# Data Model: Updated Tasting Flow Specification

**Date**: September 22, 2025
**Feature**: Implement Updated Tasting Flow Specification

## Overview

This data model extends the existing tasting system to support the three tasting modes (Quick, Study, Competition) with an enhanced category system and participant management.

## Existing Tables (Modified)

### quick_tastings
**Purpose**: Core tasting session entity with mode support

**New/Modified Fields**:
- `mode` (TEXT): 'quick' | 'study' | 'competition' - replaces implicit quick-only behavior
- `tasting_type` (TEXT): 'beer' | 'spirits' | 'wine' | 'other' - beverage category for Quick Tasting
- `study_approach` (TEXT): 'predefined' | 'collaborative' - Study Mode approach (only for mode='study')
- `expected_participants` (INTEGER): Optional field for Competition mode planning
- `is_host_controlled` (BOOLEAN): Whether competition has host controls enabled

**Validation Rules**:
- mode must be one of the three allowed values
- tasting_type required for Quick mode, optional for others
- expected_participants only relevant for Competition mode

**Relationships**:
- 1:N with quick_tasting_items
- 1:N with tasting_participants (Competition mode)
- 1:N with tasting_categories

### quick_tasting_items
**Purpose**: Individual items being tasted

**Modified Fields**:
- `correct_answers` (JSONB): Removed - replaced by structured category system
- `include_in_ranking` (BOOLEAN): New field for Competition mode ranking control

**Relationships**:
- N:1 with quick_tastings
- 1:N with tasting_participant_answers

## New Tables

### tasting_categories
**Purpose**: Evaluation dimensions for tasting sessions (up to 10 per session)

**Fields**:
- `id` (UUID): Primary key
- `tasting_id` (UUID): Foreign key to quick_tastings
- `category_name` (TEXT): User-defined name (e.g., "Variety", "Region", "Aroma")
- `parameter_type` (TEXT): 'exact_answer' | 'subjective_input' | 'contains_x' | 'multiple_choice' | 'sliding_scale'
- `options` (JSONB): Array of options for multiple_choice type, null otherwise
- `is_required` (BOOLEAN): Whether this category must be answered (default: true)
- `display_order` (INTEGER): Sort order for UI (default: 0)
- `created_at` (TIMESTAMP): Creation timestamp

**Validation Rules**:
- category_name cannot be empty
- parameter_type must be one of the five allowed values
- options required only for multiple_choice type
- Maximum 10 categories per tasting session

**Relationships**:
- N:1 with quick_tastings
- 1:N with tasting_item_answers
- 1:N with tasting_participant_answers

### tasting_item_answers
**Purpose**: Correct answers for categories in Competition mode

**Fields**:
- `id` (UUID): Primary key
- `tasting_item_id` (UUID): Foreign key to quick_tasting_items
- `category_id` (UUID): Foreign key to tasting_categories
- `correct_answer` (TEXT): Text answer for exact/contains/multiple choice
- `correct_range` (JSONB): {min: number, max: number} for sliding scale
- `created_at` (TIMESTAMP): Creation timestamp

**Validation Rules**:
- Either correct_answer OR correct_range must be provided (not both)
- For sliding scale: correct_range must have min and max
- For multiple choice: correct_answer must match an option from tasting_categories.options

**Relationships**:
- N:1 with quick_tasting_items
- N:1 with tasting_categories

### tasting_participants
**Purpose**: Users participating in tasting sessions (Competition and Study modes)

**Fields**:
- `id` (UUID): Primary key
- `tasting_id` (UUID): Foreign key to quick_tastings
- `user_id` (UUID): Foreign key to auth.users
- `role` (TEXT): User role ('host', 'participant', 'both')
- `score` (INTEGER): Calculated total score (Competition mode)
- `rank` (INTEGER): Calculated ranking position (Competition mode)
- `can_moderate` (BOOLEAN): Whether user has moderator permissions
- `can_add_items` (BOOLEAN): Whether user can suggest/add items
- `created_at` (TIMESTAMP): Join timestamp

**Validation Rules**:
- One participant record per user per tasting
- role determines permissions (host can moderate, participant can taste, both can do both)
- score and rank only relevant for Competition mode

**Relationships**:
- N:1 with quick_tastings
- N:1 with auth.users (profiles)
- 1:N with tasting_participant_answers
- 1:N with tasting_item_suggestions (for Collaborative Study Mode)

