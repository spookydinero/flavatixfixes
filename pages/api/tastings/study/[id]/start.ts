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

    // Verify user is host
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('id', id)
      .eq('host_id', user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Update session status to active
    const { error: updateError } = await supabase
      .from('study_sessions')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      console.error('Error starting session:', updateError);
      return res.status(500).json({ error: 'Failed to start session' });
    }

    res.status(200).json({ status: 'active', message: 'Session started successfully' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
