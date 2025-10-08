import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { CompetitionSession } from '@/components/competition/CompetitionSession';

const CompetitionPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !id || typeof id !== 'string') {
    return null;
  }

  return <CompetitionSession sessionId={id} />;
};

export default CompetitionPage;

