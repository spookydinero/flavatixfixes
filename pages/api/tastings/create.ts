import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type TastingMode = 'study' | 'competition' | 'quick';

interface CreateTastingRequest {
  user_id: string;
  mode: TastingMode;
  category: string;
  session_name?: string;
  notes?: string;
  rank_participants?: boolean;
  ranking_type?: string;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
  items?: Array<{
    item_name: string;
    correct_answers?: Record<string, any>;
    include_in_ranking?: boolean;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      user_id,
      mode,
      category,
      session_name,
      notes,
      rank_participants = false,
      ranking_type,
      is_blind_participants = false,
      is_blind_items = false,
      is_blind_attributes = false,
      items = []
    }: CreateTastingRequest = req.body;

    // Validate required fields
    if (!user_id || !mode || !category) {
      return res.status(400).json({ error: 'Missing required fields: user_id, mode, category' });
    }

    // Validate mode
    if (!['study', 'competition', 'quick'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode. Must be study, competition, or quick' });
    }

    // Validate category
    const validCategories = ['coffee', 'tea', 'wine', 'spirits', 'beer', 'chocolate'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Competition mode requires items
    if (mode === 'competition' && items.length === 0) {
      return res.status(400).json({ error: 'Competition mode requires at least one item' });
    }

    // Study mode should not have preloaded items
    if (mode === 'study' && items.length > 0) {
      return res.status(400).json({ error: 'Study mode should not have preloaded items' });
    }

    // Create the tasting session
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .insert({
        user_id,
        category,
        session_name: session_name || `${category.charAt(0).toUpperCase() + category.slice(1)} ${mode === 'competition' ? 'Competition' : mode === 'study' ? 'Study' : 'Quick Tasting'}`,
        notes,
        mode,
        rank_participants,
        ranking_type: rank_participants ? ranking_type : null,
        is_blind_participants,
        is_blind_items,
        is_blind_attributes
      })
      .select()
      .single();

    if (tastingError) {
      console.error('Error creating tasting:', tastingError);
      return res.status(500).json({ error: 'Failed to create tasting session' });
    }

    let createdItems = [];

    // Add items for competition mode
    if (mode === 'competition' && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        tasting_id: tasting.id,
        item_name: item.item_name,
        correct_answers: item.correct_answers || null,
        include_in_ranking: item.include_in_ranking !== false // Default to true
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('quick_tasting_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('Error creating tasting items:', itemsError);
        // Clean up the tasting if items creation failed
        await supabase.from('quick_tastings').delete().eq('id', tasting.id);
        return res.status(500).json({ error: 'Failed to create tasting items' });
      }

      createdItems = insertedItems || [];
    }

    res.status(201).json({
      tasting,
      items: createdItems,
      message: 'Tasting session created successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

