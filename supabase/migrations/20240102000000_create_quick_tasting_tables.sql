-- Create quick_tastings table for session metadata
CREATE TABLE public.quick_tastings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('coffee', 'tea', 'wine', 'spirits', 'beer', 'chocolate')),
    session_name TEXT,
    notes TEXT,
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    average_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create quick_tasting_items table for individual tasting items
CREATE TABLE public.quick_tasting_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tasting_id UUID NOT NULL REFERENCES public.quick_tastings(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    notes TEXT,
    flavor_scores JSONB,
    overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 10),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_quick_tastings_user_id ON public.quick_tastings(user_id);
CREATE INDEX idx_quick_tastings_category ON public.quick_tastings(category);
CREATE INDEX idx_quick_tastings_created_at ON public.quick_tastings(created_at DESC);
CREATE INDEX idx_quick_tasting_items_tasting_id ON public.quick_tasting_items(tasting_id);
CREATE INDEX idx_quick_tasting_items_created_at ON public.quick_tasting_items(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.quick_tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_tasting_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quick_tastings
CREATE POLICY "Users can view their own quick tastings" ON public.quick_tastings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick tastings" ON public.quick_tastings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick tastings" ON public.quick_tastings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick tastings" ON public.quick_tastings
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quick_tasting_items
CREATE POLICY "Users can view their own quick tasting items" ON public.quick_tasting_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quick_tastings qt 
            WHERE qt.id = quick_tasting_items.tasting_id 
            AND qt.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own quick tasting items" ON public.quick_tasting_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quick_tastings qt 
            WHERE qt.id = quick_tasting_items.tasting_id 
            AND qt.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own quick tasting items" ON public.quick_tasting_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.quick_tastings qt 
            WHERE qt.id = quick_tasting_items.tasting_id 
            AND qt.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own quick tasting items" ON public.quick_tasting_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.quick_tastings qt 
            WHERE qt.id = quick_tasting_items.tasting_id 
            AND qt.user_id = auth.uid()
        )
    );

-- Function to update quick tasting statistics
CREATE OR REPLACE FUNCTION update_quick_tasting_stats()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Triggers for updating quick tasting statistics
CREATE TRIGGER trigger_update_quick_tasting_stats_insert
    AFTER INSERT ON public.quick_tasting_items
    FOR EACH ROW EXECUTE FUNCTION update_quick_tasting_stats();

CREATE TRIGGER trigger_update_quick_tasting_stats_update
    AFTER UPDATE ON public.quick_tasting_items
    FOR EACH ROW EXECUTE FUNCTION update_quick_tasting_stats();

CREATE TRIGGER trigger_update_quick_tasting_stats_delete
    AFTER DELETE ON public.quick_tasting_items
    FOR EACH ROW EXECUTE FUNCTION update_quick_tasting_stats();

-- Function to update profile tasting count
CREATE OR REPLACE FUNCTION update_profile_tasting_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's total tasting count in profiles
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
$$ LANGUAGE plpgsql;

-- Trigger for updating profile tasting count
CREATE TRIGGER trigger_update_profile_tasting_count
    AFTER INSERT OR DELETE ON public.quick_tastings
    FOR EACH ROW EXECUTE FUNCTION update_profile_tasting_count();

-- Add updated_at trigger for quick_tastings
CREATE TRIGGER set_updated_at_quick_tastings
    BEFORE UPDATE ON public.quick_tastings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add updated_at trigger for quick_tasting_items
CREATE TRIGGER set_updated_at_quick_tasting_items
    BEFORE UPDATE ON public.quick_tasting_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();