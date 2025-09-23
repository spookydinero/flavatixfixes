# Manual Testing Guide: Study Mode Enhancement

**Date**: September 23, 2025
**Version**: 1.0.0
**Feature**: Study Mode Enhancement (Pre-defined & Collaborative approaches)

## Overview

This manual testing guide covers end-to-end validation of the Study Mode enhancement. All tests should be performed in a development environment with the database migration applied.

## Test Environment Setup

### Prerequisites
1. ✅ Database migration executed in Supabase SQL Editor
2. ✅ Development server running (`npm run dev`)
3. ✅ Test users created in authentication system
4. ✅ Browser developer tools available

### Test Data Setup
Create test users:
- Host User: `host@example.com`
- Participant 1: `participant1@example.com`
- Participant 2: `participant2@example.com`

## Test Scenarios

### Scenario 1: Pre-defined Study Mode Workflow

**Objective**: Validate complete Pre-defined Study Mode user journey

**Test Steps**:

1. **Session Creation**
   - Navigate to Dashboard
   - Click "Create Tasting Session"
   - Select "Study Mode"
   - Choose "Pre-defined Items" approach
   - Enter session name: "Pre-defined Coffee Study"
   - Select category: "coffee"
   - Add 2 tasting items with categories
   - Click "Create Session"
   - ✅ Verify session created successfully
   - ✅ Verify redirect to tasting page

2. **Host Experience**
   - ✅ Verify host sees "Host + Participant" role indicator
   - ✅ Verify host can add additional items (if needed)
   - ✅ Verify no suggestion interface visible to host
   - ✅ Verify moderation dashboard not visible

3. **Participant Joining**
   - Login as Participant 1
   - Navigate to session URL
   - ✅ Verify automatic role assignment as "participant"
   - ✅ Verify role indicator shows "Participant"
   - ✅ Verify cannot add items directly
   - ✅ Verify no suggestion interface visible
   - ✅ Verify no moderation controls visible

4. **Tasting Evaluation**
   - Both host and participant evaluate pre-defined items
   - ✅ Verify all items visible to both users
   - ✅ Verify evaluation forms work correctly
   - ✅ Verify progress tracking updates

5. **Session Completion**
   - Host completes session
   - ✅ Verify completion successful
   - ✅ Verify results accessible to all participants

**Expected Results**:
- ✅ Study approach selection works
- ✅ Pre-defined items workflow functions correctly
- ✅ Role-based permissions enforced
- ✅ No collaborative features interfere

---

### Scenario 2: Collaborative Study Mode Workflow

**Objective**: Validate complete Collaborative Study Mode user journey

**Test Steps**:

1. **Session Creation**
   - Login as Host User
   - Navigate to Dashboard
   - Click "Create Tasting Session"
   - Select "Study Mode"
   - Choose "Collaborative" approach
   - Enter session name: "Collaborative Wine Study"
   - Select category: "wine"
   - Click "Create Session"
   - ✅ Verify session created successfully

2. **Initial State Verification**
   - ✅ Verify no pre-loaded items
   - ✅ Verify host sees moderation controls
   - ✅ Verify host has "Host + Participant" role
   - ✅ Verify empty suggestions list

3. **Participant Suggestion Submission**
   - Login as Participant 1
   - Join the collaborative session
   - ✅ Verify "Participant" role assigned
   - ✅ Verify suggestion form visible
   - ✅ Verify can submit item suggestions
   - Submit 2-3 item suggestions
   - ✅ Verify suggestions appear in list
   - ✅ Verify pending status shown

4. **Host Moderation**
   - Switch back to Host User
   - ✅ Verify suggestions visible in moderation dashboard
   - ✅ Verify pending suggestions count
   - Approve 1 suggestion, reject 1
   - ✅ Verify approved item becomes tasting item
   - ✅ Verify rejected suggestion marked as such

5. **Real-time Updates**
   - Switch to Participant 1
   - ✅ Verify approved item appears in tasting list
   - Submit another suggestion
   - Switch to Host
   - ✅ Verify new suggestion appears immediately
   - Approve the suggestion
   - Switch back to Participant
   - ✅ Verify real-time item addition

6. **Multi-participant Interaction**
   - Login as Participant 2
   - Join session
   - Submit suggestions
   - ✅ Verify all participants see each other's suggestions
   - ✅ Verify role-based permissions work

7. **Session Completion**
   - Host completes session
   - ✅ Verify all approved items included in results
   - ✅ Verify collaborative metadata captured

**Expected Results**:
- ✅ Collaborative workflow functions end-to-end
- ✅ Real-time updates work correctly
- ✅ Moderation system operational
- ✅ Multi-user interaction seamless

---

### Scenario 3: Role Management and Permissions

**Objective**: Validate role-based access control and management

