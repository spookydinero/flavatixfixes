import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
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
  mode: string;
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

interface EditTastingDashboardProps {
  session: QuickTasting;
  onSessionUpdate?: (session: QuickTasting) => void;
}

const tastingPresets = [
  {
    id: 'basic',
    name: 'Basic Tasting',
    description: 'Standard tasting with all information visible',
    is_blind_participants: false,
    is_blind_items: false,
    is_blind_attributes: false
  },
  {
    id: 'blind-items',
    name: 'Blind Items',
    description: 'Item names are hidden during tasting',
    is_blind_participants: false,
    is_blind_items: true,
    is_blind_attributes: false
  },
  {
    id: 'full-blind',
    name: 'Full Blind Tasting',
    description: 'All information is hidden - participants, items, and attributes',
    is_blind_participants: true,
    is_blind_items: true,
    is_blind_attributes: true
  },
];

export const EditTastingDashboard: React.FC<EditTastingDashboardProps> = ({
  session,
  onSessionUpdate,
}) => {
  const [sessionName, setSessionName] = useState(session.session_name || '');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isBlindTasting, setIsBlindTasting] = useState(
    session.is_blind_participants || session.is_blind_items || session.is_blind_attributes
  );
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseClient() as any;

  useEffect(() => {
    setSessionName(session.session_name || '');
    setIsBlindTasting(session.is_blind_participants || session.is_blind_items || session.is_blind_attributes);
  }, [session]);

  const updateSession = async (updates: Partial<QuickTasting>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quick_tastings')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Tasting settings updated!');
      if (onSessionUpdate) {
        onSessionUpdate(data);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update tasting settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = () => {
    if (sessionName !== session.session_name) {
      updateSession({ session_name: sessionName });
    }
  };

  const handlePresetChange = (presetId: string) => {
    const preset = tastingPresets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      updateSession({
        is_blind_participants: preset.is_blind_participants,
        is_blind_items: preset.is_blind_items,
        is_blind_attributes: preset.is_blind_attributes,
      });
    }
  };

  const handleBlindTastingToggle = () => {
    const newBlindState = !isBlindTasting;
    setIsBlindTasting(newBlindState);
    updateSession({
      is_blind_participants: newBlindState,
      is_blind_items: newBlindState,
      is_blind_attributes: newBlindState,
    });
  };

  return (
    <div className="bg-white border border-border-primary rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border-primary">
        <div>
          <h2 className="text-xl font-heading font-semibold text-text-primary">
            Edit Tasting
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Customize your tasting session settings
          </p>
        </div>

        {/* Blind Tasting Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-text-primary">Blind Tasting</h3>
            <p className="text-sm text-text-secondary">Hide information during tasting</p>
          </div>
          <button
            onClick={handleBlindTastingToggle}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isBlindTasting
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isBlindTasting ? '🕶️ On' : '👁️ Off'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Session Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tasting Name
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onBlur={handleNameChange}
            onKeyPress={(e) => e.key === 'Enter' && handleNameChange()}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter tasting name"
          />
        </div>

        {/* Presets */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Preset Configuration
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a preset...</option>
            {tastingPresets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          {selectedPreset && (
            <p className="text-sm text-text-secondary mt-1">
              {tastingPresets.find(p => p.id === selectedPreset)?.description}
            </p>
          )}
        </div>

        {/* Current Settings Summary */}
        <div className="p-4 bg-background-secondary rounded-lg">
          <h4 className="font-medium text-text-primary mb-2">Current Settings</h4>
          <div className="text-sm text-text-secondary space-y-1">
            <div>Blind Participants: {session.is_blind_participants ? 'Yes' : 'No'}</div>
            <div>Blind Items: {session.is_blind_items ? 'Yes' : 'No'}</div>
            <div>Blind Attributes: {session.is_blind_attributes ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};