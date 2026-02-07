const express = require('express');
const { body, param, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

const db = require('../models/database');
const logger = require('../services/logger');
const { APIError, createValidationError, asyncHandler } = require('../middleware/errorHandler');
const { requirePremium, createUserRateLimit } = require('../middleware/auth');

// Rate limiting for subscription operations
const subscriptionLimiter = createUserRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 operations per minute
});

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  iron_basic_monthly: {
    stripe_price_id: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    amount: 999, // $9.99
    currency: 'usd',
    interval: 'month',
    name: 'Iron Premium Mensual',
  },
  iron_pro_yearly: {
    stripe_price_id: process.env.STRIPE_PRICE_PRO_YEARLY,
    amount: 7999, // $79.99
    currency: 'usd',
    interval: 'year',
    name: 'Iron Premium Anual',
  },
  iron_lifetime: {
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME,
    amount: 19999, // $199.99
    currency: 'usd',
    interval: 'one_time',
    name: 'Iron Premium de por Vida',
  },
};

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans
 */
router.get('/plans',
  asyncHandler(async (req, res) => {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      stripe_price_id: plan.stripe_price_id,
    }));

    res.json({
      success: true,
      data: {
        plans,
      },
    });
  })
);

/**
 * GET /api/subscriptions/current
 * Get current user's subscription status
 */
router.get('/current',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get active subscription
    const subscription = await db('subscriptions')
      .where('user_id', userId)
      .where('is_active', true)
      .first();

    let subscriptionData = null;
    let isPremium = false;

    if (subscription) {
      // Get Stripe subscription details
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        isPremium = stripeSubscription.status === 'active' && 
                   new Date(stripeSubscription.current_period_end * 1000) > new Date();

        subscriptionData = {
          id: subscription.id,
          plan_id: subscription.plan_id,
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
          trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
          created_at: subscription.created_at,
          stripe_subscription_id: subscription.stripe_subscription_id,
        };
      } catch (error) {
        logger.payment('stripe_subscription_retrieve_error', userId, null, null, {
          error: error.message,
          subscription_id: subscription.stripe_subscription_id,
        });
      }
    }

    // Get payment methods
    let paymentMethods = [];
    if (req.user.stripe_customer_id) {
      try {
        const stripePaymentMethods = await stripe.paymentMethods.list({
          customer: req.user.stripe_customer_id,
          type: 'card',
        });
        
        paymentMethods = stripePaymentMethods.data.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
          } : null,
          created: new Date(pm.created * 1000),
        }));
      } catch (error) {
        logger.payment('stripe_payment_methods_retrieve_error', userId, null, null, {
          error: error.message,
          customer_id: req.user.stripe_customer_id,
        });
      }
    }

    res.json({
      success: true,
      data: {
        subscription: subscriptionData,
        is_premium: isPremium,
        payment_methods: paymentMethods,
        customer_id: req.user.stripe_customer_id,
      },
    });
  })
);

/**
 * POST /api/subscriptions/create-payment-intent
 * Create payment intent for one-time payments
 */
router.post('/create-payment-intent',
  subscriptionLimiter,
  [
    body('plan_id')
      .isIn(Object.keys(SUBSCRIPTION_PLANS))
      .withMessage('Invalid plan ID'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { plan_id } = req.body;
    const userId = req.user.id;
    const plan = SUBSCRIPTION_PLANS[plan_id];

    if (plan.interval !== 'one_time') {
      throw new APIError('This endpoint is only for one-time payments', 400, 'INVALID_PLAN_TYPE');
    }

    // Get or create Stripe customer
    let customerId = req.user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          user_id: userId.toString(),
        },
      });
      
      customerId = customer.id;
      
      // Update user with customer ID
      await db('users')
        .where('id', userId)
        .update({ stripe_customer_id: customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.amount,
      currency: plan.currency,
      customer: customerId,
      metadata: {
        user_id: userId.toString(),
        plan_id,
        plan_name: plan.name,
      },
    });

    logger.payment('payment_intent_created', userId, plan.amount, plan.currency, {
      plan_id,
      payment_intent_id: paymentIntent.id,
    });

    res.json({
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        amount: plan.amount,
        currency: plan.currency,
        payment_intent_id: paymentIntent.id,
      },
    });
  })
);

/**
 * POST /api/subscriptions/create-subscription
 * Create recurring subscription
 */
