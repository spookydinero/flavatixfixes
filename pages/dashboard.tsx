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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEF3E7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#1F5D4C] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-[#2C1810] text-lg font-medium">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF3E7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-['Crimson_Text_Variable']">FlavorWheel</h1>
              <p className="text-green-100 text-sm">Welcome back, {profile?.full_name || user?.email}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] text-white shadow-md'
                  : 'text-[#5C5C5C] hover:text-[#2C1810] hover:bg-[#F7F3EA]'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#2C1810] mb-4 font-['Crimson_Text_Variable']">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/quick-tasting')}
              className="bg-gradient-to-br from-[#FEF3E7] to-[#F7F3EA] border border-[#1F5D4C]/10 rounded-xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="text-[#1F5D4C] font-semibold text-sm mb-1">Quick Tasting</div>
              <div className="text-[#5C5C5C] text-xs">Start a new tasting session</div>
            </button>
            
            <button className="bg-gradient-to-br from-[#FEF3E7] to-[#F7F3EA] border border-[#C65A2E]/10 rounded-xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="text-[#C65A2E] font-semibold text-sm mb-1">Write Review</div>
              <div className="text-[#5C5C5C] text-xs">Share your experience</div>
            </button>
            
            <button className="bg-gradient-to-br from-[#F7F3EA] to-[#F4E3CC] border border-[#D4AF37]/10 rounded-xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="text-[#D4AF37] font-semibold text-sm mb-1">Flavor Wheels</div>
              <div className="text-[#5C5C5C] text-xs">View your taste profile</div>
            </button>
            
            <button className="bg-gradient-to-br from-[#F7F3EA] to-[#F4E3CC] border border-[#8B8B8B]/10 rounded-xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="text-[#5C5C5C] font-semibold text-sm mb-1">History</div>
              <div className="text-[#8B8B8B] text-xs">View past tastings</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[#8B8B8B] text-sm">
          <p>FlavorWheel México • Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}