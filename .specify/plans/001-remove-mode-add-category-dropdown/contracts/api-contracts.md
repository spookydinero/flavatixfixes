# API Contracts: Remove Mode Display and Add Category Dropdown

## Overview
This document defines the API contracts for the category dropdown feature. The contracts are based on existing functionality and require minimal changes to the current implementation.

## Base URL
```
/api/tastings
```

## Authentication
All endpoints require authentication via Supabase session token.

## Endpoints

### 1. Update Session Category
**Endpoint**: `PUT /api/tastings/[id]/category`

**Purpose**: Update the category of an existing tasting session

**Request**:
```typescript
interface UpdateCategoryRequest {
  category: string;
  custom_category_name?: string;
}
```

**Request Body**:
```json
{
  "category": "coffee",
  "custom_category_name": null
}
```

**Response**:
```typescript
interface UpdateCategoryResponse {
  success: boolean;
  session: {
    id: string;
    category: string;
    custom_category_name: string | null;
    updated_at: string;
  };
  message?: string;
  error?: string;
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "session": {
    "id": "uuid-here",
    "category": "coffee",
    "custom_category_name": null,
    "updated_at": "2024-12-19T10:30:00Z"
  },
  "message": "Category updated successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid category or missing required fields
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized to update this session
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Database or server error

### 2. Get Available Categories
**Endpoint**: `GET /api/categories`

**Purpose**: Retrieve list of available categories for dropdown

**Response**:
```typescript
interface CategoriesResponse {
  success: boolean;
  categories: Array<{
    id: string;
    name: string;
    display_name: string;
  }>;
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "categories": [
    { "id": "coffee", "name": "Coffee", "display_name": "Coffee" },
    { "id": "tea", "name": "Tea", "display_name": "Tea" },
    { "id": "wine", "name": "Wine", "display_name": "Wine" },
    { "id": "spirits", "name": "Spirits", "display_name": "Spirits" },
    { "id": "beer", "name": "Beer", "display_name": "Beer" },
    { "id": "chocolate", "name": "Chocolate", "display_name": "Chocolate" },
    { "id": "other", "name": "Other", "display_name": "Other" }
  ]
}
```

## Validation Rules

### Category Validation
- `category` must be one of: coffee, tea, wine, spirits, beer, chocolate, other
- If `category` is "other", `custom_category_name` must be provided and non-empty
- `custom_category_name` must be a string with length 1-100 characters

### Authorization
- User must be authenticated
- User must be the owner of the session (session.user_id === user.id)
- Session must exist and be active

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": "Invalid category. Must be one of: coffee, tea, wine, spirits, beer, chocolate, other",
  "code": "INVALID_CATEGORY"
}
```

### Authorization Errors
```json
{
  "success": false,
  "error": "You are not authorized to update this session",
  "code": "UNAUTHORIZED"
}
```

### Not Found Errors
```json
{
  "success": false,
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND"
}
```

## Rate Limiting
- Category updates: 10 requests per minute per user
- Category list: 60 requests per minute per user

## Caching
- Category list can be cached for 1 hour (static data)
- Session updates are not cached (real-time data)

## Implementation Notes

### Existing Functionality
The category update functionality already exists in the codebase:
- `handleCategoryChange` function in `QuickTastingSession.tsx`
- Direct Supabase client usage for database updates
- Toast notifications for success/error feedback

### Required Changes
1. **No new API endpoints needed** - existing Supabase client handles updates
2. **No new validation logic needed** - existing validation is sufficient
3. **No new error handling needed** - existing error handling is comprehensive

### Frontend Integration
```typescript
// Existing function can be reused as-is
const handleCategoryChange = async (newCategory: string) => {
  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .update({ category: newCategory })
      .eq('id', session.id)
      .select()
      .single();

    if (error) throw error;

    const updatedSession = { ...session, category: newCategory };
    onSessionUpdate?.(updatedSession);
    toast.success('Category updated!');
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error('Failed to update category');
  }
};
```

## Testing Requirements

### Contract Tests
- Test valid category updates
- Test invalid category values
- Test authorization requirements
- Test error handling scenarios

### Integration Tests
- Test category dropdown functionality
- Test mode display removal
- Test session state updates
- Test error feedback display

### E2E Tests
- Test complete user workflow
- Test category change persistence
- Test UI responsiveness
- Test accessibility compliance
