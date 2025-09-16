-- Create storage bucket for tasting photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tasting-photos',
    'tasting-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Policy: Users can view all tasting photos (public bucket)
CREATE POLICY "Tasting photos are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'tasting-photos');

-- Policy: Users can upload their own tasting photos
CREATE POLICY "Users can upload their own tasting photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'tasting-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can update their own tasting photos
CREATE POLICY "Users can update their own tasting photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'tasting-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own tasting photos
CREATE POLICY "Users can delete their own tasting photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'tasting-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Add total_tastings column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'total_tastings'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN total_tastings INTEGER DEFAULT 0;
    END IF;
END $$;