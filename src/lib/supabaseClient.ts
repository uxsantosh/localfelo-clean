// Supabase Client Configuration for OldCycle
import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { CapacitorStorageAdapter } from './capacitorStorage';

// Detect if running in Figma preview (fetch might be blocked)
const isFigmaPreview = typeof window !== 'undefined' && window.location.hostname.includes('figma');

// Environment configuration with fallback
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://drofnrntrbedtjtpseve.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

// Only log in non-preview environments
if (!isFigmaPreview) {
  const isNative = Capacitor.isNativePlatform();
  console.log('🔍 Supabase Configuration:');
  console.log('   URL:', supabaseUrl);
  console.log('   Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
  console.log('   Platform:', Capacitor.getPlatform());
  console.log('   Native Platform:', isNative);
  console.log('   Using Storage:', isNative ? '🔋 Capacitor Preferences' : '💾 localStorage');
}

// Validate credentials before creating client
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseAnonKey === 'your_anon_key') {
  console.error('❌ Supabase credentials missing or invalid!');
  console.error('Please add valid credentials to .env.local:');
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
  throw new Error('Supabase credentials are required');
}

// Helper function to get current client token
function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('oldcycle_token');
}

// Create Supabase client instance
// ✅ CRITICAL: Use Capacitor Preferences storage on native platforms
// This ensures session persistence works correctly on Android/iOS
// ✅ CRITICAL: Include x-client-token header for LocalFelo RLS policies
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // MUST be true for OAuth to work
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Use Capacitor storage on native platforms, localStorage on web
    storage: Capacitor.isNativePlatform() ? CapacitorStorageAdapter : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'oldcycle-web',
    },
    // Dynamically add client token to EVERY request
    fetch: async (url, options = {}) => {
      const clientToken = getClientToken();
      const headers = new Headers(options.headers);
      
      // Add client token header if available
      if (clientToken) {
        headers.set('x-client-token', clientToken);
      }
      
      return fetch(url, {
        ...options,
        headers,
      });
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
  console.log('🔐 Client token authentication enabled for RLS policies');
  console.log('✅ Supabase client ready. Connection will be established on first query.');
}