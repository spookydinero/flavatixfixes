# Quickstart: Remove Mode Display and Add Category Dropdown

## Overview
This quickstart guide demonstrates the complete user workflow for the category dropdown feature, including mode display removal and category change functionality.

## Prerequisites
- User is authenticated and logged in
- User has an active quick tasting session
- Session has at least one item for testing

## User Workflow

### 1. Access Quick Tasting Session
**Given** I am logged in and have an active quick tasting session
**When** I navigate to the quick tasting page
**Then** I should see the session header without "Mode: Quick" display

**Expected Result**:
- Session header shows: "Category: Coffee" (or current category)
- No "Mode: Quick" text visible
- Clean, uncluttered interface

### 2. View Category Dropdown
**Given** I am viewing the session header
**When** I look at the category area
**Then** I should see a dropdown selector instead of static text

**Expected Result**:
- Category is displayed as a dropdown/select element
- Dropdown shows current category as selected
- Dropdown is clearly interactive (hover states, focus indicators)

### 3. Change Category
**Given** I see the category dropdown
**When** I click on the dropdown and select a different category
**Then** the session should update to the new category

**Test Steps**:
1. Click on the category dropdown
2. Select "Tea" from the dropdown options
3. Observe the session header updates
4. Verify the change is saved

**Expected Result**:
- Dropdown shows "Tea" as selected
- Session header displays "Category: Tea"
- Success message appears: "Category updated!"
- Change persists when page is refreshed

### 4. Verify Data Preservation
**Given** I have items with photos and notes in my session
**When** I change the category
**Then** all existing item data should be preserved

**Test Steps**:
1. Add a tasting item with photo and notes
2. Change the session category
3. Navigate to the item
4. Verify photo and notes are still present

**Expected Result**:
- Item photo remains visible
- Item notes are preserved
- Item scores are maintained
- No data loss occurs

### 5. Test Error Handling
**Given** I am changing the category
**When** a network error occurs
**Then** I should see appropriate error feedback

**Test Steps**:
1. Disconnect from internet
2. Attempt to change category
3. Observe error handling
4. Reconnect and verify recovery

**Expected Result**:
- Error message appears: "Failed to update category"
- Current category remains unchanged
- Functionality recovers when connection restored

## Validation Checklist

### UI/UX Validation
- [ ] Mode display is completely removed
- [ ] Category dropdown is clearly visible and interactive
- [ ] Dropdown shows all available categories
- [ ] Current category is properly selected
- [ ] Hover and focus states work correctly
- [ ] Mobile responsiveness maintained

### Functionality Validation
- [ ] Category changes are saved to database
- [ ] Session state updates correctly
- [ ] Success feedback is shown
- [ ] Error handling works properly
- [ ] Data integrity is maintained
- [ ] Performance is acceptable (< 100ms response)

### Accessibility Validation
- [ ] Dropdown is keyboard accessible
- [ ] Screen reader compatibility
- [ ] Focus indicators are visible
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG standards

### Integration Validation
- [ ] Works with existing session functionality
- [ ] Compatible with item management
- [ ] No conflicts with other features
- [ ] Real-time updates work correctly
- [ ] Session persistence maintained

## Test Data

### Sample Categories
```typescript
const testCategories = [
  'coffee',
  'tea', 
  'wine',
  'spirits',
  'beer',
  'chocolate',
  'other'
];
```

### Sample Session
```typescript
const testSession = {
  id: 'test-session-id',
  user_id: 'test-user-id',
  category: 'coffee',
  session_name: 'Test Coffee Tasting',
  mode: 'quick',
  created_at: '2024-12-19T10:00:00Z',
  updated_at: '2024-12-19T10:00:00Z'
};
```

## Troubleshooting

### Common Issues

**Issue**: Dropdown not visible
**Solution**: Check that component is properly imported and rendered

**Issue**: Category change not saving
**Solution**: Verify Supabase connection and authentication

**Issue**: Error messages not showing
**Solution**: Check toast notification setup and error handling

**Issue**: Mobile layout broken
**Solution**: Verify responsive design and mobile-first approach

### Debug Steps
1. Check browser console for errors
2. Verify network requests in DevTools
3. Test with different categories
4. Verify database updates
5. Check component state updates

## Success Criteria

The feature is working correctly when:
- ✅ Mode display is completely removed
- ✅ Category dropdown is functional and accessible
- ✅ Category changes save successfully
- ✅ No data loss occurs during changes
- ✅ Error handling works properly
- ✅ UI remains responsive and clean
- ✅ All accessibility requirements met
- ✅ Performance targets achieved
