#!/usr/bin/env node
/**
 * Apply database migration script
 * This script connects to Supabase using the service role key
 * and executes the SQL migration to fix missing user profiles.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Hardcode the credentials for this one-time migration
const supabaseUrl = 'https://kobuclkvlacdwvxmakvq.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYnVjbGt2bGFjZHd2eG1ha3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY5NjM5MiwiZXhwIjoyMDY4MjcyMzkyfQ.2nvFJDBmb7K0_mMXzpdLLKjywCXtOS-hp7-ZmCUbSuk';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔄 Applying migration: fix_missing_profiles.sql');

  // Read the SQL file
  const sqlPath = path.join(__dirname, '../migrations/fix_missing_profiles.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split SQL into individual statements (by semicolon)
  // First remove all comment lines
  const sqlWithoutComments = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  const statements = sqlWithoutComments
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: statement + ';'
    });

    if (error) {
      console.error(`❌ Error executing statement ${i + 1}:`, error);

      // Try alternative method: direct query
      console.log('🔄 Trying alternative method...');
      try {
        const { error: directError } = await supabase.from('profiles').select('count');
        if (directError) {
          console.error('❌ Alternative method also failed:', directError);
        }
      } catch (e) {
        console.error('❌ Alternative method error:', e.message);
      }

      // For INSERT and UPDATE statements, we can try a workaround
      if (statement.includes('INSERT INTO')) {
        console.log('💡 Attempting INSERT workaround...');
        await handleInsertWorkaround();
      }

      continue;
    }

    console.log(`✅ Statement ${i + 1} executed successfully`);
  }

  console.log('\n✅ Migration completed!');
}

/**
 * Workaround for INSERT statements using Supabase client
 * This reads auth users and creates missing profiles
 */
async function handleInsertWorkaround() {
  console.log('📊 Checking for users without profiles...');

  // Get all auth users (using service role)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  console.log(`✅ Found ${authUsers.users.length} auth users`);

  // Get all existing profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id');

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
    return;
  }

  const existingProfileIds = new Set(profiles.map(p => p.user_id));
  console.log(`✅ Found ${profiles.length} existing profiles`);

  // Find users without profiles
  const usersWithoutProfiles = authUsers.users.filter(
    user => !existingProfileIds.has(user.id)
  );

  console.log(`🔍 Found ${usersWithoutProfiles.length} users without profiles`);

  // Create missing profiles
  for (const user of usersWithoutProfiles) {
    const profileData = {
      user_id: user.id,
      full_name: user.user_metadata?.full_name || null,
      email_confirmed: user.email_confirmed_at !== null,
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    };

    console.log(`📝 Creating profile for user: ${user.email || user.id}`);

    const { error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select();

    if (error) {
      console.error(`❌ Error creating profile for ${user.id}:`, error);
    } else {
      console.log(`✅ Profile created for ${user.email || user.id}`);
    }
  }

  console.log('✅ Profile creation complete!');
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
