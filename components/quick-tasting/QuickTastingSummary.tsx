import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast';

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
  flavor_scores?: Record<string, number>;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

interface QuickTastingSummaryProps {
  session: QuickTasting;
  onStartNewSession: () => void;
}

const QuickTastingSummary: React.FC<QuickTastingSummaryProps> = ({
  session,
  onStartNewSession,
}) => {
  const [items, setItems] = useState<TastingItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageScore = (): number => {
    const scoredItems = items.filter(item => item.overall_score !== null && item.overall_score !== undefined);
    if (scoredItems.length === 0) return 0;
    
    const total = scoredItems.reduce((sum, item) => sum + (item.overall_score || 0), 0);
    return Math.round((total / scoredItems.length) * 10) / 10;
  };

  const getTopFlavors = (): Array<{ flavor: string; count: number; avgScore: number }> => {
    const flavorMap = new Map<string, { count: number; totalScore: number }>();
    
    items.forEach(item => {
      if (item.flavor_scores) {
        Object.entries(item.flavor_scores).forEach(([flavor, score]) => {
          const existing = flavorMap.get(flavor) || { count: 0, totalScore: 0 };
          flavorMap.set(flavor, {
            count: existing.count + 1,
            totalScore: existing.totalScore + score
          });
        });
      }
    });
    
    return Array.from(flavorMap.entries())
      .map(([flavor, data]) => ({
        flavor,
        count: data.count,
        avgScore: Math.round((data.totalScore / data.count) * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: Record<string, string> = {
      coffee: '☕',
      wine: '🍷',
      whiskey: '🥃',
      beer: '🍺',
      tea: '🍵',
      chocolate: '🍫',
    };
    return emojis[category] || '🍽️';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const averageScore = calculateAverageScore();
  const topFlavors = getTopFlavors();
  const completedItems = items.filter(item => item.overall_score !== null && item.overall_score !== undefined);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-background-surface rounded-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading tasting summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Session Header */}
      <div className="bg-background-surface rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{getCategoryEmoji(session.category)}</div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {session.session_name}
              </h2>
              <p className="text-text-secondary">
                {session.category.charAt(0).toUpperCase() + session.category.slice(1)} Tasting Session
              </p>
              <p className="text-sm text-text-secondary">
                Completed on {formatDate(session.completed_at || session.updated_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onStartNewSession}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Start New Session
          </button>
        </div>

        {/* Session Notes */}
        {session.notes && (
          <div className="mt-4 p-4 bg-background-app rounded-lg">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Session Notes</h3>
            <p className="text-text-primary">{session.notes}</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-surface rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">{items.length}</div>
          <div className="text-text-secondary">Total Items</div>
        </div>
        <div className="bg-background-surface rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{completedItems.length}</div>
          <div className="text-text-secondary">Items Scored</div>
        </div>
        <div className="bg-background-surface rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {averageScore > 0 ? `${averageScore}/5` : 'N/A'}
          </div>
          <div className="text-text-secondary">Average Score</div>
        </div>
      </div>

      {/* Top Flavors */}
      {topFlavors.length > 0 && (
        <div className="bg-background-surface rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Flavors</h3>
          <div className="space-y-3">
            {topFlavors.map((flavor, index) => (
              <div key={flavor.flavor} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-text-primary">{flavor.flavor}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-text-primary">
                    {flavor.avgScore}/5 avg
                  </div>
                  <div className="text-xs text-text-secondary">
                    {flavor.count} item{flavor.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-background-surface rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Tasted Items</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-border-primary rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-background-app cursor-pointer hover:bg-background-surface transition-colors"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-text-primary">{item.item_name}</h4>
                    {item.overall_score && (
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium text-text-primary">
                          {item.overall_score}/5
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.photo_url && (
                      <span className="text-sm text-text-secondary">📸</span>
                    )}
                    <span className="text-text-secondary">
                      {expandedItem === item.id ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
              </div>
              
              {expandedItem === item.id && (
                <div className="p-4 border-t border-border-default bg-background-app">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo */}
                    {item.photo_url && (
                      <div>
                        <h5 className="text-sm font-medium text-text-secondary mb-2">Photo</h5>
                        <img
                          src={item.photo_url}
                          alt={item.item_name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {/* Notes */}
                    {item.notes && (
                      <div>
                        <h5 className="text-sm font-medium text-text-secondary mb-2">Notes</h5>
                        <p className="text-text-primary text-sm leading-relaxed">{item.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Flavor Scores */}
                  {item.flavor_scores && Object.keys(item.flavor_scores).length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-text-secondary mb-2">Flavor Profile</h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.flavor_scores).map(([flavor, score]) => (
                          <div
                            key={flavor}
                            className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                          >
                            {flavor} ({score}/5)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickTastingSummary;