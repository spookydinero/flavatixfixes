import React from 'react';
import FlavorWheel from './FlavorWheel';

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

interface FlavorProfileScreenProps {
  item: TastingItemData;
  category: string;
  onFlavorSelect: (flavors: Record<string, number>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const FlavorProfileScreen: React.FC<FlavorProfileScreenProps> = ({
  item,
  category,
  onFlavorSelect,
  onNext,
  onBack,
  isFirst,
  isLast,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card p-md mb-lg">
        <div className="text-center">
          <h2 className="text-h2 font-heading font-bold text-text-primary mb-sm">
            Flavor Profile
          </h2>
          <p className="text-body font-body text-text-secondary mb-md">
            Select the flavors you detect in <strong>{item.item_name}</strong>
          </p>
          <div className="flex items-center justify-center space-x-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-800 font-bold text-lg">👃</span>
            </div>
            <div className="text-left">
              <div className="text-small font-body font-medium text-text-primary">
                {item.item_name}
              </div>
              <div className="text-caption font-body text-text-secondary">
                {category.charAt(0).toUpperCase() + category.slice(1)} Tasting
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flavor Wheel */}
      <div className="mb-lg">
        <FlavorWheel
          category={category}
          selectedFlavors={item.flavor_scores || {}}
          onFlavorSelect={onFlavorSelect}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={isFirst}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <div className="text-center">
          <div className="text-small font-body text-text-secondary">
            Step 1 of 2 for this item
          </div>
        </div>
        <button
          onClick={onNext}
          className="btn-primary"
        >
          Next: Overall Score
        </button>
      </div>
    </div>
  );
};

export default FlavorProfileScreen;