import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CategoryInput {
  name: string;
  hasText: boolean;
  hasScale: boolean;
  hasBoolean: boolean;
  scaleMax?: number;
  rankInSummary: boolean;
}

interface CreateStudySessionRequest {
  name: string;
  baseCategory: string;
  categories: CategoryInput[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { name, baseCategory, categories }: CreateStudySessionRequest = req.body;

    // Validation
    if (!name || !baseCategory || !categories || categories.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (name.length < 1 || name.length > 120) {
      return res.status(400).json({ error: 'Name must be between 1 and 120 characters' });
    }

    if (categories.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 categories allowed' });
    }

    // Validate each category
    for (const category of categories) {
      if (!category.name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      if (!category.hasText && !category.hasScale && !category.hasBoolean) {
        return res.status(400).json({ error: 'Each category must have at least one parameter type' });
      }
      if (category.hasScale) {
        const scaleMax = category.scaleMax || 100;
        if (scaleMax < 5 || scaleMax > 100) {
          return res.status(400).json({ error: 'Scale max must be between 5 and 100' });
        }
      }
    }

    // Generate unique session code
    const sessionCode = nanoid(8).toUpperCase();

    // Create study session
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        name,
        base_category: baseCategory,
        host_id: user.id,
        status: 'draft',
        session_code: sessionCode
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating study session:', sessionError);
      return res.status(500).json({ error: 'Failed to create study session' });
    }

    // Create categories
    const categoriesData = categories.map((cat, index) => ({
      session_id: session.id,
      name: cat.name,
      has_text: cat.hasText,
      has_scale: cat.hasScale,
      has_boolean: cat.hasBoolean,
      scale_max: cat.hasScale ? (cat.scaleMax || 100) : null,
      rank_in_summary: cat.rankInSummary,
      sort_order: index
    }));

    const { error: categoriesError } = await supabase
      .from('study_categories')
      .insert(categoriesData);

    if (categoriesError) {
      console.error('Error creating categories:', categoriesError);
      // Rollback: delete the session
      await supabase.from('study_sessions').delete().eq('id', session.id);
      return res.status(500).json({ error: 'Failed to create categories' });
    }

    // Create host as a participant
    const { error: participantError } = await supabase
      .from('study_participants')
      .insert({
        session_id: session.id,
        user_id: user.id,
        role: 'host'
      });

    if (participantError) {
      console.error('Error creating host participant:', participantError);
      // Continue anyway - this is not critical
    }

    res.status(201).json({
      sessionId: session.id,
      sessionCode: sessionCode,
      session
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
