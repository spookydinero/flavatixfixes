import React from 'react';
import { TastingHistory } from '../../lib/historyService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TastingHistoryItemProps {
  tasting: TastingHistory;
  onClick: (tasting: TastingHistory) => void;
}

const TastingHistoryItem: React.FC<TastingHistoryItemProps> = ({ tasting, onClick }) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: es 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'coffee': 'bg-amber-100 text-amber-800',
      'wine': 'bg-purple-100 text-purple-800',
      'tea': 'bg-green-100 text-green-800',
      'chocolate': 'bg-yellow-100 text-yellow-800',
      'cheese': 'bg-orange-100 text-orange-800',
      'beer': 'bg-blue-100 text-blue-800',
      'spirits': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    if (score >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(tasting)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {tasting.session_name || `Sesión de ${tasting.category}`}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tasting.category)}`}>
              {tasting.category}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(tasting.created_at)}
            </span>
          </div>
        </div>
        {tasting.average_score && (
          <div className="text-right">
            <div className={`text-lg font-bold ${getScoreColor(tasting.average_score)}`}>
              {tasting.average_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">puntuación</div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            <span className="font-medium">{tasting.completed_items}</span>
            <span className="text-gray-400">/{tasting.total_items}</span>
            <span className="ml-1">elementos</span>
          </span>
          {tasting.completed_at && (
            <span className="text-green-600 font-medium">Completada</span>
          )}
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {tasting.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {tasting.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default TastingHistoryItem;