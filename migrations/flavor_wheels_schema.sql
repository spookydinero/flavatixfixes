-- Flavor Wheels Feature - Database Schema Migration
-- This migration creates the necessary tables for AI-powered flavor wheel generation
-- Run this migration against your PostgreSQL database

-- ============================================================================
-- TABLES
-- ============================================================================

-- Table: flavor_descriptors
-- Stores individual flavor/aroma/metaphor descriptors extracted from user content
CREATE TABLE IF NOT EXISTS flavor_descriptors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Source information (where this descriptor came from)
    source_type TEXT NOT NULL CHECK (source_type IN ('quick_tasting', 'quick_review', 'prose_review')),
    source_id UUID NOT NULL,

    -- Descriptor data
    descriptor_text TEXT NOT NULL,
    descriptor_type TEXT NOT NULL CHECK (descriptor_type IN ('aroma', 'flavor', 'texture', 'metaphor')),

    -- Categorization (AI-generated hierarchy)
    category TEXT, -- e.g., 'Fruity', 'Spicy', 'Woody'
    subcategory TEXT, -- e.g., 'Citrus', 'Berry', 'Stone Fruit'

    -- Metadata
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),

    -- Item context (optional - for item-specific wheels)
    item_name TEXT,
    item_category TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Prevent duplicate descriptors from same source
    UNIQUE(source_type, source_id, descriptor_text, descriptor_type)
);

-- Table: flavor_wheels
-- Stores generated wheel data for different scopes
CREATE TABLE IF NOT EXISTS flavor_wheels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scope information
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wheel_type TEXT NOT NULL CHECK (wheel_type IN ('aroma', 'flavor', 'combined', 'metaphor')),
    scope_type TEXT NOT NULL CHECK (scope_type IN ('personal', 'universal', 'item', 'category', 'tasting')),

    -- Scope filters (stored as JSONB for flexibility)
    scope_filter JSONB DEFAULT '{}',
    -- Examples:
    -- Personal: { "user_id": "uuid" }
    -- Item: { "item_name": "Oban 14", "item_category": "whiskey" }
    -- Category: { "category": "mezcal" }
    -- Universal: {}

    -- Generated wheel data
    wheel_data JSONB NOT NULL,
    -- Structure:
    -- {
    --   "categories": [
    --     {
    --       "name": "Fruity",
    --       "count": 45,
    --       "percentage": 23.5,
    --       "subcategories": [
    --         {
    --           "name": "Citrus",
    --           "count": 20,
    --           "descriptors": [
    --             { "text": "lemon", "count": 10, "avgIntensity": 3.5 },
    --             { "text": "orange", "count": 10, "avgIntensity": 4.0 }
    --           ]
    --         }
    --       ]
    --     }
    --   ],
    --   "totalDescriptors": 192,
    --   "generatedFrom": { "tastings": 15, "reviews": 8 }
    -- }

    -- Statistics
    total_descriptors INTEGER DEFAULT 0,
    unique_descriptors INTEGER DEFAULT 0,
    data_sources_count INTEGER DEFAULT 0,

    -- Metadata
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE, -- For cache invalidation
    version INTEGER DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: aroma_molecules
