import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { id } = req.query;
    const { itemId, responses } = req.body;

    if (!itemId || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Item ID and responses array are required' });
    }

    // Get participant ID for this user in this session
    const { data: participant, error: participantError } = await supabase
      .from('study_participants')
      .select('id')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return res.status(403).json({ error: 'Not a participant in this session' });
    }

    // Prepare responses for insertion
    const responsesData = responses.map((r: any) => ({
      session_id: id,
      item_id: itemId,
      participant_id: participant.id,
      category_id: r.categoryId,
      text_value: r.textValue || null,
      scale_value: r.scaleValue ?? null,
      bool_value: r.boolValue ?? null
    }));

    const { error: responsesError } = await supabase
      .from('study_responses')
      .insert(responsesData);

    if (responsesError) {
      console.error('Error saving responses:', responsesError);
      return res.status(500).json({ error: 'Failed to save responses' });
    }

    // Update participant progress
    const { data: totalItems } = await supabase
      .from('study_items')
      .select('id', { count: 'exact' })
      .eq('session_id', id);

    const { data: completedItems } = await supabase
      .from('study_responses')
      .select('item_id', { count: 'exact', head: true })
      .eq('session_id', id)
      .eq('participant_id', participant.id);

    const progress = totalItems ? (completedItems || 0) : 0;

    await supabase
      .from('study_participants')
      .update({ progress })
      .eq('id', participant.id);

    res.status(200).json({ saved: true, progress });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
