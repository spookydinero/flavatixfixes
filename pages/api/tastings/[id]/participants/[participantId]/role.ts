import { NextApiRequest, NextApiResponse } from 'next';
import { roleService, ParticipantRole } from '@/lib/roleService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: tastingId, participantId } = req.query;

  if (!tastingId || typeof tastingId !== 'string') {
    return res.status(400).json({ error: 'Invalid tasting ID' });
  }

  if (!participantId || typeof participantId !== 'string') {
    return res.status(400).json({ error: 'Invalid participant ID' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user_id from request body (following existing API pattern)
  const { user_id, role } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  // Validate role
  const validRoles: ParticipantRole[] = ['host', 'participant', 'both'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      error: `role must be one of: ${validRoles.join(', ')}`
    });
  }

  try {
    const updatedParticipant = await roleService.updateParticipantRole(
      tastingId,
      participantId,
      role,
      user_id
    );

    return res.status(200).json({
      message: 'Participant role updated successfully',
      participant: updatedParticipant
    });
  } catch (error: any) {
    console.error('Error updating participant role:', error);

    // Handle specific error cases
    if (error.message.includes('does not have permission')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Only one host allowed')) {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({
      error: error.message || 'Failed to update participant role'
    });
  }
}


