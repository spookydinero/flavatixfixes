-- Study Mode Database Schema Migration
-- Creates the 6 tables needed for Study Mode functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. study_sessions - Main session tracking with unique session codes
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    base_category VARCHAR(100) NOT NULL,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    session_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. study_categories - Flexible category definitions (text/scale/boolean)
CREATE TABLE IF NOT EXISTS public.study_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    has_text BOOLEAN DEFAULT FALSE,
    has_scale BOOLEAN DEFAULT FALSE,
    has_boolean BOOLEAN DEFAULT FALSE,
    scale_max INTEGER,
    rank_in_summary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_scale_max CHECK (
        (has_scale = FALSE AND scale_max IS NULL) OR
        (has_scale = TRUE AND scale_max >= 5 AND scale_max <= 100)
    ),
    CONSTRAINT at_least_one_param CHECK (has_text OR has_scale OR has_boolean)
);

-- 3. study_participants - Host and participant management
CREATE TABLE IF NOT EXISTS public.study_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('host', 'participant')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- 4. study_items - Items being tasted
CREATE TABLE IF NOT EXISTS public.study_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    photo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. study_responses - All participant responses
CREATE TABLE IF NOT EXISTS public.study_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.study_participants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.study_items(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.study_categories(id) ON DELETE CASCADE,
    text_response TEXT,
    scale_response INTEGER,
    boolean_response BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_scale_response CHECK (
        (scale_response IS NULL) OR
        (scale_response >= 1 AND scale_response <= 100)
    ),
    UNIQUE(session_id, participant_id, item_id, category_id)
);

-- 6. study_ai_cache - AI descriptor extraction cache
CREATE TABLE IF NOT EXISTS public.study_ai_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.study_items(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.study_categories(id) ON DELETE CASCADE,
    descriptor_type VARCHAR(50) NOT NULL, -- 'aroma', 'flavor', 'defect', etc.
    descriptors JSONB DEFAULT '[]'::jsonb,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    UNIQUE(session_id, item_id, category_id, descriptor_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_host_id ON public.study_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_session_code ON public.study_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_study_sessions_status ON public.study_sessions(status);

CREATE INDEX IF NOT EXISTS idx_study_categories_session_id ON public.study_categories(session_id);
CREATE INDEX IF NOT EXISTS idx_study_categories_sort_order ON public.study_categories(session_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_study_participants_session_id ON public.study_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_study_participants_user_id ON public.study_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_study_items_session_id ON public.study_items(session_id);

CREATE INDEX IF NOT EXISTS idx_study_responses_session_item ON public.study_responses(session_id, item_id);
CREATE INDEX IF NOT EXISTS idx_study_responses_participant ON public.study_responses(participant_id);

CREATE INDEX IF NOT EXISTS idx_study_ai_cache_session ON public.study_ai_cache(session_id);
CREATE INDEX IF NOT EXISTS idx_study_ai_cache_expires ON public.study_ai_cache(expires_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON public.study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_categories_updated_at
    BEFORE UPDATE ON public.study_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_items_updated_at
    BEFORE UPDATE ON public.study_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_responses_updated_at
    BEFORE UPDATE ON public.study_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- study_sessions policies
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions they host or participate in"
    ON public.study_sessions FOR SELECT
    USING (
        host_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.study_participants sp
            WHERE sp.session_id = study_sessions.id AND sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own sessions"
    ON public.study_sessions FOR INSERT
    WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their sessions"
    ON public.study_sessions FOR UPDATE
    USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their sessions"
    ON public.study_sessions FOR DELETE
    USING (host_id = auth.uid());

-- study_categories policies
ALTER TABLE public.study_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories for sessions they can access"
    ON public.study_categories FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_categories.session_id AND (
                ss.host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.study_participants sp
                    WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Hosts can manage categories for their sessions"
    ON public.study_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_categories.session_id AND ss.host_id = auth.uid()
        )
    );

-- study_participants policies
ALTER TABLE public.study_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in sessions they can access"
    ON public.study_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_participants.session_id AND (
                ss.host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.study_participants sp
                    WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can join sessions"
    ON public.study_participants FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave sessions"
    ON public.study_participants FOR DELETE
    USING (user_id = auth.uid());

-- study_items policies
ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in sessions they can access"
    ON public.study_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_items.session_id AND (
                ss.host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.study_participants sp
                    WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Hosts can manage items in their sessions"
    ON public.study_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_items.session_id AND ss.host_id = auth.uid()
        )
    );

-- study_responses policies
ALTER TABLE public.study_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses in sessions they can access"
    ON public.study_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_responses.session_id AND (
                ss.host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.study_participants sp
                    WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage their own responses"
    ON public.study_responses FOR ALL
    USING (
        participant_id IN (
            SELECT id FROM public.study_participants
            WHERE user_id = auth.uid()
        )
    );

-- study_ai_cache policies
ALTER TABLE public.study_ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI cache for sessions they can access"
    ON public.study_ai_cache FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_ai_cache.session_id AND (
                ss.host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.study_participants sp
                    WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Service role can manage AI cache"
    ON public.study_ai_cache FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_categories TO authenticated;
GRANT ALL ON public.study_participants TO authenticated;
GRANT ALL ON public.study_items TO authenticated;
GRANT ALL ON public.study_responses TO authenticated;
GRANT ALL ON public.study_ai_cache TO authenticated;

GRANT ALL ON public.study_sessions TO service_role;
GRANT ALL ON public.study_categories TO service_role;
GRANT ALL ON public.study_participants TO service_role;
GRANT ALL ON public.study_items TO service_role;
GRANT ALL ON public.study_responses TO service_role;
GRANT ALL ON public.study_ai_cache TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Study Mode database schema created successfully!';
  RAISE NOTICE '📋 Created tables: study_sessions, study_categories, study_participants, study_items, study_responses, study_ai_cache';
  RAISE NOTICE '🔒 RLS policies configured for all tables';
  RAISE NOTICE '📊 Indexes created for optimal performance';
END $$;
