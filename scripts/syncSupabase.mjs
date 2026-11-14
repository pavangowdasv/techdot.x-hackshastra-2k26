import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env if present
const envPath = path.resolve(process.cwd(), '.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').replace(/^["']|["']$/g, '').trim();
    if (key === 'VITE_SUPABASE_URL' && !supabaseUrl) supabaseUrl = val;
    if (key === 'VITE_SUPABASE_ANON_KEY' && !supabaseKey) supabaseKey = val;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = val;
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  console.log('Please provide your Supabase URL and Key in .env or run with:');
  console.log('VITE_SUPABASE_URL="https://xxx.supabase.co" VITE_SUPABASE_ANON_KEY="eyJ..." node scripts/syncSupabase.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Connecting to Supabase project at:', supabaseUrl);
  const { data, error } = await supabase.from('civil_tickets').select('id').limit(1);
  if (error) {
    if (error.code === '42P01') {
      console.log('⚠️  Connected, but table "civil_tickets" does not exist yet.');
      console.log('👉 Please execute "supabase_schema.sql" in your Supabase SQL Editor first!');
      return false;
    }
    console.error('❌ Error testing connection:', error.message);
    return false;
  }
  console.log('✅ Successfully connected to Supabase "civil_tickets" table!');
  return true;
}

testConnection();

