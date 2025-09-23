# Quickstart Guide: Update Study Mode Specification

**Date**: September 22, 2025
**Feature**: Update Study Mode Specification

## Overview

This quickstart guide provides end-to-end validation scenarios for the enhanced Study Mode functionality, including both Pre-defined and Collaborative approaches with proper role management.

## Test Scenarios

### Scenario 1: Study Mode - Pre-defined Items Approach

**User Story**: As a host, I want to conduct a structured study tasting with all items planned upfront.

**Setup Steps**:
1. Navigate to Dashboard
2. Click "Create Tasting Session"
3. Select "Study Mode"
4. Choose "Pre-defined Items" approach
5. Enter session name: "Coffee Study Session"
6. Add categories: Origin (Exact Answer), Roast Level (Multiple Choice: Light, Medium, Dark)
7. Add items: "Ethiopian Yirgacheffe", "Colombian Supremo"
8. Start the session

**Validation Steps**:
1. ✅ Study Mode selection works
2. ✅ Pre-defined Items approach can be selected
3. ✅ Category creation with parameter types functional
4. ✅ Item preloading works before participants join
5. ✅ Participants can only evaluate pre-defined items
6. ✅ No suggestion interface visible to participants
7. ✅ Host appears with "Host + Participant" role indicator
8. ✅ Session completes with structured analysis

**Expected Results**:
- Study session created with study_approach='predefined'
- tasting_item_suggestions table remains empty
- Participants have role='participant' with can_add_items=false
- Host has role='both' with full permissions

### Scenario 2: Study Mode - Collaborative Approach

**User Story**: As a host, I want an interactive study tasting where participants can suggest items.

**Setup Steps**:
1. Navigate to Dashboard
2. Click "Create Tasting Session"
3. Select "Study Mode"
4. Choose "Collaborative" approach
5. Enter session name: "Wine Discovery Session"
6. Add categories: Grape Variety (Exact Answer), Body (Sliding Scale 1-100)
7. Start the session

**Host Actions**:
8. As host, suggest an item: "Cabernet Sauvignon"
9. Check moderator dashboard for suggestions

**Participant Actions**:
10. Join as participant
11. Suggest an item: "Pinot Noir"
12. Verify suggestion appears as pending

**Validation Steps**:
1. ✅ Collaborative approach selection works
2. ✅ Host can access moderator controls
3. ✅ Participants see suggestion interface
4. ✅ Item suggestions submit successfully
5. ✅ Host sees pending suggestions in moderator view
6. ✅ Host can approve/reject suggestions
7. ✅ Approved items become available for all participants
8. ✅ Rejected suggestions are removed
9. ✅ Role indicators show correct permissions
10. ✅ Real-time updates work for suggestion status changes

**Expected Results**:
- Study session created with study_approach='collaborative'
- tasting_item_suggestions table populated with pending suggestions
- Approved suggestions create corresponding quick_tasting_items
- Host can seamlessly switch between moderating and participating
- Participants can evaluate both pre-approved and suggested items

### Scenario 3: Role Management and Dual Participation

**User Story**: As a host, I want to participate in tasting while maintaining moderator privileges.

**Setup Steps**:
1. Create Collaborative Study Mode session as above
2. Have host and participants join
3. Participants submit suggestions

**Host Dual Role Validation**:
1. ✅ Host can moderate suggestions while session is active
2. ✅ Host can evaluate items as a participant
3. ✅ Host sees both moderator controls and tasting interface
4. ✅ Role indicator shows "Host + Participant"
5. ✅ Host permissions work for both roles
6. ✅ UI clearly separates moderator actions from tasting actions

**Expected Results**:
- Host has role='both' in tasting_participants
- can_moderate=true and can_add_items=true
- UI adapts to show both moderator and participant interfaces
- Actions are properly attributed to correct role

### Scenario 4: Host Unresponsive Handling

**User Story**: As a participant, I want the session to continue even if the host becomes unresponsive.

