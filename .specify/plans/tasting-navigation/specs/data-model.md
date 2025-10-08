# Data Model: Tasting Session Navigation

## Overview
This document defines the data model for the tasting session navigation feature. No database schema changes are required as the existing tables support all needed functionality.

## Existing Database Schema

### quick_tastings Table
```sql
CREATE TABLE IF NOT EXISTS "public"."quick_tastings" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "category" text NOT NULL,
    "session_name" text,
    "notes" text,
    "total_items" integer DEFAULT 0,
    "completed_items" integer DEFAULT 0,
    "average_score" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "quick_tastings_category_check" CHECK (("category" = ANY (ARRAY['coffee', 'tea', 'wine', 'spirits', 'beer', 'chocolate'])))
);
```

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `auth.users(id)` ON DELETE CASCADE  
**Constraints:** Category must be one of: coffee, tea, wine, spirits, beer, chocolate

### quick_tasting_items Table
```sql
CREATE TABLE IF NOT EXISTS "public"."quick_tasting_items" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "tasting_id" uuid NOT NULL,
    "item_name" text NOT NULL,
    "notes" text,
    "aroma" text,
    "flavor" text,
    "flavor_scores" jsonb,
    "overall_score" integer,
    "photo_url" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "quick_tasting_items_overall_score_check" CHECK ((("overall_score" >= 1) AND ("overall_score" <= 100)))
);
```

**Primary Key:** `id`  
**Foreign Keys:** `tasting_id` → `quick_tastings(id)` ON DELETE CASCADE  
**Constraints:** Overall score must be between 1-100

## TypeScript Interfaces

### Core Interfaces
```typescript
interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  custom_category_name?: string | null;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mode: string;
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

interface TastingItemData {
  id: string;
  tasting_id: string;
  item_name: string;
  notes?: string;
  aroma?: string;
  flavor?: string;
  flavor_scores?: Record<string, number>;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Navigation-Specific Interfaces
```typescript
interface ItemNavigationState {
  currentItemIndex: number;
  items: TastingItemData[];
  totalItems: number;
  completedItems: number;
}

interface NavigationItem {
  id: string;
  index: number;
  name: string;
  isCompleted: boolean;
  hasPhoto: boolean;
  score?: number;
  isCurrent: boolean;
}

interface ItemNavigationProps {
  items: TastingItemData[];
  currentIndex: number;
  onItemSelect: (index: number) => void;
  className?: string;
}
```

## State Management

### Component State
```typescript
// QuickTastingSession.tsx state
interface QuickTastingSessionState {
  // Existing state
  items: TastingItemData[];
  currentItemIndex: number;
  phase: 'setup' | 'tasting';
  userRole: string;
  userPermissions: any;
  showEditTastingDashboard: boolean;
  showItemSuggestions: boolean;
  isEditingSessionName: boolean;
  editingSessionName: string;
  
  // New navigation state
  showItemNavigation: boolean;
  navigationExpanded: boolean;
}
```

### State Transitions
```typescript
// Navigation state transitions
type NavigationAction = 
  | { type: 'SET_CURRENT_ITEM'; payload: number }
  | { type: 'NEXT_ITEM' }
  | { type: 'PREVIOUS_ITEM' }
  | { type: 'TOGGLE_NAVIGATION' }
  | { type: 'UPDATE_ITEM'; payload: { index: number; item: TastingItemData } };

// State reducer
const navigationReducer = (state: ItemNavigationState, action: NavigationAction): ItemNavigationState => {
  switch (action.type) {
    case 'SET_CURRENT_ITEM':
      return {
        ...state,
        currentItemIndex: Math.max(0, Math.min(action.payload, state.items.length - 1))
      };
    case 'NEXT_ITEM':
      return {
        ...state,
        currentItemIndex: Math.min(state.currentItemIndex + 1, state.items.length - 1)
      };
    case 'PREVIOUS_ITEM':
      return {
        ...state,
        currentItemIndex: Math.max(state.currentItemIndex - 1, 0)
      };
    default:
      return state;
  }
};
```

## Data Flow

### Navigation Data Flow
```
User Action → Navigation Component → State Update → UI Re-render
     ↓
Item Selection → setCurrentItemIndex → TastingItem Update → Form State Reset
```

### Item Update Flow
```
Item Edit → Local State → Debounced Update → Database → Real-time Sync
     ↓
