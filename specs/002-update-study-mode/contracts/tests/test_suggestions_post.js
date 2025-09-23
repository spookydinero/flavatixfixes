/**
 * Contract Test: POST /api/tastings/{tastingId}/suggestions
 *
 * Validates the contract for submitting item suggestions in Collaborative Study Mode.
 * This test MUST fail until the endpoint implementation is complete.
 */

describe('POST /api/tastings/{tastingId}/suggestions', () => {
  const testTastingId = '550e8400-e29b-41d4-a716-446655440000';
  const testParticipantId = '660e8400-e29b-41d4-a716-446655440001';

  test('should accept valid suggestion submission', async () => {
    const requestBody = {
      participant_id: testParticipantId,
      item_name: 'Cabernet Sauvignon 2018'
    };

    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    // This should fail until endpoint is implemented
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.participant_id).toBe(testParticipantId);
    expect(data.suggested_item_name).toBe('Cabernet Sauvignon 2018');
    expect(data.status).toBe('pending');
  });

  test('should reject suggestion without participant_id', async () => {
    const requestBody = {
      item_name: 'Test Item'
    };

    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(400);
  });

  test('should reject suggestion without item_name', async () => {
    const requestBody = {
      participant_id: testParticipantId
    };

    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(400);
  });

  test('should reject empty item_name', async () => {
    const requestBody = {
      participant_id: testParticipantId,
      item_name: ''
    };

    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(400);
  });

  test('should reject item_name that is too long', async () => {
    const requestBody = {
      participant_id: testParticipantId,
      item_name: 'A'.repeat(101) // Over 100 character limit
    };

    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(400);
  });

  test('should reject unauthorized participant', async () => {
    const requestBody = {
      participant_id: 'invalid-participant-id',
      item_name: 'Test Item'
    };

    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(403);
  });

  test('should reject for non-collaborative tasting', async () => {
    const nonCollaborativeTastingId = '770e8400-e29b-41d4-a716-446655440002';
    const requestBody = {
      participant_id: testParticipantId,
      item_name: 'Test Item'
    };

    const response = await fetch(`/api/tastings/${nonCollaborativeTastingId}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(404);
  });
});
