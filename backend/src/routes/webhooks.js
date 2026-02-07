// backend/src/routes/webhooks.js

const express = require('express');
const router = express.Router();
const logger = require('../services/logger');
const crypto = require('crypto');

// Stripe webhook handler
router.post('/stripe',
  express.raw({ type: 'application/json' }), // Important: Use raw body for signature verification
  async (req, res, next) => {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        logger.error('Stripe webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
      }

      let event;

      try {
        // Verify webhook signature
        event = require('stripe')(process.env.STRIPE_SECRET_KEY)
          .webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        logger.error('Webhook signature verification failed', { error: err.message });
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const db = req.app.get('db');

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object, db);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object, db);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object, db);
          break;

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object, db);
          break;

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object, db);
          break;

        case 'payment_method.attached':
          await handlePaymentMethodAttached(event.data.object, db);
          break;

        case 'customer.created':
          await handleCustomerCreated(event.data.object, db);
          break;

        default:
          logger.warn(`Unhandled Stripe webhook event: ${event.type}`, {
            eventId: event.id
          });
      }

      logger.info('Stripe webhook processed successfully', {
        eventType: event.type,
        eventId: event.id
      });

      res.json({ received: true });
    } catch (error) {
      logger.error('Error processing Stripe webhook', {
        error: error.message,
        eventType: req.body?.type
      });
      next(error);
    }
  }
);

// Subscription created handler
async function handleSubscriptionCreated(subscription, db) {
  try {
    const user = await db('users')
      .where('stripe_customer_id', subscription.customer)
      .first();

    if (!user) {
      logger.warn('User not found for subscription creation', {
        customerId: subscription.customer,
        subscriptionId: subscription.id
      });
      return;
    }

    // Create subscription record
    await db('subscriptions').insert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      plan_id: subscription.items.data[0]?.price?.id,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      created_at: new Date()
    });

    // Update user premium status
    await db('users')
      .where('id', user.id)
      .update({ premium_status: true });

    // Create notification
    await createNotification(db, user.id, {
      type: 'subscription',
      title: '¡Bienvenido a Premium!',
      body: 'Tu suscripción premium está activa. Disfruta de todas las funciones exclusivas.',
      data: { subscription_id: subscription.id }
    });

    logger.info('Subscription created successfully', {
      userId: user.id,
      subscriptionId: subscription.id,
      status: subscription.status
    });
  } catch (error) {
    logger.error('Error handling subscription creation', {
      error: error.message,
      subscriptionId: subscription.id
    });
    throw error;
  }
}

// Subscription updated handler
async function handleSubscriptionUpdated(subscription, db) {
  try {
    const existingSubscription = await db('subscriptions')
      .where('stripe_subscription_id', subscription.id)
      .first();

    if (!existingSubscription) {
      logger.warn('Subscription not found for update', {
        subscriptionId: subscription.id
      });
      return;
    }

    const oldStatus = existingSubscription.status;
    const newStatus = subscription.status;

    // Update subscription
    await db('subscriptions')
      .where('stripe_subscription_id', subscription.id)
      .update({
        status: subscription.status,
        plan_id: subscription.items.data[0]?.price?.id,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date()
      });

    // Update user premium status based on subscription status
    const isPremium = ['active', 'trialing'].includes(subscription.status);
    await db('users')
      .where('id', existingSubscription.user_id)
      .update({ premium_status: isPremium });

    // Create notifications for status changes
    if (oldStatus !== newStatus) {
      let notificationData = { subscription_id: subscription.id };
      let title, body;

      switch (newStatus) {
        case 'active':
          title = '✅ Suscripción Activa';
          body = 'Tu suscripción premium está activa y funcionando correctamente.';
          break;
        case 'canceled':
          title = '❌ Suscripción Cancelada';
          body = 'Tu suscripción premium ha sido cancelada. Tendrás acceso hasta el final del período actual.';
          break;
        case 'incomplete':
          title = '⚠️ Problema con el Pago';
          body = 'Hay un problema con tu método de pago. Por favor actualiza tu información de facturación.';
          break;
        case 'past_due':
          title = '⚠️ Pago Vencido';
          body = 'Tu pago está vencido. Actualiza tu método de pago para mantener tu suscripción activa.';
          break;
        default:
          title = 'Suscripción Actualizada';
          body = `El estado de tu suscripción ha cambiado a: ${newStatus}`;
      }

      await createNotification(db, existingSubscription.user_id, {
        type: 'subscription',
        title,
        body,
        data: notificationData
      });
    }

    logger.info('Subscription updated successfully', {
      subscriptionId: subscription.id,
      oldStatus,
      newStatus
    });
  } catch (error) {
    logger.error('Error handling subscription update', {
      error: error.message,
      subscriptionId: subscription.id
    });
    throw error;
  }
}

