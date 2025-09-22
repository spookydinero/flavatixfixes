/**
 * Contract Tests for Tasting Creation API
 *
 * These tests validate the API contract for POST /api/tastings/create
 * Tests will fail until the implementation is complete.
 */

const { expect } = require('@jest/globals');

describe('POST /api/tastings/create', () => {
  test('should create Quick tasting session with required fields', async () => {
    const requestBody = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      mode: 'quick',
      tasting_type: 'beer',
      category: 'craft_beer'
    };

    // This test will fail until the endpoint is implemented
    const response = await fetch('/api/tastings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('tasting');
    expect(data.tasting.mode).toBe('quick');
    expect(data.tasting.tasting_type).toBe('beer');
  });

  test('should create Study tasting session with categories', async () => {
    const requestBody = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      mode: 'study',
      category: 'coffee_tasting',
      categories: [
        {
          category_name: 'Origin',
          parameter_type: 'exact_answer',
          is_required: true
        },
        {
          category_name: 'Roast Level',
          parameter_type: 'multiple_choice',
          options: ['Light', 'Medium', 'Dark'],
          is_required: true
        }
      ]
    };

    const response = await fetch('/api/tastings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('tasting');
    expect(data).toHaveProperty('categories');
    expect(data.categories).toHaveLength(2);
  });

  test('should create Competition tasting with items and answers', async () => {
    const requestBody = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      mode: 'competition',
      category: 'wine_tasting',
      rank_participants: true,
      ranking_type: 'overall_score',
      categories: [
        {
          category_name: 'Grape Variety',
          parameter_type: 'exact_answer',
          is_required: true
        }
      ],
      items: [
        {
          item_name: 'Cabernet Sauvignon 2018',
          correct_answers: {
            'category-1': 'Cabernet Sauvignon'
          }
        }
      ]
    };

    const response = await fetch('/api/tastings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('tasting');
    expect(data).toHaveProperty('categories');
    expect(data).toHaveProperty('items');
    expect(data.tasting.rank_participants).toBe(true);
  });

  test('should reject invalid mode', async () => {
    const requestBody = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      mode: 'invalid_mode',
      category: 'test'
    };

    const response = await fetch('/api/tastings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(400);
  });

  test('should reject competition mode without items', async () => {
    const requestBody = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      mode: 'competition',
      category: 'wine_tasting'
    };

    const response = await fetch('/api/tastings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(400);
  });

  test('should reject more than 10 categories', async () => {
    const categories = Array.from({ length: 11 }, (_, i) => ({
      category_name: `Category ${i + 1}`,
      parameter_type: 'subjective_input'
    }));

    const requestBody = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      mode: 'study',
      category: 'test',
      categories
    };

    const response = await fetch('/api/tastings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(response.status).toBe(400);
  });
});
