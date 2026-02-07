/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('notifications', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign key
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Notification content
      table.string('title', 255).notNullable();
      table.text('body').notNullable();
      table.json('data').nullable(); // Additional structured data
      
      // Notification type and category
      table.enum('type', [
        'workout_reminder', 'achievement', 'streak', 'challenge', 
        'social', 'subscription', 'health_metric', 'ai_insight', 
        'system', 'promotional', 'safety'
      ]).notNullable();
      
      table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
      
      // Delivery information
      table.json('channels').notNullable(); // push, email, in_app
      table.boolean('is_read').defaultTo(false);
      table.timestamp('read_at').nullable();
      
      // Scheduling
      table.timestamp('scheduled_for').nullable(); // For scheduled notifications
      table.timestamp('sent_at').nullable();
      table.enum('status', ['pending', 'sent', 'failed', 'canceled']).defaultTo('pending');
      
      // Action and interaction
      table.json('action_buttons').nullable(); // Array of action buttons
      table.string('deep_link_url').nullable(); // Where to navigate when tapped
      table.json('analytics_data').nullable(); // For tracking engagement
      
      // Expiration
      table.timestamp('expires_at').nullable();
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['type']);
      table.index(['status']);
      table.index(['is_read']);
      table.index(['scheduled_for']);
      table.index(['created_at']);
    })
    .createTable('push_tokens', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign key
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Token information
      table.text('token').notNullable();
      table.enum('platform', ['ios', 'android', 'web']).notNullable();
      table.string('device_id').nullable();
      table.string('app_version').nullable();
      table.string('os_version').nullable();
      
      // Status
      table.boolean('is_active').defaultTo(true);
      table.timestamp('last_used').defaultTo(knex.fn.now());
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['token']);
      table.index(['platform']);
      table.index(['is_active']);
      
      // Ensure unique token per user
      table.unique(['user_id', 'token']);
    })
    .createTable('user_metrics', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign key
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Metric information
      table.string('metric_type', 100).notNullable(); // weight, body_fat, muscle_mass, etc.
      table.float('value').notNullable();
      table.string('unit', 20).notNullable(); // kg, %, bpm, etc.
      table.date('recorded_date').notNullable();
      
      // Source and context
      table.enum('source', ['manual', 'bluetooth_device', 'smart_scale', 'fitness_tracker', 'estimated']).notNullable();
      table.string('device_name').nullable(); // Name of the device that recorded this
      table.json('metadata').nullable(); // Additional context data
      
      // Validation and quality
      table.boolean('is_validated').defaultTo(true);
      table.text('notes').nullable();
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['metric_type']);
      table.index(['recorded_date']);
      table.index(['source']);
      table.index(['is_validated']);
    })
    .createTable('user_progress', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign key
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Progress tracking
      table.date('date').notNullable();
      table.integer('workouts_completed').defaultTo(0);
      table.integer('total_workout_minutes').defaultTo(0);
      table.float('total_calories_burned').defaultTo(0);
      table.float('total_weight_lifted').defaultTo(0); // Total volume in kg
      
      // Streaks and consistency
      table.integer('current_workout_streak').defaultTo(0);
      table.integer('weekly_workout_count').defaultTo(0);
      table.integer('monthly_workout_count').defaultTo(0);
      
      // Performance metrics
      table.float('average_workout_rating').nullable(); // Average user rating of workouts
      table.float('average_difficulty_rating').nullable();
      table.float('average_enjoyment_rating').nullable();
      
      // Health metrics (daily averages)
      table.float('average_heart_rate').nullable();
      table.float('resting_heart_rate').nullable();
      table.integer('steps_count').nullable();
      table.float('sleep_hours').nullable();
      table.integer('hydration_glasses').nullable(); // Glasses of water
      
      // AI insights and recommendations
      table.json('ai_insights').nullable(); // Daily AI analysis
      table.float('overall_fitness_score').nullable(); // AI-calculated fitness score 0-100
      table.json('recommendations').nullable(); // AI recommendations for tomorrow
      
      // Achievements
      table.json('achievements_earned').nullable(); // Achievements earned on this date
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['date']);
      table.index(['current_workout_streak']);
      
      // Ensure one record per user per date
      table.unique(['user_id', 'date']);
    })
    .createTable('achievements', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Achievement information
      table.string('key', 100).notNullable().unique(); // unique identifier like 'first_workout'
      table.string('name', 255).notNullable();
      table.text('description').notNullable();
      table.string('icon', 255).nullable(); // Icon name or URL
      table.string('badge_image_url').nullable();
      
      // Achievement type and category
      table.enum('category', [
        'workout_count', 'streak', 'weight_lifting', 'cardio', 
        'consistency', 'milestone', 'social', 'special_event'
      ]).notNullable();
      
      table.enum('type', ['count_based', 'streak_based', 'milestone', 'time_based', 'special']).notNullable();
      table.enum('difficulty', ['bronze', 'silver', 'gold', 'platinum', 'legendary']).notNullable();
      
      // Requirements
      table.json('requirements').notNullable(); // Conditions to earn this achievement
      table.integer('points_reward').defaultTo(0); // Points awarded for earning this
      
      // Availability
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_premium').defaultTo(false); // Premium-only achievements
      table.boolean('is_repeatable').defaultTo(false); // Can be earned multiple times
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['category']);
      table.index(['type']);
      table.index(['difficulty']);
      table.index(['is_active']);
    })
    .createTable('user_achievements', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign keys
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('achievement_id').unsigned().notNullable();
      table.foreign('achievement_id').references('id').inTable('achievements').onDelete('CASCADE');
      
      // Progress tracking
      table.float('progress').defaultTo(0); // Progress towards earning (0-100%)
      table.date('earned_on').nullable(); // When the achievement was earned
      table.boolean('is_earned').defaultTo(false);
      table.boolean('is_displayed').defaultTo(false); // Whether user wants to display this
      
      // Context
      table.json('earned_data').nullable(); // Data context when achievement was earned
      table.text('user_note').nullable(); // User's note about this achievement
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['achievement_id']);
      table.index(['is_earned']);
      table.index(['earned_on']);
      table.index(['is_displayed']);
      
      // Ensure user can only have one record per achievement (for non-repeatable achievements)
      table.unique(['user_id', 'achievement_id']);
    })
    .createTable('password_reset_tokens', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign key
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Token information
      table.string('token', 255).notNullable().unique();
      table.timestamp('expires_at').notNullable();
      table.boolean('is_used').defaultTo(false);
      table.timestamp('used_at').nullable();
      
      // Security
      table.string('ip_address', 45).nullable(); // IPv6 compatible
      table.text('user_agent').nullable();
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['token']);
      table.index(['expires_at']);
      table.index(['is_used']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('password_reset_tokens')
    .dropTableIfExists('user_achievements')
    .dropTableIfExists('achievements')
    .dropTableIfExists('user_progress')
    .dropTableIfExists('user_metrics')
    .dropTableIfExists('push_tokens')
    .dropTableIfExists('notifications');
};