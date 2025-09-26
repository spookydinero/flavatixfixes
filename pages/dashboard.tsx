import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import ProfileService, { UserProfile } from '../lib/profileService';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import { getUserTastingStats, getLatestTasting } from '../lib/historyService';

export default function Dashboard() {
   const { user, loading, signOut } = useAuth();
   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'edit'>('home');
   const [tastingStats, setTastingStats] = useState<any>(null);
   const [latestTasting, setLatestTasting] = useState<any>(null);
   const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }
    
    if (user) {
      initializeDashboard();
    }
  }, [user, loading, router]);

  const initializeDashboard = async () => {
    try {
      if (!user) return;
      
      // Fetch user profile
      const userProfile = await ProfileService.getProfile(user.id);
      setProfile(userProfile);
      
      // Fetch tasting stats and latest tasting
      const [stats, latest] = await Promise.all([
        getUserTastingStats(user.id),
        getLatestTasting(user.id)
      ]);
      setTastingStats(stats.data);
      setLatestTasting(latest.data);
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Error loading dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/auth');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setActiveTab('profile');
    toast.success('Profile updated successfully!');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEF3E7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#1F5D4C] border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-200">
      <div className="flex h-screen flex-col">
        <header className="flex items-center border-b border-zinc-200 dark:border-zinc-700 p-4">
           <h1 className="flex-1 text-center text-xl font-bold">
             {activeTab === 'home' ? 'Dashboard' : 'Profile'}
           </h1>
           <button
             onClick={handleLogout}
             className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
           >
             Logout
           </button>
         </header>

        <main className="flex-1 overflow-y-auto">
           {/* Main Tab Navigation */}
           <div className="flex border-b border-zinc-200 dark:border-zinc-700">
             <button
               onClick={() => setActiveTab('home')}
               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                 activeTab === 'home'
                   ? 'border-primary text-primary'
                   : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
               }`}
             >
               Home
             </button>
             <button
               onClick={() => setActiveTab('profile')}
               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                 activeTab === 'profile' || activeTab === 'edit'
                   ? 'border-primary text-primary'
                   : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
               }`}
             >
               Profile
             </button>
           </div>

           {activeTab === 'home' && (
             <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Welcome back, {profile?.full_name || user?.email}!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Ready to explore new flavors?
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Quick Start</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/create-tasting')}
                    className="w-full flex items-center gap-3 p-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    <div className="text-left">
                      <div className="font-medium">Create Tasting Session</div>
                      <div className="text-sm opacity-90">Study or Competition mode</div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/quick-tasting')}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">local_bar</span>
                    <div className="text-left">
                      <div className="font-medium">Quick Tasting</div>
                      <div className="text-sm opacity-75">Standard tasting workflow</div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/history')}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">history</span>
                    <div className="text-left">
                      <div className="font-medium">View History</div>
                      <div className="text-sm opacity-75">Your past tastings</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Tasting Summary */}
              {latestTasting && (
                <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Latest Tasting
                    </h3>
                    <button
                      onClick={() => router.push('/history')}
                      className="text-primary hover:underline text-sm"
                    >
                      View All
                    </button>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-900 dark:text-white font-medium">
                        {latestTasting.category?.replace('_', ' ') || 'Tasting'}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                        {latestTasting.created_at && !isNaN(new Date(latestTasting.created_at).getTime())
                          ? new Date(latestTasting.created_at).toLocaleDateString()
                          : 'Date unavailable'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Score:</span>
                      <span className="text-primary font-semibold">
                        {latestTasting.average_score ? latestTasting.average_score.toFixed(1) : 'N/A'}/5
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {latestTasting.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Card */}
              {tastingStats && (
                <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{tastingStats.totalTastings}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Tastings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {tastingStats.averageScore ? tastingStats.averageScore.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">Avg Score</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {(activeTab === 'profile' || activeTab === 'edit') && (
            <div className="p-6">
              {/* Profile Tab Navigation */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  View Profile
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'edit'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Edit Profile
                </button>
              </div>

              {/* Profile Content */}
              <div className="max-w-2xl mx-auto">
                {activeTab === 'profile' && (
                  <ProfileDisplay profile={profile} authEmail={user.email} />
                )}

                {activeTab === 'edit' && (
                  <ProfileEditForm
                    profile={profile}
                    onProfileUpdate={handleProfileUpdate}
                  />
                )}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <footer className="border-t border-zinc-200 bg-background-light dark:border-zinc-800 dark:bg-background-dark">
          <nav className="flex justify-around p-2">
            <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/dashboard">
              <span className="material-symbols-outlined">home</span>
              <span className="text-xs font-bold">Home</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-400" href="/create-tasting">
              <span className="material-symbols-outlined">add_circle</span>
              <span className="text-xs font-medium">Create</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-400" href="/quick-tasting">
              <span className="material-symbols-outlined">local_bar</span>
              <span className="text-xs font-medium">Tasting</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-400" href="/social">
              <span className="material-symbols-outlined">diversity_3</span>
              <span className="text-xs font-medium">Social</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-400" href="/history">
              <span className="material-symbols-outlined">analytics</span>
              <span className="text-xs font-medium">Analytics</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}