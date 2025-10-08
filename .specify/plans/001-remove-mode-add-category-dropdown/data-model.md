# Data Model: Remove Mode Display and Add Category Dropdown

## Entities

### Session Entity
**Purpose**: Represents a tasting session with category information

**Current Fields**:
- `id`: string (primary key)
- `user_id`: string (foreign key to profiles)
- `category`: string (coffee, tea, wine, spirits, beer, chocolate, other)
- `custom_category_name`: string | null (for 'other' category)
- `session_name`: string
- `mode`: string (quick, study, competition)
- `created_at`: timestamp
- `updated_at`: timestamp
- `completed_at`: timestamp | null

**Modifications for Feature**:
- No schema changes required
- `category` field will be updated via existing `handleCategoryChange` function
- `mode` field remains in data but not displayed in UI

**Validation Rules**:
- Category must be one of: coffee, tea, wine, spirits, beer, chocolate, other
- If category is 'other', custom_category_name must be provided
- Category changes must preserve existing session data

**State Transitions**:
- Category can be changed at any time during active session
- Category change triggers session update and UI refresh
- No impact on existing items or their data

### Category Entity
**Purpose**: Represents available category options for selection

**Fields**:
- `id`: string (category identifier)
- `name`: string (display name)
- `display_name`: string (formatted display name)

**Available Categories**:
```typescript
const categories = [
  { id: 'coffee', name: 'Coffee', display_name: 'Coffee' },
  { id: 'tea', name: 'Tea', display_name: 'Tea' },
  { id: 'wine', name: 'Wine', display_name: 'Wine' },
  { id: 'spirits', name: 'Spirits', display_name: 'Spirits' },
  { id: 'beer', name: 'Beer', display_name: 'Beer' },
  { id: 'chocolate', name: 'Chocolate', display_name: 'Chocolate' },
  { id: 'other', name: 'Other', display_name: 'Other' }
];
```

**Validation Rules**:
- Category selection must be from available options
- 'Other' category requires custom_category_name input
- Category names are case-sensitive and must match exactly

## Relationships

### Session → Category
- **Type**: Many-to-One
- **Description**: Each session belongs to one category
- **Implementation**: Foreign key relationship via category field
- **Constraints**: Category must exist in available categories list

### Session → Items
- **Type**: One-to-Many
- **Description**: Each session can have multiple tasting items
- **Implementation**: Items reference session via tasting_id
- **Impact of Category Change**: No impact on existing items

## Data Flow

### Category Change Flow
1. User selects new category from dropdown
2. Frontend validates selection
3. `handleCategoryChange` function called
4. Supabase API updates session.category
5. Session state updated via `onSessionUpdate`
6. UI refreshes with new category
7. Success feedback shown to user

### Error Handling
- Invalid category selection: Show validation error
- Network failure: Show error message, maintain current state
- Permission denied: Show access error
- Database constraint violation: Show data error

## State Management

### Component State
```typescript
interface QuickTastingSessionState {
  session: QuickTasting;
  isChangingCategory: boolean;
  categoryChangeError: string | null;
}
```

### Session Update Flow
```typescript
const handleCategoryChange = async (newCategory: string) => {
  setIsChangingCategory(true);
  setCategoryChangeError(null);
  
  try {
    // Update via Supabase
    const { data, error } = await supabase
      .from('quick_tastings')
      .update({ category: newCategory })
      .eq('id', session.id)
      .select()
      .single();

    if (error) throw error;

    // Update local state
    const updatedSession = { ...session, category: newCategory };
    onSessionUpdate?.(updatedSession);
    
    // Show success feedback
    toast.success('Category updated!');
  } catch (error) {
    setCategoryChangeError(error.message);
    toast.error('Failed to update category');
  } finally {
    setIsChangingCategory(false);
  }
};
```

## Validation Rules

### Frontend Validation
- Category must be selected from dropdown options
- No empty category selection allowed
- Custom category name required if 'other' selected

### Backend Validation
- Category must exist in allowed values
- User must have permission to update session
- Session must exist and be active

### Database Constraints
- Category field has CHECK constraint for valid values
- Foreign key constraint to user_id
- NOT NULL constraint on category field

## Performance Considerations

### Database Queries
- Category update uses single UPDATE query
- No additional queries required for validation
- Existing indexes on session.id support efficient updates

### UI Performance
- Dropdown renders only available categories
- No additional API calls for category list
- State updates are local and immediate

### Caching
- Category list is static and can be cached
- Session data cached in component state
- No additional caching requirements
