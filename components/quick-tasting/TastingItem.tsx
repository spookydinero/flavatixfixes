import React, { useState, useRef } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { Coffee, Wine, Beer, Utensils, Star, Camera } from 'lucide-react';

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

  const getScoreLabel = (score: number): string => {
    const labels: Record<number, string> = {
      1: '(Poor)',
      2: '(Fair)',
      3: '(Good)',
      4: '(Very Good)',
      5: '(Excellent)'
    };
    return labels[score] || '';
  };
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

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 24, className: "text-primary-600" };
    switch (category) {
      case 'coffee':
      case 'tea':
        return <Coffee {...iconProps} />;
      case 'wine':
        return <Wine {...iconProps} />;
      case 'beer':
        return <Beer {...iconProps} />;
      case 'whiskey':
      case 'chocolate':
      default:
        return <Utensils {...iconProps} />;
    }
  };

  return (
    <div className="card p-sm tablet:p-md mobile-container mobile-touch">
      {/* Item Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-sm mb-md">
        <div className="flex items-center space-x-sm min-w-0 flex-1">
          <div className="flex items-center justify-center w-10 h-10 tablet:w-12 tablet:h-12 flex-shrink-0">{getCategoryIcon(category)}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg tablet:text-h4 font-heading font-semibold text-text-primary truncate">{item.item_name}</h3>
            <p className="text-xs tablet:text-small font-body text-text-secondary">
              {category.charAt(0).toUpperCase() + category.slice(1)} Tasting
            </p>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="text-center font-body flex-shrink-0">
          <div className="text-xs tablet:text-small font-body text-text-secondary mb-xs">Overall Score</div>
          <div className="flex space-x-1 tablet:space-x-xs justify-center">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => handleScoreChange(score)}
                className={`
                  min-w-touch min-h-touch w-9 h-9 tablet:w-11 tablet:h-11 rounded-full transition-all duration-300 flex items-center justify-center
                  transform hover:scale-110 active:scale-95 touch-manipulation
                  ${localScore >= score
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-lg'
                    : 'bg-background-surface text-text-secondary hover:bg-yellow-50 hover:text-yellow-600'
                  }
                `}
              >
                <Star 
                  className={`w-4 h-4 tablet:w-5 tablet:h-5 transition-all duration-200 ${
                    localScore >= score 
                      ? 'fill-current drop-shadow-sm' 
                      : 'hover:fill-yellow-200'
                  }`} 
                />
              </button>
            ))}
          </div>
          {localScore > 0 && (
            <div className="text-xs tablet:text-small font-body font-medium text-text-primary mt-xs animate-fade-in">
              {localScore}/5 {getScoreLabel(localScore)}
            </div>
          )}
        </div>
      </div>

      {/* Photo Section */}
      <div className="mb-md">
        <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-xs mb-sm">
          <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary">Photo</h4>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary text-xs tablet:text-small disabled:opacity-50 min-w-touch min-h-touch px-sm py-xs tablet:px-md tablet:py-sm self-start tablet:self-auto"
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
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={item.photo_url}
              alt={item.item_name}
              className="w-full h-40 tablet:h-48 object-cover"
            />
            <button
              onClick={removePhoto}
              className="absolute top-xs right-xs min-w-touch min-h-touch w-9 h-9 tablet:w-11 tablet:h-11 bg-error text-white rounded-full hover:bg-error/90 transition-colors flex items-center justify-center text-sm tablet:text-lg font-bold touch-manipulation"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-full h-40 tablet:h-48 border-2 border-dashed border-border-default rounded-lg flex items-center justify-center bg-background-app">
            <div className="text-center font-body px-sm">
              <Camera size={32} className="text-text-secondary mb-xs mx-auto tablet:w-12 tablet:h-12" />
              <p className="text-sm tablet:text-body font-body text-text-secondary">No photo added</p>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div>
        <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Tasting Notes</h4>
        <textarea
          value={localNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={`Describe the ${category}'s aroma, taste, mouthfeel, and finish...`}
          className="form-input w-full h-24 tablet:h-32 resize-none text-sm tablet:text-base"
        />
      </div>

      {/* Flavor Summary */}
      {item.flavor_scores && Object.keys(item.flavor_scores).length > 0 && (
        <div className="mt-md pt-md border-t border-border-primary">
          <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Flavor Profile</h4>
          <div className="flex flex-wrap gap-1 tablet:gap-xs">
            {Object.entries(item.flavor_scores).map(([flavor, score]) => (
              <div
                key={flavor}
                className="px-xs tablet:px-sm py-1 tablet:py-xs bg-primary-100 text-primary-800 rounded-full text-xs tablet:text-small font-body font-medium"
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