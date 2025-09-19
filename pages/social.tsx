import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient, Database } from '../lib/supabase';
import { toast } from '../lib/toast';

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
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked: boolean;
  isFollowed: boolean;
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
      const userIds = (tastingsData as any[])?.map((t: any) => t.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get social stats for each tasting (likes, comments, shares)
      const tastingIds = (tastingsData as any[])?.map((t: any) => t.id) || [];

      let likesData: any[] = [];
      let commentsData: any[] = [];
      let sharesData: any[] = [];
      let userLikes = new Set<string>();
      let userFollows = new Set<string>();

      try {
        // Get likes count for each tasting
        const likesResult = await supabase
          .from('tasting_likes')
          .select('tasting_id, user_id')
          .in('tasting_id', tastingIds);
        likesData = likesResult.data || [];
      } catch (error) {
        console.log('Likes table not available yet, using defaults');
      }

      try {
        // Get comments count for each tasting
        const commentsResult = await supabase
          .from('tasting_comments')
          .select('tasting_id')
          .in('tasting_id', tastingIds);
        commentsData = commentsResult.data || [];
      } catch (error) {
        console.log('Comments table not available yet, using defaults');
      }

      try {
        // Get shares count for each tasting
        const sharesResult = await supabase
          .from('tasting_shares')
          .select('tasting_id')
          .in('tasting_id', tastingIds);
        sharesData = sharesResult.data || [];
      } catch (error) {
        console.log('Shares table not available yet, using defaults');
      }

      if (user?.id) {
        try {
          const { data: userLikesData } = await supabase
            .from('tasting_likes')
            .select('tasting_id')
            .eq('user_id', user.id)
            .in('tasting_id', tastingIds);
          userLikes = new Set((userLikesData as any[])?.map((l: any) => l.tasting_id) || []);
        } catch (error) {
          console.log('User likes query failed, using defaults');
        }

        try {
          const { data: userFollowsData } = await supabase
            .from('user_follows')
            .select('following_id')
            .eq('follower_id', user.id);
          userFollows = new Set((userFollowsData as any[])?.map((f: any) => f.following_id) || []);
        } catch (error) {
          console.log('User follows query failed, using defaults');
        }
      }

      // Combine the data
      const data = (tastingsData as any[])?.map((tasting: any) => ({
        ...tasting,
        profiles: (profilesData as any[])?.find((p: any) => p.user_id === tasting.user_id)
      }));

      // Transform the data to match our interface
      const transformedPosts: TastingPost[] = (data as any[])?.map(post => {
        const likes = likesData?.filter(l => l.tasting_id === post.id) || [];
        const comments = commentsData?.filter(c => c.tasting_id === post.id) || [];
        const shares = sharesData?.filter(s => s.tasting_id === post.id) || [];

        return {
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
          user: Array.isArray(post.profiles) ? post.profiles[0] || {} : post.profiles || {},
          stats: {
            likes: likes.length,
            comments: comments.length,
            shares: shares.length
          },
          isLiked: userLikes.has(post.id),
          isFollowed: userFollows.has(post.user_id)
        };
      }) || [];

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

  const handleLike = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const isCurrentlyLiked = likedPosts.has(postId);

      if (isCurrentlyLiked) {
        // Unlike
        try {
          const { error } = await (supabase as any)
            .from('tasting_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('tasting_id', postId);

          if (error) throw error;
        } catch (dbError) {
          console.log('Likes table not available, using local state only');
        }

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });

        // Update post stats
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, stats: { ...post.stats, likes: Math.max(0, post.stats.likes - 1) }, isLiked: false }
            : post
        ));
      } else {
        // Like
        try {
          const { error } = await (supabase as any)
            .from('tasting_likes')
            .insert({
              user_id: user.id,
              tasting_id: postId
            });

          if (error) throw error;
        } catch (dbError) {
          console.log('Likes table not available, using local state only');
        }

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });

        // Update post stats
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, stats: { ...post.stats, likes: post.stats.likes + 1 }, isLiked: true }
            : post
        ));

        toast.success('Post liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleFollow = async (targetUserId: string, targetUserName: string) => {
    if (!user?.id) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (targetUserId === user.id) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const post = posts.find(p => p.user_id === targetUserId);
      const isCurrentlyFollowing = post?.isFollowed || false;

      if (isCurrentlyFollowing) {
        // Unfollow
        try {
          const { error } = await (supabase as any)
            .from('user_follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetUserId);

          if (error) throw error;
        } catch (dbError) {
          console.log('Follows table not available, using local state only');
        }

        // Update post
        setPosts(prev => prev.map(post =>
          post.user_id === targetUserId
            ? { ...post, isFollowed: false }
            : post
        ));

        toast.success(`Unfollowed ${targetUserName}`);
      } else {
        // Follow
        try {
          const { error } = await (supabase as any)
            .from('user_follows')
            .insert({
              follower_id: user.id,
              following_id: targetUserId
            });

          if (error) throw error;
        } catch (dbError) {
          console.log('Follows table not available, using local state only');
        }

        // Update post
        setPosts(prev => prev.map(post =>
          post.user_id === targetUserId
            ? { ...post, isFollowed: true }
            : post
        ));

        toast.success(`Following ${targetUserName}!`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleComment = (postId: string) => {
    // TODO: Open comment modal/input when implemented
    toast.info('Comments feature coming soon!');
  };

  const handleShare = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to share posts');
      return;
    }

    try {
      const supabase = getSupabaseClient();

      // Record the share in database (if table exists)
      try {
        const { error } = await (supabase as any)
          .from('tasting_shares')
          .insert({
            user_id: user.id,
            tasting_id: postId
          });

        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }
      } catch (dbError) {
        console.log('Shares table not available, skipping database record');
      }

      // Update post stats
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, stats: { ...post.stats, shares: post.stats.shares + 1 } }
          : post
      ));

      // Use Web Share API or clipboard
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this tasting!',
          text: 'I found an interesting tasting session',
          url: `${window.location.origin}/social`
        });
        toast.success('Post shared!');
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/social`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share post');
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
                <div className="mb-4">
                  <span className="material-symbols-outlined text-6xl text-orange-500">local_bar</span>
                </div>
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
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-baseline space-x-2 flex-1 min-w-0">
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
                        {/* Follow Button */}
                        {user?.id !== post.user_id && (
                          <button
                            onClick={() => handleFollow(post.user_id, post.user.full_name || 'User')}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              post.isFollowed
                                ? 'bg-primary text-white hover:bg-primary/80'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {post.isFollowed ? 'Following' : 'Follow'}
                          </button>
                        )}
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
                          <span className="text-sm">{post.stats.comments}</span>
                        </button>
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 group transition-colors ${
                            post.isLiked
                              ? 'text-red-500'
                              : 'hover:text-red-500'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-lg ${
                            post.isLiked ? 'text-red-500' : 'group-hover:text-red-500'
                          }`}>
                            {post.isLiked ? 'favorite' : 'favorite_border'}
                          </span>
                          <span className="text-sm">{post.stats.likes}</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center space-x-2 hover:text-primary group transition-colors"
                        >
                          <span className="material-symbols-outlined group-hover:text-primary text-lg">share</span>
                          <span className="text-sm">{post.stats.shares}</span>
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
