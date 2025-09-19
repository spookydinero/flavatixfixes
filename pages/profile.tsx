import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import ProfileService, { UserProfile } from '../lib/profileService';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import ProfileEditForm from '../components/profile/ProfileEditForm';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, loading, router]);

  const loadProfile = async () => {
    if (!user?.id) return;

    setLoadingProfile(true);
    try {
      const userProfile = await ProfileService.getProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setActiveTab('view');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background-app p-4 flex items-center justify-center">
        <div className="text-text-primary text-body font-body">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-200">
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex items-center border-b border-zinc-200 dark:border-zinc-700 p-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">Profile</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'view'
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

          {/* Content */}
          <div className="max-w-2xl mx-auto">
            {activeTab === 'view' && (
              <ProfileDisplay profile={profile} authEmail={user.email} />
            )}

            {activeTab === 'edit' && (
              <ProfileEditForm
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
              />
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="border-t border-zinc-200 bg-background-light dark:border-zinc-800 dark:bg-background-dark">
          <nav className="flex justify-around p-2">
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-400" href="/dashboard">
              <span className="material-symbols-outlined">home</span>
              <span className="text-xs font-medium">Home</span>
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
            <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/profile">
              <span className="material-symbols-outlined">person</span>
              <span className="text-xs font-bold">Profile</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
