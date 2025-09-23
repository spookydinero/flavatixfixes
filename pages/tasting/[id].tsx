import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import { toast } from '@/lib/toast';
import { ChevronLeft } from 'lucide-react';

interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mode: string;
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

const TastingSessionPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [session, setSession] = useState<QuickTasting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (id && user) {
      loadSession();
    }
  }, [id, user, loading, router]);

  const loadSession = async () => {
    if (!id || typeof id !== 'string' || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch the tasting session
      const { data: sessionData, error: sessionError } = await supabase
        .from('quick_tastings')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          setError('Tasting session not found');
        } else {
          throw sessionError;
        }
        return;
      }

      // Check if user has access to this session (either creator or participant)
      const { data: participantData, error: participantError } = await supabase
        .from('tasting_participants')
        .select('*')
        .eq('tasting_id', id)
        .eq('user_id', user.id)
        .single();

      if (participantError && (sessionData as any).user_id !== user.id) {
        // If not a participant and not the creator, try to add as participant
        try {
          const { error: addError } = await supabase
            .from('tasting_participants')
            .insert({
              tasting_id: id as string,
              user_id: user.id,
              role: 'participant'
            } as any);

          if (addError) {
            throw addError;
          }
        } catch (addError) {
          console.error('Error adding participant:', addError);
          setError('You do not have access to this tasting session');
          return;
        }
      }

      setSession(sessionData);
    } catch (error: any) {
      console.error('Error loading session:', error);
      setError(error.message || 'Failed to load tasting session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionComplete = (completedSession: QuickTasting) => {
    setSession(completedSession);
    toast.success('Tasting session completed!');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading tasting session...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-md py-lg max-w-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-md">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-sm">
              Session Not Found
            </h1>
            <p className="text-body text-text-secondary mb-lg">
              {error}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-200 min-h-screen">
      <main id="main-content">
        <div className="container mx-auto px-md py-lg">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.back()}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back
            </button>
          </div>

          {/* Tasting Session */}
          <QuickTastingSession
            session={session}
            userId={user!.id}
            onSessionComplete={handleSessionComplete}
          />
        </div>
      </main>
    </div>
  );
};

export default TastingSessionPage;
