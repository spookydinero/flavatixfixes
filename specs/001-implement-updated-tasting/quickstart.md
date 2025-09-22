# Quickstart Guide: Updated Tasting Flow Specification

**Date**: September 22, 2025
**Feature**: Implement Updated Tasting Flow Specification

## Overview

This quickstart guide provides end-to-end validation scenarios derived from the user stories and acceptance criteria. Use these scenarios to validate that the implementation works correctly.

## Test Scenarios

### Scenario 1: Quick Tasting - Personal Beer Evaluation

**User Story**: As a user, I want to quickly taste beers one-by-one with structured evaluation fields.

**Setup Steps**:
1. Navigate to Dashboard
2. Click "Quick Tasting" button
3. Select "Beer" as tasting type
4. Enter session name: "Craft Beer Tasting"

**Validation Steps**:
1. ✅ Page loads with type selector
2. ✅ Can select "Beer" type
3. ✅ Session name field accepts input
4. ✅ "Add Item" button is visible
5. ✅ Can add first beer item
6. ✅ Item form shows: Name, Photo, Aroma, Flavor, Overall Score, Notes fields
7. ✅ Can save item and add another
8. ✅ "End Tasting" button appears after first item
9. ✅ Can complete session successfully

**Expected Results**:
- Session created with mode='quick', tasting_type='beer'
- Items stored with evaluation data
- Session marked as completed
- User redirected to results/summary

### Scenario 2: Study Mode - Pre-defined Items Approach

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
2. ✅ Pre-defined vs Collaborative approach selection
3. ✅ Category creation with parameter types
4. ✅ Item preloading before participants join
5. ✅ Participants can only evaluate pre-loaded items
6. ✅ Host can participate as both host and taster
7. ✅ Session completes with structured analysis

**Expected Results**:
- Study session created with study_approach='predefined'
- Categories and items pre-configured
- Participants join with 'participant' role
- Host has 'both' role for tasting and moderating

### Scenario 3: Study Mode - Collaborative Approach

**User Story**: As a host, I want an interactive study tasting where participants can suggest items.

**Setup Steps**:
1. Navigate to Dashboard
2. Click "Create Tasting Session"
3. Select "Study Mode"
4. Choose "Collaborative" approach
5. Enter session name: "Wine Discovery Session"
6. Add categories: Grape Variety (Exact Answer), Body (Sliding Scale 1-100)
7. Start the session

**Validation Steps**:
1. ✅ Collaborative approach selection works
2. ✅ Participants can suggest items during session
3. ✅ Host can approve/reject item suggestions
4. ✅ Approved items become available for all participants
5. ✅ Host maintains moderator controls while tasting
6. ✅ Role separation (host controls vs tasting actions)
7. ✅ Session completes with collaborative results

**Expected Results**:
- Study session created with study_approach='collaborative'
- Item suggestion workflow functional
- Host moderation capabilities working
- Dual role management (host + participant)

### Scenario 4: Competition Mode - Wine Competition

**User Story**: As a host, I want to create a competitive tasting with preloaded items and participant ranking.

**Setup Steps**:
1. Navigate to Dashboard
2. Click "Create Tasting Session"
3. Select "Competition Mode"
4. Enter session name: "Wine Competition 2025"
5. Enable "Rank Participants"
6. Select ranking type: "Overall Score"
7. Add categories:
   - "Grape Variety" (Exact Answer)
   - "Tannin Level" (Sliding Scale 1-100)
8. Add competition items with correct answers:
   - Item 1: "Cabernet Sauvignon" (Grape: Cabernet Sauvignon, Tannins: 70-85)
   - Item 2: "Pinot Noir" (Grape: Pinot Noir, Tannins: 20-40)

**Validation Steps**:
1. ✅ Competition Mode can be selected
2. ✅ Ranking options appear and work
3. ✅ Categories can be configured
4. ✅ Items can be preloaded with correct answers
5. ✅ Validation prevents proceeding without items
6. ✅ Host can start competition
7. ✅ Participants can join
8. ✅ Blind tasting options work (if enabled)
9. ✅ Host can monitor progress
10. ✅ Rankings calculated correctly
11. ✅ Host can end session for all participants

**Expected Results**:
- Competition session created with preload validation
- Participants can join and submit answers
- Scoring works based on correct answers
- Rankings displayed in real-time
- Host controls functional

### Scenario 4: Blind Tasting - Mystery Spirits

**User Story**: As a host, I want to conduct a blind tasting where participants cannot see item details.

**Setup Steps**:
1. Create Competition Mode session
2. Enable all blind options:
   - Hide participant identities
   - Hide item details
   - Hide flavor attributes
3. Add items and correct answers
4. Start competition

**Validation Steps**:
1. ✅ Blind options can be enabled
2. ✅ Item names replaced with "Item #X" format
3. ✅ Participant names hidden/replaced
4. ✅ Flavor attributes hidden in evaluation
5. ✅ Scoring still works correctly
6. ✅ Results revealed after completion

**Expected Results**:
- Blind tasting mechanics work correctly
- Scoring unaffected by blindness
- Results properly revealed at end

## Integration Test Scenarios

### API Contract Validation

**Tasting Creation API**:
```bash
# Test Quick Tasting creation
curl -X POST /api/tastings/create \
  -H "Content-Type: application/json" \
  -d '{"user_id":"uuid","mode":"quick","tasting_type":"beer","category":"craft"}'

# Test Competition creation with validation
curl -X POST /api/tastings/create \
  -H "Content-Type: application/json" \
  -d '{"user_id":"uuid","mode":"competition","category":"wine","items":[...]}'
```

**Expected API Behaviors**:
- ✅ Correct status codes returned
- ✅ Proper validation of required fields
- ✅ Appropriate error messages
- ✅ Data structure matches contracts

### Database Integrity Tests

**Migration Validation**:
- ✅ All new tables created
- ✅ Foreign key constraints work
- ✅ Row Level Security policies applied
- ✅ Indexes created for performance

**Data Relationship Tests**:
- ✅ Tasting → Categories (1:N, max 10)
- ✅ Tasting → Items (1:N)
- ✅ Tasting → Participants (1:N, competition only)
- ✅ Item → Answers (1:N per category)
- ✅ Participant → Answers (1:N per item)

## Performance Validation

### Response Time Targets
- Page loads: <2 seconds
- API responses: <500ms
- Image uploads: <10 seconds
- Real-time updates: <1 second

### Scale Testing
- Support 100+ concurrent users
- Handle 50+ active competitions
- Process 1000+ participant answers

## Accessibility Validation

### Keyboard Navigation
- ✅ All forms keyboard accessible
- ✅ Focus management works
- ✅ Screen reader compatible

### Visual Accessibility
- ✅ Color contrast meets WCAG standards
- ✅ Focus indicators visible
- ✅ Responsive design works on mobile

## Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Support**:
- iOS Safari
- Chrome Mobile
- Samsung Internet

---

## Success Criteria

**Feature Complete When**:
- ✅ All 4 primary scenarios work end-to-end
- ✅ API contracts validated
- ✅ Database integrity confirmed
- ✅ Performance targets met
- ✅ Accessibility requirements satisfied
- ✅ Cross-browser compatibility verified

**Ready for Production When**:
- ✅ All contract tests pass
- ✅ Integration tests pass
- ✅ User acceptance testing complete
- ✅ Performance benchmarks met
- ✅ Security review passed
