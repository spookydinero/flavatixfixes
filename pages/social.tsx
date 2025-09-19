import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient, Database } from '../lib/supabase';

type TastingPost = {
  id: string;
  user_id: string;
  category: string;
  session_name?: string;
  notes?: string;
  average_score?: number;
  created_at: string;
  completed_at?: string;
  total_items: number;
  completed_items: number;
  user: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
};

export default function SocialPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<TastingPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      loadSocialFeed();
    }
  }, [user, loading, router]);

  const loadSocialFeed = async () => {
    if (!user?.id) return;

    try {
      setLoadingPosts(true);
      const supabase = getSupabaseClient();

      // First, let's just get completed tastings without joins to debug
      const { data: tastingsData, error: tastingsError } = await supabase
        .from('quick_tastings')
        .select('*')
        .not('completed_at', 'is', null) // Only completed tastings
        .order('completed_at', { ascending: false })
        .limit(20);

      if (tastingsError) {
        console.error('Error fetching tastings:', tastingsError);
        throw tastingsError;
      }

      // Now get profiles for these users
      const userIds = tastingsData?.map(t => t.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine the data
      const data = tastingsData?.map(tasting => ({
        ...tasting,
        profiles: profilesData?.find(p => p.user_id === tasting.user_id)
      }));

      // Transform the data to match our interface
      const transformedPosts: TastingPost[] = (data as any[])?.map(post => ({
        id: post.id,
        user_id: post.user_id,
        category: post.category,
        session_name: post.session_name,
        notes: post.notes,
        average_score: post.average_score,
        created_at: post.created_at,
        completed_at: post.completed_at,
        total_items: post.total_items,
        completed_items: post.completed_items,
        user: Array.isArray(post.profiles) ? post.profiles[0] || {} : post.profiles || {}
      })) || [];

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading social feed:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      coffee: 'text-amber-600',
      wine: 'text-red-600',
      whiskey: 'text-orange-600',
      beer: 'text-yellow-600',
      spirits: 'text-purple-600',
      tea: 'text-green-600',
      chocolate: 'text-pink-600'
    };
    return colors[category.toLowerCase()] || 'text-primary';
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    // TODO: Save to database when tables are created
  };

  const handleComment = (postId: string) => {
    // TODO: Open comment modal/input when implemented
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Check out this tasting!',
        text: 'I just completed a tasting session',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
  };

  if (loading || loadingPosts) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-200 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading social feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-200 min-h-screen">
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 p-4 bg-background-light dark:bg-background-dark">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold">Social Feed</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {posts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🍷</div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No tastings yet</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Be the first to share your tasting experience!
                </p>
                <button
                  onClick={() => router.push('/quick-tasting')}
                  className="btn-primary"
                >
                  Start Tasting
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {post.user.avatar_url ? (
                        <img
                          src={post.user.avatar_url}
                          alt={`${post.user.full_name || 'User'}'s avatar`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (post.user.full_name || 'U')[0].toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* User Info */}
                      <div className="flex items-baseline space-x-2 mb-1">
                        <p className="font-bold text-zinc-900 dark:text-white truncate">
                          {post.user.full_name || 'Anonymous User'}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                          @{post.user.username || post.user.full_name?.toLowerCase().replace(' ', '') || 'user'}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          · {formatTimeAgo(post.completed_at || post.created_at)}
                        </p>
                      </div>

                      {/* Category Badge */}
                      <p className={`text-sm font-medium mb-2 capitalize ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </p>

                      {/* Session Name */}
                      {post.session_name && (
                        <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                          {post.session_name}
                        </p>
                      )}

                      {/* Notes */}
                      {post.notes && (
                        <p className="text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed">
                          {post.notes}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                        <span>{post.total_items} items tasted</span>
                        {post.average_score && (
                          <>
                            <span>•</span>
                            <span>Avg score: {post.average_score.toFixed(1)}/100</span>
                          </>
                        )}
                      </div>

                      {/* Engagement Buttons */}
                      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <button
                          onClick={() => handleComment(post.id)}
                          className="flex items-center space-x-2 hover:text-primary group transition-colors"
                        >
                          <span className="material-symbols-outlined group-hover:text-primary text-lg">mode_comment</span>
                          <span className="text-sm">0</span>
                        </button>
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 group transition-colors ${
                            likedPosts.has(post.id)
                              ? 'text-red-500'
                              : 'hover:text-red-500'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-lg ${
                            likedPosts.has(post.id) ? 'text-red-500' : 'group-hover:text-red-500'
                          }`}>
                            {likedPosts.has(post.id) ? 'favorite' : 'favorite_border'}
                          </span>
                          <span className="text-sm">{likedPosts.has(post.id) ? '1' : '0'}</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="hover:text-primary group transition-colors"
                        >
                          <span className="material-symbols-outlined group-hover:text-primary text-lg">share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
            <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/social">
              <span className="material-symbols-outlined">diversity_3</span>
              <span className="text-xs font-bold">Social</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-400" href="/history">
              <span className="material-symbols-outlined">analytics</span>
              <span className="text-xs font-medium">Analytics</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-400" href="/profile">
              <span className="material-symbols-outlined">person</span>
              <span className="text-xs font-medium">Profile</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