// Subscription deleted handler
async function handleSubscriptionDeleted(subscription, db) {
  try {
    const existingSubscription = await db('subscriptions')
      .where('stripe_subscription_id', subscription.id)
      .first();

    if (!existingSubscription) {
      logger.warn('Subscription not found for deletion', {
        subscriptionId: subscription.id
      });
      return;
    }

    // Update subscription status
    await db('subscriptions')
      .where('stripe_subscription_id', subscription.id)
      .update({
        status: 'canceled',
        canceled_at: new Date(),
        updated_at: new Date()
      });

    // Remove user premium status
    await db('users')
      .where('id', existingSubscription.user_id)
      .update({ premium_status: false });

    // Create notification
    await createNotification(db, existingSubscription.user_id, {
      type: 'subscription',
      title: 'Suscripción Finalizada',
      body: 'Tu suscripción premium ha finalizado. Puedes renovarla en cualquier momento desde la configuración.',
      data: { subscription_id: subscription.id }
    });

    logger.info('Subscription deleted successfully', {
      subscriptionId: subscription.id,
      userId: existingSubscription.user_id
    });
  } catch (error) {
    logger.error('Error handling subscription deletion', {
      error: error.message,
      subscriptionId: subscription.id
    });
    throw error;
  }
}

// Payment succeeded handler
async function handlePaymentSucceeded(invoice, db) {
  try {
    const subscription = await db('subscriptions')
      .where('stripe_subscription_id', invoice.subscription)
      .first();

    if (!subscription) {
      logger.warn('Subscription not found for successful payment', {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription
      });
      return;
    }

    // Record successful payment
    await db('payments').insert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      stripe_payment_intent_id: invoice.payment_intent,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'completed',
      payment_date: new Date(invoice.status_transitions.finalized_at * 1000),
      created_at: new Date()
    });

    // Create notification
    await createNotification(db, subscription.user_id, {
      type: 'payment',
      title: '✅ Pago Procesado',
      body: `Tu pago de ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()} ha sido procesado exitosamente.`,
      data: { 
        invoice_id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency
      }
    });

    logger.info('Payment succeeded processed', {
      invoiceId: invoice.id,
      userId: subscription.user_id,
      amount: invoice.amount_paid
    });
  } catch (error) {
    logger.error('Error handling payment success', {
      error: error.message,
      invoiceId: invoice.id
    });
    throw error;
  }
}

// Payment failed handler
async function handlePaymentFailed(invoice, db) {
  try {
    const subscription = await db('subscriptions')
      .where('stripe_subscription_id', invoice.subscription)
      .first();

    if (!subscription) {
      logger.warn('Subscription not found for failed payment', {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription
      });
      return;
    }

    // Record failed payment
    await db('payments').insert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      stripe_payment_intent_id: invoice.payment_intent,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      payment_date: new Date(),
      created_at: new Date()
    });

    // Create notification
    await createNotification(db, subscription.user_id, {
      type: 'payment',
      title: '❌ Error en el Pago',
      body: 'No pudimos procesar tu pago. Por favor verifica tu método de pago y vuelve a intentar.',
      data: { 
        invoice_id: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        action_required: true
      }
    });

    logger.warn('Payment failed processed', {
      invoiceId: invoice.id,
      userId: subscription.user_id,
      amount: invoice.amount_due
    });
  } catch (error) {
    logger.error('Error handling payment failure', {
      error: error.message,
      invoiceId: invoice.id
    });
    throw error;
  }
}

