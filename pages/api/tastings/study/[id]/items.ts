import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: items, error } = await supabase
        .from('study_items')
        .select('*')
        .eq('session_id', id)
        .order('sort_order');

      if (error) {
        console.error('Error fetching items:', error);
        return res.status(500).json({ error: 'Failed to fetch items' });
      }

      res.status(200).json({ items });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
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

      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      // Verify user is host
      const { data: session, error: sessionError } = await supabase
        .from('study_sessions')
        .select('host_id')
        .eq('id', id)
        .single();

      if (sessionError || !session || session.host_id !== user.id) {
        return res.status(403).json({ error: 'Only the host can add items' });
      }

      // Prepare items for insertion
      const itemsData = items.map((item: any, index: number) => ({
        session_id: id,
        label: item.label,
        sort_order: item.sortOrder ?? index,
        created_by: user.id
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from('study_items')
        .insert(itemsData)
        .select();

      if (itemsError) {
        console.error('Error creating items:', itemsError);
        return res.status(500).json({ error: 'Failed to create items' });
      }

      res.status(201).json({ items: createdItems });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
