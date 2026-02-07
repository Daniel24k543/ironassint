/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('exercises', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Basic information
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.json('instructions').nullable(); // Array of step-by-step instructions
      
      // Exercise categorization
      table.enum('category', [
        'cardio', 'strength', 'flexibility', 'balance', 'sports', 
        'functional', 'rehabilitation', 'warm_up', 'cool_down'
      ]).notNullable();
      
      table.json('muscle_groups').notNullable(); // Array of muscle groups: chest, back, legs, etc.
      table.json('equipment').nullable(); // Array of equipment needed: dumbbells, barbell, etc.
      
      // Difficulty and metrics
      table.enum('difficulty_level', ['beginner', 'intermediate', 'advanced']).notNullable();
      table.integer('estimated_calories_per_minute').nullable(); // Calories burned per minute
      table.boolean('is_unilateral').defaultTo(false); // True if exercise should be done on each side
      
      // Media
      table.json('images').nullable(); // Array of image URLs
      table.json('videos').nullable(); // Array of video URLs
      table.string('demonstration_gif').nullable(); // GIF showing the exercise
      
      // Variations and progressions
      table.json('variations').nullable(); // Array of exercise variations
      table.json('progressions').nullable(); // Array of progression exercises
      table.json('regressions').nullable(); // Array of easier versions
      
      // Safety and contraindications
      table.json('contraindications').nullable(); // When not to do this exercise
      table.json('safety_tips').nullable(); // Safety considerations
      
      // Metadata
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_premium').defaultTo(false); // Premium exercises for paid users
      table.integer('popularity_score').defaultTo(0); // Based on usage
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['category']);
      table.index(['difficulty_level']);
      table.index(['is_active']);
      table.index(['is_premium']);
      table.index(['popularity_score']);
    })
    .createTable('workout_plans', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Plan information
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.string('image_url').nullable();
      
      // Plan categorization
      table.enum('type', [
        'strength_training', 'cardio', 'hiit', 'yoga', 'pilates', 
        'crossfit', 'bodyweight', 'rehabilitation', 'sports_specific'
      ]).notNullable();
      
      table.enum('difficulty_level', ['beginner', 'intermediate', 'advanced']).notNullable();
      table.json('goals').notNullable(); // weight_loss, muscle_gain, endurance, etc.
      
      // Duration and structure
      table.integer('duration_weeks').notNullable(); // How many weeks the plan lasts
      table.integer('workouts_per_week').notNullable();
      table.integer('estimated_duration_minutes').nullable(); // Typical workout duration
      
      // Requirements
      table.json('required_equipment').nullable(); // Equipment needed for this plan
      table.enum('experience_level', ['beginner', 'intermediate', 'advanced']).notNullable();
      table.json('muscle_groups_targeted').notNullable();
      
      // Metadata
      table.boolean('is_premium').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_featured').defaultTo(false);
      table.integer('popularity_score').defaultTo(0);
      
      // Creator information
      table.string('created_by', 255).nullable(); // Trainer or AI
      table.boolean('is_ai_generated').defaultTo(false);
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['type']);
      table.index(['difficulty_level']);
      table.index(['is_premium']);
      table.index(['is_active']);
      table.index(['is_featured']);
      table.index(['popularity_score']);
    })
    .createTable('workouts', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign keys
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('workout_plan_id').unsigned().nullable();
      table.foreign('workout_plan_id').references('id').inTable('workout_plans').onDelete('SET NULL');
      
      // Workout information
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.date('scheduled_date').nullable(); // When the workout is planned
      table.timestamp('started_at').nullable(); // When user started the workout
      table.timestamp('completed_at').nullable(); // When user completed the workout
      table.integer('actual_duration_minutes').nullable(); // How long it actually took
      
      // Workout type and structure
      table.enum('type', [
        'strength_training', 'cardio', 'hiit', 'yoga', 'pilates', 
        'crossfit', 'bodyweight', 'rehabilitation', 'sports_specific', 'custom'
      ]).notNullable();
      
      // Status
      table.enum('status', ['planned', 'in_progress', 'completed', 'skipped', 'canceled']).defaultTo('planned');
      
      // Measurements and feedback
      table.float('calories_burned').nullable();
      table.integer('user_rating').nullable(); // 1-5 stars
      table.text('user_notes').nullable();
      table.json('user_feedback').nullable(); // Structured feedback data
      
      // AI and metrics
      table.boolean('is_ai_generated').defaultTo(false);
      table.json('ai_recommendations').nullable(); // AI suggestions for next workout
      table.float('difficulty_rating').nullable(); // User's perceived difficulty 1-10
      table.float('enjoyment_rating').nullable(); // How much user enjoyed it 1-10
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['workout_plan_id']);
      table.index(['scheduled_date']);
      table.index(['status']);
      table.index(['type']);
      table.index(['completed_at']);
    })
    .createTable('workout_exercises', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign keys
      table.integer('workout_id').unsigned().notNullable();
      table.foreign('workout_id').references('id').inTable('workouts').onDelete('CASCADE');
      table.integer('exercise_id').unsigned().notNullable();
      table.foreign('exercise_id').references('id').inTable('exercises').onDelete('CASCADE');
      
      // Exercise order and structure
      table.integer('order_in_workout').notNullable();
      table.integer('sets').nullable();
      table.integer('reps').nullable();
      table.float('weight_kg').nullable();
      table.integer('duration_seconds').nullable(); // For timed exercises
      table.float('distance_meters').nullable(); // For distance-based exercises
      table.integer('rest_seconds').nullable(); // Rest time after this exercise
      
      // Performance tracking
      table.json('completed_sets').nullable(); // Array of completed set data
      table.integer('actual_sets').nullable(); // How many sets were actually completed
      table.float('total_volume').nullable(); // Total weight lifted (sets × reps × weight)
      table.boolean('is_completed').defaultTo(false);
      
      // Modifications and notes
      table.text('modifications').nullable(); // Any modifications made to the exercise
      table.text('notes').nullable(); // User notes about this specific exercise
      table.float('perceived_exertion').nullable(); // RPE scale 1-10
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['workout_id']);
      table.index(['exercise_id']);
      table.index(['order_in_workout']);
      table.index(['is_completed']);
    })
    .createTable('user_exercise_records', function (table) {
      // Primary key
      table.increments('id').primary();
      
      // Foreign keys
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('exercise_id').unsigned().notNullable();
      table.foreign('exercise_id').references('id').inTable('exercises').onDelete('CASCADE');
      
      // Record information
      table.enum('record_type', ['max_weight', 'max_reps', 'max_duration', 'max_distance', 'best_time']).notNullable();
      table.float('value').notNullable(); // The record value
      table.string('unit', 20).notNullable(); // kg, reps, seconds, meters, etc.
      
      // Context
      table.text('notes').nullable();
      table.date('achieved_on').notNullable();
      table.integer('workout_exercise_id').unsigned().nullable(); // Link to the specific workout where record was set
      table.foreign('workout_exercise_id').references('id').inTable('workout_exercises').onDelete('SET NULL');
      
      // Verification
      table.boolean('is_verified').defaultTo(false); // For competition/official records
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['user_id']);
      table.index(['exercise_id']);
      table.index(['record_type']);
      table.index(['achieved_on']);
      
      // Ensure only one record per user per exercise per type
      table.unique(['user_id', 'exercise_id', 'record_type']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_exercise_records')
    .dropTableIfExists('workout_exercises')
    .dropTableIfExists('workouts')
    .dropTableIfExists('workout_plans')
    .dropTableIfExists('exercises');
};