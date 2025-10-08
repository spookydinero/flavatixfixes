import React, { useState, useRef, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { Coffee, Wine, Beer, Utensils, Star, Camera, Edit } from 'lucide-react';
import FlavorWheel from './FlavorWheel';

interface TastingItemData {
  id: string;
  tasting_id: string;
  item_name: string;
  notes?: string;
  aroma?: string;
  flavor?: string;
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
  showOverallScore?: boolean;
  showFlavorWheel?: boolean;
  showEditControls?: boolean;
  showPhotoControls?: boolean;
  showNotesFields?: boolean;
  itemIndex?: number; // 1-based index for dynamic naming
}

const TastingItem: React.FC<TastingItemProps> = ({
  item,
  category,
  userId,
  onUpdate,
  isBlindItems = false,
  isBlindAttributes = false,
  showOverallScore = true,
  showFlavorWheel = false,
  showEditControls = true,
  showPhotoControls = true,
  showNotesFields = true,
  itemIndex,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.notes || '');
  const [localAroma, setLocalAroma] = useState(item.aroma || '');
  const [localFlavor, setLocalFlavor] = useState(item.flavor || '');
  const [localScore, setLocalScore] = useState(item.overall_score || 0);

  // Generate dynamic display name based on current category and item index
  const getDisplayName = () => {
    if (isBlindItems) {
      return `Item ${item.id.slice(-4)}`;
    }
    // Always use the stored item name
    return item.item_name;
  };
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(item.item_name);

  // Reset local state when item changes
  useEffect(() => {
    setLocalNotes(item.notes || '');
    setLocalAroma(item.aroma || '');
    setLocalFlavor(item.flavor || '');
    setLocalScore(item.overall_score || 0);
    setEditingName(item.item_name);
    setIsEditingName(false);
  }, [item.id]);

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

  const handleAromaChange = (aroma: string) => {
    setLocalAroma(aroma);
    // Immediate update for critical data like aroma/flavor
    onUpdate({ aroma });
  };

  const handleFlavorChange = (flavor: string) => {
    setLocalFlavor(flavor);
    // Immediate update for critical data like aroma/flavor
    onUpdate({ flavor });
  };

  const handleScoreChange = (score: number) => {
    setLocalScore(score);
    onUpdate({ overall_score: score });
  };

  const startEditingName = () => {
    setIsEditingName(true);
    setEditingName(item.item_name);
  };

  const saveName = () => {
    const trimmedName = editingName.trim();
    if (trimmedName && trimmedName !== item.item_name) {
      // Update immediately to prevent reverting
      onUpdate({ item_name: trimmedName });
    }
    setIsEditingName(false);
  };

  const cancelEditingName = () => {
    setEditingName(item.item_name);
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
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveName}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') cancelEditingName();
                  }}
                  className="text-lg tablet:text-h4 font-heading font-semibold text-text-primary bg-transparent border-b border-primary-500 focus:outline-none flex-1"
                  autoFocus
                />
              </div>
            ) : (
              <div className={`flex items-center space-x-2 ${showEditControls ? 'group cursor-pointer' : ''}`} onClick={showEditControls ? startEditingName : undefined}>
                <h3 className="text-lg tablet:text-h4 font-heading font-semibold text-text-primary truncate">
                  {getDisplayName()}
                </h3>
                {!isBlindItems && showEditControls && (
                  <Edit size={16} className="text-text-secondary opacity-80 transition-opacity flex-shrink-0" />
                )}
              </div>
            )}
            <p className="text-xs tablet:text-small font-body text-text-secondary">
              {category.charAt(0).toUpperCase() + category.slice(1)} Tasting
              {isBlindItems && ' • Blind Tasting'}
            </p>
          </div>
        </div>
        
      </div>

      {/* Photo Section */}
      {!isBlindItems && showPhotoControls && (
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

      {/* Notes Fields - Only show in tasting/review mode */}
      {showNotesFields && (
        <>
          {/* Aroma Section */}
          <div className="mb-md">
            <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Aroma</h4>
            <textarea
              value={localAroma}
              onChange={(e) => handleAromaChange(e.target.value)}
              placeholder={`Describe the ${category}'s aroma...`}
              className="form-input w-full h-20 tablet:h-24 resize-none text-sm tablet:text-base"
            />
          </div>

          {/* Flavor Section */}
          <div className="mb-md">
            <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Flavor</h4>
            <textarea
              value={localFlavor}
              onChange={(e) => handleFlavorChange(e.target.value)}
              placeholder={`Describe the ${category}'s flavor, taste, and mouthfeel...`}
              className="form-input w-full h-20 tablet:h-24 resize-none text-sm tablet:text-base"
            />
          </div>

          {/* Overall Score - Show when requested */}
          {showOverallScore && (
            <div className="mb-md">
              <div className="text-center">
                <div className="text-xs tablet:text-sm font-medium text-text-primary mb-6 tracking-widest uppercase">
                  Overall Score
                </div>
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative w-48 mobile:w-52 tablet:w-64">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localScore}
                      onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                      className="w-full bg-neutral-200 rounded-full appearance-none cursor-pointer slider-ultra-thin shadow-none border-0"
                      style={{
                        background: `linear-gradient(to right,
                          #ec7813 0%,
                          #ec7813 ${localScore}%,
                          #e5e5e5 ${localScore}%,
                          #e5e5e5 100%)`
                      }}
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-4xl mobile:text-5xl tablet:text-6xl font-thin text-neutral-600 tracking-tight leading-none">
                      {localScore}
                    </div>
                    {localScore > 0 && (
                      <div className="text-sm mobile:text-base tablet:text-lg font-normal text-neutral-400 animate-fade-in leading-relaxed tracking-wide opacity-80">
                        {getScoreLabel(localScore)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          <div>
            <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Other Notes</h4>
            <textarea
              value={localNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={`Additional notes about the ${category}...`}
              className="form-input w-full h-20 tablet:h-24 resize-none text-sm tablet:text-base"
            />
          </div>
        </>
      )}

      {/* Flavor Wheel */}
      {showFlavorWheel && !isBlindAttributes && (
        <div className="mb-md">
          <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">Flavor Profile</h4>
          <FlavorWheel
            category={category}
            selectedFlavors={item.flavor_scores || {}}
            onFlavorSelect={(flavors) => onUpdate({ flavor_scores: flavors })}
          />
        </div>
      )}

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