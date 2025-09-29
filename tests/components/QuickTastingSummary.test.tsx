import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickTastingSummary from '../../components/quick-tasting/QuickTastingSummary';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock toast
jest.mock('../../lib/toast', () => ({
  toast: {
    error: jest.fn()
  }
}));

describe('QuickTastingSummary Enhanced Display', () => {
  const mockSession = {
    id: 'test-session-id',
    user_id: 'test-user-id',
    category: 'coffee',
    session_name: 'Test Session',
    total_items: 2,
    completed_items: 2,
    created_at: '2024-12-19T10:00:00Z',
    updated_at: '2024-12-19T10:30:00Z'
  };

  const mockOnStartNewSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Aroma Field Display', () => {
    it('should display aroma field when item has aroma data', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Great coffee',
          aroma: 'Rich, chocolatey aroma with hints of caramel',
          flavor: null,
          overall_score: 85,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockItems,
              error: null
            }))
          }))
        }))
      });

      render(
        <QuickTastingSummary 
          session={mockSession} 
          onStartNewSession={mockOnStartNewSession} 
        />
      );

      // Wait for items to load
      await screen.findByText('Coffee 1');

      // Click to expand the item - click on the item header div
      const itemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (itemHeader) {
        fireEvent.click(itemHeader);
      }

      // Check that aroma field is displayed
      expect(screen.getByText('Aroma')).toBeInTheDocument();
      expect(screen.getByText('Rich, chocolatey aroma with hints of caramel')).toBeInTheDocument();
    });

    it('should not display aroma field when item has no aroma data', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Great coffee',
          aroma: null,
          flavor: null,
          overall_score: 85,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockItems,
              error: null
            }))
          }))
        }))
      });

      render(
        <QuickTastingSummary 
          session={mockSession} 
          onStartNewSession={mockOnStartNewSession} 
        />
      );

      // Wait for items to load
      await screen.findByText('Coffee 1');

      // Click to expand the item - click on the item header div
      const itemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (itemHeader) {
        fireEvent.click(itemHeader);
      }

      // Check that aroma field is not displayed
      expect(screen.queryByText('Aroma')).not.toBeInTheDocument();
    });
  });

  describe('Flavor Field Display', () => {
    it('should display flavor field when item has flavor data', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Great coffee',
          aroma: null,
          flavor: 'Bold and smooth with notes of dark chocolate',
          overall_score: 85,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockItems,
              error: null
            }))
          }))
        }))
      });

      render(
        <QuickTastingSummary 
          session={mockSession} 
          onStartNewSession={mockOnStartNewSession} 
        />
      );

      // Wait for items to load
      await screen.findByText('Coffee 1');

      // Click to expand the item - click on the item header div
      const itemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (itemHeader) {
        fireEvent.click(itemHeader);
      }

      // Check that flavor field is displayed
      expect(screen.getByText('Flavor')).toBeInTheDocument();
      expect(screen.getByText('Bold and smooth with notes of dark chocolate')).toBeInTheDocument();
    });

    it('should not display flavor field when item has no flavor data', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Great coffee',
          aroma: null,
          flavor: null,
          overall_score: 85,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockItems,
              error: null
            }))
          }))
        }))
      });

      render(
        <QuickTastingSummary 
          session={mockSession} 
          onStartNewSession={mockOnStartNewSession} 
        />
      );

      // Wait for items to load
      await screen.findByText('Coffee 1');

      // Click to expand the item - click on the item header div
      const itemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (itemHeader) {
        fireEvent.click(itemHeader);
      }

      // Check that flavor field is not displayed
      expect(screen.queryByText('Flavor')).not.toBeInTheDocument();
    });
  });

  describe('Conditional Field Rendering', () => {
    it('should display fields in correct order: Aroma → Flavor → Notes', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Great coffee',
          aroma: 'Rich aroma',
          flavor: 'Bold flavor',
          overall_score: 85,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockItems,
              error: null
            }))
          }))
        }))
      });

      render(
        <QuickTastingSummary 
          session={mockSession} 
          onStartNewSession={mockOnStartNewSession} 
        />
      );

      // Wait for items to load
      await screen.findByText('Coffee 1');

      // Click to expand the item - click on the item header div
      const itemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (itemHeader) {
        fireEvent.click(itemHeader);
      }

      // Check that all fields are displayed in correct order
      const labels = screen.getAllByText(/^(Aroma|Flavor|Notes)$/);
      expect(labels[0]).toHaveTextContent('Aroma');
      expect(labels[1]).toHaveTextContent('Flavor');
      expect(labels[2]).toHaveTextContent('Notes');
    });

    it('should only display fields that have content', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Great coffee',
          aroma: null,
          flavor: 'Bold flavor',
          overall_score: 85,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockItems,
              error: null
            }))
          }))
        }))
      });

      render(
        <QuickTastingSummary 
          session={mockSession} 
          onStartNewSession={mockOnStartNewSession} 
        />
      );

      // Wait for items to load
      await screen.findByText('Coffee 1');

      // Click to expand the item - click on the item header div
      const itemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (itemHeader) {
        fireEvent.click(itemHeader);
      }

      // Check that only Flavor and Notes are displayed
      expect(screen.queryByText('Aroma')).not.toBeInTheDocument();
      expect(screen.getByText('Flavor')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });
  });
});
