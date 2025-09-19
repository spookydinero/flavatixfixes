import React, { useState } from 'react';

interface FlavorCategory {
  name: string;
  flavors: string[];
  color: string;
  angle: number;
}

interface FlavorWheelProps {
  category: string;
  selectedFlavors: Record<string, number>;
  onFlavorSelect: (flavors: Record<string, number>) => void;
}

const flavorProfiles: Record<string, FlavorCategory[]> = {
  coffee: [
    {
      name: 'Fruity',
      flavors: ['Berry', 'Citrus', 'Stone Fruit', 'Tropical'],
      color: 'bg-red-500',
      angle: 0
    },
    {
      name: 'Sweet',
      flavors: ['Chocolate', 'Caramel', 'Vanilla', 'Honey'],
      color: 'bg-yellow-500',
      angle: 60
    },
    {
      name: 'Nutty',
      flavors: ['Almond', 'Hazelnut', 'Walnut', 'Peanut'],
      color: 'bg-amber-600',
      angle: 120
    },
    {
      name: 'Spicy',
      flavors: ['Cinnamon', 'Clove', 'Pepper', 'Cardamom'],
      color: 'bg-orange-600',
      angle: 180
    },
    {
      name: 'Floral',
      flavors: ['Jasmine', 'Rose', 'Lavender', 'Hibiscus'],
      color: 'bg-pink-500',
      angle: 240
    },
    {
      name: 'Earthy',
      flavors: ['Woody', 'Tobacco', 'Cedar', 'Mushroom'],
      color: 'bg-green-700',
      angle: 300
    }
  ],
  wine: [
    {
      name: 'Fruity',
      flavors: ['Red Berry', 'Black Berry', 'Citrus', 'Stone Fruit'],
      color: 'bg-red-500',
      angle: 0
    },
    {
      name: 'Floral',
      flavors: ['Violet', 'Rose', 'Elderflower', 'Acacia'],
      color: 'bg-pink-500',
      angle: 60
    },
    {
      name: 'Herbal',
      flavors: ['Mint', 'Eucalyptus', 'Thyme', 'Sage'],
      color: 'bg-green-500',
      angle: 120
    },
    {
      name: 'Earthy',
      flavors: ['Mineral', 'Wet Stone', 'Forest Floor', 'Truffle'],
      color: 'bg-gray-600',
      angle: 180
    },
    {
      name: 'Spicy',
      flavors: ['Black Pepper', 'White Pepper', 'Clove', 'Cinnamon'],
      color: 'bg-orange-600',
      angle: 240
    },
    {
      name: 'Oak',
      flavors: ['Vanilla', 'Toast', 'Smoke', 'Cedar'],
      color: 'bg-amber-700',
      angle: 300
    }
  ],
  whiskey: [
    {
      name: 'Sweet',
      flavors: ['Honey', 'Caramel', 'Vanilla', 'Maple'],
      color: 'bg-yellow-500',
      angle: 0
    },
    {
      name: 'Fruity',
      flavors: ['Apple', 'Pear', 'Orange', 'Cherry'],
      color: 'bg-red-500',
      angle: 60
    },
    {
      name: 'Spicy',
      flavors: ['Cinnamon', 'Nutmeg', 'Pepper', 'Ginger'],
      color: 'bg-orange-600',
      angle: 120
    },
    {
      name: 'Smoky',
      flavors: ['Peat', 'Charcoal', 'Tobacco', 'Leather'],
      color: 'bg-gray-700',
      angle: 180
    },
    {
      name: 'Nutty',
      flavors: ['Almond', 'Walnut', 'Pecan', 'Hazelnut'],
      color: 'bg-amber-600',
      angle: 240
    },
    {
      name: 'Woody',
      flavors: ['Oak', 'Cedar', 'Pine', 'Birch'],
      color: 'bg-green-700',
      angle: 300
    }
  ],
  beer: [
    {
      name: 'Malty',
      flavors: ['Bread', 'Biscuit', 'Caramel', 'Chocolate'],
      color: 'bg-amber-600',
      angle: 0
    },
    {
      name: 'Hoppy',
      flavors: ['Citrus', 'Pine', 'Floral', 'Herbal'],
      color: 'bg-green-500',
      angle: 60
    },
    {
      name: 'Fruity',
      flavors: ['Apple', 'Banana', 'Berry', 'Tropical'],
      color: 'bg-red-500',
      angle: 120
    },
    {
      name: 'Spicy',
      flavors: ['Pepper', 'Clove', 'Coriander', 'Ginger'],
      color: 'bg-orange-600',
      angle: 180
    },
    {
      name: 'Roasted',
      flavors: ['Coffee', 'Chocolate', 'Burnt', 'Smoky'],
      color: 'bg-gray-700',
      angle: 240
    },
    {
      name: 'Sour',
      flavors: ['Tart', 'Acidic', 'Vinegar', 'Lactic'],
      color: 'bg-yellow-400',
      angle: 300
    }
  ]
};

