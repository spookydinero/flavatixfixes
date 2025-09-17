import React, { useState } from 'react';

interface FlavorCategory {
  name: string;
  flavors: string[];
  color: string;
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
      color: 'bg-red-500'
    },
    {
      name: 'Sweet',
      flavors: ['Chocolate', 'Caramel', 'Vanilla', 'Honey'],
      color: 'bg-yellow-500'
    },
    {
      name: 'Nutty',
      flavors: ['Almond', 'Hazelnut', 'Walnut', 'Peanut'],
      color: 'bg-amber-600'
    },
    {
      name: 'Spicy',
      flavors: ['Cinnamon', 'Clove', 'Pepper', 'Cardamom'],
      color: 'bg-orange-600'
    },
    {
      name: 'Floral',
      flavors: ['Jasmine', 'Rose', 'Lavender', 'Hibiscus'],
      color: 'bg-pink-500'
    },
    {
      name: 'Earthy',
      flavors: ['Woody', 'Tobacco', 'Cedar', 'Mushroom'],
      color: 'bg-green-700'
    }
  ],
  wine: [
    {
      name: 'Fruity',
      flavors: ['Red Berry', 'Black Berry', 'Citrus', 'Stone Fruit'],
      color: 'bg-red-500'
    },
    {
      name: 'Floral',
      flavors: ['Violet', 'Rose', 'Elderflower', 'Acacia'],
      color: 'bg-pink-500'
    },
    {
      name: 'Herbal',
      flavors: ['Mint', 'Eucalyptus', 'Thyme', 'Sage'],
      color: 'bg-green-500'
    },
    {
      name: 'Earthy',
      flavors: ['Mineral', 'Wet Stone', 'Forest Floor', 'Truffle'],
      color: 'bg-gray-600'
    },
    {
      name: 'Spicy',
      flavors: ['Black Pepper', 'White Pepper', 'Clove', 'Cinnamon'],
      color: 'bg-orange-600'
    },
    {
      name: 'Oak',
      flavors: ['Vanilla', 'Toast', 'Smoke', 'Cedar'],
      color: 'bg-amber-700'
    }
  ],
  whiskey: [
    {
      name: 'Sweet',
      flavors: ['Honey', 'Caramel', 'Vanilla', 'Maple'],
      color: 'bg-yellow-500'
    },
    {
      name: 'Fruity',
      flavors: ['Apple', 'Pear', 'Orange', 'Cherry'],
      color: 'bg-red-500'
    },
    {
      name: 'Spicy',
      flavors: ['Cinnamon', 'Nutmeg', 'Pepper', 'Ginger'],
      color: 'bg-orange-600'
    },
    {
      name: 'Smoky',
      flavors: ['Peat', 'Charcoal', 'Tobacco', 'Leather'],
      color: 'bg-gray-700'
    },
    {
      name: 'Nutty',
      flavors: ['Almond', 'Walnut', 'Pecan', 'Hazelnut'],
      color: 'bg-amber-600'
    },
    {
      name: 'Woody',
      flavors: ['Oak', 'Cedar', 'Pine', 'Birch'],
      color: 'bg-green-700'
    }
  ],
  beer: [
    {
      name: 'Malty',
      flavors: ['Bread', 'Biscuit', 'Caramel', 'Chocolate'],
      color: 'bg-amber-600'
    },
    {
      name: 'Hoppy',
      flavors: ['Citrus', 'Pine', 'Floral', 'Herbal'],
      color: 'bg-green-500'
    },
    {
      name: 'Fruity',
      flavors: ['Apple', 'Banana', 'Berry', 'Tropical'],
      color: 'bg-red-500'
    },
    {
      name: 'Spicy',
      flavors: ['Pepper', 'Clove', 'Coriander', 'Ginger'],
      color: 'bg-orange-600'
    },
    {
      name: 'Roasted',
      flavors: ['Coffee', 'Chocolate', 'Burnt', 'Smoky'],
      color: 'bg-gray-700'
    },
    {
      name: 'Sour',
      flavors: ['Tart', 'Acidic', 'Vinegar', 'Lactic'],
      color: 'bg-yellow-400'
    }
  ]
};

const FlavorWheel: React.FC<FlavorWheelProps> = ({
  category,
  selectedFlavors,
  onFlavorSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
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

  return (
    <div className="card p-md">
      <h3 className="text-h4 font-heading font-semibold text-text-primary mb-md">Flavor Profile</h3>
      
      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-sm mb-md">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
            className={`
              p-sm rounded-lg border-2 transition-all duration-200
              ${activeCategory === cat.name
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-default bg-background-app hover:border-primary-300'
              }
            `}
          >
            <div className={`w-8 h-8 rounded-full ${cat.color} mx-auto mb-xs`}></div>
            <div className="text-small font-body font-medium text-text-primary">{cat.name}</div>
            <div className="text-caption font-body text-text-secondary">
              {cat.flavors.filter(flavor => getFlavorScore(flavor) > 0).length} selected
            </div>
          </button>
        ))}
      </div>

      {/* Active Category Flavors */}
      {activeCategory && (
        <div className="border-t border-border-primary pt-md">
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
      {Object.keys(selectedFlavors).length > 0 && (
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