import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { roleService } from '../../lib/roleService';
import { studyModeService } from '../../lib/studyModeService';
import FlavorWheel from './FlavorWheel';
import TastingItem from './TastingItem';
import CompetitionRanking from './CompetitionRanking';
import { RoleIndicator } from './RoleIndicator';
import { ModerationDashboard } from './ModerationDashboard';
import { ItemSuggestions } from './ItemSuggestions';
import { toast } from '../../lib/toast';
import { Utensils, Settings } from 'lucide-react';

const categories = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'wine', name: 'Wine' },
  { id: 'spirits', name: 'Spirits' },
  { id: 'beer', name: 'Beer' },
  { id: 'chocolate', name: 'Chocolate' },
];

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
  flavor_scores?: any;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  correct_answers?: any;
  include_in_ranking?: boolean;
}

interface QuickTastingSessionProps {
  session: QuickTasting;
  userId: string;
  onSessionComplete: (session: QuickTasting) => void;
  onSessionUpdate?: (session: QuickTasting) => void;
}

const QuickTastingSession: React.FC<QuickTastingSessionProps> = ({
  session,
  userId,
  onSessionComplete,
  onSessionUpdate,
}) => {
  const [items, setItems] = useState<TastingItemData[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionNotes, setSessionNotes] = useState(session.notes || '');
  const [userRole, setUserRole] = useState<'host' | 'participant' | 'both' | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [showModerationDashboard, setShowModerationDashboard] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const supabase = getSupabaseClient() as any;

  useEffect(() => {
    loadTastingItems();
    loadUserRole();
  }, [session.id, userId]);

  const loadUserRole = async () => {
    try {
      const permissions = await roleService.getUserPermissions(session.id, userId);
      setUserPermissions(permissions);
      setUserRole(permissions.role);
    } catch (error) {
      console.error('Error loading user role:', error);
      // User might not be a participant yet, try to add them
      try {
        await roleService.addParticipant(session.id, userId);
        const permissions = await roleService.getUserPermissions(session.id, userId);
        setUserPermissions(permissions);
        setUserRole(permissions.role);
      } catch (addError) {
        console.error('Error adding user as participant:', addError);
      }
    }
  };

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
    // Check permissions based on mode
    if (session.mode === 'competition') {
      toast.error('Cannot add items in competition mode');
      return;
    }

    if (session.mode === 'study' && session.study_approach === 'collaborative') {
      toast.error('In collaborative mode, suggest items instead of adding them directly');
      setShowItemSuggestions(true);
      return;
    }

    if (session.mode === 'study' && !userPermissions.canAddItems) {
      toast.error('You do not have permission to add items');
      return;
    }

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

  const handleCategoryChange = async (newCategory: string) => {
    try {
      const { data, error } = await supabase
        .from('quick_tastings')
        .update({ category: newCategory })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession = { ...session, category: newCategory };
      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }
      toast.success('Category updated!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
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
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <label className="text-text-secondary font-medium">Category:</label>
                <select
                  value={session.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="form-input text-sm"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-text-secondary">
              Mode: {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}
              {session.mode === 'study' && session.study_approach && ` • ${session.study_approach.charAt(0).toUpperCase() + session.study_approach.slice(1)}`}
              {session.rank_participants && ' • Ranked Competition'}
              {(session.is_blind_participants || session.is_blind_items || session.is_blind_attributes) && ' • Blind Tasting'}
            </p>
            {userRole && (
              <div className="mt-2">
                <RoleIndicator
                  role={userRole}
                  userId={userId}
                  currentUserId={userId}
                  size="sm"
                />
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {/* Moderation Controls for Hosts */}
            {userPermissions.canModerate && (
              <button
                onClick={() => setShowModerationDashboard(!showModerationDashboard)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  showModerationDashboard
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                <Settings size={16} />
                Moderate
              </button>
            )}

            {/* Item Suggestions for Collaborative Study Mode */}
            {session.mode === 'study' && session.study_approach === 'collaborative' && (
              <button
                onClick={() => setShowItemSuggestions(!showItemSuggestions)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  showItemSuggestions
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                💡 Suggestions
              </button>
            )}
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

      {/* Moderation Dashboard */}
      {showModerationDashboard && userPermissions.canModerate && (
        <div className="mb-lg">
          <ModerationDashboard
            tastingId={session.id}
            userId={userId}
            onRoleSwitch={(role) => {
              // Handle role switching between moderating and participating
              console.log('Role switched to:', role);
            }}
          />
        </div>
      )}

      {/* Item Suggestions */}
      {showItemSuggestions && session.mode === 'study' && session.study_approach === 'collaborative' && (
        <div className="mb-lg">
          <ItemSuggestions
            tastingId={session.id}
            userId={userId}
            canAddItems={userPermissions.canAddItems}
            canModerate={userPermissions.canModerate}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Left Column - Item Management */}
        <div className="space-y-6">
          {/* Item Navigation */}
          {hasItems && (
            <div className="card p-md">
              <div className="flex items-center justify-between mb-sm">
                <h3 className="text-h4 font-heading font-semibold text-text-primary">Items</h3>
                {((session.mode === 'study' && session.study_approach !== 'collaborative' && userPermissions.canAddItems) ||
                  (session.mode === 'quick')) && (
                  <button
                    onClick={addNewItem}
                    className="btn-primary"
                  >
                    Add Item
                  </button>
                )}
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
              isBlindItems={session.is_blind_items}
              isBlindAttributes={session.is_blind_attributes}
            />
          ) : (
            <div className="card p-lg text-center">
              <div className="flex items-center justify-center mb-sm">
                <Utensils size={64} className="text-text-secondary" />
              </div>
              <h3 className="text-h3 font-heading font-semibold text-text-primary mb-2">
                {session.mode === 'competition' ? 'Waiting for Items' : 'No Items Yet'}
              </h3>
              <p className="text-text-secondary mb-md">
                {session.mode === 'competition'
                  ? 'Items should be preloaded for competition mode.'
                  : 'Add your first item to start tasting!'
                }
              </p>
              {(session.mode === 'study' || session.mode === 'quick') && (
                <button
                  onClick={addNewItem}
                  className="btn-primary"
                >
                  Add First Item
                </button>
              )}
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

          {/* Competition Ranking */}
          {session.rank_participants && (
            <CompetitionRanking
              tastingId={session.id}
              isRankingEnabled={true}
              currentUserId={session.user_id}
            />
          )}
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