// Payment method attached handler
async function handlePaymentMethodAttached(paymentMethod, db) {
  try {
    const user = await db('users')
      .where('stripe_customer_id', paymentMethod.customer)
      .first();

    if (!user) {
      logger.warn('User not found for payment method attachment', {
        customerId: paymentMethod.customer,
        paymentMethodId: paymentMethod.id
      });
      return;
    }

    // Create notification
    await createNotification(db, user.id, {
      type: 'payment',
      title: 'Método de Pago Agregado',
      body: `Se ha agregado un nuevo método de pago (${paymentMethod.type}) a tu cuenta.`,
      data: { 
        payment_method_id: paymentMethod.id,
        type: paymentMethod.type
      }
    });

    logger.info('Payment method attached', {
      userId: user.id,
      paymentMethodId: paymentMethod.id,
      type: paymentMethod.type
    });
  } catch (error) {
    logger.error('Error handling payment method attachment', {
      error: error.message,
      paymentMethodId: paymentMethod.id
    });
    throw error;
  }
}

// Customer created handler
async function handleCustomerCreated(customer, db) {
  try {
    // This might happen if a customer is created outside of our app flow
    // We can try to match by email and update the user record
    const user = await db('users')
      .where('email', customer.email)
      .whereNull('stripe_customer_id')
      .first();

    if (user) {
      await db('users')
        .where('id', user.id)
        .update({ stripe_customer_id: customer.id });

      logger.info('Stripe customer linked to existing user', {
        userId: user.id,
        customerId: customer.id,
        email: customer.email
      });
    } else {
      logger.info('Stripe customer created without matching user', {
        customerId: customer.id,
        email: customer.email
      });
    }
  } catch (error) {
    logger.error('Error handling customer creation', {
      error: error.message,
      customerId: customer.id
    });
    throw error;
  }
}

// Helper function to create notifications
async function createNotification(db, userId, { type, title, body, data = {} }) {
  try {
    await db('user_notifications').insert({
      user_id: userId,
      notification_type: type,
      title,
      body,
      data: JSON.stringify(data),
      is_read: false,
      created_at: new Date()
    });
  } catch (error) {
    logger.error('Error creating notification', {
      error: error.message,
      userId,
      type,
      title
    });
  }
}

// Health check endpoint for webhooks
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    service: 'webhooks'
  });
});

// GitHub webhook handler (for CI/CD)
router.post('/github',
  express.json(),
  async (req, res) => {
    try {
      const githubSecret = process.env.GITHUB_WEBHOOK_SECRET;
      
      if (githubSecret) {
        const signature = req.headers['x-hub-signature-256'];
        const expectedSignature = 'sha256=' + 
          crypto.createHmac('sha256', githubSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }

      const event = req.headers['x-github-event'];
      const { action, repository, ref } = req.body;

      logger.info('GitHub webhook received', {
        event,
        action,
        repository: repository?.name,
        ref
      });

      // Handle specific events (deployment, push, etc.)
      switch (event) {
        case 'push':
          if (ref === 'refs/heads/main' || ref === 'refs/heads/master') {
            logger.info('Push to main branch detected', {
              repository: repository.name,
              commits: req.body.commits?.length
            });
          }
          break;
        
        case 'deployment_status':
          logger.info('Deployment status update', {
            environment: req.body.deployment?.environment,
            state: req.body.deployment_status?.state
          });
          break;

        default:
          logger.debug(`Unhandled GitHub event: ${event}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Error processing GitHub webhook', {
        error: error.message,
        event: req.headers['x-github-event']
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// Generic webhook handler for other services
router.post('/generic/:service',
  express.json(),
  async (req, res) => {
    try {
      const service = req.params.service;
      
      logger.info('Generic webhook received', {
        service,
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        }
      });

      // Here you can add handling for other webhook services
      // like SendGrid, Twilio, Firebase, etc.

      res.json({ 
        received: true,
        service,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error processing generic webhook', {
        error: error.message,
        service: req.params.service
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

module.exports = router;