// Supabase Client Configuration for OldCycle
import { createClient } from '@supabase/supabase-js';

// Detect if running in Figma preview (fetch might be blocked)
const isFigmaPreview = typeof window !== 'undefined' && window.location.hostname.includes('figma');

// Environment configuration with fallback
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://drofnrntrbedtjtpseve.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

// Only log in non-preview environments
if (!isFigmaPreview) {
  console.log('🔍 Supabase Configuration:');
  console.log('   URL:', supabaseUrl);
  console.log('   Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
}

// Validate credentials before creating client
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseAnonKey === 'your_anon_key') {
  console.error('❌ Supabase credentials missing or invalid!');
  console.error('Please add valid credentials to .env.local:');
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
  throw new Error('Supabase credentials are required');
}

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // MUST be true for OAuth to work
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'oldcycle-web',
    },
  },
  // Add realtime config to reduce connection issues
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export flag for services to check
export const IS_OFFLINE_MODE = isFigmaPreview;

// Log when client is initialized
if (!isFigmaPreview) {
  console.log('🔧 Supabase client initialized with PKCE flow (auto-refresh ON)');
  console.log('✅ Supabase client ready. Connection will be established on first query.');
}