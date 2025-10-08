import React from 'react'

interface CategoryDropdownProps {
  /** The currently selected category value */
  category: string
  /** Callback function called when user selects a different category */
  onCategoryChange: (category: string) => void
  /** Optional additional CSS classes to apply to the select element */
  className?: string
  /** Whether the dropdown is in a loading state (disables interaction) */
  isLoading?: boolean
}

/**
 * CategoryDropdown - A reusable dropdown component for selecting tasting categories
 *
 * This component provides a standardized way to select from available tasting categories
 * including coffee, tea, wine, spirits, beer, chocolate, and other. It supports loading
 * states and accessibility features.
 *
 * @example
 * ```tsx
 * <CategoryDropdown
 *   category="coffee"
 *   onCategoryChange={(newCategory) => console.log(newCategory)}
 *   isLoading={false}
 * />
 * ```
 */

export const CATEGORIES = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'wine', name: 'Wine' },
  { id: 'spirits', name: 'Spirits' },
  { id: 'beer', name: 'Beer' },
  { id: 'chocolate', name: 'Chocolate' },
  { id: 'other', name: 'Other' },
]

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  category,
  onCategoryChange,
  className = '',
  isLoading = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(event.target.value)
  }

  return (
    <select
      value={category}
      onChange={handleChange}
      disabled={isLoading}
      className={`form-input ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Select tasting category"
      name="category"
    >
      {CATEGORIES.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
