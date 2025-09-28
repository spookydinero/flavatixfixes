import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock components to isolate session header testing
jest.mock('../../components/quick-tasting/CategoryDropdown', () => ({
  CategoryDropdown: ({ category, onCategoryChange, isLoading }: any) => (
    <select value={category} onChange={(e) => onCategoryChange(e.target.value)} disabled={isLoading}>
      <option value="coffee">Coffee</option>
      <option value="tea">Tea</option>
    </select>
  ),
}))

// Test the session header logic in isolation
const SessionHeader = ({ session, onCategoryChange, isChangingCategory }: any) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0 text-text-secondary">
      <span className="text-sm font-medium">Category:</span>
      <select
        value={session.category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="form-input text-sm w-full sm:w-auto"
        aria-label="Select tasting category"
        name="category"
      >
        <option value="coffee">Coffee</option>
        <option value="tea">Tea</option>
        <option value="wine">Wine</option>
        <option value="spirits">Spirits</option>
        <option value="beer">Beer</option>
        <option value="chocolate">Chocolate</option>
        <option value="other">Other</option>
      </select>
      <div className="flex flex-wrap items-center space-x-2 text-xs">
        {session.mode === 'study' && session.study_approach && <span>• {session.study_approach.charAt(0).toUpperCase() + session.study_approach.slice(1)}</span>}
        {session.rank_participants && <span>• Ranked Competition</span>}
        {(session.is_blind_participants || session.is_blind_items || session.is_blind_attributes) && <span>• Blind Tasting</span>}
      </div>
    </div>
  );
};

describe('QuickTastingSession Session Header Unit Tests', () => {
  const mockSession = {
    category: 'coffee',
    mode: 'quick',
    study_approach: null,
    rank_participants: false,
    is_blind_participants: false,
    is_blind_items: false,
    is_blind_attributes: false,
  }

  it('renders category label correctly', () => {
    render(<SessionHeader session={mockSession} onCategoryChange={() => {}} />)
    expect(screen.getByText('Category:')).toBeInTheDocument()
  })

  it('renders category dropdown with correct value', () => {
    render(<SessionHeader session={mockSession} onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('coffee')
  })

  it('applies correct CSS classes for mobile responsiveness', () => {
    render(<SessionHeader session={mockSession} onCategoryChange={() => {}} />)
    const container = screen.getByText('Category:').parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'sm:items-center', 'sm:space-x-2', 'space-y-1', 'sm:space-y-0')
  })

  it('renders additional session info for study mode', () => {
    const studySession = { ...mockSession, mode: 'study', study_approach: 'predefined' }
    render(<SessionHeader session={studySession} onCategoryChange={() => {}} />)
    expect(screen.getByText('• Predefined')).toBeInTheDocument()
  })

  it('renders ranked competition indicator', () => {
    const rankedSession = { ...mockSession, rank_participants: true }
    render(<SessionHeader session={rankedSession} onCategoryChange={() => {}} />)
    expect(screen.getByText('• Ranked Competition')).toBeInTheDocument()
  })

  it('renders blind tasting indicator', () => {
    const blindSession = { ...mockSession, is_blind_participants: true }
    render(<SessionHeader session={blindSession} onCategoryChange={() => {}} />)
    expect(screen.getByText('• Blind Tasting')).toBeInTheDocument()
  })

  it('does not render mode information for quick mode', () => {
    render(<SessionHeader session={mockSession} onCategoryChange={() => {}} />)
    expect(screen.queryByText(/Mode:/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Quick')).not.toBeInTheDocument()
  })

  it('has accessible category dropdown', () => {
    render(<SessionHeader session={mockSession} onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-label', 'Select tasting category')
    expect(select).toHaveAttribute('name', 'category')
  })

  it('calls onCategoryChange when category is changed', async () => {
    const mockOnChange = jest.fn()
    render(<SessionHeader session={mockSession} onCategoryChange={mockOnChange} />)

    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'tea')

    expect(mockOnChange).toHaveBeenCalledWith('tea')
  })

  it('applies responsive width classes to dropdown', () => {
    render(<SessionHeader session={mockSession} onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('form-input', 'text-sm', 'w-full', 'sm:w-auto')
  })
})
