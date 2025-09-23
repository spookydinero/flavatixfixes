import { NextApiRequest, NextApiResponse } from 'next';
import { studyModeService } from '@/lib/studyModeService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: tastingId } = req.query;

  if (!tastingId || typeof tastingId !== 'string') {
    return res.status(400).json({ error: 'Invalid tasting ID' });
  }

  // Get user_id from request body (following existing API pattern)
  const userId = req.body?.user_id || req.query?.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetSuggestions(tastingId, userId, req, res);
      case 'POST':
        return await handlePostSuggestion(tastingId, userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

async function handleGetSuggestions(
  tastingId: string,
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { status } = req.query;

  try {
    const suggestions = await studyModeService.getSuggestions(
      tastingId,
      userId,
      status as 'pending' | 'approved' | 'rejected' | undefined
    );

    return res.status(200).json(suggestions);
  } catch (error: any) {
    console.error('Error getting suggestions:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get suggestions'
    });
  }
}

async function handlePostSuggestion(
  tastingId: string,
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { participant_id, item_name } = req.body;

  // Validate required fields
  if (!participant_id || !item_name) {
    return res.status(400).json({
      error: 'participant_id and item_name are required'
    });
  }

  // Validate item_name constraints
  if (typeof item_name !== 'string' || item_name.trim().length === 0) {
    return res.status(400).json({
      error: 'item_name must be a non-empty string'
    });
  }

  if (item_name.length > 100) {
    return res.status(400).json({
      error: 'item_name must be 100 characters or less'
    });
  }

  // Verify the participant_id belongs to the current user
  const supabase = getSupabaseClient();
  const { data: participant, error: participantError } = await supabase
    .from('tasting_participants')
    .select('user_id, tasting_id')
    .eq('id', participant_id)
    .eq('tasting_id', tastingId)
    .single();

  if (participantError || !participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  if (participant.user_id !== userId) {
    return res.status(403).json({
      error: 'You can only submit suggestions for yourself'
    });
  }

  try {
    const suggestion = await studyModeService.submitSuggestion(
      tastingId,
      participant_id,
      item_name.trim()
    );

    return res.status(201).json({
      message: 'Suggestion submitted successfully',
      suggestion
    });
  } catch (error: any) {
    console.error('Error submitting suggestion:', error);

    // Handle specific error cases
    if (error.message.includes('Suggestions only allowed')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('does not have permission')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({
      error: error.message || 'Failed to submit suggestion'
    });
  }
}
