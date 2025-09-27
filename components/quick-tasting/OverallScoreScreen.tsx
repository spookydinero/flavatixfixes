import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

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

interface OverallScoreScreenProps {
  item: TastingItemData;
  category: string;
  onScoreChange: (score: number) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const OverallScoreScreen: React.FC<OverallScoreScreenProps> = ({
  item,
  category,
  onScoreChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}) => {
  const [localScore, setLocalScore] = useState(item.overall_score || 0);

  useEffect(() => {
    setLocalScore(item.overall_score || 0);
  }, [item.id, item.overall_score]);

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

  const handleScoreChange = (score: number) => {
    setLocalScore(score);
    onScoreChange(score);
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 24, className: "text-primary-600" };
    switch (category) {
      case 'coffee':
      case 'tea':
        return '☕';
      case 'wine':
        return '🍷';
      case 'beer':
        return '🍺';
      case 'whiskey':
      case 'spirits':
        return '🥃';
      case 'chocolate':
        return '🍫';
      default:
        return '🍽️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card p-md mb-lg">
        <div className="text-center">
          <h2 className="text-h2 font-heading font-bold text-text-primary mb-sm">
            Overall Score
          </h2>
          <p className="text-body font-body text-text-secondary mb-md">
            Rate your overall impression of <strong>{item.item_name}</strong>
          </p>
          <div className="flex items-center justify-center space-x-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-800 font-bold text-lg">{getCategoryIcon(category)}</span>
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

      {/* Score Input */}
      <div className="card p-lg mb-lg">
        <div className="text-center">
          <div className="text-xs tablet:text-sm font-medium text-neutral-400 mb-8 tracking-widest uppercase opacity-70">
            Overall Score
          </div>
          <div className="flex flex-col items-center space-y-8">
            <div className="relative w-48 mobile:w-52 tablet:w-64">
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

          {/* Flavor Summary */}
          {item.flavor_scores && Object.keys(item.flavor_scores).length > 0 && (
            <div className="mt-8 pt-6 border-t border-border-default">
              <h4 className="text-base tablet:text-lg font-body font-medium text-text-primary mb-sm">
                Selected Flavors
              </h4>
              <div className="flex flex-wrap gap-xs justify-center">
                {Object.entries(item.flavor_scores).map(([flavor, score]) => (
                  <div
                    key={flavor}
                    className="px-sm py-xs bg-primary-100 text-primary-800 rounded-full text-xs tablet:text-small font-body font-medium"
                  >
                    {flavor} ({score}/5)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Back: Flavor Profile
        </button>
        <div className="text-center">
          <div className="text-small font-body text-text-secondary">
            Step 2 of 2 for this item
          </div>
        </div>
        <button
          onClick={onNext}
          className="btn-primary"
        >
          {isLast ? 'Complete Tasting' : 'Next Item'}
        </button>
      </div>
    </div>
  );
};

export default OverallScoreScreen;