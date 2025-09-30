// Comment types for the social feed comments system

export type TastingComment = {
  id: string;
  tasting_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  comment_text: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type CommentLike = {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
};

export type CommentWithUser = TastingComment & {
  user: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  likes_count: number;
  is_liked: boolean;
  replies?: CommentWithUser[];
};

