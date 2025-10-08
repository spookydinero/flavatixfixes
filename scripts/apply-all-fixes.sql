-- ============================================================================
-- FLAVATIX - COMPREHENSIVE DATABASE FIXES
-- This script fixes all identified database issues
-- ============================================================================

-- Fix 1: Update RLS policies for flavor_descriptors to allow service role access
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own descriptors" ON flavor_descriptors;
DROP POLICY IF EXISTS "Users can insert their own descriptors" ON flavor_descriptors;
DROP POLICY IF EXISTS "Users can update their own descriptors" ON flavor_descriptors;
DROP POLICY IF EXISTS "Users can delete their own descriptors" ON flavor_descriptors;

-- New policies that allow both user access and service role access
CREATE POLICY "Users and service can view descriptors"
    ON flavor_descriptors FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users and service can insert descriptors"
    ON flavor_descriptors FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users and service can update descriptors"
    ON flavor_descriptors FOR UPDATE
    USING (
        auth.uid() = user_id
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users and service can delete descriptors"
    ON flavor_descriptors FOR DELETE
    USING (
        auth.uid() = user_id
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

-- Fix 2: Update RLS policies for flavor_wheels
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own wheels" ON flavor_wheels;
DROP POLICY IF EXISTS "Users can insert their own wheels" ON flavor_wheels;
DROP POLICY IF EXISTS "Users can update their own wheels" ON flavor_wheels;
DROP POLICY IF EXISTS "Users can delete their own wheels" ON flavor_wheels;

CREATE POLICY "Users and service can view wheels"
    ON flavor_wheels FOR SELECT
    USING (
        user_id = auth.uid()
        OR scope_type = 'universal'
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users and service can insert wheels"
    ON flavor_wheels FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR (user_id IS NULL AND scope_type = 'universal')
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users and service can update wheels"
    ON flavor_wheels FOR UPDATE
    USING (
        user_id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users and service can delete wheels"
    ON flavor_wheels FOR DELETE
    USING (
        user_id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

-- Fix 3: Grant proper permissions to service role
-- ============================================================================
GRANT ALL ON TABLE flavor_descriptors TO service_role;
GRANT ALL ON TABLE flavor_wheels TO service_role;
GRANT ALL ON TABLE aroma_molecules TO service_role;

-- Fix 4: Update quick_tastings category constraint to allow more categories
-- ============================================================================
ALTER TABLE quick_tastings DROP CONSTRAINT IF EXISTS quick_tastings_category_check;

-- Add new constraint that allows any category
ALTER TABLE quick_tastings
  ADD CONSTRAINT quick_tastings_category_check
  CHECK (category = ANY (ARRAY[
    'coffee'::text,
    'tea'::text,
    'wine'::text,
    'spirits'::text,
    'whiskey'::text,
    'beer'::text,
    'chocolate'::text,
    'cheese'::text,
    'olive_oil'::text,
    'other'::text
  ]));

-- Fix 5: Ensure all required indexes exist
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_quick_tastings_completed_at
  ON quick_tastings(completed_at DESC)
  WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quick_tasting_items_overall_score
  ON quick_tasting_items(overall_score)
  WHERE overall_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_user_created
  ON flavor_descriptors(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flavor_wheels_user_type_scope
  ON flavor_wheels(user_id, wheel_type, scope_type);

-- Fix 6: Add helpful database functions
-- ============================================================================

-- Function to get completed items count for a tasting
CREATE OR REPLACE FUNCTION get_completed_items_count(tasting_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM quick_tasting_items
  WHERE tasting_id = tasting_uuid
    AND overall_score IS NOT NULL;
$$;

-- Function to get total scored items for a user
CREATE OR REPLACE FUNCTION get_user_scored_items_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM quick_tasting_items qti
  INNER JOIN quick_tastings qt ON qt.id = qti.tasting_id
  WHERE qt.user_id = user_uuid
    AND qti.overall_score IS NOT NULL;
$$;

-- Fix 7: Create view for completed tastings with stats
-- ============================================================================
CREATE OR REPLACE VIEW quick_tasting_sessions AS
SELECT
  qt.*,
  COALESCE(
    (SELECT COUNT(*)
     FROM quick_tasting_items qti
     WHERE qti.tasting_id = qt.id AND qti.overall_score IS NOT NULL),
    0
  ) as items_scored
FROM quick_tastings qt
WHERE qt.completed_at IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON quick_tasting_sessions TO authenticated;
GRANT SELECT ON quick_tasting_sessions TO anon;

-- Fix 8: Update stats trigger to be more accurate
-- ============================================================================
CREATE OR REPLACE FUNCTION update_quick_tasting_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
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

-- Recreate triggers with the updated function
DROP TRIGGER IF EXISTS trigger_update_quick_tasting_stats_delete ON quick_tasting_items;
DROP TRIGGER IF EXISTS trigger_update_quick_tasting_stats_insert ON quick_tasting_items;
DROP TRIGGER IF EXISTS trigger_update_quick_tasting_stats_update ON quick_tasting_items;

CREATE TRIGGER trigger_update_quick_tasting_stats_insert
    AFTER INSERT ON quick_tasting_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quick_tasting_stats();

CREATE TRIGGER trigger_update_quick_tasting_stats_update
    AFTER UPDATE ON quick_tasting_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quick_tasting_stats();

CREATE TRIGGER trigger_update_quick_tasting_stats_delete
    AFTER DELETE ON quick_tasting_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quick_tasting_stats();

-- Fix 9: Add foreign key relationship between quick_tastings and profiles
-- This enables the social feed widget to join with user profiles
-- ============================================================================
ALTER TABLE quick_tastings
ADD CONSTRAINT quick_tastings_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('flavor_descriptors', 'flavor_wheels')
ORDER BY tablename, policyname;

-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'flavor_descriptors',
    'flavor_wheels',
    'aroma_molecules',
    'tasting_likes',
    'tasting_comments'
  )
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All database fixes applied successfully!';
END $$;
