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
    const { sessionId, displayName } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get user from token if provided
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Check if session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'finished') {
      return res.status(400).json({ error: 'This session has ended' });
    }

    // Check if participant already exists
    if (userId) {
      const { data: existing } = await supabase
        .from('study_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return res.status(200).json({ participantId: existing.id, message: 'Already joined' });
      }
    }

    // Create participant
    const { data: participant, error: participantError } = await supabase
      .from('study_participants')
      .insert({
        session_id: sessionId,
        user_id: userId,
        display_name: displayName || 'Anonymous',
        role: 'participant'
      })
      .select()
      .single();

    if (participantError) {
      console.error('Error creating participant:', participantError);
      return res.status(500).json({ error: 'Failed to join session' });
    }

    res.status(200).json({ participantId: participant.id });

  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
