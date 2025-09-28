import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { roleService } from '../../lib/roleService';
import { studyModeService } from '../../lib/studyModeService';
import FlavorWheel from './FlavorWheel';
import TastingItem from './TastingItem';
import CompetitionRanking from './CompetitionRanking';
import { RoleIndicator } from './RoleIndicator';
import { EditTastingDashboard } from './EditTastingDashboard';
import { ItemSuggestions } from './ItemSuggestions';
import { toast } from '../../lib/toast';
import { Utensils, Settings, Play, Edit } from 'lucide-react';

const categories = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'wine', name: 'Wine' },
  { id: 'spirits', name: 'Spirits' },
  { id: 'beer', name: 'Beer' },
  { id: 'chocolate', name: 'Chocolate' },
  { id: 'other', name: 'Other' },
];

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
  flavor_scores?: any;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  correct_answers?: any;
  include_in_ranking?: boolean;
}

interface QuickTastingSessionProps {
  session: QuickTasting | null;
  userId: string;
  onSessionComplete: (session: QuickTasting) => void;
  onSessionUpdate?: (session: QuickTasting) => void;
  onSessionCreate?: (session: QuickTasting) => void;
}

const QuickTastingSession: React.FC<QuickTastingSessionProps> = ({
  session,
  userId,
  onSessionComplete,
  onSessionUpdate,
  onSessionCreate,
}) => {
  // Helper function to get the display category name
  const getDisplayCategoryName = (category: string, customName?: string | null): string => {
    if (category === 'other' && customName) {
      return customName;
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-md mb-lg">
          <div className="text-center mb-md">
            <h2 className="text-h2 font-heading font-bold text-text-primary mb-sm">
              Start Quick Tasting
            </h2>
            <p className="text-text-secondary">
              Select a category to begin your tasting session
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <label className="text-text-secondary font-medium">Category:</label>
              <select
                value=""
                onChange={async (e) => {
                  const category = e.target.value;
                  if (!category || !onSessionCreate) return;
                  const supabase = getSupabaseClient() as any;
                  try {
                    const { data, error } = await supabase
                      .from('quick_tastings')
                      .insert({
                        user_id: userId,
                        category,
                        session_name: 'Quick Tasting',
                        mode: 'quick'
                      })
                      .select()
                      .single();

                    if (error) throw error;
                    onSessionCreate(data);
                  } catch (error) {
                    console.error('Error creating session:', error);
                    toast.error('Failed to create session');
                  }
                }}
                className="form-input"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [items, setItems] = useState<TastingItemData[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionNotes, setSessionNotes] = useState(session.notes || '');
  const [userRole, setUserRole] = useState<'host' | 'participant' | 'both' | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [showEditTastingDashboard, setShowEditTastingDashboard] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'tasting'>('setup');
  const [isEditingSessionName, setIsEditingSessionName] = useState(false);
  const [editingSessionName, setEditingSessionName] = useState(session.session_name || '');
  const supabase = getSupabaseClient() as any;

  useEffect(() => {
    loadTastingItems();
    loadUserRole();
  }, [session.id, userId]);

  useEffect(() => {
    setEditingSessionName(session.session_name || '');
  }, [session.session_name]);

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

    const itemName = `${getDisplayCategoryName(session.category, session.custom_category_name)} ${items.length + 1}`;

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
      // Removed toast.error to prevent annoying notifications during typing
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

  const startTasting = () => {
    setPhase('tasting');
    setCurrentItemIndex(0);
    setShowEditTastingDashboard(false);
  };

  const startEditingSessionName = () => {
    setIsEditingSessionName(true);
    setEditingSessionName(session.session_name || '');
  };

  const saveSessionName = async () => {
    if (editingSessionName.trim() && editingSessionName.trim() !== session.session_name) {
      try {
        const { data, error } = await supabase
          .from('quick_tastings')
          .update({ session_name: editingSessionName.trim() })
          .eq('id', session.id)
          .select()
          .single();

        if (error) throw error;

        const updatedSession = { ...session, session_name: editingSessionName.trim() };
        if (onSessionUpdate) {
          onSessionUpdate(updatedSession);
        }
        toast.success('Session name updated!');
      } catch (error) {
        console.error('Error updating session name:', error);
        toast.error('Failed to update session name');
      }
    }
    setIsEditingSessionName(false);
  };

  const cancelEditingSessionName = () => {
    setEditingSessionName(session.session_name || '');
    setIsEditingSessionName(false);
  };

  const handleNextItem = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setShowEditTastingDashboard(false); // Close edit dashboard when moving to next item
    } else {
      completeSession();
    }
  };

  const handleBackToSetup = () => {
    setPhase('setup');
  };

  const handleAddNextItem = async () => {
    // Add new item and switch to tasting phase
    await addNewItem();
    setPhase('tasting');
  };

  const handleEndTasting = () => {
    completeSession();
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
            {isEditingSessionName ? (
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={editingSessionName}
                  onChange={(e) => setEditingSessionName(e.target.value)}
                  onBlur={saveSessionName}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') saveSessionName();
                    if (e.key === 'Escape') cancelEditingSessionName();
                  }}
                  className="text-h2 font-heading font-bold text-text-primary bg-transparent border-b border-primary-500 focus:outline-none flex-1"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2 mb-2 group cursor-pointer" onClick={startEditingSessionName}>
                <h2 className="text-h2 font-heading font-bold text-text-primary">
                  {session.session_name}
                </h2>
                <Edit size={20} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            {phase === 'setup' && (
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
            )}
            <p className="text-text-secondary">
              Category: {getDisplayCategoryName(session.category, session.custom_category_name)}
              {' • '}
              Mode: {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}
              {session.mode === 'study' && session.study_approach && ` • ${session.study_approach.charAt(0).toUpperCase() + session.study_approach.slice(1)}`}
              {session.rank_participants && ' • Ranked Competition'}
              {(session.is_blind_participants || session.is_blind_items || session.is_blind_attributes) && ' • Blind Tasting'}
            </p>
            {userRole && session.mode !== 'quick' && (
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
            {/* Edit Tasting Controls - Only show in setup phase */}
            {phase === 'setup' && (
              <button
                onClick={() => setShowEditTastingDashboard(!showEditTastingDashboard)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings size={16} />
                Edit Tasting
              </button>
            )}

            {/* Item Suggestions for Collaborative Study Mode */}
            {session.mode === 'study' && session.study_approach === 'collaborative' && phase === 'setup' && (
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

      {/* Edit Tasting Dashboard */}
      {showEditTastingDashboard && (
        <div className="mb-lg">
          <EditTastingDashboard
            session={session}
            onSessionUpdate={onSessionUpdate}
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

      {phase === 'setup' && (
        <div className="max-w-4xl mx-auto">
          {/* Item Management */}
          <div className="space-y-6">
          {/* Item Navigation */}
          {hasItems && (
            <div className="card p-md">
              <div className="flex items-center justify-between mb-sm">
                <h3 className="text-h4 font-heading font-semibold text-text-primary">Items</h3>
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
              category={getDisplayCategoryName(session.category, session.custom_category_name)}
              userId={session.user_id}
              onUpdate={(updates: Partial<TastingItemData>) => updateItem(currentItem.id, updates)}
              isBlindItems={session.is_blind_items}
              isBlindAttributes={session.is_blind_attributes}
              showOverallScore={true}
              showNotesFields={true}
              showFlavorWheel={false}
            />
          ) : (
            <div className="card p-lg text-center">
              <div className="flex items-center justify-center mb-sm">
                <Utensils size={64} className="text-text-secondary" />
              </div>
              <h3 className="text-h3 font-heading font-semibold text-text-primary mb-2">
                {hasItems
                  ? 'Add Next Item'
                  : session.mode === 'competition'
                    ? 'Waiting for Items'
                    : 'No Items Yet'
                }
              </h3>
              <p className="text-text-secondary mb-md">
                {hasItems
                  ? 'Add another item to continue your tasting session.'
                  : session.mode === 'competition'
                    ? 'Items should be preloaded for competition mode.'
                    : 'Add your first item to start tasting!'
                }
              </p>
              {(session.mode === 'study' || session.mode === 'quick') && (
                <button
                  onClick={addNewItem}
                  className="btn-primary"
                >
                  {hasItems ? 'Add Next Item' : 'Add First Item'}
                </button>
              )}
            </div>
          )}


          {/* Competition Ranking */}
          {session.rank_participants && (
            <CompetitionRanking
              tastingId={session.id}
              isRankingEnabled={true}
              currentUserId={session.user_id}
            />
          )}
        </div>

        {/* Item Action Buttons */}
        {currentItem && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleAddNextItem}
              className="btn-secondary flex items-center gap-2"
            >
              Next Item
            </button>
            <button
              onClick={handleEndTasting}
              className="btn-primary flex items-center gap-2"
            >
              End Tasting
            </button>
          </div>
        )}
      </div>
    )}

    {/* Tasting Phase */}
    {phase === 'tasting' && currentItem && (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card p-md mb-lg">
          <div className="text-center">
            <h2 className="text-h2 font-heading font-bold text-text-primary mb-sm">
              Tasting {currentItem.item_name}
            </h2>
            <p className="text-body font-body text-text-secondary mb-md">
              Rate the flavors and overall impression of <strong>{currentItem.item_name}</strong>
            </p>
            <div className="flex items-center justify-center space-x-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-800 font-bold text-lg">🍷</span>
              </div>
              <div className="text-left">
                <div className="text-small font-body font-medium text-text-primary">
                  {currentItem.item_name}
                </div>
                <div className="text-caption font-body text-text-secondary">
                  {getDisplayCategoryName(session.category, session.custom_category_name)} Tasting
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Tasting Item */}
        <TastingItem
          item={currentItem}
          category={getDisplayCategoryName(session.category, session.custom_category_name)}
          userId={session.user_id}
          onUpdate={(updates: Partial<TastingItemData>) => updateItem(currentItem.id, updates)}
          isBlindItems={session.is_blind_items}
          isBlindAttributes={session.is_blind_attributes}
          showOverallScore={false}
          showFlavorWheel={false}
          showEditControls={true}
          showPhotoControls={false}
        />

        {/* Overall Score Card */}
        <div className="card p-lg mb-lg">
          <div className="text-center">
            <div className="text-xs tablet:text-sm font-medium text-text-primary mb-8 tracking-widest uppercase">
              Overall Score
            </div>
            <div className="flex flex-col items-center space-y-8">
              <div className="relative w-48 mobile:w-52 tablet:w-64">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={currentItem.overall_score || 0}
                  onChange={(e) => updateItem(currentItem.id, { overall_score: parseInt(e.target.value) })}
                  className="w-full h-px bg-neutral-200 rounded-full appearance-none cursor-pointer slider-ultra-thin shadow-none border-0"
                  style={{
                    background: `linear-gradient(to right,
                      var(--color-neutral-200) 0%,
                      var(--color-primary-500) ${currentItem.overall_score || 0}%,
                      var(--color-neutral-200) ${currentItem.overall_score || 0}%,
                      var(--color-neutral-200) 100%)`
                  }}
                />
                <div className="absolute -top-1.5 left-0 w-full h-4 pointer-events-none flex items-center">
                  <div
                    className="absolute w-2 h-2 bg-white rounded-full shadow-sm border border-neutral-300 transition-all duration-200 ease-out"
                    style={{
                      left: `calc(${(((currentItem.overall_score || 0) - 1) / 99) * 100}% - 4px)`,
                      borderColor: (currentItem.overall_score || 0) > 80 ? '#737373' : (currentItem.overall_score || 0) > 60 ? '#a3a3a3' : (currentItem.overall_score || 0) > 40 ? '#d4d4d4' : '#e5e5e5'
                    }}
                  />
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl mobile:text-5xl tablet:text-6xl font-thin text-neutral-600 tracking-tight leading-none">
                  {currentItem.overall_score || 0}
                </div>
                {(currentItem.overall_score || 0) > 0 && (
                  <div className="text-sm mobile:text-base tablet:text-lg font-normal text-neutral-400 animate-fade-in leading-relaxed tracking-wide opacity-80">
                    {(() => {
                      const score = currentItem.overall_score || 0;
                      if (score >= 90) return '(Exceptional)';
                      if (score >= 80) return '(Excellent)';
                      if (score >= 70) return '(Very Good)';
                      if (score >= 60) return '(Good)';
                      if (score >= 50) return '(Average)';
                      if (score >= 40) return '(Below Average)';
                      if (score >= 30) return '(Poor)';
                      if (score >= 20) return '(Very Poor)';
                      if (score >= 10) return '(Terrible)';
                      return '(Unacceptable)';
                    })()}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-lg">
          <button
            onClick={handleBackToSetup}
            className="btn-secondary"
          >
            Back to Setup
          </button>
          <div className="text-center">
            <div className="text-small font-body text-text-secondary">
              Item {currentItemIndex + 1} of {items.length}
            </div>
          </div>
          <button
            onClick={handleNextItem}
            className="btn-primary"
          >
            {currentItemIndex === items.length - 1 ? 'Complete Tasting' : 'Next Item'}
          </button>
        </div>
      </div>
    )}
    </div>
  );
};

export default QuickTastingSession;