### tasting_item_suggestions
**Purpose**: Item suggestions in Collaborative Study Mode

**Fields**:
- `id` (UUID): Primary key
- `participant_id` (UUID): Foreign key to tasting_participants
- `suggested_item_name` (TEXT): Name of suggested item
- `status` (TEXT): Suggestion status ('pending', 'approved', 'rejected')
- `moderated_by` (UUID): User who approved/rejected (nullable)
- `moderated_at` (TIMESTAMP): When moderation occurred (nullable)
- `created_at` (TIMESTAMP): When suggestion was made

**Validation Rules**:
- Only participants with can_add_items = true can create suggestions
- Status must be one of the three allowed values
- moderated_by and moderated_at required when status is 'approved' or 'rejected'

**Relationships**:
- N:1 with tasting_participants
- 1:1 with quick_tasting_items (when approved, creates actual item)

### tasting_participant_answers
**Purpose**: Individual participant responses to tasting categories

**Fields**:
- `id` (UUID): Primary key
- `participant_id` (UUID): Foreign key to tasting_participants
- `item_id` (UUID): Foreign key to quick_tasting_items
- `category_id` (UUID): Foreign key to tasting_categories
- `answer_text` (TEXT): Text response for applicable types
- `answer_numeric` (INTEGER): Numeric response for sliding scale (1-100)
- `is_correct` (BOOLEAN): Calculated correctness flag
- `created_at` (TIMESTAMP): Submission timestamp

**Validation Rules**:
- For sliding scale: answer_numeric must be 1-100
- For multiple choice: answer_text must match category options
- is_correct calculated based on tasting_item_answers

**Relationships**:
- N:1 with tasting_participants
- N:1 with quick_tasting_items
- N:1 with tasting_categories

## Data Flow Patterns

### Quick Tasting Mode
1. User creates quick_tastings record (mode='quick', tasting_type set)
2. User adds quick_tasting_items dynamically
3. Items evaluated without structured categories
4. Session completed and stats calculated

### Study Mode - Pre-defined Items
1. Host creates quick_tastings record (mode='study', study_approach='predefined')
2. Host defines tasting_categories
3. Host adds all quick_tasting_items upfront
4. Participants join with role='participant'
5. Participants evaluate pre-defined items against categories
6. Session completed with analysis

### Study Mode - Collaborative
1. Host creates quick_tastings record (mode='study', study_approach='collaborative')
2. Host defines tasting_categories
3. Host and participants join (host gets role='both', participants get role='participant')
4. Participants can submit tasting_item_suggestions
5. Host moderates suggestions (approve/reject)
6. Approved suggestions become quick_tasting_items
7. All participants evaluate items against categories
8. Session completed with collaborative analysis

### Competition Mode
1. Host creates quick_tastings record (mode='competition')
2. Host defines tasting_categories
3. Host adds quick_tasting_items with tasting_item_answers
4. Participants join (tasting_participants records)
5. Participants submit tasting_participant_answers
6. System calculates scores and rankings
7. Host can monitor progress and end session

## State Transitions

### Tasting Session States
- `created`: Initial state
- `active`: Items being added/evaluated
- `completed`: Session finished, results calculated

### Participant States (Competition Mode)
- `joined`: Participant added to tasting
- `active`: Actively submitting answers
- `completed`: Finished all required evaluations

## Indexing Strategy

**Performance Indexes**:
- tasting_categories(tasting_id) - Category listing
- tasting_item_answers(tasting_item_id, category_id) - Item answers lookup
- tasting_participants(tasting_id) - Participant listing
- tasting_participants(user_id) - User participation history
- tasting_participant_answers(participant_id, item_id) - Participant progress

## Data Integrity Constraints

**Foreign Key Constraints**:
- All foreign keys with CASCADE delete where appropriate
- tasting_participants enforces unique (tasting_id, user_id)

**Business Logic Constraints**:
- Competition mode requires at least one category and one item
- Maximum 10 categories per tasting session
- Sliding scale answers must be within correct_range for scoring
- Participant answers must match category parameter types

## Migration Strategy

**Database Changes**:
1. Add new columns to existing tables
2. Create new tables with proper constraints
3. Add indexes for performance
4. Implement Row Level Security policies
5. Grant appropriate permissions

**Data Migration**:
- Existing quick_tastings default to mode='quick'
- Existing quick_tasting_items remain functional
- No data loss for existing sessions
