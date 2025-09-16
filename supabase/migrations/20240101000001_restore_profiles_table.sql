-- Restore profiles table and all related components
-- Based on database-context.md specifications

-- Create profiles table
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "username" text,
    "bio" text,
    "posts_count" integer DEFAULT 0 NOT NULL,
    "followers_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "preferred_category" text,
    "last_tasted_at" timestamp with time zone,
    "email_confirmed" boolean DEFAULT false NOT NULL,
    "tastings_count" integer DEFAULT 0 NOT NULL,
    "reviews_count" integer DEFAULT 0 NOT NULL
);

-- Add primary key constraint
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");

-- Add foreign key constraint
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "auth"."users"("id") 
    ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "delete_own_profile" ON "public"."profiles"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "insert_own_profile" ON "public"."profiles"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "read_all_profiles" ON "public"."profiles"
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "update_own_profile" ON "public"."profiles"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_view_profile" ON "public"."profiles"
    FOR SELECT
    TO authenticated
    USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, full_name, avatar_url, username, bio, email_confirmed, created_at, updated_at
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'bio',
    false,
    now(),
    now()
  );
  RETURN new;
END;
$$;

-- Create function to auto-update timestamps
CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER "on_auth_user_created"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" 
    BEFORE UPDATE ON "public"."profiles" 
    FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

-- Grant necessary permissions
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";