import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface UserProfile {
  user_id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  preferred_category?: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  tastings_count: number;
  reviews_count: number;
  email_confirmed: boolean;
  created_at: string;
  updated_at: string;
  last_tasted_at?: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  preferred_category?: string;
}

class ProfileService {
  /**
   * Get user profile by user ID
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: ProfileUpdateData
  ): Promise<boolean> {
    try {
      // Validate bio length
      if (updates.bio && updates.bio.length > 200) {
        toast.error('Bio must be 200 characters or less');
        return false;
      }

      // Validate username format (if provided)
      if (updates.username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(updates.username)) {
          toast.error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
          return false;
        }

        // Check if username is already taken
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', updates.username)
          .neq('user_id', userId)
          .single();

        if (existingUser) {
          toast.error('Username is already taken');
          return false;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return false;
      }

      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username);

      if (currentUserId) {
        query = query.neq('user_id', currentUserId);
      }

      const { data } = await query.single();
      return !data; // Available if no data found
    } catch (error) {
      // If no user found, username is available
      return true;
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Unexpected error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile with auth data combined
   */
  static async getFullUserData() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const profile = await this.getProfile(user.id);
      return {
        auth: user,
        profile
      };
    } catch (error) {
      console.error('Error getting full user data:', error);
      return null;
    }
  }
}

export { ProfileService };
export default ProfileService;