router.post('/create-subscription',
  subscriptionLimiter,
  [
    body('plan_id')
      .isIn(Object.keys(SUBSCRIPTION_PLANS))
      .withMessage('Invalid plan ID'),
    body('payment_method_id')
      .notEmpty()
      .withMessage('Payment method ID is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { plan_id, payment_method_id } = req.body;
    const userId = req.user.id;
    const plan = SUBSCRIPTION_PLANS[plan_id];

    if (plan.interval === 'one_time') {
      throw new APIError('This endpoint is only for recurring subscriptions', 400, 'INVALID_PLAN_TYPE');
    }

    // Check if user already has an active subscription
    const existingSubscription = await db('subscriptions')
      .where('user_id', userId)
      .where('is_active', true)
      .first();

    if (existingSubscription) {
      throw new APIError('User already has an active subscription', 409, 'SUBSCRIPTION_EXISTS');
    }

    // Get or create Stripe customer
    let customerId = req.user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          user_id: userId.toString(),
        },
      });
      
      customerId = customer.id;
      
      // Update user with customer ID
      await db('users')
        .where('id', userId)
        .update({ stripe_customer_id: customerId });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: plan.stripe_price_id,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId.toString(),
        plan_id,
      },
    });

    // Save subscription to database
    await db('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      plan_id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      is_active: subscription.status === 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    logger.payment('subscription_created', userId, plan.amount, plan.currency, {
      plan_id,
      subscription_id: subscription.id,
      status: subscription.status,
    });

    res.json({
      success: true,
      data: {
        subscription_id: subscription.id,
        client_secret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status,
      },
    });
  })
);

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
router.post('/cancel',
  subscriptionLimiter,
  [
    body('immediate')
      .optional()
      .isBoolean()
      .withMessage('Immediate must be a boolean'),
  ],
  asyncHandler(async (req, res) => {
    const { immediate = false } = req.body;
    const userId = req.user.id;

    // Get current subscription
    const subscription = await db('subscriptions')
      .where('user_id', userId)
      .where('is_active', true)
      .first();

    if (!subscription) {
      throw new APIError('No active subscription found', 404, 'SUBSCRIPTION_NOT_FOUND');
    }

    // Cancel Stripe subscription
    let stripeSubscription;
    if (immediate) {
      stripeSubscription = await stripe.subscriptions.del(subscription.stripe_subscription_id);
    } else {
      stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    // Update database
    const updateData = {
      cancel_at_period_end: !immediate,
      canceled_at: immediate ? new Date() : null,
      is_active: immediate ? false : true,
      updated_at: new Date(),
    };

    await db('subscriptions')
      .where('id', subscription.id)
      .update(updateData);

    logger.payment('subscription_canceled', userId, null, null, {
      subscription_id: subscription.stripe_subscription_id,
      immediate,
      plan_id: subscription.plan_id,
    });

    res.json({
      success: true,
      message: immediate 
        ? 'Subscription canceled immediately' 
        : 'Subscription will be canceled at the end of the current period',
      data: {
        subscription_id: subscription.stripe_subscription_id,
        canceled_at: immediate ? new Date() : null,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: !immediate,
      },
    });
  })
);

/**
 * POST /api/subscriptions/reactivate
 * Reactivate a canceled subscription
 */
router.post('/reactivate',
  subscriptionLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get canceled subscription
    const subscription = await db('subscriptions')
      .where('user_id', userId)
      .where('cancel_at_period_end', true)
      .where('is_active', true)
      .first();

    if (!subscription) {
      throw new APIError('No canceled subscription found', 404, 'SUBSCRIPTION_NOT_FOUND');
    }

    // Reactivate Stripe subscription
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update database
    await db('subscriptions')
      .where('id', subscription.id)
      .update({
        cancel_at_period_end: false,
        updated_at: new Date(),
      });

    logger.payment('subscription_reactivated', userId, null, null, {
      subscription_id: subscription.stripe_subscription_id,
      plan_id: subscription.plan_id,
    });

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        subscription_id: subscription.stripe_subscription_id,
        current_period_end: subscription.current_period_end,
      },
    });
  })
);

/**
 * GET /api/subscriptions/billing-history
 * Get user's billing history
 */
router.get('/billing-history',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.user.stripe_customer_id) {
      return res.json({
        success: true,
        data: {
          invoices: [],
        },
      });
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: req.user.stripe_customer_id,
      limit: 20,
    });

    const billingHistory = invoices.data.map(invoice => ({
      id: invoice.id,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      period_start: new Date(invoice.period_start * 1000),
      period_end: new Date(invoice.period_end * 1000),
      created: new Date(invoice.created * 1000),
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      description: invoice.description,
    }));

    res.json({
      success: true,
      data: {
        invoices: billingHistory,
      },
    });
  })
);

/**
 * POST /api/subscriptions/update-payment-method
 * Update default payment method
 */
router.post('/update-payment-method',
  subscriptionLimiter,
  [
    body('payment_method_id')
      .notEmpty()
      .withMessage('Payment method ID is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { payment_method_id } = req.body;
    const userId = req.user.id;

    if (!req.user.stripe_customer_id) {
      throw new APIError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    // Attach payment method and set as default
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: req.user.stripe_customer_id,
    });

    await stripe.customers.update(req.user.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    logger.payment('payment_method_updated', userId, null, null, {
      payment_method_id,
      customer_id: req.user.stripe_customer_id,
    });

    res.json({
      success: true,
      message: 'Payment method updated successfully',
    });
  })
);

module.exports = router;