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
   const [activeTab, setActiveTab] = useState<'home' | 'edit'>('home');
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
    setActiveTab('home');
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
    <div className="bg-background-light font-display text-zinc-900 min-h-screen">
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

        <main className="flex-1 overflow-y-auto pb-20">
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

           {activeTab === 'home' && (
             <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Welcome back, {profile?.full_name || user?.email}!
              </h2>
              <p className="text-zinc-600">
                Ready to explore new flavors?
              </p>
            </div>

            {/* Profile Overview */}
            {profile && (
              <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-lg mb-6">
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 relative">
                    {profile.avatar_url ? (
                      <>
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || 'Profile'}
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-xl">
                          {(profile.full_name || user?.email || '?')[0].toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-xl">
                        {(profile.full_name || user?.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                      {profile.full_name || 'No name set'}
                    </h3>
                    {profile.username && (
                      <p className="text-zinc-600 dark:text-zinc-400 mb-1">@{profile.username}</p>
                    )}
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">{user?.email}</p>
                    {profile.preferred_category && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-primary/10 text-primary">
                        {profile.preferred_category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">About</h4>
                    <p className="text-zinc-900 dark:text-white leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-50 dark:bg-zinc-700/50 p-4 text-center rounded-lg">
                    <div className="text-2xl font-bold text-primary">{tastingStats?.totalTastings || profile.tastings_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Tastings</div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-700/50 p-4 text-center rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profile.reviews_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Reviews</div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-700/50 p-4 text-center rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profile.followers_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Followers</div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-700/50 p-4 text-center rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profile.following_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Following</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Member since</span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {profile.last_tasted_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600 dark:text-zinc-400">Last tasting</span>
                      <span className="text-zinc-900 dark:text-white font-medium">
                        {new Date(profile.last_tasted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Email verified</span>
                    <div className="flex items-center">
                      {profile.email_confirmed ? (
                        <>
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-500 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-yellow-500 font-medium">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-4">
              <button
                onClick={() => router.push('/history')}
                className="w-full flex items-center gap-3 p-4 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="material-symbols-outlined">history</span>
                <div className="text-left">
                  <div className="font-medium">View History</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Your past tastings</div>
                </div>
              </button>

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

          {activeTab === 'edit' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <ProfileEditForm
                  profile={profile}
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background-light">
          <nav className="flex justify-around p-2">
            <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/dashboard">
              <span className="material-symbols-outlined">home</span>
              <span className="text-xs font-bold">Home</span>
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
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/flavor-wheels">
              <span className="material-symbols-outlined">donut_large</span>
              <span className="text-xs font-medium">Flavor Wheels</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}