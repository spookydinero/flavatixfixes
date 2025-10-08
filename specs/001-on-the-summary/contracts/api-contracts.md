# API Contracts: Enhanced Tasting Summary Display

## Overview
This document defines the API contracts for the enhanced tasting summary display feature. Since this is primarily a display enhancement, no new API endpoints are required. The existing database queries will be updated to include the new aroma and flavor fields.

## Database Query Contracts

### Get Tasting Items Query
**Endpoint**: Supabase Query (not REST API)
**Method**: SELECT query on `quick_tasting_items` table

#### Request
```typescript
const { data, error } = await supabase
  .from('quick_tasting_items')
  .select('*')
  .eq('tasting_id', sessionId)
  .order('created_at', { ascending: true });
```

#### Response Schema
```typescript
interface TastingItemResponse {
  id: string;
  tasting_id: string;
  item_name: string;
  notes: string | null;
  aroma: string | null;        // NEW FIELD
  flavor: string | null;       // NEW FIELD
  flavor_scores: Record<string, number> | null;
  overall_score: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}
```

#### Response Example
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "tasting_id": "987fcdeb-51a2-43d7-8f9e-123456789abc",
    "item_name": "Coffee 1",
    "notes": "Very good coffee with rich flavor",
    "aroma": "Rich, chocolatey aroma with hints of caramel",
    "flavor": "Bold and smooth with notes of dark chocolate",
    "flavor_scores": {
      "bitterness": 3,
      "acidity": 4,
      "body": 5
    },
    "overall_score": 85,
    "photo_url": null,
    "created_at": "2024-12-19T10:30:00Z",
    "updated_at": "2024-12-19T10:35:00Z"
  }
]
```

## Component Interface Contracts

### QuickTastingSummary Component Props
```typescript
interface QuickTastingSummaryProps {
  session: QuickTasting;
  onStartNewSession: () => void;
}
```

### TastingItemData Interface
```typescript
interface TastingItemData {
  id: string;
  tasting_id: string;
  item_name: string;
  notes?: string;
  aroma?: string;        // NEW FIELD
  flavor?: string;       // NEW FIELD
  flavor_scores?: Record<string, number>;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}
```

## Display Logic Contracts

### Field Display Rules
1. **Conditional Rendering**: Only display fields that have non-empty content
2. **Field Order**: Aroma → Flavor → Notes (natural tasting progression)
3. **Styling**: Consistent with existing design system
4. **Accessibility**: Proper ARIA labels and semantic HTML

### Expanded Item Display Contract
```typescript
interface ExpandedItemDisplay {
  // Display aroma field if present
  aroma?: {
    label: "Aroma";
    content: string;
    visible: boolean;
  };
  
  // Display flavor field if present
  flavor?: {
    label: "Flavor";
    content: string;
    visible: boolean;
  };
  
  // Display notes field if present
  notes?: {
    label: "Notes";
    content: string;
    visible: boolean;
  };
}
```

## Error Handling Contracts

### Database Query Errors
```typescript
interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Error handling for missing fields
const handleMissingFields = (item: TastingItemData) => {
  // Gracefully handle items without aroma/flavor data
  return {
    hasAroma: Boolean(item.aroma?.trim()),
    hasFlavor: Boolean(item.flavor?.trim()),
    hasNotes: Boolean(item.notes?.trim())
  };
};
```

### Component Error States
```typescript
interface ComponentErrorState {
  isLoading: boolean;
  error: string | null;
  items: TastingItemData[];
}

// Error handling for data loading
const handleDataLoadingError = (error: any) => {
  console.error('Error loading tasting items:', error);
  toast.error('Failed to load tasting items');
  return {
    isLoading: false,
    error: 'Failed to load tasting items',
    items: []
  };
};
```

## Validation Contracts

### Field Content Validation
```typescript
interface FieldValidation {
  aroma: {
    maxLength: number; // No limit for text fields
    required: false;
    trim: true;
  };
  flavor: {
    maxLength: number; // No limit for text fields
    required: false;
    trim: true;
  };
  notes: {
    maxLength: number; // No limit for text fields
    required: false;
    trim: true;
  };
}
```

### Display Validation
```typescript
interface DisplayValidation {
  // Ensure fields are only displayed when they have content
  shouldDisplayField: (content: string | null | undefined) => boolean;
  
  // Ensure proper field ordering
  fieldOrder: ['aroma', 'flavor', 'notes'];
  
  // Ensure consistent styling
  stylingConsistency: {
    labelClass: 'text-small font-body font-medium text-text-secondary';
    contentClass: 'text-small font-body text-text-primary mt-xs';
  };
}
```

## Performance Contracts

### Query Performance
- **Response Time**: < 100ms for typical session (1-10 items)
- **Data Size**: Minimal impact (text fields only when populated)
- **Caching**: No additional caching needed (existing patterns apply)

### Rendering Performance
- **Conditional Rendering**: Only render fields with content
- **DOM Elements**: Minimal additional elements (3 fields max per item)
- **Re-renders**: No impact on existing re-render patterns

## Backward Compatibility Contracts

### Existing Data Compatibility
- **NULL Fields**: Gracefully handle items without aroma/flavor data
- **Display Logic**: Show only available fields
- **No Breaking Changes**: Existing functionality remains intact

### Component Compatibility
- **Props Interface**: No breaking changes to existing props
- **State Management**: No changes to existing state patterns
- **Event Handling**: No changes to existing event handlers