Form Change → setLocalState → setTimeout → Supabase Update → Trigger Update
```

## Database Queries

### Existing Queries (No Changes)
```typescript
// Load tasting items
const { data, error } = await supabase
  .from('quick_tasting_items')
  .select('*')
  .eq('tasting_id', session.id)
  .order('created_at', { ascending: true });

// Update item
const { data, error } = await supabase
  .from('quick_tasting_items')
  .update(updates)
  .eq('id', item.id)
  .select()
  .single();

// Update session
const { data, error } = await supabase
  .from('quick_tastings')
  .update(updates)
  .eq('id', session.id)
  .select()
  .single();
```

### Navigation-Specific Queries
```typescript
// Get item completion status
const getItemCompletionStatus = (item: TastingItemData): boolean => {
  return item.overall_score !== null && item.overall_score !== undefined;
};

// Get navigation items
const getNavigationItems = (items: TastingItemData[], currentIndex: number): NavigationItem[] => {
  return items.map((item, index) => ({
    id: item.id,
    index,
    name: item.item_name,
    isCompleted: getItemCompletionStatus(item),
    hasPhoto: !!item.photo_url,
    score: item.overall_score,
    isCurrent: index === currentIndex
  }));
};
```

## Validation Rules

### Item Navigation Validation
```typescript
const validateItemIndex = (index: number, totalItems: number): boolean => {
  return index >= 0 && index < totalItems;
};

const validateNavigationState = (state: ItemNavigationState): boolean => {
  return (
    state.currentItemIndex >= 0 &&
    state.currentItemIndex < state.items.length &&
    state.items.length === state.totalItems
  );
};
```

### Form State Validation
```typescript
const validateItemData = (item: Partial<TastingItemData>): boolean => {
  if (item.overall_score !== undefined) {
    return item.overall_score >= 1 && item.overall_score <= 100;
  }
  return true;
};
```

## Performance Considerations

### State Optimization
- Use `useMemo` for navigation items calculation
- Implement `useCallback` for navigation handlers
- Debounce item updates to prevent excessive API calls

### Rendering Optimization
- Virtual scrolling for large item lists (future enhancement)
- Lazy loading of item details
- Memoized navigation components

## Security Considerations

### Row Level Security
- All queries respect existing RLS policies
- User can only access their own tasting sessions
- Item updates are validated against user ownership

### Input Validation
- All user inputs are validated before database updates
- XSS prevention through proper sanitization
- SQL injection prevention through parameterized queries

## Migration Strategy

### No Database Migration Required
- Existing schema supports all functionality
- No breaking changes to existing data
- Backward compatibility maintained

### Code Migration
- Gradual rollout of navigation components
- Feature flags for new navigation (optional)
- A/B testing for user experience validation

## Testing Data

### Test Scenarios
```typescript
// Test data for navigation
const mockTastingSession: QuickTasting = {
  id: 'test-session-id',
  user_id: 'test-user-id',
  category: 'coffee',
  session_name: 'Test Session',
  total_items: 3,
  completed_items: 1,
  average_score: 75.5,
  created_at: '2025-01-27T10:00:00Z',
  updated_at: '2025-01-27T10:00:00Z',
  mode: 'quick'
};

const mockTastingItems: TastingItemData[] = [
  {
    id: 'item-1',
    tasting_id: 'test-session-id',
    item_name: 'Ethiopian Coffee',
    notes: 'Bright and fruity',
    aroma: 'Floral and citrus',
    flavor: 'Lemon and bergamot',
    overall_score: 85,
    created_at: '2025-01-27T10:00:00Z',
    updated_at: '2025-01-27T10:00:00Z'
  },
  {
    id: 'item-2',
    tasting_id: 'test-session-id',
    item_name: 'Colombian Coffee',
    notes: 'Chocolate and nutty',
    overall_score: null,
    created_at: '2025-01-27T10:05:00Z',
    updated_at: '2025-01-27T10:05:00Z'
  },
  {
    id: 'item-3',
    tasting_id: 'test-session-id',
    item_name: 'Guatemalan Coffee',
    notes: '',
    overall_score: null,
    created_at: '2025-01-27T10:10:00Z',
    updated_at: '2025-01-27T10:10:00Z'
  }
];
```

## Conclusion

The data model for tasting session navigation leverages the existing database schema without requiring any changes. The TypeScript interfaces provide type safety for the new navigation components, and the state management approach ensures smooth transitions between items while maintaining data consistency.