**Test Steps**:

1. **Role Assignment**
   - Create collaborative session as Host
   - Have multiple participants join
   - ✅ Verify automatic role assignment
   - ✅ Verify host gets "both" role
   - ✅ Verify participants get "participant" role

2. **Permission Enforcement**
   - **Host Permissions**:
     - ✅ Can moderate suggestions
     - ✅ Can add items directly
     - ✅ Can manage participant roles
     - ✅ Can view all suggestions
   - **Participant Permissions**:
     - ✅ Can submit suggestions
     - ✅ Cannot moderate
     - ✅ Cannot manage roles
     - ✅ Can only view own suggestions

3. **Role Changes**
   - Host changes Participant 1 to "both" role
   - ✅ Verify Participant 1 gains moderation permissions
   - ✅ Verify UI updates immediately
   - Host changes back to "participant"
   - ✅ Verify permissions revoked

4. **Dual Role Functionality**
   - Host switches between moderating and participating
   - ✅ Verify UI adapts appropriately
   - ✅ Verify permissions remain intact

**Expected Results**:
- ✅ Role-based permissions strictly enforced
- ✅ Role changes work in real-time
- ✅ Dual role functionality operational

---

### Scenario 4: Host Unresponsiveness Handling

**Objective**: Validate graceful degradation when host becomes unresponsive

**Test Steps**:

1. **Normal Operation**
   - Create collaborative session
   - Participants submit suggestions
   - Host moderates normally
   - ✅ Verify standard workflow works

2. **Simulate Host Unresponsiveness**
   - Host stops interacting (close browser/simulate disconnect)
   - Participants continue submitting suggestions
   - ✅ Verify suggestions queue properly
   - ✅ Verify participants can still evaluate approved items
   - ✅ Verify no system crashes

3. **Fallback Behavior**
   - Wait for unresponsiveness timeout (2 minutes)
   - ✅ Verify graceful degradation
   - ✅ Verify participants can complete session
   - ✅ Verify data integrity maintained

4. **Host Returns**
   - Host reconnects
   - ✅ Verify pending suggestions become available
   - ✅ Verify can resume moderation
   - ✅ Verify system recovers gracefully

**Expected Results**:
- ✅ System handles host unresponsiveness gracefully
- ✅ Participants can continue working
- ✅ Data integrity preserved
- ✅ Recovery works when host returns

---

### Scenario 5: Error Handling and Edge Cases

**Objective**: Validate robust error handling and edge case management

**Test Steps**:

1. **Network Issues**
   - Simulate network disconnection during suggestion submission
   - ✅ Verify graceful error handling
   - ✅ Verify retry mechanisms work
   - ✅ Verify data not lost

2. **Invalid Data**
   - Try submitting empty suggestions
   - Try submitting overly long item names
   - ✅ Verify validation works
   - ✅ Verify helpful error messages

3. **Permission Violations**
   - Participant tries to moderate suggestions
   - Non-participant tries to access session
   - ✅ Verify access denied appropriately
   - ✅ Verify security maintained

4. **Race Conditions**
   - Multiple participants submit suggestions simultaneously
   - Host moderates while participants submit
   - ✅ Verify no data corruption
   - ✅ Verify all operations complete successfully

**Expected Results**:
- ✅ Robust error handling
- ✅ Data validation works
- ✅ Security boundaries maintained
- ✅ Race conditions handled

## Test Results Template

For each scenario, record:

```
Scenario: [Name]
Date: [Date]
Tester: [Name]
Environment: [Browser/OS]

Steps Completed: [X/X]
Issues Found: [Count]
- [Issue 1]
- [Issue 2]

Overall Result: [PASS/FAIL/PARTIAL]
Notes: [Any observations]
```

## Success Criteria

### Must-Have (Blocking)
- [ ] All core workflows complete successfully
- [ ] No data loss or corruption
- [ ] Security boundaries maintained
- [ ] Basic accessibility requirements met

### Should-Have (Important)
- [ ] Real-time features work reliably
- [ ] Error messages are helpful
- [ ] Performance meets requirements
- [ ] UI is intuitive

### Nice-to-Have (Enhancement)
- [ ] Advanced accessibility features
- [ ] Performance optimizations
- [ ] Enhanced error recovery

## Bug Report Template

```
Title: [Clear, descriptive title]

Environment:
- Browser: [Chrome/Firefox/etc]
- OS: [macOS/Windows/etc]
- Device: [Desktop/Mobile]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Severity: [Critical/High/Medium/Low]
```

## Completion Checklist

- [ ] All scenarios executed
- [ ] Test results documented
- [ ] Bugs reported and prioritized
- [ ] Accessibility validated
- [ ] Performance verified
- [ ] Security tested

**Final Sign-off**: All critical functionality validated and working as expected.
