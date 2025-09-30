import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import TastingHistoryList from '../components/history/TastingHistoryList';
import TastingHistoryStats from '../components/history/TastingHistoryStats';
import TastingHistoryDetail from '../components/history/TastingHistoryDetail';
import { usePageWhitespace } from '../components/GlobalInspirationBox';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const InspirationBox = dynamic(() => import('../components/ui/inspiration-box'), {
  ssr: false,
  loading: () => null
});

type ViewMode = 'list' | 'stats' | 'detail';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTastingId, setSelectedTastingId] = useState<string | null>(null);
  const [hasTastings, setHasTastings] = useState(false);
  const { hasWhitespace, containerRef } = usePageWhitespace();

  // Redirect to auth if not logged in
  if (!loading && !user) {
    router.push('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-200 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const handleTastingSelect = (tasting: any) => {
    setSelectedTastingId(tasting.id);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedTastingId(null);
    setViewMode('list');
  };

  return (
    <div className="bg-background-light font-display text-zinc-900 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Catas</h1>
            </div>

            {/* View Mode Toggle */}
            {viewMode !== 'detail' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'stats'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Estadísticas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'list' && (
          <TastingHistoryList
            onTastingClick={handleTastingSelect}
            onTastingsLoaded={(hasItems) => setHasTastings(hasItems)}
          />
        )}

        {viewMode === 'stats' && (
          <TastingHistoryStats />
        )}

        {viewMode === 'detail' && selectedTastingId && (
          <div>
            <div className="mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a la lista
              </button>
            </div>
            <TastingHistoryDetail tastingId={selectedTastingId} onBack={handleBackToList} />
          </div>
        )}

        {/* Inspiration Box - only show in genuine whitespace areas, not in list view with tastings */}
        {hasWhitespace && !(viewMode === 'list' && hasTastings) && (
          <div className="mt-8">
            <InspirationBox />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background-light">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/create-tasting">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-xs font-medium">Create</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/social">
            <span className="material-symbols-outlined">groups</span>
            <span className="text-xs font-medium">Social</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_large</span>
            <span className="text-xs font-bold">Flavor Wheels</span>
          </a>
        </nav>
      </footer>
    </div>
  );
}