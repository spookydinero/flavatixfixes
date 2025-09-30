import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { generateReviewId } from '@/lib/reviewIdGenerator';
import { FileText, Edit3, Clock } from 'lucide-react';

interface Review {
  id: string;
  item_name: string;
  category: string;
  batch_id: string;
  created_at: string;
  status: string;
  overall_score?: number;
}

interface ProseReview {
  id: string;
  item_name: string;
  category: string;
  batch_id: string;
  created_at: string;
  status: string;
}

const MyReviewsPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient() as any;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [proseReviews, setProseReviews] = useState<ProseReview[]>([]);
  const [drafts, setDrafts] = useState<(Review | ProseReview)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      loadReviews();
    }
  }, [user, loading, router]);

  const loadReviews = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load structured reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('quick_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Load prose reviews
      const { data: proseData, error: proseError } = await supabase
        .from('prose_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (proseError) throw proseError;

      // Separate completed and drafts
      const completedReviews = reviewsData?.filter((r: Review) => r.status === 'completed' || r.status === 'published') || [];
      const completedProse = proseData?.filter((r: ProseReview) => r.status === 'completed' || r.status === 'published') || [];
      const allDrafts = [
        ...(reviewsData?.filter((r: Review) => r.status === 'draft') || []),
        ...(proseData?.filter((r: ProseReview) => r.status === 'draft') || [])
      ];

      setReviews(completedReviews);
      setProseReviews(completedProse);
      setDrafts(allDrafts);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatReviewId = (review: Review | ProseReview) => {
    return generateReviewId(
      review.category,
      review.item_name,
      review.batch_id || '',
      new Date(review.created_at)
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-light font-display text-zinc-900 min-h-screen pb-20">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-200 p-4 bg-background-light sticky top-0 z-10">
          <button
            onClick={() => router.push('/review')}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold">My Reviews</h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Reviews in Progress */}
            {drafts.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="text-warning" size={24} />
                  <h3 className="text-lg font-bold text-text-primary">Reviews in Progress</h3>
                </div>
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <button
                      key={draft.id}
                      onClick={() => router.push(`/review/summary/${draft.id}`)}
                      className="w-full p-4 bg-background-app hover:bg-primary-50 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-text-primary">{draft.item_name}</p>
                          <p className="text-sm text-text-secondary">{formatReviewId(draft)}</p>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary">
                          arrow_forward
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Reviews */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="text-primary" size={24} />
                <h3 className="text-lg font-bold text-text-primary">Reviews</h3>
              </div>
              {reviews.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-2">
                  {reviews.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => router.push(`/review/summary/${review.id}`)}
                      className="w-full p-4 bg-background-app hover:bg-primary-50 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{review.item_name}</p>
                          <p className="text-sm text-text-secondary">{formatReviewId(review)}</p>
                          {review.overall_score && (
                            <p className="text-sm text-primary font-bold mt-1">
                              Score: {review.overall_score}/100
                            </p>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-text-secondary">
                          arrow_forward
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prose Reviews */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Edit3 className="text-secondary" size={24} />
                <h3 className="text-lg font-bold text-text-primary">Prose Reviews</h3>
              </div>
              {proseReviews.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No prose reviews yet</p>
              ) : (
                <div className="space-y-2">
                  {proseReviews.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => router.push(`/review/summary/${review.id}`)}
                      className="w-full p-4 bg-background-app hover:bg-secondary-50 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-text-primary">{review.item_name}</p>
                          <p className="text-sm text-text-secondary">{formatReviewId(review)}</p>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary">
                          arrow_forward
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create New Review Button */}
            <button
              onClick={() => router.push('/review')}
              className="btn-primary w-full"
            >
              Create New Review
            </button>
          </div>
        </main>

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
            <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/review">
              <span className="material-symbols-outlined">reviews</span>
              <span className="text-xs font-bold">Review</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/social">
              <span className="material-symbols-outlined">groups</span>
              <span className="text-xs font-medium">Social</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/flavor-wheels">
              <span className="material-symbols-outlined">donut_small</span>
              <span className="text-xs font-medium">Wheels</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default MyReviewsPage;

