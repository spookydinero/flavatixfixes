import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import CategorySelector from '@/components/quick-tasting/CategorySelector';
import QuickTastingSummary from '@/components/quick-tasting/QuickTastingSummary';
import { toast } from '@/lib/toast';

type QuickTasting = Database['public']['Tables']['quick_tastings']['Row'];
type QuickTastingWithNull = {
  id: string;
  user_id: string;
  category: string;
  session_name: string | null;
  notes: string | null;
  total_items: number;
  completed_items: number;
  average_score: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

// Type conversion utilities
const toQuickTasting = (data: QuickTastingWithNull): QuickTasting => ({
  ...data,
  session_name: data.session_name === null ? undefined : data.session_name,
  notes: data.notes === null ? undefined : data.notes,
  average_score: data.average_score === null ? undefined : data.average_score,
  completed_at: data.completed_at === null ? undefined : data.completed_at,
} as QuickTasting);

const toQuickTastingWithNull = (data: QuickTasting): QuickTastingWithNull => ({
  ...data,
  session_name: data.session_name === undefined ? null : data.session_name,
  notes: data.notes === undefined ? null : data.notes,
  average_score: data.average_score === undefined ? null : data.average_score,
  completed_at: data.completed_at === undefined ? null : data.completed_at,
} as QuickTastingWithNull);

type TastingStep = 'category' | 'session' | 'summary';

const QuickTastingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading, refreshSession } = useAuth();
  const supabase = getSupabaseClient() as any; // Temporary fix for type issues
  const [currentStep, setCurrentStep] = useState<TastingStep>('category');
  const [currentSession, setCurrentSession] = useState<QuickTastingWithNull | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleCategorySelect = async (category: string) => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setIsLoading(true);
    
    try {
      // Refresh session to ensure auth state is synchronized
      console.log('Refreshing session for auth synchronization...');
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        console.error('Session refresh failed:', sessionError);
        toast.error('Authentication error. Please try again.');
        return;
      }
      
      console.log('Session refreshed successfully');
      
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profile) {
        console.error('User profile not found:', profileError);
        toast.error('User profile not found. Please contact support.');
        return;
      }
      
      // Debug logging
      console.log('Auth state debug:', {
        'auth.uid()': (await supabase.auth.getUser()).data.user?.id,
        'user.id': user.id,
        'profile.user_id': profile.user_id,
        'session': (await supabase.auth.getSession()).data.session
      });

      const { data, error } = await supabase
        .from('quick_tastings')
        .insert({
          user_id: user.id,
          category,
          session_name: `${category.charAt(0).toUpperCase() + category.slice(1)} Tasting`
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating tasting session:', error);
        console.error('RLS Policy Debug:', {
          'Attempting to insert user_id': user.id,
          'Current auth.uid()': (await supabase.auth.getUser()).data.user?.id,
          'Error details': error
        });
        
        // Handle specific RLS policy errors
        if (error.code === '42501') {
          toast.error('Permission denied. Please try logging out and back in.');
          return;
        } else if (error.code === 'PGRST116') {
          toast.error('Authentication error. Please refresh the page and try again.');
          return;
        } else {
          toast.error('Failed to create tasting session. Please try again.');
          return;
        }
      }

      setCurrentSession(data);
      setCurrentStep('session');
      toast.success('Tasting session started!');
    } catch (error) {
      console.error('Error creating tasting session:', error);
      toast.error('Failed to start tasting session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionComplete = async (sessionData: QuickTastingWithNull) => {
    setCurrentSession(sessionData);
    setCurrentStep('summary');
  };

  const handleStartNewSession = () => {
    setCurrentSession(null);
    setCurrentStep('category');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-app">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Quick Tasting
          </h1>
          <p className="text-text-secondary">
            Start a quick tasting session to explore flavors and record your impressions
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${
              currentStep === 'category' ? 'text-primary-600' : 
              currentStep === 'session' || currentStep === 'summary' ? 'text-primary-400' : 'text-text-secondary'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'category' ? 'border-primary-600 bg-primary-600 text-white' :
                currentStep === 'session' || currentStep === 'summary' ? 'border-primary-400 bg-primary-400 text-white' :
                'border-border-default'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Category</span>
            </div>
            <div className={`w-8 h-0.5 ${
              currentStep === 'session' || currentStep === 'summary' ? 'bg-primary-400' : 'bg-border-default'
            }`}></div>
            <div className={`flex items-center ${
              currentStep === 'session' ? 'text-primary-600' :
              currentStep === 'summary' ? 'text-primary-400' : 'text-text-secondary'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'session' ? 'border-primary-600 bg-primary-600 text-white' :
                currentStep === 'summary' ? 'border-primary-400 bg-primary-400 text-white' :
                'border-border-default'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Tasting</span>
            </div>
            <div className={`w-8 h-0.5 ${
              currentStep === 'summary' ? 'bg-primary-400' : 'bg-border-default'
            }`}></div>
            <div className={`flex items-center ${
              currentStep === 'summary' ? 'text-primary-600' : 'text-text-secondary'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'summary' ? 'border-primary-600 bg-primary-600 text-white' :
                'border-border-default'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Summary</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'category' && (
            <CategorySelector
              onCategorySelect={handleCategorySelect}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'session' && currentSession && (
              <QuickTastingSession
                session={currentSession as any}
                onSessionComplete={(data) => handleSessionComplete(data as any)}
              />
            )}
            {currentStep === 'summary' && currentSession && (
              <QuickTastingSummary
                session={currentSession as any}
                onStartNewSession={handleStartNewSession}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default QuickTastingPage;