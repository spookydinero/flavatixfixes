import { NextApiRequest, NextApiResponse } from 'next';
import { studyModeService } from '@/lib/studyModeService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: tastingId, suggestionId } = req.query;

  if (!tastingId || typeof tastingId !== 'string') {
    return res.status(400).json({ error: 'Invalid tasting ID' });
  }

  if (!suggestionId || typeof suggestionId !== 'string') {
    return res.status(400).json({ error: 'Invalid suggestion ID' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user_id from request body (following existing API pattern)
  const { user_id, moderator_id, action } = req.body;

  if (!user_id && !moderator_id) {
    return res.status(400).json({ error: 'user_id or moderator_id is required' });
  }

  // Use moderator_id if provided, otherwise use user_id
  const actingUserId = moderator_id || user_id;

  if (!actingUserId) {
    return res.status(400).json({ error: 'No valid user ID provided' });
  }

  // Validate action
  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      error: 'action must be either "approve" or "reject"'
    });
  }

  try {
    const updatedSuggestion = await studyModeService.moderateSuggestion(
      suggestionId,
      actingUserId,
      action,
      tastingId
    );

    return res.status(200).json({
      message: `Suggestion ${action}d successfully`,
      suggestion: updatedSuggestion
    });
  } catch (error: any) {
    console.error('Error moderating suggestion:', error);

    // Handle specific error cases
    if (error.message.includes('does not have permission')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found') || error.message.includes('already been moderated')) {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({
      error: error.message || 'Failed to moderate suggestion'
    });
  }
}

