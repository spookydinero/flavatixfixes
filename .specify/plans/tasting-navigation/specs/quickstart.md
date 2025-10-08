# Quickstart Guide: Tasting Session Navigation

## Overview
This guide provides a quick start for implementing the tasting session navigation feature. The feature adds flexible navigation between tasting items during an active session.

## Prerequisites
- Existing FlavorWheel project with tasting functionality
- React/TypeScript development environment
- Supabase backend configured
- Understanding of existing QuickTastingSession component

## Quick Implementation

### 1. Create ItemNavigationDropdown Component

Create `components/quick-tasting/ItemNavigationDropdown.tsx`:

```typescript
import React, { useState } from 'react';
import { ChevronDown, CheckCircle, Circle, Camera } from 'lucide-react';

interface NavigationItem {
  id: string;
  index: number;
  name: string;
  isCompleted: boolean;
  hasPhoto: boolean;
  score?: number;
  isCurrent: boolean;
}

interface ItemNavigationDropdownProps {
  items: NavigationItem[];
  currentIndex: number;
  onItemSelect: (index: number) => void;
  className?: string;
}

export const ItemNavigationDropdown: React.FC<ItemNavigationDropdownProps> = ({
  items,
  currentIndex,
  onItemSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentItem = items.find(item => item.isCurrent);

  const handleItemClick = (index: number) => {
    onItemSelect(index);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className="flex items-center">
          <span className="mr-2">Item {currentIndex + 1} of {items.length}</span>
          {currentItem && (
            <span className="text-gray-500 truncate max-w-32">
              {currentItem.name}
            </span>
          )}
        </span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.index)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                item.isCurrent ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center min-w-0 flex-1">
                <div className="flex items-center mr-2">
                  {item.isCompleted ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                </div>
                <span className="truncate">
                  {item.index + 1}. {item.name}
                </span>
              </div>
              <div className="flex items-center ml-2">
                {item.hasPhoto && (
                  <Camera size={14} className="text-gray-400 mr-1" />
                )}
                {item.score && (
                  <span className="text-xs text-gray-500">
                    {item.score}/100
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Update QuickTastingSession Component

Add navigation functionality to `components/quick-tasting/QuickTastingSession.tsx`:

```typescript
// Add import
import { ItemNavigationDropdown } from './ItemNavigationDropdown';

// Add to component state (if not already present)
const [showItemNavigation, setShowItemNavigation] = useState(false);

// Add navigation helper functions
const getNavigationItems = (): NavigationItem[] => {
  return items.map((item, index) => ({
    id: item.id,
    index,
    name: item.item_name,
    isCompleted: item.overall_score !== null && item.overall_score !== undefined,
    hasPhoto: !!item.photo_url,
    score: item.overall_score,
    isCurrent: index === currentItemIndex
  }));
};

const handleItemNavigation = (index: number) => {
  if (index >= 0 && index < items.length) {
    setCurrentItemIndex(index);
    setShowEditTastingDashboard(false);
    setShowItemSuggestions(false);
  }
};

// Add to JSX (in the header section)
{items.length > 1 && (
  <div className="mb-4">
    <ItemNavigationDropdown
      items={getNavigationItems()}
      currentIndex={currentItemIndex}
      onItemSelect={handleItemNavigation}
      className="w-full max-w-sm"
    />
  </div>
)}
```

### 3. Enhanced Navigation Controls

Add enhanced navigation buttons to the existing navigation section:

```typescript
// Enhanced navigation section
<div className="flex items-center justify-between mt-6">
  <div className="flex items-center space-x-2">
    <button
      onClick={handlePreviousItem}
      disabled={currentItemIndex === 0}
      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>
    
    <span className="text-sm text-gray-500 px-2">
      {currentItemIndex + 1} of {items.length}
    </span>
    
    <button
      onClick={handleNextOrAdd}
      className="btn-primary"
    >
      {currentItemIndex < items.length - 1 ? 'Next' : 'Add Item'}
    </button>
  </div>
  
  {items.length > 1 && (
    <button
      onClick={() => setShowItemNavigation(!showItemNavigation)}
      className="text-sm text-primary-600 hover:text-primary-700"
    >
      {showItemNavigation ? 'Hide' : 'Show'} All Items
    </button>
  )}
