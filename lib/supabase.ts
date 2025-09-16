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
        };
      };
    };
  };
};