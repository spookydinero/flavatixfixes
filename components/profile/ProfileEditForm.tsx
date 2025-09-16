import { useState, useEffect } from 'react';
import ProfileService, { UserProfile, ProfileUpdateData } from '../../lib/profileService';
import { toast } from 'react-toastify';

interface ProfileEditFormProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const CATEGORY_OPTIONS = [
  'Coffee',
  'Wine',
  'Beer',
  'Spirits',
  'Mezcal',
  'Perfume',
  'Olive Oil',
  'Snacks',
  'Other'
];

export default function ProfileEditForm({ profile, onProfileUpdate }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    full_name: '',
    username: '',
    bio: '',
    preferred_category: '',
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        preferred_category: profile.preferred_category || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    const available = await ProfileService.isUsernameAvailable(username, profile?.user_id);
    setUsernameAvailable(available);
    setCheckingUsername(false);
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'username') {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error('Profile not loaded');
      return;
    }

    if (formData.username && usernameAvailable === false) {
      toast.error('Please choose an available username');
      return;
    }

    setIsLoading(true);
    
    const success = await ProfileService.updateProfile(profile.user_id, formData);
    
    if (success) {
      // Fetch updated profile
      const updatedProfile = await ProfileService.getProfile(profile.user_id);
      if (updatedProfile) {
        onProfileUpdate(updatedProfile);
      }
    }
    
    setIsLoading(false);
  };

  const getUsernameStatus = () => {
    if (!formData.username || formData.username === profile?.username) return null;
    if (checkingUsername) return 'checking';
    if (formData.username.length < 3) return 'too-short';
    return usernameAvailable ? 'available' : 'taken';
  };

  const usernameStatus = getUsernameStatus();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-[#2C1810] mb-6 font-['Crimson_Text_Variable']">
        Edit Profile
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C65A2E] focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-[#2C1810]"
            placeholder="Enter your full name"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-[#2C1810] ${
                usernameStatus === 'available' ? 'border-[#22C55E] focus:border-[#22C55E]' :
                usernameStatus === 'taken' || usernameStatus === 'too-short' ? 'border-[#EF4444] focus:border-[#EF4444]' :
                'border-gray-200 focus:border-[#C65A2E]'
              }`}
              placeholder="Choose a unique username"
            />
            {usernameStatus && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <div className="w-4 h-4 border-2 border-[#C65A2E] border-t-transparent rounded-full animate-spin"></div>
                )}
                {usernameStatus === 'available' && (
                  <svg className="w-5 h-5 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'too-short') && (
                  <svg className="w-5 h-5 text-[#EF4444]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {usernameStatus === 'too-short' && (
            <p className="text-sm text-[#EF4444] mt-1">Username must be at least 3 characters</p>
          )}
          {usernameStatus === 'taken' && (
            <p className="text-sm text-[#EF4444] mt-1">Username is already taken</p>
          )}
          {usernameStatus === 'available' && (
            <p className="text-sm text-[#22C55E] mt-1">Username is available</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C65A2E] focus:ring-0 focus:outline-none transition-colors resize-none text-[#2C1810]"
            placeholder="Tell us about yourself..."
            rows={3}
            maxLength={200}
          />
          <div className="text-right text-sm text-[#8B8B8B] mt-1">
            {formData.bio?.length || 0}/200
          </div>
        </div>

        {/* Preferred Category */}
        <div>
          <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
            Preferred Category
          </label>
          <select
            value={formData.preferred_category}
            onChange={(e) => handleInputChange('preferred_category', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C65A2E] focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-[#2C1810] bg-white"
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            value={formData.avatar_url}
            onChange={(e) => handleInputChange('avatar_url', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C65A2E] focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-[#2C1810]"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!!formData.username && usernameAvailable === false)}
          className="w-full bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] text-white py-3 px-6 rounded-xl font-semibold min-h-[44px] shadow-[0_2px_8px_rgba(31,93,76,0.25)] hover:shadow-[0_4px_16px_rgba(31,93,76,0.35)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_2px_8px_rgba(31,93,76,0.25)]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </div>
          ) : (
            'Update Profile'
          )}
        </button>
      </form>
    </div>
  );
}