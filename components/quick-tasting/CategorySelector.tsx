import React from 'react';

interface CategorySelectorProps {
  onCategorySelect: (category: string) => void;
  isLoading: boolean;
}

const categories = [
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'Explore coffee beans, roasts, and brewing methods',
    icon: '☕',
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
  },
  {
    id: 'tea',
    name: 'Tea',
    description: 'Discover tea varieties and flavor profiles',
    icon: '🍵',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
  {
    id: 'wine',
    name: 'Wine',
    description: 'Taste wines and learn about terroir',
    icon: '🍷',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
  },
  {
    id: 'spirits',
    name: 'Spirits',
    description: 'Explore whiskey, rum, gin, and more',
    icon: '🥃',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
  {
    id: 'beer',
    name: 'Beer',
    description: 'Sample craft beers and brewing styles',
    icon: '🍺',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    description: 'Taste chocolate and cacao varieties',
    icon: '🍫',
    color: 'bg-brown-500',
    hoverColor: 'hover:bg-brown-600',
  },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategorySelect,
  isLoading,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Choose Your Tasting Category
        </h2>
        <p className="text-text-secondary">
          Select a category to start your quick tasting session
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            disabled={isLoading}
            className={`
              relative p-6 rounded-xl border-2 border-border-primary
              bg-background-surface hover:bg-background-app
              transition-all duration-200 transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              group
            `}
          >
            {/* Category Icon */}
            <div className="text-center mb-4">
              <div className={`
                inline-flex items-center justify-center w-16 h-16 rounded-full
                ${category.color} ${category.hoverColor}
                text-white text-2xl font-bold
                transition-colors duration-200
                group-hover:scale-110 transform
              `}>
                {category.icon}
              </div>
            </div>

            {/* Category Info */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {category.description}
              </p>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-xl bg-primary-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-app rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="text-text-primary font-medium">Starting your tasting session...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;