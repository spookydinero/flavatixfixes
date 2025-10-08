-- Migration: Add missing fields to review tables
-- Date: 2025-09-30
-- Description: Add brand, country, state, region, vintage, batch_id, upc_barcode, review_id, and status fields to quick_reviews and prose_reviews tables

-- Add new columns to prose_reviews table
ALTER TABLE "public"."prose_reviews"
ADD COLUMN IF NOT EXISTS "review_id" character varying(100),
ADD COLUMN IF NOT EXISTS "brand" character varying(255),
ADD COLUMN IF NOT EXISTS "country" character varying(100),
ADD COLUMN IF NOT EXISTS "state" character varying(100),
ADD COLUMN IF NOT EXISTS "region" character varying(255),
ADD COLUMN IF NOT EXISTS "vintage" character varying(4),
ADD COLUMN IF NOT EXISTS "batch_id" character varying(255),
ADD COLUMN IF NOT EXISTS "upc_barcode" character varying(255),
ADD COLUMN IF NOT EXISTS "status" character varying(20) DEFAULT 'in_progress' NOT NULL;

-- Add constraint for prose_reviews status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'prose_reviews_status_check'
    ) THEN
        ALTER TABLE "public"."prose_reviews"
        ADD CONSTRAINT "prose_reviews_status_check" 
        CHECK ("status" IN ('in_progress', 'completed', 'published'));
    END IF;
END $$;

-- Add new columns to quick_reviews table
ALTER TABLE "public"."quick_reviews"
ADD COLUMN IF NOT EXISTS "review_id" character varying(100),
ADD COLUMN IF NOT EXISTS "brand" character varying(255),
ADD COLUMN IF NOT EXISTS "country" character varying(100),
ADD COLUMN IF NOT EXISTS "state" character varying(100),
ADD COLUMN IF NOT EXISTS "region" character varying(255),
ADD COLUMN IF NOT EXISTS "vintage" character varying(4),
ADD COLUMN IF NOT EXISTS "batch_id" character varying(255),
ADD COLUMN IF NOT EXISTS "upc_barcode" character varying(255),
ADD COLUMN IF NOT EXISTS "status" character varying(20) DEFAULT 'in_progress' NOT NULL;

-- Add constraint for quick_reviews status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quick_reviews_status_check'
    ) THEN
        ALTER TABLE "public"."quick_reviews"
        ADD CONSTRAINT "quick_reviews_status_check" 
        CHECK ("status" IN ('in_progress', 'completed', 'published'));
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_prose_reviews_review_id" ON "public"."prose_reviews" USING "btree" ("review_id");
CREATE INDEX IF NOT EXISTS "idx_prose_reviews_status" ON "public"."prose_reviews" USING "btree" ("status");
CREATE INDEX IF NOT EXISTS "idx_quick_reviews_review_id" ON "public"."quick_reviews" USING "btree" ("review_id");
CREATE INDEX IF NOT EXISTS "idx_quick_reviews_status" ON "public"."quick_reviews" USING "btree" ("status");

-- Add comments
COMMENT ON COLUMN "public"."prose_reviews"."review_id" IS 'Composite ID: First 4 chars of Category + Name + Lot ID + Date';
COMMENT ON COLUMN "public"."prose_reviews"."status" IS 'Review status: in_progress, completed, or published';
COMMENT ON COLUMN "public"."quick_reviews"."review_id" IS 'Composite ID: First 4 chars of Category + Name + Lot ID + Date';
COMMENT ON COLUMN "public"."quick_reviews"."status" IS 'Review status: in_progress, completed, or published';