**Setup Steps**:
1. Create Collaborative session with host and participants
2. Participants submit suggestions
3. Simulate host becoming unresponsive

**Validation Steps**:
1. ✅ Participants can continue evaluating existing approved items
2. ✅ Pending suggestions remain in queue
3. ✅ Session doesn't break when host is unresponsive
4. ✅ Participants receive appropriate messaging about suggestion status
5. ✅ System allows read-only continuation
6. ✅ No data loss occurs

**Expected Results**:
- Session remains accessible in read-only mode
- Existing approved items remain available for tasting
- Pending suggestions persist for later moderation
- Graceful degradation without session termination

## Integration Test Scenarios

### API Contract Validation

**Suggestion Management API**:
```bash
# Submit suggestion
curl -X POST /api/tastings/{id}/suggestions \
  -H "Content-Type: application/json" \
  -d '{"participant_id":"uuid","item_name":"New Item"}'

# Get suggestions (moderator)
curl -X GET /api/tastings/{id}/suggestions?status=pending

# Moderate suggestion
curl -X POST /api/tastings/{id}/suggestions/{suggestionId}/moderate \
  -H "Content-Type: application/json" \
  -d '{"moderator_id":"uuid","action":"approve"}'
```

**Role Management API**:
```bash
# Update participant role
curl -X PUT /api/tastings/{id}/participants/{participantId}/role \
  -H "Content-Type: application/json" \
  -d '{"role":"both"}'
```

**Expected API Behaviors**:
- ✅ Correct HTTP status codes returned
- ✅ Proper authorization checks for role-based actions
- ✅ Real-time updates propagated to connected clients
- ✅ Data consistency maintained across role changes

### Real-time Collaboration Tests

**Live Suggestion Updates**:
- Moderator sees new suggestions instantly
- Participants see newly approved items immediately
- Status changes reflect in real-time across all clients

**Role-based UI Updates**:
- Interface adapts when user role changes
- Permission-based features show/hide appropriately
- No UI inconsistencies during role transitions

### Database Integrity Tests

**Role Constraints**:
- Only one host/both role per session
- Permission flags consistent with role assignments
- Suggestion creation respects can_add_items permission

**Suggestion Lifecycle**:
- Approved suggestions create quick_tasting_items records
- Rejected suggestions are marked but preserved
- Moderation actions properly attributed and timestamped

## Performance Validation

### Response Time Targets
- Suggestion submission: <300ms
- Moderation actions: <500ms
- Real-time updates: <100ms latency
- Role changes: <200ms UI update

### Concurrent User Support
- Support 20+ participants in collaborative session
- Handle 50+ simultaneous suggestion submissions
- Maintain real-time sync for all active users

## Security Validation

### Authorization Checks
- ✅ Participants cannot moderate suggestions
- ✅ Non-moderators cannot view pending suggestions
- ✅ Role changes require host privileges
- ✅ Suggestion creation requires can_add_items permission

### Data Privacy
- ✅ Participants only see approved items
- ✅ Moderators only see suggestions from their sessions
- ✅ No cross-session data leakage

## Browser Compatibility

**Real-time Features**:
- WebSocket fallback for browsers without full real-time support
- Graceful degradation when real-time fails
- Manual refresh capability for critical updates

---

## Success Criteria

**Feature Complete When**:
- ✅ Both Study Mode approaches work end-to-end
- ✅ Role management functions correctly
- ✅ Collaborative suggestion workflow complete
- ✅ Real-time updates work across all clients
- ✅ Host dual participation is seamless
- ✅ Unresponsive host handling works
- ✅ All security and authorization checks pass
- ✅ Performance targets met under load

**Ready for Production When**:
- ✅ All API contracts validated
- ✅ Real-time features tested across different networks
- ✅ Database constraints prevent invalid states
- ✅ Comprehensive E2E test suite passes
- ✅ User acceptance testing with real collaborative sessions
