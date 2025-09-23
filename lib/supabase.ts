import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Singleton pattern for Supabase client
class SupabaseClientSingleton {
  private static instance: SupabaseClient<Database> | null = null;

  public static getInstance(): SupabaseClient<Database> {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
    }
    return SupabaseClientSingleton.instance;
  }

  // Method to reset the instance (useful for testing or logout)
  public static resetInstance(): void {
    SupabaseClientSingleton.instance = null;
  }
}

// Export the singleton instance
export const supabase = SupabaseClientSingleton.getInstance();

// Export the class for advanced usage
export { SupabaseClientSingleton };

// Helper function to get a fresh client instance
export const getSupabaseClient = () => SupabaseClientSingleton.getInstance();

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          username: string | null;
          bio: string | null;
          posts_count: number;
          followers_count: number;
          following_count: number;
          preferred_category: string | null;
          last_tasted_at: string | null;
          email_confirmed: boolean;
          tastings_count: number;
          reviews_count: number;
          total_tastings: number;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          bio?: string | null;
          posts_count?: number;
          followers_count?: number;
          following_count?: number;
          preferred_category?: string | null;
          last_tasted_at?: string | null;
          email_confirmed?: boolean;
          tastings_count?: number;
          reviews_count?: number;
          total_tastings?: number;
        };
        Update: {
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          bio?: string | null;
          posts_count?: number;
          followers_count?: number;
          following_count?: number;
          preferred_category?: string | null;
          last_tasted_at?: string | null;
          email_confirmed?: boolean;
          tastings_count?: number;
          reviews_count?: number;
          total_tastings?: number;
        };
      };
      quick_tastings: {
        Row: {
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
          mode: string;
          rank_participants: boolean;
          ranking_type: string | null;
          is_blind_participants: boolean;
          is_blind_items: boolean;
          is_blind_attributes: boolean;
          study_approach: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          session_name?: string | null;
          notes?: string | null;
          total_items?: number;
          completed_items?: number;
          average_score?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          mode?: string;
          rank_participants?: boolean;
          ranking_type?: string | null;
          is_blind_participants?: boolean;
          is_blind_items?: boolean;
          is_blind_attributes?: boolean;
          study_approach?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          session_name?: string | null;
          notes?: string | null;
          total_items?: number;
          completed_items?: number;
          average_score?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          mode?: string;
          rank_participants?: boolean;
          ranking_type?: string | null;
          is_blind_participants?: boolean;
          is_blind_items?: boolean;
          is_blind_attributes?: boolean;
          study_approach?: string | null;
        };
      };
      quick_tasting_items: {
        Row: {
          id: string;
          tasting_id: string;
          item_name: string;
          notes: string | null;
          flavor_scores: any | null;
          overall_score: number | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
          correct_answers: any | null;
          include_in_ranking: boolean;
        };
        Insert: {
          id?: string;
          tasting_id: string;
          item_name: string;
          notes?: string | null;
          flavor_scores?: any | null;
          overall_score?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          correct_answers?: any | null;
          include_in_ranking?: boolean;
        };
        Update: {
          id?: string;
          tasting_id?: string;
          item_name?: string;
          notes?: string | null;
          flavor_scores?: any | null;
          overall_score?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          correct_answers?: any | null;
          include_in_ranking?: boolean;
        };
      };
      tasting_participants: {
        Row: {
          id: string;
          tasting_id: string;
          user_id: string;
          role: string;
          score: number | null;
          rank: number | null;
          can_moderate: boolean;
          can_add_items: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tasting_id: string;
          user_id: string;
          role?: string;
          score?: number | null;
          rank?: number | null;
          can_moderate?: boolean;
          can_add_items?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tasting_id?: string;
          user_id?: string;
          role?: string;
          score?: number | null;
          rank?: number | null;
          can_moderate?: boolean;
          can_add_items?: boolean;
          created_at?: string;
        };
      };
      tasting_item_suggestions: {
        Row: {
          id: string;
          participant_id: string;
          suggested_item_name: string;
          status: string;
          moderated_by: string | null;
          moderated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          suggested_item_name: string;
          status?: string;
          moderated_by?: string | null;
          moderated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          suggested_item_name?: string;
          status?: string;
          moderated_by?: string | null;
          moderated_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
};