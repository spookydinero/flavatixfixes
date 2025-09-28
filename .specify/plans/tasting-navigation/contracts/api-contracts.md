# API Contracts: Tasting Session Navigation

## Overview
This document defines the API contracts for the tasting session navigation feature. No new API endpoints are required as the existing endpoints support all needed functionality.

## Existing API Endpoints

### Tasting Session Management

#### GET /api/tastings/[id]
**Purpose:** Retrieve a specific tasting session  
**Method:** GET  
**Authentication:** Required  
**Authorization:** User must own the session or be a participant  

**Request:**
```typescript
interface GetTastingRequest {
  id: string; // Tasting session ID
}
```

**Response:**
```typescript
interface GetTastingResponse {
  success: boolean;
  data: QuickTasting;
  error?: string;
}
```

**Example:**
```typescript
// Request
GET /api/tastings/123e4567-e89b-12d3-a456-426614174000

// Response
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-123",
    "category": "coffee",
    "session_name": "Morning Tasting",
    "total_items": 3,
    "completed_items": 1,
    "average_score": 75.5,
    "created_at": "2025-01-27T10:00:00Z",
    "updated_at": "2025-01-27T10:00:00Z",
    "mode": "quick"
  }
}
```

#### PUT /api/tastings/[id]
**Purpose:** Update a tasting session  
**Method:** PUT  
**Authentication:** Required  
**Authorization:** User must own the session  

**Request:**
```typescript
interface UpdateTastingRequest {
  session_name?: string;
  notes?: string;
  category?: string;
  // ... other updatable fields
}
```

**Response:**
```typescript
interface UpdateTastingResponse {
  success: boolean;
  data: QuickTasting;
  error?: string;
}
```

### Tasting Items Management

#### GET /api/tastings/[id]/items
**Purpose:** Retrieve all items for a tasting session  
**Method:** GET  
**Authentication:** Required  
**Authorization:** User must have access to the session  

**Request:**
```typescript
interface GetTastingItemsRequest {
  id: string; // Tasting session ID
}
```

**Response:**
```typescript
interface GetTastingItemsResponse {
  success: boolean;
  data: TastingItemData[];
  error?: string;
}
```

