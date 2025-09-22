-- FlavorWheel Upgrade Migration: Study vs Competition Mode Implementation
-- Run this against your PostgreSQL database

-- Step 1: Add new columns to quick_tastings table
ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'study' CHECK (mode IN ('study', 'competition', 'quick'));

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS rank_participants BOOLEAN DEFAULT false;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS ranking_type TEXT NULL;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS is_blind_participants BOOLEAN DEFAULT false;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS is_blind_items BOOLEAN DEFAULT false;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS is_blind_attributes BOOLEAN DEFAULT false;

-- Step 2: Add new columns to quick_tasting_items table
ALTER TABLE quick_tasting_items
ADD COLUMN IF NOT EXISTS correct_answers JSONB NULL;

ALTER TABLE quick_tasting_items
ADD COLUMN IF NOT EXISTS include_in_ranking BOOLEAN DEFAULT false;

-- Step 3: Create tasting_participants table
CREATE TABLE IF NOT EXISTS tasting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tasting_id UUID NOT NULL REFERENCES quick_tastings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NULL,
    rank INTEGER NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tasting_id, user_id)
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasting_participants_tasting_id ON tasting_participants(tasting_id);
CREATE INDEX IF NOT EXISTS idx_tasting_participants_user_id ON tasting_participants(user_id);

-- Step 5: Enable RLS on new table
ALTER TABLE tasting_participants ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for tasting_participants
CREATE POLICY "Users can view participants of tastings they can access" ON tasting_participants FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert participants for tastings they own" ON tasting_participants FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update participants for tastings they own" ON tasting_participants FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete participants for tastings they own" ON tasting_participants FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

-- Step 7: Grant permissions
GRANT ALL ON TABLE tasting_participants TO anon;
GRANT ALL ON TABLE tasting_participants TO authenticated;
GRANT ALL ON TABLE tasting_participants TO service_role;

