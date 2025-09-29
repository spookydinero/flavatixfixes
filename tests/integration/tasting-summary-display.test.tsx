import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Tasting Summary Display Integration Tests', () => {
  const mockSession = {
    id: 'test-session-id',
    user_id: 'test-user-id',
    category: 'coffee',
    session_name: 'Test Session',
    total_items: 3,
    completed_items: 3,
    created_at: '2024-12-19T10:00:00Z',
    updated_at: '2024-12-19T10:30:00Z'
  };

  const mockOnStartNewSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Tasting Session with All Fields', () => {
    it('should display all three fields (Aroma, Flavor, Notes) for items with complete data', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Excellent coffee, would buy again',
          aroma: 'Rich, chocolatey aroma with hints of caramel',
          flavor: 'Bold and smooth with notes of dark chocolate',
          overall_score: 85,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        },
        {
          id: 'item-2',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 2',
          notes: 'Good coffee, decent quality',
          aroma: 'Light, fruity aroma with citrus notes',
          flavor: 'Bright acidity with lemon and berry flavors',
          overall_score: 72,
          created_at: '2024-12-19T10:05:00Z',
          updated_at: '2024-12-19T10:05:00Z'
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
      await waitFor(() => {
        expect(screen.getByText('Coffee 1')).toBeInTheDocument();
        expect(screen.getByText('Coffee 2')).toBeInTheDocument();
      });

      // Expand first item - click on the item header div
      const firstItemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (firstItemHeader) {
        fireEvent.click(firstItemHeader);
      }

      // Check that all three fields are displayed for first item
      expect(screen.getByText('Aroma')).toBeInTheDocument();
      expect(screen.getByText('Rich, chocolatey aroma with hints of caramel')).toBeInTheDocument();
      expect(screen.getByText('Flavor')).toBeInTheDocument();
      expect(screen.getByText('Bold and smooth with notes of dark chocolate')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Excellent coffee, would buy again')).toBeInTheDocument();

      // Expand second item - click on the item header div
      const secondItemHeader = screen.getByText('Coffee 2').closest('div')?.parentElement;
      if (secondItemHeader) {
        fireEvent.click(secondItemHeader);
      }

      // Check that all three fields are displayed for second item
      expect(screen.getByText('Light, fruity aroma with citrus notes')).toBeInTheDocument();
      expect(screen.getByText('Bright acidity with lemon and berry flavors')).toBeInTheDocument();
      expect(screen.getByText('Good coffee, decent quality')).toBeInTheDocument();
    });
  });

  describe('Partial Data Display', () => {
    it('should display only available fields for items with partial data', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Only notes available',
          aroma: null,
          flavor: null,
          overall_score: 60,
          created_at: '2024-12-19T10:00:00Z',
          updated_at: '2024-12-19T10:00:00Z'
        },
        {
          id: 'item-2',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 2',
          notes: null,
          aroma: 'Only aroma available',
          flavor: 'Only flavor available',
          overall_score: 70,
          created_at: '2024-12-19T10:05:00Z',
          updated_at: '2024-12-19T10:05:00Z'
        },
        {
          id: 'item-3',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 3',
          notes: 'All fields available',
          aroma: 'Rich aroma',
          flavor: 'Bold flavor',
          overall_score: 80,
          created_at: '2024-12-19T10:10:00Z',
          updated_at: '2024-12-19T10:10:00Z'
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
      await waitFor(() => {
        expect(screen.getByText('Coffee 1')).toBeInTheDocument();
        expect(screen.getByText('Coffee 2')).toBeInTheDocument();
        expect(screen.getByText('Coffee 3')).toBeInTheDocument();
      });

      // Expand first item (only notes) - click on the item header div
      const firstItemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (firstItemHeader) {
        fireEvent.click(firstItemHeader);
      }

      // Check that only Notes is displayed for first item
      expect(screen.queryByText('Aroma')).not.toBeInTheDocument();
      expect(screen.queryByText('Flavor')).not.toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Only notes available')).toBeInTheDocument();

      // Expand second item (only aroma and flavor) - click on the item header div
      const secondItemHeader = screen.getByText('Coffee 2').closest('div')?.parentElement;
      if (secondItemHeader) {
        fireEvent.click(secondItemHeader);
      }

      // Check that only Aroma and Flavor are displayed for second item
      expect(screen.getByText('Aroma')).toBeInTheDocument();
      expect(screen.getByText('Only aroma available')).toBeInTheDocument();
      expect(screen.getByText('Flavor')).toBeInTheDocument();
      expect(screen.getByText('Only flavor available')).toBeInTheDocument();
      expect(screen.queryByText('Notes')).not.toBeInTheDocument();

      // Expand third item (all fields) - click on the item header div
      const thirdItemHeader = screen.getByText('Coffee 3').closest('div')?.parentElement;
      if (thirdItemHeader) {
        fireEvent.click(thirdItemHeader);
      }

      // Check that all three fields are displayed for third item
      expect(screen.getByText('Rich aroma')).toBeInTheDocument();
      expect(screen.getByText('Bold flavor')).toBeInTheDocument();
      expect(screen.getByText('All fields available')).toBeInTheDocument();
    });
  });

  describe('Field Display Order', () => {
    it('should display fields in correct order: Aroma → Flavor → Notes', async () => {
      const mockItems = [
        {
          id: 'item-1',
          tasting_id: 'test-session-id',
          item_name: 'Coffee 1',
          notes: 'Notes content',
          aroma: 'Aroma content',
          flavor: 'Flavor content',
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
      await waitFor(() => {
        expect(screen.getByText('Coffee 1')).toBeInTheDocument();
      });

      // Expand the item - click on the item header div
      const itemHeader = screen.getByText('Coffee 1').closest('div')?.parentElement;
      if (itemHeader) {
        fireEvent.click(itemHeader);
      }

      // Get all field labels and content
      const aromaLabel = screen.getByText('Aroma');
      const flavorLabel = screen.getByText('Flavor');
      const notesLabel = screen.getByText('Notes');

      // Check that labels appear in correct order
      const labels = [aromaLabel, flavorLabel, notesLabel];
      const labelTexts = labels.map(label => label.textContent);
      
      expect(labelTexts).toEqual(['Aroma', 'Flavor', 'Notes']);
    });
  });
});
