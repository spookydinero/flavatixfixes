const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  console.log('🔍 Checking database state...\n');

  // Check for tables
  const tables = [
    'quick_tastings',
    'quick_tasting_items',
    'flavor_descriptors',
    'flavor_wheels',
    'aroma_molecules',
    'tasting_likes',
    'tasting_comments',
    'tasting_shares',
    'user_follows',
    'profiles'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}': DOES NOT EXIST or NO ACCESS`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': EXISTS`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ERROR - ${err.message}`);
    }
  }

  // Check quick_tastings columns
  console.log('\n🔍 Checking quick_tastings columns...');
  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      console.log('Columns:', Object.keys(data).join(', '));
    }
  } catch (err) {
    console.log('Could not fetch columns');
  }

  // Check quick_tasting_items columns
  console.log('\n🔍 Checking quick_tasting_items columns...');
  try {
    const { data, error } = await supabase
      .from('quick_tasting_items')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      console.log('Columns:', Object.keys(data).join(', '));
    } else if (error && error.code === 'PGRST116') {
      console.log('Table exists but has no data');
    }
  } catch (err) {
    console.log('Could not fetch columns');
  }
}

checkDatabaseState().catch(console.error);
