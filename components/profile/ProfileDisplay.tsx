import { UserProfile } from '../../lib/profileService';

interface ProfileDisplayProps {
  profile: UserProfile | null;
  authEmail?: string;
}

export default function ProfileDisplay({ profile, authEmail }: ProfileDisplayProps) {
  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="text-center text-[#8B8B8B]">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      'Coffee': 'bg-[#8C5A3A] text-white',
      'Wine': 'bg-[#B53F3F] text-white',
      'Beer': 'bg-[#DFAF2B] text-[#2C1810]',
      'Spirits': 'bg-[#6B5B95] text-white',
      'Mezcal': 'bg-[#C65A2E] text-white',
      'Perfume': 'bg-[#E9A2AD] text-[#2C1810]',
      'Olive Oil': 'bg-[#57A773] text-white',
      'Snacks': 'bg-[#E4572E] text-white',
      'Other': 'bg-[#8B8B8B] text-white'
    };
    return colors[category || ''] || 'bg-[#F4E3CC] text-[#2C1810]';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Profile'}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#F4E3CC]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#1F5D4C] to-[#2E7D32] flex items-center justify-center text-white font-semibold text-lg ${profile.avatar_url ? 'hidden' : ''}`}>
            {getInitials(profile.full_name)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-[#2C1810] font-['Crimson_Text_Variable'] truncate">
            {profile.full_name || 'No name set'}
          </h2>
          {profile.username && (
            <p className="text-[#5C5C5C] text-sm mb-1">@{profile.username}</p>
          )}
          <p className="text-[#8B8B8B] text-sm">{authEmail}</p>
          {profile.preferred_category && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(profile.preferred_category)}`}>
              {profile.preferred_category}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#5C5C5C] mb-2">About</h3>
          <p className="text-[#2C1810] leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#FEF3E7] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#1F5D4C] font-['Crimson_Text_Variable']">
            {profile.tastings_count}
          </div>
          <div className="text-sm text-[#5C5C5C]">Tastings</div>
        </div>
        
        <div className="bg-[#FEF3E7] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#1F5D4C] font-['Crimson_Text_Variable']">
            {profile.reviews_count}
          </div>
          <div className="text-sm text-[#5C5C5C]">Reviews</div>
        </div>
        
        <div className="bg-[#F7F3EA] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#C65A2E] font-['Crimson_Text_Variable']">
            {profile.followers_count}
          </div>
          <div className="text-sm text-[#5C5C5C]">Followers</div>
        </div>
        
        <div className="bg-[#F7F3EA] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#C65A2E] font-['Crimson_Text_Variable']">
            {profile.following_count}
          </div>
          <div className="text-sm text-[#5C5C5C]">Following</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#5C5C5C]">Member since</span>
          <span className="text-[#2C1810] font-medium">{formatDate(profile.created_at)}</span>
        </div>
        
        {profile.last_tasted_at && (
          <div className="flex justify-between items-center">
            <span className="text-[#5C5C5C]">Last tasting</span>
            <span className="text-[#2C1810] font-medium">{formatDate(profile.last_tasted_at)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-[#5C5C5C]">Email verified</span>
          <div className="flex items-center">
            {profile.email_confirmed ? (
              <>
                <svg className="w-4 h-4 text-[#22C55E] mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[#22C55E] font-medium">Verified</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-[#F59E0B] mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-[#F59E0B] font-medium">Pending</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}