**Example:**
```typescript
// Request
GET /api/tastings/123e4567-e89b-12d3-a456-426614174000/items

// Response
{
  "success": true,
  "data": [
    {
      "id": "item-1",
      "tasting_id": "123e4567-e89b-12d3-a456-426614174000",
      "item_name": "Ethiopian Coffee",
      "notes": "Bright and fruity",
      "aroma": "Floral and citrus",
      "flavor": "Lemon and bergamot",
      "overall_score": 85,
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

#### PUT /api/tastings/[id]/items/[itemId]
**Purpose:** Update a specific tasting item  
**Method:** PUT  
**Authentication:** Required  
**Authorization:** User must have access to the session  

**Request:**
```typescript
interface UpdateTastingItemRequest {
  item_name?: string;
  notes?: string;
  aroma?: string;
  flavor?: string;
  overall_score?: number;
  flavor_scores?: Record<string, number>;
  photo_url?: string;
}
```

**Response:**
```typescript
interface UpdateTastingItemResponse {
  success: boolean;
  data: TastingItemData;
  error?: string;
}
```

#### POST /api/tastings/[id]/items
**Purpose:** Create a new tasting item  
**Method:** POST  
**Authentication:** Required  
**Authorization:** User must have access to the session  

**Request:**
```typescript
interface CreateTastingItemRequest {
  item_name: string;
  notes?: string;
  aroma?: string;
  flavor?: string;
  overall_score?: number;
  flavor_scores?: Record<string, number>;
  photo_url?: string;
}
```

**Response:**
```typescript
interface CreateTastingItemResponse {
  success: boolean;
  data: TastingItemData;
  error?: string;
}
```

## Navigation-Specific API Usage

### Client-Side API Calls

#### Load Session with Items
```typescript
const loadTastingSession = async (sessionId: string) => {
  try {
    // Load session
    const sessionResponse = await fetch(`/api/tastings/${sessionId}`);
    const sessionData = await sessionResponse.json();
    
    // Load items
    const itemsResponse = await fetch(`/api/tastings/${sessionId}/items`);
    const itemsData = await itemsResponse.json();
    
    return {
      session: sessionData.data,
      items: itemsData.data
    };
  } catch (error) {
    console.error('Error loading tasting session:', error);
    throw error;
  }
};
```

#### Update Item with Navigation Context
```typescript
const updateTastingItem = async (
  sessionId: string, 
  itemId: string, 
  updates: Partial<TastingItemData>
) => {
  try {
    const response = await fetch(`/api/tastings/${sessionId}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update item');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error updating tasting item:', error);
    throw error;
  }
};
```

#### Navigate to Item (Client-Side Only)
```typescript
const navigateToItem = (
  items: TastingItemData[],
  targetIndex: number,
  setCurrentItemIndex: (index: number) => void
) => {
  if (targetIndex >= 0 && targetIndex < items.length) {
    setCurrentItemIndex(targetIndex);
    return true;
  }
  return false;
};
```

## Real-Time Updates

### Supabase Real-Time Subscriptions
```typescript
// Subscribe to tasting session updates
const subscribeToTastingSession = (sessionId: string, onUpdate: (data: any) => void) => {
  const supabase = getSupabaseClient();
  
  return supabase
    .channel(`tasting-session-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quick_tasting_items',
        filter: `tasting_id=eq.${sessionId}`
      },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();
};

// Subscribe to specific item updates
const subscribeToTastingItem = (itemId: string, onUpdate: (data: any) => void) => {
  const supabase = getSupabaseClient();
  
  return supabase
    .channel(`tasting-item-${itemId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quick_tasting_items',
        filter: `id=eq.${itemId}`
      },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();
};
```

## Error Handling

### Standard Error Responses
```typescript
interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// Common error codes
enum ErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

### Error Handling in Navigation
```typescript
const handleNavigationError = (error: any, fallbackAction: () => void) => {
  console.error('Navigation error:', error);
  
  // Show user-friendly error message
  toast.error('Failed to navigate to item. Please try again.');
  
  // Fallback to safe state
  fallbackAction();
};
```

## Performance Considerations

### Caching Strategy
```typescript
// Cache session data
const sessionCache = new Map<string, { data: QuickTasting; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedSession = (sessionId: string): QuickTasting | null => {
  const cached = sessionCache.get(sessionId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedSession = (sessionId: string, data: QuickTasting) => {
  sessionCache.set(sessionId, { data, timestamp: Date.now() });
};
```

### Debounced Updates
```typescript
// Debounce item updates to prevent excessive API calls
const debouncedUpdateItem = debounce(
  async (sessionId: string, itemId: string, updates: Partial<TastingItemData>) => {
    try {
      await updateTastingItem(sessionId, itemId, updates);
    } catch (error) {
      console.error('Debounced update failed:', error);
    }
  },
  500 // 500ms delay
);
```

## Security Considerations

### Authentication
- All API calls require valid authentication token
- JWT tokens are validated on each request
- Session tokens are refreshed automatically

### Authorization
- Row Level Security (RLS) policies enforce data access
- Users can only access their own tasting sessions
- Participants can only access sessions they're invited to

### Input Validation
```typescript
// Validate item updates
const validateItemUpdate = (updates: Partial<TastingItemData>): boolean => {
  if (updates.overall_score !== undefined) {
    if (updates.overall_score < 1 || updates.overall_score > 100) {
      return false;
    }
  }
  
  if (updates.item_name !== undefined) {
    if (typeof updates.item_name !== 'string' || updates.item_name.trim().length === 0) {
      return false;
    }
  }
  
  return true;
};
```

## Testing

### API Test Cases
```typescript
describe('Tasting Session Navigation API', () => {
  test('should load session with items', async () => {
    const sessionId = 'test-session-id';
    const result = await loadTastingSession(sessionId);
    
    expect(result.session).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
  });
  
  test('should update item successfully', async () => {
    const sessionId = 'test-session-id';
    const itemId = 'test-item-id';
    const updates = { notes: 'Updated notes' };
    
    const result = await updateTastingItem(sessionId, itemId, updates);
    
    expect(result.notes).toBe('Updated notes');
  });
  
  test('should handle navigation errors gracefully', () => {
    const items = [mockItem1, mockItem2];
    const result = navigateToItem(items, 5, jest.fn()); // Invalid index
    
    expect(result).toBe(false);
  });
});
```

## Conclusion

The API contracts for tasting session navigation leverage existing endpoints without requiring any new API development. The client-side navigation logic handles state management and user interactions, while the existing API endpoints provide the necessary data operations. Real-time updates ensure that navigation state remains synchronized across all clients.
