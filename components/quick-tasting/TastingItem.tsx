import React, { useState, useRef, useEffect } from 'react';
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
  isBlindItems?: boolean;
  isBlindAttributes?: boolean;
}

const TastingItem: React.FC<TastingItemProps> = ({
  item,
  category,
  userId,
  onUpdate,
  isBlindItems = false,
  isBlindAttributes = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.notes || '');
  const [localScore, setLocalScore] = useState(item.overall_score || 0);
  const [localItemName, setLocalItemName] = useState(item.item_name);
  const [isEditingName, setIsEditingName] = useState(false);

  // Reset local state when item changes
  useEffect(() => {
    setLocalNotes(item.notes || '');
    setLocalScore(item.overall_score || 0);
    setLocalItemName(item.item_name);
  }, [item.id, item.item_name]);

  const getScoreLabel = (score: number): string => {
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

  const handleItemNameChange = (name: string) => {
    setLocalItemName(name);
  };

  const handleItemNameBlur = () => {
    if (localItemName.trim() && localItemName !== item.item_name) {
      onUpdate({ item_name: localItemName.trim() });
      toast.success('Item name updated');
    } else if (!localItemName.trim()) {
      setLocalItemName(item.item_name);
    }
    setIsEditingName(false);
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
            {isBlindItems ? (
              <h3 className="text-lg tablet:text-h4 font-heading font-semibold text-text-primary truncate">
                Item {item.id.slice(-4)}
              </h3>
            ) : isEditingName ? (
              <input
                type="text"
                value={localItemName}
                onChange={(e) => handleItemNameChange(e.target.value)}
                onBlur={handleItemNameBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleItemNameBlur();
                  } else if (e.key === 'Escape') {
                    setLocalItemName(item.item_name);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                className="text-lg tablet:text-h4 font-heading font-semibold text-text-primary w-full border-b-2 border-primary bg-transparent focus:outline-none"
              />
            ) : (
              <h3
                className="text-lg tablet:text-h4 font-heading font-semibold text-text-primary truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditingName(true)}
                title="Click to edit item name"
              >
                {item.item_name}
              </h3>
            )}
            <p className="text-xs tablet:text-small font-body text-text-secondary">
              {category.charAt(0).toUpperCase() + category.slice(1)} Tasting
              {isBlindItems && ' • Blind Tasting'}
            </p>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="text-center font-body flex-shrink-0 px-3 py-4">
          <div className="text-xs tablet:text-sm font-medium text-neutral-400 mb-4 tracking-widest uppercase opacity-70">Overall Score</div>
          <div className="flex flex-col items-center space-y-5">
            <div className="relative w-40 mobile:w-44 tablet:w-52">
              <input
                type="range"
                min="1"
                max="100"
                value={localScore}
                onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                className="w-full h-px bg-neutral-200 rounded-full appearance-none cursor-pointer slider-ultra-thin shadow-none border-0"
                style={{
                  background: `linear-gradient(to right, 
                    #d4d4d4 0%, 
                    #a3a3a3 ${localScore}%, 
                    #e5e5e5 ${localScore}%, 
                    #e5e5e5 100%)`
                }}
              />
              <div className="absolute -top-1.5 left-0 w-full h-4 pointer-events-none flex items-center">
                <div 
                  className="absolute w-2 h-2 bg-white rounded-full shadow-sm border border-neutral-300 transition-all duration-200 ease-out"
                  style={{ 
                    left: `calc(${((localScore - 1) / 99) * 100}% - 4px)`,
                    borderColor: localScore > 80 ? '#737373' : localScore > 60 ? '#a3a3a3' : localScore > 40 ? '#d4d4d4' : '#e5e5e5'
                  }}
                />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <div className="text-2xl mobile:text-3xl tablet:text-4xl font-thin text-neutral-600 tracking-tight leading-none">{localScore}</div>
              {localScore > 0 && (
                <div className="text-xs mobile:text-sm tablet:text-sm font-normal text-neutral-400 animate-fade-in leading-relaxed tracking-wide opacity-80">
                  {getScoreLabel(localScore)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Section */}
      {!isBlindItems && (
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
      )}

      {/* Notes Section */}
      <div>
        <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Aroma</h4>
        <textarea
          value={localNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={`Describe the ${category}'s aroma, taste, mouthfeel, and finish...`}
          className="form-input w-full h-24 tablet:h-32 resize-none text-sm tablet:text-base"
        />
      </div>

      {/* Flavor Summary */}
      {item.flavor_scores && Object.keys(item.flavor_scores).length > 0 && !isBlindAttributes && (
        <div className="mt-md pt-md border-t border-border-primary">
          <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Flavor Profile</h4>
          <div className="flex flex-wrap gap-1 tablet:gap-xs">
            {Object.entries(item.flavor_scores).map(([flavor, score]) => (
              <div
                key={flavor}
                className="px-xs tablet:px-sm py-1 tablet:py-xs bg-primary-100 text-primary-800 rounded-full text-xs tablet:text-small font-body font-medium"
              >
                {flavor} ({score}/100)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TastingItem;