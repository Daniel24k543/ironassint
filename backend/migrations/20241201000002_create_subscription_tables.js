/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('subscriptions', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign key to user
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Stripe integration
      table.string('stripe_subscription_id', 255).notNullable().unique();
      table.string('stripe_customer_id', 255).notNullable();
      
      // Plan information
      table.string('plan_id', 100).notNullable(); // iron_basic_monthly, iron_pro_yearly, etc.
      table.string('stripe_price_id', 255).notNullable();
      
      // Subscription status
      table.enum('status', [
        'incomplete', 'incomplete_expired', 'trialing', 'active', 
        'past_due', 'canceled', 'unpaid'
      ]).notNullable();
      
      // Billing information
      table.integer('amount').notNullable(); // Amount in cents
      table.string('currency', 3).defaultTo('usd');
      table.enum('interval', ['month', 'year']).notNullable();
      
      // Period information
      table.timestamp('current_period_start').notNullable();
      table.timestamp('current_period_end').notNullable();
      table.timestamp('trial_start').nullable();
      table.timestamp('trial_end').nullable();
      
      // Cancellation information
      table.boolean('cancel_at_period_end').defaultTo(false);
      table.timestamp('canceled_at').nullable();
      table.timestamp('ended_at').nullable();
      
      // Status flags
      table.boolean('is_active').defaultTo(true);
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['stripe_subscription_id']);
      table.index(['plan_id']);
      table.index(['status']);
      table.index(['is_active']);
      table.index(['current_period_end']);
    })
    .createTable('payments', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign keys
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('subscription_id').unsigned().nullable();
      table.foreign('subscription_id').references('id').inTable('subscriptions').onDelete('SET NULL');
      
      // Stripe integration
      table.string('stripe_payment_intent_id', 255).nullable().unique();
      table.string('stripe_charge_id', 255).nullable();
      table.string('stripe_invoice_id', 255).nullable();
      
      // Payment information
      table.integer('amount').notNullable(); // Amount in cents
      table.integer('amount_refunded').defaultTo(0); // Refunded amount in cents
      table.string('currency', 3).defaultTo('usd');
      table.string('description').nullable();
      
      // Payment status
      table.enum('status', [
        'pending', 'processing', 'succeeded', 'failed', 
        'canceled', 'refunded', 'partially_refunded'
      ]).notNullable();
      
      // Payment method information
      table.enum('payment_method_type', ['card', 'bank_transfer', 'wallet']).nullable();
      table.json('payment_method_details').nullable(); // Card last4, brand, etc.
      
      // Plan information for this payment
      table.string('plan_id', 100).nullable();
      table.string('plan_name', 255).nullable();
      
      // Failure information
      table.string('failure_code', 100).nullable();
      table.string('failure_message').nullable();
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('paid_at').nullable();
      
      // Indexes
      table.index(['user_id']);
      table.index(['subscription_id']);
      table.index(['stripe_payment_intent_id']);
      table.index(['status']);
      table.index(['plan_id']);
      table.index(['created_at']);
    })
    .createTable('payment_methods', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign key
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Stripe integration
      table.string('stripe_payment_method_id', 255).notNullable().unique();
      
      // Payment method information
      table.enum('type', ['card', 'bank_account', 'wallet']).notNullable();
      table.json('details').nullable(); // Card details, bank details, etc.
      
      // Status
      table.boolean('is_default').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['stripe_payment_method_id']);
      table.index(['is_default']);
      table.index(['is_active']);
    })
    .createTable('coupons', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Coupon information
      table.string('code', 50).notNullable().unique();
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      
      // Discount information
      table.enum('discount_type', ['percentage', 'fixed_amount']).notNullable();
      table.float('discount_value').notNullable(); // Percentage (0-100) or fixed amount in cents
      table.string('currency', 3).defaultTo('usd'); // For fixed amount discounts
      
      // Usage limits
      table.integer('max_uses').nullable(); // null = unlimited
      table.integer('max_uses_per_user').nullable(); // null = unlimited per user
      table.integer('current_uses').defaultTo(0);
      
      // Validity period
      table.timestamp('valid_from').defaultTo(knex.fn.now());
      table.timestamp('valid_until').nullable();
      
      // Restrictions
      table.json('applicable_plans').nullable(); // Which plans this coupon applies to
      table.integer('minimum_amount').nullable(); // Minimum purchase amount in cents
      table.boolean('first_time_users_only').defaultTo(false);
      
      // Status
      table.boolean('is_active').defaultTo(true);
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['code']);
      table.index(['is_active']);
      table.index(['valid_from']);
      table.index(['valid_until']);
    })
    .createTable('coupon_redemptions', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign keys
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('coupon_id').unsigned().notNullable();
      table.foreign('coupon_id').references('id').inTable('coupons').onDelete('CASCADE');
      table.integer('payment_id').unsigned().nullable();
      table.foreign('payment_id').references('id').inTable('payments').onDelete('SET NULL');
      
      // Redemption details
      table.integer('discount_amount').notNullable(); // Actual discount amount applied in cents
      table.integer('original_amount').notNullable(); // Original amount before discount
      table.integer('final_amount').notNullable(); // Final amount after discount
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['coupon_id']);
      table.index(['payment_id']);
      table.index(['created_at']);
      
      // Ensure user can't redeem same coupon multiple times (if coupon has max_uses_per_user = 1)
      table.unique(['user_id', 'coupon_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('coupon_redemptions')
    .dropTableIfExists('coupons')
    .dropTableIfExists('payment_methods')
    .dropTableIfExists('payments')
    .dropTableIfExists('subscriptions');
};