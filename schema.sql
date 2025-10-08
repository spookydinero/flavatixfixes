

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_reviews_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Actualizar contador de reviews del usuario
    UPDATE public.profiles
    SET 
        reviews_count = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        ),
        updated_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_profile_reviews_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_tasting_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update the user's total tasting count in profiles
    -- Use auth.users id to find corresponding profile
    UPDATE public.profiles
    SET 
        total_tastings = (
            SELECT COUNT(*) 
            FROM public.quick_tastings 
            WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        ),
        updated_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_profile_tasting_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_prose_word_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_prose_word_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quick_tasting_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update total_items, completed_items, and average_score
    UPDATE public.quick_tastings
    SET 
        total_items = (
            SELECT COUNT(*) 
            FROM public.quick_tasting_items 
            WHERE tasting_id = COALESCE(NEW.tasting_id, OLD.tasting_id)
        ),
        completed_items = (
            SELECT COUNT(*) 
            FROM public.quick_tasting_items 
            WHERE tasting_id = COALESCE(NEW.tasting_id, OLD.tasting_id) 
            AND overall_score IS NOT NULL
        ),
        average_score = (
            SELECT AVG(overall_score) 
            FROM public.quick_tasting_items 
            WHERE tasting_id = COALESCE(NEW.tasting_id, OLD.tasting_id) 
            AND overall_score IS NOT NULL
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.tasting_id, OLD.tasting_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_quick_tasting_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_review_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_review_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reviews_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles 
        SET reviews_count = reviews_count + 1 
        WHERE user_id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles 
        SET reviews_count = reviews_count - 1 
        WHERE user_id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_reviews_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "username" "text",
    "bio" "text",
    "posts_count" integer DEFAULT 0 NOT NULL,
    "followers_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "preferred_category" "text",
    "last_tasted_at" timestamp with time zone,
    "email_confirmed" boolean DEFAULT false NOT NULL,
    "tastings_count" integer DEFAULT 0 NOT NULL,
    "reviews_count" integer DEFAULT 0 NOT NULL,
    "total_tastings" integer DEFAULT 0
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prose_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "review_id" character varying(100),
    "item_name" character varying(255) NOT NULL,
    "picture_url" "text",
    "brand" character varying(255),
    "country" character varying(100),
    "state" character varying(100),
    "region" character varying(255),
    "vintage" character varying(4),
    "batch_id" character varying(255),
    "upc_barcode" character varying(255),
    "category" character varying(100) NOT NULL,
    "production_date" "date",
    "review_content" "text" NOT NULL,
    "status" character varying(20) DEFAULT 'in_progress' NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "prose_reviews_status_check" CHECK (("status" IN ('in_progress', 'completed', 'published')))
);


ALTER TABLE "public"."prose_reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."prose_reviews" IS 'Reviews en formato libre de texto';



COMMENT ON COLUMN "public"."prose_reviews"."review_content" IS 'Contenido completo del review en texto libre';



