import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const view = (req.query.view as string) || 'all';

    // Verify user has access
    const { data: participant, error: participantError } = await supabase
      .from('study_participants')
      .select('id, role')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return res.status(403).json({ error: 'Not authorized to view this session' });
    }

    // Get categories that should be ranked
    const { data: categories } = await supabase
      .from('study_categories')
      .select('*')
      .eq('session_id', id)
      .eq('rank_in_summary', true)
      .eq('has_scale', true);

    // Get items
    const { data: items } = await supabase
      .from('study_items')
      .select('*')
      .eq('session_id', id)
      .order('sort_order');

    // Calculate rankings
    const ranking = [];

    if (items && categories) {
      for (const item of items) {
        for (const category of categories) {
          // Get all scale responses for this item and category
          const { data: responses } = await supabase
            .from('study_responses')
            .select('scale_value')
            .eq('session_id', id)
            .eq('item_id', item.id)
            .eq('category_id', category.id)
            .not('scale_value', 'is', null);

          if (responses && responses.length > 0) {
            const scores = responses.map(r => r.scale_value);
            const avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;

            ranking.push({
              itemId: item.id,
              itemLabel: item.label,
              categoryId: category.id,
              categoryName: category.name,
              score: Math.round(avgScore * 10) / 10,
              responseCount: scores.length
            });
          }
        }
      }
    }

    // Sort by score descending
    ranking.sort((a, b) => b.score - a.score);

    // Get AI insights if view=me
    let aiInsights = [];
    if (view === 'me') {
      const { data: insights } = await supabase
        .from('study_ai_cache')
        .select('*')
        .eq('session_id', id)
        .eq('participant_id', participant.id);

      aiInsights = insights || [];
    }

    res.status(200).json({
      ranking,
      aiInsights,
      items,
      categories
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