-- Reference table for descriptor-to-molecule mappings
CREATE TABLE IF NOT EXISTS aroma_molecules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Descriptor information
    descriptor TEXT NOT NULL UNIQUE,
    descriptor_normalized TEXT NOT NULL, -- lowercase, trimmed

    -- Molecule data (stored as JSONB array)
    molecules JSONB NOT NULL,
    -- Structure:
    -- [
    --   { "name": "Limonene", "casNumber": "5989-27-5", "frequency": "high" },
    --   { "name": "Citral", "casNumber": "5392-40-5", "frequency": "medium" }
    -- ]

    -- Metadata
    source TEXT, -- e.g., 'FlavorDB', 'Manual', 'Research'
    verified BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes for flavor_descriptors
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_user_id
    ON flavor_descriptors(user_id);

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_source
    ON flavor_descriptors(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_type
    ON flavor_descriptors(descriptor_type);

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_category
    ON flavor_descriptors(category);

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_item
    ON flavor_descriptors(item_name, item_category)
    WHERE item_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_created_at
    ON flavor_descriptors(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_user_type
    ON flavor_descriptors(user_id, descriptor_type, created_at DESC);

-- Indexes for flavor_wheels
CREATE INDEX IF NOT EXISTS idx_flavor_wheels_user_id
    ON flavor_wheels(user_id);

CREATE INDEX IF NOT EXISTS idx_flavor_wheels_scope
    ON flavor_wheels(scope_type, wheel_type);

CREATE INDEX IF NOT EXISTS idx_flavor_wheels_generated_at
    ON flavor_wheels(generated_at DESC);

-- GIN index for JSONB scope_filter queries
CREATE INDEX IF NOT EXISTS idx_flavor_wheels_scope_filter
    ON flavor_wheels USING GIN (scope_filter);

-- Indexes for aroma_molecules
CREATE INDEX IF NOT EXISTS idx_aroma_molecules_descriptor_normalized
    ON aroma_molecules(descriptor_normalized);

-- GIN index for molecules JSONB searches
CREATE INDEX IF NOT EXISTS idx_aroma_molecules_molecules
    ON aroma_molecules USING GIN (molecules);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at on flavor_descriptors
CREATE OR REPLACE TRIGGER set_updated_at_flavor_descriptors
    BEFORE UPDATE ON flavor_descriptors
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Trigger: Update updated_at on flavor_wheels
CREATE OR REPLACE TRIGGER set_updated_at_flavor_wheels
    BEFORE UPDATE ON flavor_wheels
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Trigger: Update updated_at on aroma_molecules
CREATE OR REPLACE TRIGGER set_updated_at_aroma_molecules
    BEFORE UPDATE ON aroma_molecules
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE flavor_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_wheels ENABLE ROW LEVEL SECURITY;
ALTER TABLE aroma_molecules ENABLE ROW LEVEL SECURITY;

-- Policies for flavor_descriptors
CREATE POLICY "Users can view their own descriptors"
    ON flavor_descriptors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own descriptors"
    ON flavor_descriptors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own descriptors"
    ON flavor_descriptors FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own descriptors"
    ON flavor_descriptors FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for flavor_wheels
CREATE POLICY "Users can view their own wheels"
    ON flavor_wheels FOR SELECT
    USING (
        user_id = auth.uid()
        OR scope_type = 'universal'
    );

CREATE POLICY "Users can insert their own wheels"
    ON flavor_wheels FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR user_id IS NULL AND scope_type = 'universal'
    );

CREATE POLICY "Users can update their own wheels"
    ON flavor_wheels FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own wheels"
    ON flavor_wheels FOR DELETE
    USING (user_id = auth.uid());

-- Policies for aroma_molecules (public read, admin write)
CREATE POLICY "Anyone can view aroma molecules"
    ON aroma_molecules FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage aroma molecules"
    ON aroma_molecules FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON TABLE flavor_descriptors TO authenticated;
GRANT SELECT ON TABLE flavor_descriptors TO anon;

GRANT ALL ON TABLE flavor_wheels TO authenticated;
GRANT SELECT ON TABLE flavor_wheels TO anon;

GRANT SELECT ON TABLE aroma_molecules TO authenticated;
GRANT SELECT ON TABLE aroma_molecules TO anon;
GRANT ALL ON TABLE aroma_molecules TO service_role;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get descriptor statistics for a user
CREATE OR REPLACE FUNCTION get_user_descriptor_stats(target_user_id UUID)
RETURNS TABLE(
    descriptor_type TEXT,
    total_count BIGINT,
    unique_count BIGINT,
    top_category TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        fd.descriptor_type,
        COUNT(*) as total_count,
        COUNT(DISTINCT fd.descriptor_text) as unique_count,
        (
            SELECT category
            FROM flavor_descriptors
            WHERE user_id = target_user_id
                AND descriptor_type = fd.descriptor_type
                AND category IS NOT NULL
            GROUP BY category
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) as top_category
    FROM flavor_descriptors fd
    WHERE fd.user_id = target_user_id
    GROUP BY fd.descriptor_type;
END;
$$;

-- Function: Check if wheel needs regeneration (cache invalidation)
CREATE OR REPLACE FUNCTION should_regenerate_wheel(
    p_wheel_type TEXT,
    p_scope_type TEXT,
    p_scope_filter JSONB
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    latest_wheel_date TIMESTAMP WITH TIME ZONE;
    latest_descriptor_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the latest wheel generation date
    SELECT generated_at INTO latest_wheel_date
    FROM flavor_wheels
    WHERE wheel_type = p_wheel_type
        AND scope_type = p_scope_type
        AND scope_filter = p_scope_filter
    ORDER BY generated_at DESC
    LIMIT 1;

    -- If no wheel exists, needs generation
    IF latest_wheel_date IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Check if wheel has expired
    IF EXISTS (
        SELECT 1 FROM flavor_wheels
        WHERE wheel_type = p_wheel_type
            AND scope_type = p_scope_type
            AND scope_filter = p_scope_filter
            AND expires_at < now()
    ) THEN
        RETURN TRUE;
    END IF;

    -- Get the latest descriptor date for this scope
    SELECT MAX(created_at) INTO latest_descriptor_date
    FROM flavor_descriptors
    WHERE (
        p_scope_type = 'universal' OR
        (p_scope_type = 'personal' AND user_id = (p_scope_filter->>'user_id')::UUID)
    );

    -- Regenerate if new descriptors added since last wheel generation
    RETURN latest_descriptor_date > latest_wheel_date;
END;
$$;

-- ============================================================================
-- SEED DATA (Common aroma molecules)
-- ============================================================================

INSERT INTO aroma_molecules (descriptor, descriptor_normalized, molecules, source, verified) VALUES
    ('lemon', 'lemon', '[{"name": "Limonene", "casNumber": "5989-27-5", "frequency": "high"}, {"name": "Citral", "casNumber": "5392-40-5", "frequency": "high"}]', 'FlavorDB', true),
    ('vanilla', 'vanilla', '[{"name": "Vanillin", "casNumber": "121-33-5", "frequency": "high"}]', 'FlavorDB', true),
    ('smoke', 'smoke', '[{"name": "Guaiacol", "casNumber": "90-05-1", "frequency": "high"}, {"name": "Phenol", "casNumber": "108-95-2", "frequency": "medium"}]', 'FlavorDB', true),
    ('caramel', 'caramel', '[{"name": "Diacetyl", "casNumber": "431-03-8", "frequency": "high"}, {"name": "Acetoin", "casNumber": "513-86-0", "frequency": "medium"}]', 'FlavorDB', true),
    ('rose', 'rose', '[{"name": "Geraniol", "casNumber": "106-24-1", "frequency": "high"}, {"name": "Citronellol", "casNumber": "106-22-9", "frequency": "high"}]', 'FlavorDB', true),
    ('mint', 'mint', '[{"name": "Menthol", "casNumber": "89-78-1", "frequency": "high"}]', 'FlavorDB', true),
    ('chocolate', 'chocolate', '[{"name": "Tetramethylpyrazine", "casNumber": "1124-11-4", "frequency": "medium"}, {"name": "Trimethylpyrazine", "casNumber": "14667-55-1", "frequency": "medium"}]', 'FlavorDB', true),
    ('apple', 'apple', '[{"name": "Hexyl acetate", "casNumber": "142-92-7", "frequency": "high"}, {"name": "Ethyl 2-methylbutyrate", "casNumber": "7452-79-1", "frequency": "medium"}]', 'FlavorDB', true)
ON CONFLICT (descriptor) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE flavor_descriptors IS 'Stores individual flavor/aroma descriptors extracted from user reviews and tastings';
COMMENT ON TABLE flavor_wheels IS 'Stores generated flavor wheel visualizations for different scopes (personal, universal, etc.)';
COMMENT ON TABLE aroma_molecules IS 'Reference table mapping flavor descriptors to their chemical compounds';

COMMENT ON COLUMN flavor_descriptors.confidence_score IS 'AI confidence score for descriptor extraction (0.0 to 1.0)';
COMMENT ON COLUMN flavor_descriptors.intensity IS 'User-provided or inferred intensity rating (1-5)';
COMMENT ON COLUMN flavor_wheels.wheel_data IS 'Complete JSON structure of the generated flavor wheel';
COMMENT ON COLUMN flavor_wheels.expires_at IS 'Cache expiration timestamp - wheel should be regenerated after this';
COMMENT ON COLUMN aroma_molecules.molecules IS 'Array of chemical compounds associated with this descriptor';