CREATE TABLE IF NOT EXISTS "public"."quick_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "review_id" character varying(100),
    "item_name" character varying(255) NOT NULL,
    "picture_url" "text",
    "brand" character varying(255),
    "country" character varying(100),
    "state" character varying(100),
    "region" character varying(255),
    "vintage" character varying(4),
    "batch_id" character varying(255),
    "upc_barcode" character varying(255),
    "category" character varying(100) NOT NULL,
    "production_date" "date",
    "aroma_notes" "text",
    "aroma_intensity" integer,
    "salt_score" integer,
    "salt_notes" "text",
    "umami_score" integer,
    "umami_notes" "text",
    "spiciness_score" integer,
    "spiciness_notes" "text",
    "acidity_score" integer,
    "acidity_notes" "text",
    "sweetness_score" integer,
    "sweetness_notes" "text",
    "flavor_notes" "text",
    "flavor_intensity" integer,
    "texture_notes" "text",
    "typicity_score" integer,
    "complexity_score" integer,
    "other_notes" "text",
    "overall_score" integer,
    "status" character varying(20) DEFAULT 'in_progress' NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quick_reviews_acidity_score_check" CHECK ((("acidity_score" >= 1) AND ("acidity_score" <= 100))),
    CONSTRAINT "quick_reviews_aroma_intensity_check" CHECK ((("aroma_intensity" >= 1) AND ("aroma_intensity" <= 100))),
    CONSTRAINT "quick_reviews_complexity_score_check" CHECK ((("complexity_score" >= 1) AND ("complexity_score" <= 100))),
    CONSTRAINT "quick_reviews_flavor_intensity_check" CHECK ((("flavor_intensity" >= 1) AND ("flavor_intensity" <= 100))),
    CONSTRAINT "quick_reviews_overall_score_check" CHECK ((("overall_score" >= 1) AND ("overall_score" <= 100))),
    CONSTRAINT "quick_reviews_salt_score_check" CHECK ((("salt_score" >= 1) AND ("salt_score" <= 100))),
    CONSTRAINT "quick_reviews_spiciness_score_check" CHECK ((("spiciness_score" >= 1) AND ("spiciness_score" <= 100))),
    CONSTRAINT "quick_reviews_sweetness_score_check" CHECK ((("sweetness_score" >= 1) AND ("sweetness_score" <= 100))),
    CONSTRAINT "quick_reviews_typicity_score_check" CHECK ((("typicity_score" >= 1) AND ("typicity_score" <= 100))),
    CONSTRAINT "quick_reviews_umami_score_check" CHECK ((("umami_score" >= 1) AND ("umami_score" <= 100))),
    CONSTRAINT "quick_reviews_status_check" CHECK (("status" IN ('in_progress', 'completed', 'published')))
);


ALTER TABLE "public"."quick_reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."quick_reviews" IS 'Reviews estructurados con puntuaciones 1-100 para diferentes aspectos';



COMMENT ON COLUMN "public"."quick_reviews"."overall_score" IS 'Puntuación general del 1-100';



CREATE TABLE IF NOT EXISTS "public"."quick_tasting_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tasting_id" "uuid" NOT NULL,
    "item_name" "text" NOT NULL,
    "notes" "text",
    "flavor_scores" "jsonb",
    "overall_score" integer,
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quick_tasting_items_overall_score_check" CHECK ((("overall_score" >= 1) AND ("overall_score" <= 100)))
);


ALTER TABLE "public"."quick_tasting_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quick_tastings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "session_name" "text",
    "notes" "text",
    "total_items" integer DEFAULT 0,
    "completed_items" integer DEFAULT 0,
    "average_score" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "quick_tastings_category_check" CHECK (("category" = ANY (ARRAY['coffee'::"text", 'tea'::"text", 'wine'::"text", 'spirits'::"text", 'beer'::"text", 'chocolate'::"text"])))
);


ALTER TABLE "public"."quick_tastings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."prose_reviews"
    ADD CONSTRAINT "prose_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quick_reviews"
    ADD CONSTRAINT "quick_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quick_tasting_items"
    ADD CONSTRAINT "quick_tasting_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quick_tastings"
    ADD CONSTRAINT "quick_tastings_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_prose_reviews_category" ON "public"."prose_reviews" USING "btree" ("category");



CREATE INDEX "idx_prose_reviews_created_at" ON "public"."prose_reviews" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_prose_reviews_user_id" ON "public"."prose_reviews" USING "btree" ("user_id");



CREATE INDEX "idx_quick_reviews_category" ON "public"."quick_reviews" USING "btree" ("category");



CREATE INDEX "idx_quick_reviews_created_at" ON "public"."quick_reviews" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_quick_reviews_overall_score" ON "public"."quick_reviews" USING "btree" ("overall_score" DESC);



CREATE INDEX "idx_quick_reviews_user_id" ON "public"."quick_reviews" USING "btree" ("user_id");



CREATE INDEX "idx_quick_tasting_items_created_at" ON "public"."quick_tasting_items" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_quick_tasting_items_tasting_id" ON "public"."quick_tasting_items" USING "btree" ("tasting_id");



CREATE INDEX "idx_quick_tastings_category" ON "public"."quick_tastings" USING "btree" ("category");



