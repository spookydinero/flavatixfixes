const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyDatabaseFixes() {
  console.log('🔧 Applying database fixes...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'apply-all-fixes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split into individual statements (simple split on ';')
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^DO \$\$/));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      // Get first few words for logging
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ');

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          // Try direct execution via postgrest
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok) {
            console.log(`⚠️  Statement ${i + 1}: ${preview}...`);
            console.log(`   Note: May require manual execution\n`);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1}: ${preview}...`);
            successCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1}: ${preview}...`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1}: ${preview}...`);
        console.log(`   Error: ${err.message}\n`);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Skipped/Manual: ${errorCount}`);
    console.log(`\n💡 Note: Some statements may need to be run manually via Supabase SQL editor`);
    console.log(`   Run the SQL file: scripts/apply-all-fixes.sql\n`);

  } catch (error) {
    console.error('❌ Error applying fixes:', error.message);
    console.log('\n💡 Please run the SQL file manually via Supabase SQL editor:');
    console.log('   File: scripts/apply-all-fixes.sql\n');
    process.exit(1);
  }
}

applyDatabaseFixes().catch(console.error);
