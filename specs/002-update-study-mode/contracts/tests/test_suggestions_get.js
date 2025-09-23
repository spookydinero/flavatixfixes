/**
 * Contract Test: GET /api/tastings/{tastingId}/suggestions
 *
 * Validates the contract for retrieving item suggestions in Study Mode.
 * This test MUST fail until the endpoint implementation is complete.
 */

describe('GET /api/tastings/{tastingId}/suggestions', () => {
  const testTastingId = '550e8400-e29b-41d4-a716-446655440000';

  test('should return all suggestions for moderators', async () => {
    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`);

    // This should fail until endpoint is implemented
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const suggestion = data[0];
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('participant_id');
      expect(suggestion).toHaveProperty('suggested_item_name');
      expect(suggestion).toHaveProperty('status');
      expect(['pending', 'approved', 'rejected']).toContain(suggestion.status);
      expect(suggestion).toHaveProperty('created_at');
    }
  });

  test('should filter suggestions by status', async () => {
    const response = await fetch(`/api/tastings/${testTastingId}/suggestions?status=pending`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    data.forEach(suggestion => {
      expect(suggestion.status).toBe('pending');
    });
  });

  test('should return only user suggestions for non-moderators', async () => {
    // This would need authentication context in real implementation
    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    // In real implementation, this would be filtered to user's own suggestions
  });

  test('should reject unauthorized access', async () => {
    const unauthorizedTastingId = '880e8400-e29b-41d4-a716-446655440003';

    const response = await fetch(`/api/tastings/${unauthorizedTastingId}/suggestions`);

    expect(response.status).toBe(403);
  });

  test('should return empty array for tasting with no suggestions', async () => {
    const emptyTastingId = '990e8400-e29b-41d4-a716-446655440004';

    const response = await fetch(`/api/tastings/${emptyTastingId}/suggestions`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  test('should include participant details in response', async () => {
    const response = await fetch(`/api/tastings/${testTastingId}/suggestions`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const suggestion = data[0];
      expect(suggestion).toHaveProperty('participant');
      expect(suggestion.participant).toHaveProperty('full_name');
      expect(suggestion.participant).toHaveProperty('username');
    }
  });

  test('should handle invalid tasting ID', async () => {
    const response = await fetch('/api/tastings/invalid-id/suggestions');

    expect(response.status).toBe(404);
  });
});

