/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Authentication fields
      table.string('firebase_uid', 128).unique().nullable();
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).nullable(); // For email/password auth
      table.boolean('email_verified').defaultTo(false);
      
      // Profile information
      table.string('name', 100).nullable();
      table.text('picture').nullable(); // URL to profile picture
      table.string('provider', 50).nullable(); // 'email', 'google', 'apple', etc.
      table.enum('role', ['user', 'admin', 'trainer']).defaultTo('user');
      
      // Account status
      table.boolean('is_active').defaultTo(true);
      table.enum('subscription_status', ['free', 'premium', 'lifetime']).defaultTo('free');
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('last_login').nullable();
      
      // Preferences and settings (JSON field)
      table.json('preferences').nullable();
      
      // Stripe integration
      table.string('stripe_customer_id', 255).nullable().unique();
      
      // Terms and privacy
      table.boolean('accepted_terms').defaultTo(false);
      table.timestamp('accepted_terms_at').nullable();
      table.boolean('accepted_privacy').defaultTo(false);
      table.timestamp('accepted_privacy_at').nullable();
      
      // Soft delete
      table.timestamp('deleted_at').nullable();
      
      // Indexes
      table.index(['email']);
      table.index(['firebase_uid']);
      table.index(['subscription_status']);
      table.index(['is_active']);
      table.index(['created_at']);
    })
    .createTable('user_profiles', function (table) {
      // Primary key and foreign key
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Physical characteristics
      table.integer('age').nullable();
      table.enum('gender', ['male', 'female', 'other', 'prefer_not_to_say']).nullable();
      table.float('height_cm').nullable(); // Height in centimeters
      table.float('weight_kg').nullable(); // Weight in kilograms
      table.enum('activity_level', ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).nullable();
      
      // Fitness goals
      table.json('fitness_goals').nullable(); // Array of goals: weight_loss, muscle_gain, endurance, etc.
      table.float('target_weight_kg').nullable();
      table.integer('weekly_workout_goal').nullable(); // Target workouts per week
      
      // Health information
      table.json('health_conditions').nullable(); // Array of health conditions
      table.json('injuries').nullable(); // Array of current or past injuries
      table.json('medications').nullable(); // Array of medications that might affect exercise
      
      // Experience and preferences
      table.enum('fitness_experience', ['beginner', 'intermediate', 'advanced']).nullable();
      table.json('preferred_workout_types').nullable(); // cardio, strength, yoga, etc.
      table.json('available_equipment').nullable(); // gym, dumbbells, resistance_bands, etc.
      table.integer('available_time_minutes').nullable(); // Typical workout duration
      table.json('preferred_workout_times').nullable(); // morning, afternoon, evening
      
      // Emergency contact
      table.string('emergency_contact_name', 100).nullable();
      table.string('emergency_contact_phone', 20).nullable();
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['activity_level']);
      table.index(['fitness_experience']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_profiles')
    .dropTableIfExists('users');
};