# Data Model: Update Study Mode Specification

**Date**: September 22, 2025
**Feature**: Update Study Mode Specification

## Overview

This data model extends the existing tasting system to support flexible Study Mode approaches with role-based permissions and collaborative item suggestions.

## Modified Tables

### quick_tastings
**Purpose**: Enhanced to support Study Mode approach selection

**New Fields**:
- `study_approach` (TEXT): 'predefined' | 'collaborative' - Only for mode='study'

**Validation Rules**:
- study_approach required when mode='study'
- study_approach must be null for other modes

### tasting_participants
**Purpose**: Extended role management for Study Mode permissions

**Enhanced Fields**:
- `role` (TEXT): 'host' | 'participant' | 'both' - User role in session
- `can_moderate` (BOOLEAN): Permission to moderate suggestions
- `can_add_items` (BOOLEAN): Permission to suggest items

**New Validation Rules**:
- role determines permission defaults:
  - 'host': can_moderate=true, can_add_items=true
  - 'participant': can_moderate=false, can_add_items=true (for collaborative)
  - 'both': can_moderate=true, can_add_items=true
- Only one 'host' or 'both' role per session
- Multiple 'participant' roles allowed

## New Tables

### tasting_item_suggestions
**Purpose**: Manages item suggestions in Collaborative Study Mode

**Fields**:
- `id` (UUID): Primary key
- `participant_id` (UUID): Foreign key to tasting_participants
- `suggested_item_name` (TEXT): Name of suggested item
- `status` (TEXT): 'pending' | 'approved' | 'rejected'
- `moderated_by` (UUID): Foreign key to auth.users (nullable)
- `moderated_at` (TIMESTAMP): When moderation occurred (nullable)
- `created_at` (TIMESTAMP): When suggestion was made

**Validation Rules**:
- Only participants with can_add_items=true can create suggestions
- Status transitions: pending → approved/rejected
- moderated_by and moderated_at required when status ≠ 'pending'
- Suggestions automatically create tasting_items when approved

**Relationships**:
- N:1 with tasting_participants
- 1:1 with quick_tasting_items (when approved)

## Data Flow Patterns

### Pre-defined Study Mode
1. Host creates quick_tastings (mode='study', study_approach='predefined')
2. Host adds all quick_tasting_items upfront
3. Participants join with role='participant' (can_add_items=false)
4. Participants evaluate only pre-defined items
5. Session completes with structured analysis

### Collaborative Study Mode
1. Host creates quick_tastings (mode='study', study_approach='collaborative')
2. Host defines categories (optional)
3. Host joins with role='both' (can_moderate=true, can_add_items=true)
4. Participants join with role='participant' (can_add_items=true)
5. Participants submit tasting_item_suggestions
6. Host moderates suggestions (approve/reject)
7. Approved suggestions become quick_tasting_items
8. All participants evaluate available items
9. Session completes with collaborative analysis

### Role Transitions
- Host can switch between 'moderating' and 'participating' modes in UI
- If host becomes unresponsive in Collaborative mode:
  - System allows read-only continuation
  - Participants can continue evaluating existing items
  - New suggestions queue for later moderation

## State Transitions

### Suggestion States
- `pending`: Awaiting host moderation
- `approved`: Becomes available item, creates quick_tasting_items record
- `rejected`: Removed from consideration

### Session States
- `setup`: Host configuring session
- `active`: Participants can suggest/evaluate items
- `moderation_pending`: Suggestions awaiting approval
- `completed`: Session finished

## Indexing Strategy

**New Performance Indexes**:
- tasting_item_suggestions(participant_id, status) - User's suggestions by status
- tasting_item_suggestions(status, created_at) - Pending suggestions queue
- tasting_participants(tasting_id, role) - Role distribution per session

## Data Integrity Constraints

**Business Logic Constraints**:
- Pre-defined mode: No tasting_item_suggestions allowed
- Collaborative mode: Only participants with can_add_items=true can suggest
- Host role: Maximum one per session (either 'host' or 'both')
- Item approval: Creates corresponding quick_tasting_items record

**Permission Constraints**:
- Only moderators (can_moderate=true) can change suggestion status
- Participants cannot moderate their own suggestions
- Approved items are immutable (cannot be rejected later)

## Migration Strategy

**Database Changes**:
1. Add study_approach column to quick_tastings
2. Add role, can_moderate, can_add_items columns to tasting_participants
3. Create tasting_item_suggestions table
4. Add indexes and RLS policies
5. Update existing Study Mode sessions to use 'predefined' approach

**Data Migration**:
- Existing tasting_participants default to role='participant'
- Existing Study Mode sessions set study_approach='predefined'
- No breaking changes to existing data

## API Integration Points

**New Endpoints Required**:
- `POST /api/tastings/{id}/suggestions` - Submit item suggestion
- `GET /api/tastings/{id}/suggestions` - List pending suggestions (moderators only)
- `POST /api/tastings/{id}/suggestions/{suggestionId}/moderate` - Approve/reject suggestion

**Enhanced Endpoints**:
- `POST /api/tastings/create` - Add study_approach parameter
- `POST /api/tastings/{id}/participants` - Include role assignment

## Real-time Considerations

**Live Updates Required**:
- Suggestion status changes (pending → approved/rejected)
- New items becoming available in Collaborative mode
- Participant role changes (if host reassigns moderation)

**Subscription Patterns**:
- Moderators subscribe to suggestion status changes
- All participants subscribe to new approved items
- Role-based filtering for appropriate updates

