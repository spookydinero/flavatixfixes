import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import FlavorWheel from './FlavorWheel';
import TastingItem from './TastingItem';
import { toast } from '../../lib/toast';
import { Utensils } from 'lucide-react';

interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface TastingItemData {
  id: string;
  tasting_id: string;
  item_name: string;
  notes?: string;
  flavor_scores?: any;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

interface QuickTastingSessionProps {
  session: QuickTasting;
  onSessionComplete: (session: QuickTasting) => void;
}

const QuickTastingSession: React.FC<QuickTastingSessionProps> = ({
  session,
  onSessionComplete,
}) => {
  const [items, setItems] = useState<TastingItemData[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionNotes, setSessionNotes] = useState(session.notes || '');
  const supabase = getSupabaseClient() as any;

  useEffect(() => {
    loadTastingItems();
  }, [session.id]);

  const loadTastingItems = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .select('*')
        .eq('tasting_id', session.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading tasting items:', error);
      toast.error('Failed to load tasting items');
    }
  };

  const addNewItem = async () => {
    const itemName = `${session.category.charAt(0).toUpperCase() + session.category.slice(1)} ${items.length + 1}`;
    
    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .insert({
          tasting_id: session.id,
          item_name: itemName,
        })
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data]);
      setCurrentItemIndex(items.length);
      toast.success('New item added!');
    } catch (error) {
      console.error('Error adding new item:', error);
      toast.error('Failed to add new item');
    }
  };

  const updateItem = async (itemId: string, updates: Partial<TastingItemData>) => {
    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...data } : item
      ));
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const completeSession = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_tastings')
        .update({
          notes: sessionNotes,
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Tasting session completed!');
      onSessionComplete(data);
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    } finally {
      setIsLoading(false);
    }
  };

  const currentItem = items[currentItemIndex];
  const hasItems = items.length > 0;
  const completedItems = items.filter(item => item.overall_score !== null).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Session Header */}
      <div className="card p-md mb-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-h2 font-heading font-bold text-text-primary mb-2">
              {session.session_name}
            </h2>
            <p className="text-text-secondary">
              Category: {session.category.charAt(0).toUpperCase() + session.category.slice(1)}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-primary-600">{completedItems}</div>
              <div className="text-small font-body text-text-secondary">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-text-primary">{items.length}</div>
              <div className="text-small font-body text-text-secondary">Total Items</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Left Column - Item Management */}
        <div className="space-y-6">
          {/* Item Navigation */}
          {hasItems && (
            <div className="card p-md">
              <div className="flex items-center justify-between mb-sm">
                <h3 className="text-h4 font-heading font-semibold text-text-primary">Items</h3>
                <button
                  onClick={addNewItem}
                className="btn-primary"
                >
                  Add Item
                </button>
              </div>
              
              <div className="flex flex-wrap gap-xs mb-sm">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentItemIndex(index)}
                    className={`
                      px-sm py-xs rounded-lg text-small font-body font-medium transition-colors min-h-touch
                      ${currentItemIndex === index
                        ? 'bg-primary text-white'
                        : item.overall_score !== null
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-background-surface text-text-secondary hover:bg-border-default'
                      }
                    `}
                  >
                    {item.item_name}
                    {item.overall_score !== null && (
                      <span className="ml-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Item */}
          {currentItem ? (
            <TastingItem
              item={currentItem}
              category={session.category}
              userId={session.user_id}
              onUpdate={(updates: Partial<TastingItemData>) => updateItem(currentItem.id, updates)}
            />
          ) : (
            <div className="card p-lg text-center">
              <div className="flex items-center justify-center mb-sm">
                <Utensils size={64} className="text-text-secondary" />
              </div>
              <h3 className="text-h3 font-heading font-semibold text-text-primary mb-2">
                No Items Yet
              </h3>
              <p className="text-text-secondary mb-md">
                Add your first item to start tasting!
              </p>
              <button
                onClick={addNewItem}
                className="btn-primary"
              >
                Add First Item
              </button>
            </div>
          )}

          {/* Session Notes */}
          <div className="card p-md">
            <h3 className="text-h4 font-heading font-semibold text-text-primary mb-sm">Other Notes</h3>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add notes about this tasting session..."
              className="form-input w-full h-32 resize-none"
            />
          </div>
        </div>

        {/* Right Column - Flavor Wheel */}
        <div className="space-y-6">
          <FlavorWheel
            category={session.category}
            selectedFlavors={currentItem?.flavor_scores || {}}
            onFlavorSelect={(flavors: Record<string, number>) => {
              if (currentItem) {
                updateItem(currentItem.id, { flavor_scores: flavors });
              }
            }}
          />
        </div>
      </div>

      {/* Complete Session Button */}
      {hasItems && completedItems > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={completeSession}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Completing...' : 'Complete Session'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickTastingSession;