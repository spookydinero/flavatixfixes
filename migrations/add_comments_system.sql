-- Comments System Migration
-- Creates tables for tasting comments with threading support

-- Create tasting_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tasting_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    tasting_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_comment_id uuid,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT tasting_comments_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES public.quick_tastings(id) ON DELETE CASCADE,
    CONSTRAINT tasting_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT tasting_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.tasting_comments(id) ON DELETE CASCADE
);

-- Create comment_likes table for liking comments
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.tasting_comments(id) ON DELETE CASCADE,
    CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT comment_likes_unique UNIQUE (comment_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasting_comments_tasting_id ON public.tasting_comments(tasting_id);
CREATE INDEX IF NOT EXISTS idx_tasting_comments_user_id ON public.tasting_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tasting_comments_parent_id ON public.tasting_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_tasting_comments_created_at ON public.tasting_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_comment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_tasting_comments
    BEFORE UPDATE ON public.tasting_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_updated_at();

-- Enable Row Level Security
ALTER TABLE public.tasting_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasting_comments
-- Anyone can read non-deleted comments
CREATE POLICY "Comments are viewable by everyone"
    ON public.tasting_comments
    FOR SELECT
    USING (deleted_at IS NULL);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
    ON public.tasting_comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
    ON public.tasting_comments
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can soft delete their own comments
CREATE POLICY "Users can delete their own comments"
    ON public.tasting_comments
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for comment_likes
-- Anyone can view comment likes
CREATE POLICY "Comment likes are viewable by everyone"
    ON public.comment_likes
    FOR SELECT
    USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can like comments"
    ON public.comment_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can unlike comments"
    ON public.comment_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.tasting_comments TO authenticated;
GRANT ALL ON public.comment_likes TO authenticated;
GRANT SELECT ON public.tasting_comments TO anon;
GRANT SELECT ON public.comment_likes TO anon;

