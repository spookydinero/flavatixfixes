import React, { useState } from 'react';
import { TastingHistory } from '../../lib/historyService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TastingHistoryItemProps {
  tasting: TastingHistory;
  onClick: (tasting: TastingHistory) => void;
  onDelete: (id: string) => void;
}

const TastingHistoryItem: React.FC<TastingHistoryItemProps> = ({ tasting, onClick, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el onClick del contenedor
    if (isDeleting) return;
    
    setIsDeleting(true);
    onDelete(tasting.id);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={() => onClick(tasting)}
    >
      {/* Botón de eliminar */}
      <button
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
        aria-label="Eliminar cata"
        title="Eliminar cata"
      >
        {isDeleting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>

      <div className="flex justify-between items-start mb-3 pr-10">
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