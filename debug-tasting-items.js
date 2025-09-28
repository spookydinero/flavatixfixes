// Debug script to check tasting items in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kobuclkvlacdwvxmakvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYnVjbGt2bGFjZHd2eG1ha3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTYzOTIsImV4cCI6MjA2ODI3MjM5Mn0.wOq-3WWMLJyq9gKDoifb-7CqXb7kQx5hGcnv3MBCbPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTastingSession(tastingId) {
  console.log(`🔍 Debugging tasting session: ${tastingId}`);

  try {
    // Check the tasting session
    const { data: session, error: sessionError } = await supabase
      .from('quick_tastings')
      .select('*')
      .eq('id', tastingId)
      .single();

    if (sessionError) {
      console.error('❌ Error fetching session:', sessionError);
      return;
    }

    console.log('📋 Session data:', session);

    // Check items for this session
    const { data: items, error: itemsError } = await supabase
      .from('quick_tasting_items')
      .select('*')
      .eq('tasting_id', tastingId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('❌ Error fetching items:', itemsError);
      return;
    }

    console.log(`📝 Found ${items.length} items:`);
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.item_name}`);
      console.log(`     - ID: ${item.id}`);
      console.log(`     - Score: ${item.overall_score}`);
      console.log(`     - Notes: ${item.notes ? item.notes.substring(0, 50) + '...' : 'None'}`);
      console.log(`     - Aroma: ${item.aroma ? item.aroma.substring(0, 50) + '...' : 'None'}`);
      console.log(`     - Flavor: ${item.flavor ? item.flavor.substring(0, 50) + '...' : 'None'}`);
      console.log('');
    });

    // Check completed items
    const completedItems = items.filter(item => item.overall_score !== null && item.overall_score !== undefined);
    console.log(`✅ Completed items: ${completedItems.length}/${items.length}`);

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Usage: node debug-tasting-items.js <tasting_id>
const tastingId = process.argv[2];
if (!tastingId) {
  console.log('Usage: node debug-tasting-items.js <tasting_id>');
  console.log('Example: node debug-tasting-items.js 123e4567-e89b-12d3-a456-426614174000');
  process.exit(1);
}

debugTastingSession(tastingId);
