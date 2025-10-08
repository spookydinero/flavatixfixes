# Data Model: Enhanced Tasting Summary Display

## Overview
This document defines the data model for enhancing the tasting summary display to show aroma and flavor inputs alongside notes. The changes involve database schema updates and component interface modifications.

## Database Schema Changes

### quick_tasting_items Table Update
```sql
-- Add aroma and flavor fields to existing table
ALTER TABLE quick_tasting_items 
ADD COLUMN IF NOT EXISTS aroma TEXT,
ADD COLUMN IF NOT EXISTS flavor TEXT;
```

**Updated Schema**:
```sql
CREATE TABLE IF NOT EXISTS "public"."quick_tasting_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tasting_id" "uuid" NOT NULL,
    "item_name" "text" NOT NULL,
    "notes" "text",
    "aroma" "text",                    -- NEW FIELD
    "flavor" "text",                   -- NEW FIELD
    "flavor_scores" "jsonb",
    "overall_score" integer,
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quick_tasting_items_overall_score_check" CHECK ((("overall_score" >= 1) AND ("overall_score" <= 100)))
);
```

## TypeScript Interface Updates

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

### Supabase Database Types Update
```typescript
// Update lib/supabase.ts Database type
quick_tasting_items: {
  Row: {
    id: string;
    tasting_id: string;
    item_name: string;
    notes: string | null;
    aroma: string | null;        // NEW FIELD
    flavor: string | null;       // NEW FIELD
    flavor_scores: any | null;
    overall_score: number | null;
    photo_url: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    tasting_id: string;
    item_name: string;
    notes?: string | null;
    aroma?: string | null;       // NEW FIELD
    flavor?: string | null;      // NEW FIELD
    flavor_scores?: any | null;
    overall_score?: number | null;
    photo_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    tasting_id?: string;
    item_name?: string;
    notes?: string | null;
    aroma?: string | null;       // NEW FIELD
    flavor?: string | null;      // NEW FIELD
    flavor_scores?: any | null;
    overall_score?: number | null;
    photo_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
};
```

## Component Data Flow

### QuickTastingSummary Component
```typescript
interface QuickTastingSummaryProps {
  session: QuickTasting;
  onStartNewSession: () => void;
}

// Display logic for expanded item view
const renderExpandedContent = (item: TastingItemData) => {
  return (
    <div className="p-sm border-t border-border-primary bg-background-surface">
      {item.aroma && (
        <div className="mb-sm">
          <label className="text-small font-body font-medium text-text-secondary">Aroma</label>
          <p className="text-small font-body text-text-primary mt-xs">{item.aroma}</p>
        </div>
      )}
      {item.flavor && (
        <div className="mb-sm">
          <label className="text-small font-body font-medium text-text-secondary">Flavor</label>
          <p className="text-small font-body text-text-primary mt-xs">{item.flavor}</p>
        </div>
      )}
      {item.notes && (
        <div>
          <label className="text-small font-body font-medium text-text-secondary">Notes</label>
          <p className="text-small font-body text-text-primary mt-xs">{item.notes}</p>
        </div>
      )}
    </div>
  );
};
```

## Data Validation Rules

### Field Constraints
- **aroma**: Optional text field, no length limit
- **flavor**: Optional text field, no length limit
- **notes**: Optional text field, no length limit (existing)

### Display Logic Rules
- Only display fields that have content (non-empty strings)
- Maintain field order: Aroma → Flavor → Notes
- Preserve existing expand/collapse functionality
- Handle null/undefined values gracefully

## State Management

### Component State
```typescript
// QuickTastingSummary component state
const [items, setItems] = useState<TastingItemData[]>([]);
const [expandedItem, setExpandedItem] = useState<string | null>(null);

// Data loading (no changes needed)
const loadTastingItems = async () => {
  const { data, error } = await supabase
    .from('quick_tasting_items')
    .select('*')  // Will now include aroma and flavor fields
    .eq('tasting_id', session.id)
    .order('created_at', { ascending: true });
};
```

## Migration Strategy

### Database Migration
1. Add new columns with `IF NOT EXISTS` to prevent conflicts
2. Existing data remains intact (new fields will be NULL)
3. No data loss or breaking changes

### Component Migration
1. Update TypeScript interfaces to match database schema
2. Update component rendering logic to display new fields
3. Maintain backward compatibility with existing sessions

### Testing Strategy
1. Test with existing sessions (no aroma/flavor data)
2. Test with new sessions (with aroma/flavor data)
3. Test mixed scenarios (some items with partial data)

## Performance Considerations

### Database Queries
- No impact on existing queries (new fields are optional)
- No additional indexes needed (text fields not searchable)
- Minimal storage overhead (only when fields are populated)

### Component Rendering
- Conditional rendering prevents unnecessary DOM elements
- No performance impact on existing functionality
- Maintains current expand/collapse performance