const FlavorWheel: React.FC<FlavorWheelProps> = ({
  category,
  selectedFlavors,
  onFlavorSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const categories = flavorProfiles[category] || flavorProfiles.coffee;

  const updateFlavorScore = (flavor: string, score: number) => {
    const newFlavors = { ...selectedFlavors };
    if (score === 0) {
      delete newFlavors[flavor];
    } else {
      newFlavors[flavor] = score;
    }
    onFlavorSelect(newFlavors);
  };

  const getFlavorScore = (flavor: string): number => {
    return selectedFlavors[flavor] || 0;
  };

  const getCategorySelectedCount = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return 0;
    return category.flavors.filter(flavor => getFlavorScore(flavor) > 0).length;
  };

  const toggleWheel = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="card p-md">
      <h3 className="text-h4 font-heading font-semibold text-text-primary mb-md">Flavor Profile</h3>

      {/* Circular Flavor Wheel */}
      <div className="relative max-w-sm mx-auto mb-lg">
        {/* 3D Wheel Container */}
        <div
          className="relative aspect-square w-full preserve-3d transition-transform duration-700 ease-in-out"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            perspective: '1000px'
          }}
        >
          {/* Front Side - User Tasting */}
          <div className="absolute inset-0 backface-hidden">
            <div className="relative w-full h-full rounded-full bg-gray-200 dark:bg-gray-800">
              {/* Wheel Segments */}
              {categories.map((cat, index) => {
                const isSelected = getCategorySelectedCount(cat.name) > 0;
                const isHovered = hoveredSegment === cat.name;
                return (
                  <button
                    key={cat.name}
                    className={`
                      absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left transition-all duration-300 ease-in-out
                      ${cat.color} hover:brightness-110
                      ${isSelected ? 'brightness-110 ring-4 ring-white/50' : ''}
                      ${isHovered ? 'scale-105' : ''}
                    `}
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%)',
                      transform: `rotate(${cat.angle}deg)`,
                      transformOrigin: '0% 100%'
                    }}
                    onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                    onMouseEnter={() => setHoveredSegment(cat.name)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    {/* Segment Label */}
                    <span
                      className="absolute text-white text-xs font-bold pointer-events-none"
                      style={{
                        top: '20%',
                        left: '70%',
                        transform: `rotate(${cat.angle + 18}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}

              {/* Center Information */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-3/5 bg-background-light dark:bg-background-dark rounded-full flex flex-col items-center justify-center text-center p-3 shadow-inner">
                <h3 className="text-sm font-bold text-primary">Your Notes</h3>
                <span className="text-xs text-text-secondary">
                  {Object.keys(selectedFlavors).length} flavors selected
                </span>
              </div>
            </div>
          </div>

          {/* Back Side - Community View */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="relative w-full h-full rounded-full bg-gray-200 dark:bg-gray-800">
              {/* Community Wheel Segments */}
              {categories.map((cat, index) => {
                const isSelected = getCategorySelectedCount(cat.name) > 0;
                const isHovered = hoveredSegment === cat.name;
                return (
                  <div
                    key={`community-${cat.name}`}
                    className={`
                      absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left
                      ${cat.color}/50 hover:brightness-110
                    `}
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%)',
                      transform: `rotate(${cat.angle}deg)`,
                      transformOrigin: '0% 100%'
                    }}
                  >
                    {/* Community Segment Label */}
                    <span
                      className="absolute text-white/70 text-xs font-bold pointer-events-none"
                      style={{
                        top: '20%',
                        left: '70%',
                        transform: `rotate(${cat.angle + 18}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      {cat.name}
                    </span>
                  </div>
                );
              })}

              {/* Community Center Information */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-3/5 bg-background-light dark:bg-background-dark rounded-full flex flex-col items-center justify-center text-center p-3 shadow-inner">
                <h3 className="text-sm font-bold text-gray-500">Community</h3>
                <span className="text-xs text-text-secondary">
                  Average Notes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <span className={`text-sm font-medium ${!isFlipped ? 'text-primary' : 'text-text-secondary'}`}>
            Your Tasting
          </span>
          <button
            onClick={toggleWheel}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${isFlipped ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}
            `}
          >
            <span className="sr-only">Toggle Community View</span>
            <span
              className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-300 shadow ring-0 transition duration-200 ease-in-out"
              style={{ transform: isFlipped ? 'translateX(1.25rem)' : 'translateX(0)' }}
            ></span>
          </button>
          <span className={`text-sm font-medium ${isFlipped ? 'text-primary' : 'text-text-secondary'}`}>
            Community
          </span>
        </div>
      </div>

      {/* Active Category Flavors */}
      {activeCategory && !isFlipped && (
        <div className="border-t border-border-primary pt-md animate-fade-in-up">
          <h4 className="text-lg font-body font-medium text-text-primary mb-sm">
            {activeCategory} Flavors
          </h4>
          <div className="space-y-sm">
            {categories
              .find(cat => cat.name === activeCategory)
              ?.flavors.map((flavor) => {
                const score = getFlavorScore(flavor);
                return (
                  <div key={flavor} className="flex items-center justify-between">
                    <span className="text-text-primary font-body font-medium">{flavor}</span>
                    <div className="flex items-center space-x-xs">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => updateFlavorScore(flavor, score === value ? 0 : value)}
                          className={`
                            w-8 h-8 rounded-full border-2 transition-all duration-200
                            ${score >= value
                              ? 'bg-primary-500 border-primary-500 text-white'
                              : 'border-border-default bg-background-app hover:border-primary-300'
                            }
                          `}
                        >
                          <span className="text-caption font-body font-medium">{value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}

      {/* Selected Flavors Summary */}
      {Object.keys(selectedFlavors).length > 0 && !isFlipped && (
        <div className="border-t border-border-primary pt-md mt-md">
          <h4 className="text-lg font-body font-medium text-text-primary mb-sm">Selected Flavors</h4>
          <div className="flex flex-wrap gap-xs">
            {Object.entries(selectedFlavors).map(([flavor, score]) => (
              <div
                key={flavor}
                className="flex items-center space-x-xs px-sm py-xs bg-primary-100 text-primary-800 rounded-full text-small font-body"
              >
                <span>{flavor}</span>
                <span className="font-body font-medium">({score})</span>
                <button
                  onClick={() => updateFlavorScore(flavor, 0)}
                  className="ml-xs text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlavorWheel;