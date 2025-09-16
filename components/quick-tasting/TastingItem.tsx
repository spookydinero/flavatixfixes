import React, { useState, useRef } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from '../../lib/toast';

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

interface TastingItemProps {
  item: TastingItemData;
  category: string;
  userId: string;
  onUpdate: (updates: Partial<TastingItemData>) => void;
}

const TastingItem: React.FC<TastingItemProps> = ({
  item,
  category,
  userId,
  onUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.notes || '');
  const [localScore, setLocalScore] = useState(item.overall_score || 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient() as any;

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${item.id}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('tasting-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tasting-photos')
        .getPublicUrl(filePath);

      // Update item with photo URL
      onUpdate({ photo_url: publicUrl });
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNotesChange = (notes: string) => {
    setLocalNotes(notes);
    // Debounce the update
    setTimeout(() => {
      onUpdate({ notes });
    }, 500);
  };

  const handleScoreChange = (score: number) => {
    setLocalScore(score);
    onUpdate({ overall_score: score });
  };

  const removePhoto = async () => {
    if (!item.photo_url) return;

    try {
      // Extract file path from URL
      const url = new URL(item.photo_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from('tasting-photos')
        .remove([filePath]);

      if (error) throw error;

      // Update item
      onUpdate({ photo_url: undefined });
      toast.success('Photo removed');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    }
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

  return (
    <div className="bg-background-surface rounded-lg p-6">
      {/* Item Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getCategoryEmoji(category)}</div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">{item.item_name}</h3>
            <p className="text-sm text-text-secondary">
              {category.charAt(0).toUpperCase() + category.slice(1)} Tasting
            </p>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Overall Score</div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => handleScoreChange(score)}
                className={`
                  w-8 h-8 rounded-full transition-all duration-200
                  ${localScore >= score
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-background-surface text-text-secondary hover:bg-yellow-100'
                  }
                `}
              >
                ⭐
              </button>
            ))}
          </div>
          {localScore > 0 && (
            <div className="text-sm font-medium text-text-primary mt-1">
              {localScore}/5
            </div>
          )}
        </div>
      </div>

      {/* Photo Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-text-primary">Photo</h4>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : item.photo_url ? 'Change Photo' : 'Add Photo'}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        
        {item.photo_url ? (
          <div className="relative">
            <img
              src={item.photo_url}
              alt={item.item_name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={removePhoto}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-full h-48 border-2 border-dashed border-border-default rounded-lg flex items-center justify-center bg-background-app">
            <div className="text-center">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-text-secondary">No photo added</p>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div>
        <h4 className="text-md font-medium text-text-primary mb-3">Tasting Notes</h4>
        <textarea
          value={localNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={`Describe the ${category}'s aroma, taste, mouthfeel, and finish...`}
          className="w-full h-32 p-3 border border-border-default rounded-lg bg-background-app text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Flavor Summary */}
      {item.flavor_scores && Object.keys(item.flavor_scores).length > 0 && (
        <div className="mt-6 pt-6 border-t border-border-primary">
          <h4 className="text-md font-medium text-text-primary mb-3">Flavor Profile</h4>
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
  );
};

export default TastingItem;