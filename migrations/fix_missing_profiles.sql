-- Migration: Fix missing profiles for existing users
-- Date: 2025-10-03
-- Description: Ensure all auth users have corresponding profiles

-- Insert missing profiles for users who signed up but don't have profiles
INSERT INTO public.profiles (user_id, full_name, email_confirmed, created_at, updated_at)
SELECT
    au.id,
    au.raw_user_meta_data->>'full_name',
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Update any existing profiles that might be missing email_confirmed status
UPDATE public.profiles
SET email_confirmed = CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END
FROM auth.users au
WHERE profiles.user_id = au.id AND profiles.email_confirmed IS NULL;
