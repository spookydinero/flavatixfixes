import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import ProfileService, { UserProfile } from '../lib/profileService';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import ProfileEditForm from '../components/profile/ProfileEditForm';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'edit'>('profile');
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
    <div className="min-h-screen bg-[#FEF3E7]">
      <main id="main-content">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] text-white">
          <div className="max-w-md mx-auto px-md py-md">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-heading font-bold">FlavorWheel</h1>
              <p className="text-green-100 text-small font-body">Welcome back, {profile?.full_name || user?.email}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-sm py-xs rounded-xl text-small font-body font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-md py-md space-y-md">
        {/* Tab Navigation */}
        <div className="card p-xs">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-sm px-sm rounded-xl text-small font-body font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] text-white shadow-md'
                  : 'text-[#5C5C5C] hover:text-[#2C1810] hover:bg-[#F7F3EA]'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-sm px-sm rounded-xl text-small font-body font-medium transition-all ${
                activeTab === 'edit'
                  ? 'bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] text-white shadow-md'
                  : 'text-[#5C5C5C] hover:text-[#2C1810] hover:bg-[#F7F3EA]'
              }`}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' ? (
          <ProfileDisplay profile={profile} authEmail={user?.email} />
        ) : (
          <ProfileEditForm profile={profile} onProfileUpdate={handleProfileUpdate} />
        )}

        {/* Quick Actions */}
        <div className="card p-md">
          <h3 className="text-h4 font-heading font-semibold text-text-primary mb-sm">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-sm">
            <button 
              onClick={() => router.push('/quick-tasting')}
              className="bg-gradient-to-br from-[#FEF3E7] to-[#F7F3EA] border border-[#1F5D4C]/10 rounded-xl p-sm text-left hover:shadow-md transition-all hover:-translate-y-0.5 min-h-touch"
            >
              <div className="text-[#1F5D4C] font-body font-semibold text-small mb-xs">Quick Tasting</div>
              <div className="text-text-secondary text-caption font-body">Start a new tasting session</div>
            </button>
            
            <button className="card text-left min-h-touch">
            <div className="text-[#C65A2E] font-body font-semibold text-small mb-xs">Write Review</div>
            <div className="text-text-secondary text-caption font-body">Share your experience</div>
            </button>
            
            <button className="card text-left min-h-touch">
            <div className="text-[#D4AF37] font-body font-semibold text-small mb-xs">Flavor Wheels</div>
            <div className="text-text-secondary text-caption font-body">View your taste profile</div>
            </button>
            
            <button className="card text-left min-h-touch">
            <div className="text-text-secondary font-body font-semibold text-small mb-xs">History</div>
            <div className="text-text-muted text-caption font-body">View past tastings</div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-text-muted text-small font-body">
        <p>FlavorWheel México • Version 1.0.0</p>
      </div>
      </main>
    </div>
  );
}