CREATE INDEX "idx_quick_tastings_created_at" ON "public"."quick_tastings" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_quick_tastings_user_id" ON "public"."quick_tastings" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "prose_reviews_count_trigger" AFTER INSERT OR DELETE ON "public"."prose_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_reviews_count"();



CREATE OR REPLACE TRIGGER "quick_reviews_count_trigger" AFTER INSERT OR DELETE ON "public"."quick_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_reviews_count"();



CREATE OR REPLACE TRIGGER "set_updated_at_quick_tasting_items" BEFORE UPDATE ON "public"."quick_tasting_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_quick_tastings" BEFORE UPDATE ON "public"."quick_tastings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_profile_tasting_count" AFTER INSERT OR DELETE ON "public"."quick_tastings" FOR EACH ROW EXECUTE FUNCTION "public"."update_profile_tasting_count"();



CREATE OR REPLACE TRIGGER "trigger_update_quick_tasting_stats_delete" AFTER DELETE ON "public"."quick_tasting_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_quick_tasting_stats"();



CREATE OR REPLACE TRIGGER "trigger_update_quick_tasting_stats_insert" AFTER INSERT ON "public"."quick_tasting_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_quick_tasting_stats"();



CREATE OR REPLACE TRIGGER "trigger_update_quick_tasting_stats_update" AFTER UPDATE ON "public"."quick_tasting_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_quick_tasting_stats"();



CREATE OR REPLACE TRIGGER "update_prose_reviews_updated_at" BEFORE UPDATE ON "public"."prose_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_quick_reviews_updated_at" BEFORE UPDATE ON "public"."quick_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prose_reviews"
    ADD CONSTRAINT "prose_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quick_reviews"
    ADD CONSTRAINT "quick_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quick_tasting_items"
    ADD CONSTRAINT "quick_tasting_items_tasting_id_fkey" FOREIGN KEY ("tasting_id") REFERENCES "public"."quick_tastings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quick_tastings"
    ADD CONSTRAINT "quick_tastings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete own prose reviews" ON "public"."prose_reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own quick reviews" ON "public"."quick_reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own quick tasting items" ON "public"."quick_tasting_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."quick_tastings" "qt"
  WHERE (("qt"."id" = "quick_tasting_items"."tasting_id") AND ("qt"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own quick tastings" ON "public"."quick_tastings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own prose reviews" ON "public"."prose_reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own quick reviews" ON "public"."quick_reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own quick tasting items" ON "public"."quick_tasting_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."quick_tastings" "qt"
  WHERE (("qt"."id" = "quick_tasting_items"."tasting_id") AND ("qt"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own quick tastings" ON "public"."quick_tastings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own prose reviews" ON "public"."prose_reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own quick reviews" ON "public"."quick_reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own quick tasting items" ON "public"."quick_tasting_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."quick_tastings" "qt"
  WHERE (("qt"."id" = "quick_tasting_items"."tasting_id") AND ("qt"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own quick tastings" ON "public"."quick_tastings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own prose reviews" ON "public"."prose_reviews" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own quick reviews" ON "public"."quick_reviews" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own quick tasting items" ON "public"."quick_tasting_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."quick_tastings" "qt"
  WHERE (("qt"."id" = "quick_tasting_items"."tasting_id") AND ("qt"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own quick tastings" ON "public"."quick_tastings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "delete_own_profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "insert_own_profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prose_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_tasting_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_tastings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_all_profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "update_own_profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_view_profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT ALL ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT ON TABLE "public"."prose_reviews" TO "anon";
GRANT ALL ON TABLE "public"."prose_reviews" TO "authenticated";



GRANT SELECT ON TABLE "public"."quick_reviews" TO "anon";
GRANT ALL ON TABLE "public"."quick_reviews" TO "authenticated";



GRANT ALL ON TABLE "public"."quick_tasting_items" TO "anon";
GRANT ALL ON TABLE "public"."quick_tasting_items" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_tasting_items" TO "service_role";



GRANT ALL ON TABLE "public"."quick_tastings" TO "anon";
GRANT ALL ON TABLE "public"."quick_tastings" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_tastings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT ON TABLES TO "authenticated";



























RESET ALL;
