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
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Session code is required' });
    }

    const { data: session, error } = await supabase
      .from('study_sessions')
      .select('id, name, status')
      .eq('session_code', code.toUpperCase())
      .single();

    if (error || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'finished') {
      return res.status(400).json({ error: 'This session has ended' });
    }

    res.status(200).json({
      sessionId: session.id,
      sessionName: session.name,
      requiresAuth: false
    });

  } catch (error) {
    console.error('Error resolving code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