</div>
```

### 4. Update QuickTastingSummary

Enhance the summary to show aroma and flavor data in `components/quick-tasting/QuickTastingSummary.tsx`:

```typescript
// In the expanded item details section, add:
{expandedItem === item.id && (
  <div className="p-sm border-t border-border-default bg-background-app">
    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-md">
      {/* Photo */}
      {item.photo_url && (
        <div>
          <h5 className="text-small font-body font-medium text-text-secondary mb-xs">Photo</h5>
          <img
            src={item.photo_url}
            alt={item.item_name}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      {/* Aroma */}
      {item.aroma && (
        <div>
          <h5 className="text-small font-body font-medium text-text-secondary mb-xs">Aroma</h5>
          <p className="text-text-primary text-small font-body leading-relaxed">{item.aroma}</p>
        </div>
      )}
      
      {/* Flavor */}
      {item.flavor && (
        <div>
          <h5 className="text-small font-body font-medium text-text-secondary mb-xs">Flavor</h5>
          <p className="text-text-primary text-small font-body leading-relaxed">{item.flavor}</p>
        </div>
      )}
      
      {/* Notes */}
      {item.notes && (
        <div>
          <h5 className="text-small font-body font-medium text-text-secondary mb-xs">Notes</h5>
          <p className="text-text-primary text-small font-body leading-relaxed">{item.notes}</p>
        </div>
      )}
    </div>
    
    {/* Flavor Scores */}
    {item.flavor_scores && Object.keys(item.flavor_scores).length > 0 && (
      <div className="mt-sm">
        <h5 className="text-small font-body font-medium text-text-secondary mb-xs">Flavor Profile</h5>
        <div className="flex flex-wrap gap-xs">
          {Object.entries(item.flavor_scores).map(([flavor, score]) => (
            <div
              key={flavor}
              className="px-sm py-xs bg-primary/10 text-primary rounded-full text-small font-body font-medium"
            >
              {flavor} ({score}/5)
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
```

## Testing the Implementation

### 1. Basic Navigation Test
```typescript
// Test navigation between items
const testNavigation = () => {
  // Create a session with multiple items
  const items = [
    { id: '1', item_name: 'Item 1', overall_score: 85 },
    { id: '2', item_name: 'Item 2', overall_score: null },
    { id: '3', item_name: 'Item 3', overall_score: null }
  ];
  
  // Test navigation dropdown
  const dropdown = screen.getByRole('button', { name: /item 1 of 3/i });
  fireEvent.click(dropdown);
  
  // Test item selection
  const item2 = screen.getByText('2. Item 2');
  fireEvent.click(item2);
  
  // Verify navigation
  expect(screen.getByText('Item 2 of 3')).toBeInTheDocument();
};
```

### 2. State Management Test
```typescript
// Test state consistency during navigation
const testStateManagement = () => {
  const { result } = renderHook(() => useTastingNavigation(mockItems));
  
  act(() => {
    result.current.jumpToItem(2);
  });
  
  expect(result.current.currentItemIndex).toBe(2);
  expect(result.current.currentItem.id).toBe('item-3');
};
```

## Common Issues and Solutions

### Issue 1: Navigation State Not Updating
**Problem:** Item navigation doesn't update the current item
**Solution:** Ensure `setCurrentItemIndex` is called with the correct index

### Issue 2: Dropdown Not Closing
**Problem:** Navigation dropdown stays open after selection
**Solution:** Add `setIsOpen(false)` in the item click handler

### Issue 3: Performance Issues
**Problem:** Slow navigation with many items
**Solution:** Implement virtualization for large item lists

### Issue 4: Mobile Responsiveness
**Problem:** Dropdown doesn't work well on mobile
**Solution:** Use touch-friendly interactions and proper z-index

## Next Steps

1. **Test the implementation** with real tasting sessions
2. **Gather user feedback** on navigation usability
3. **Optimize performance** for large item lists
4. **Add keyboard shortcuts** for power users
5. **Implement bulk editing** features

## Resources

- [React Dropdown Patterns](https://react.dev/learn/conditional-rendering)
- [Accessibility Guidelines](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [Mobile Touch Interactions](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

## Support

For issues or questions:
1. Check the existing QuickTastingSession component
2. Review the database schema in `schema.sql`
3. Test with the existing tasting functionality
4. Refer to the full feature specification
