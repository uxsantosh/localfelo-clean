// =====================================================
// GOOGLE AUTHENTICATION SERVICE - Simple & Clean
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

export interface GoogleAuthResult {
  user: User;
  clientToken: string;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateToken(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function saveToLocalStorage(user: User, token: string): void {
  localStorage.setItem('oldcycle_user', JSON.stringify(user));
  localStorage.setItem('oldcycle_token', token);
}

// =====================================================
// STEP 1: START GOOGLE SIGN-IN
// =====================================================

export async function startGoogleSignIn(): Promise<void> {
  console.log('🚀 Starting Google Sign-In...');
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://oldcycle.hueandhype.com',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('❌ Google Sign-In Error:', error);
    throw error;
  }
}

// =====================================================
// STEP 2: CHECK FOR GOOGLE SESSION AFTER REDIRECT
// =====================================================

export async function checkGoogleSession(): Promise<{ user: any; session: any } | null> {
  console.log('🔍 Checking for Google session...');
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('❌ Session Error:', error);
    return null;
  }

  if (session?.user) {
    console.log('✅ Google session found:', session.user.email);
    return { user: session.user, session };
  }

  console.log('❌ No Google session found');
  return null;
}

// =====================================================
// STEP 3: CHECK IF USER EXISTS IN DATABASE
// =====================================================

export async function checkUserExists(email: string): Promise<boolean> {
  console.log('🔍 Checking if user exists:', email);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('❌ Database error:', error);
      return false;
    }

    const exists = !!data;
    console.log(exists ? '✅ User exists' : '❌ New user');
    return exists;
  } catch (err) {
    console.error('❌ Error checking user:', err);
    return false;
  }
}

// =====================================================
// STEP 4A: LOGIN EXISTING USER
// =====================================================

export async function loginExistingUser(email: string, authUserId: string): Promise<GoogleAuthResult> {
  console.log('🔐 Logging in existing user:', email);
  
  const clientToken = generateToken();

  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !profile) {
    throw new Error('Profile not found');
  }

  // Update tokens
  await supabase
    .from('profiles')
    .update({
      client_token: clientToken,
      auth_user_id: authUserId,
    })
    .eq('id', profile.id);

  const user: User = {
    id: profile.id,
    name: profile.name,
    phone: profile.phone || '',
    email: profile.email,
    whatsappSame: profile.whatsapp_same || false,
    authUserId: authUserId,
    clientToken: clientToken,
  };

  saveToLocalStorage(user, clientToken);

  console.log('✅ User logged in successfully');
  return { user, clientToken };
}

// =====================================================
// STEP 4B: REGISTER NEW USER
// =====================================================

export async function registerNewUser(
  name: string,
  email: string,
  authUserId: string
): Promise<GoogleAuthResult> {
  console.log('📝 Registering new user:', email);
  
  const clientToken = generateToken();

  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      name,
      email,
      phone: '', // Empty initially - user can add later
      whatsapp_same: false,
      client_token: clientToken,
      auth_user_id: authUserId,
    })
    .select()
    .single();

  if (error || !newProfile) {
    console.error('❌ Error creating profile:', error);
    throw error || new Error('Failed to create profile');
  }

  const user: User = {
    id: newProfile.id,
    name: name,
    phone: '',
    email: email,
    whatsappSame: false,
    authUserId: authUserId,
    clientToken: clientToken,
  };

  saveToLocalStorage(user, clientToken);

  console.log('✅ User registered successfully');
  return { user, clientToken };
}

// =====================================================
// COMPLETE FLOW: HANDLE GOOGLE AUTH CALLBACK
// =====================================================

export async function handleGoogleAuthCallback(): Promise<GoogleAuthResult | null> {
  console.log('🔄 Processing Google Auth callback...');

  // Check if we have OAuth parameters in URL
  const hasHashParams = window.location.hash.includes('access_token');
  const hasCodeParam = window.location.search.includes('code=');

  if (!hasHashParams && !hasCodeParam) {
    console.log('❌ No OAuth parameters found');
    return null;
  }

  console.log('✅ OAuth params detected:', hasHashParams ? 'hash' : 'code');

  // CRITICAL: For hash params (implicit flow), manually set the session
  if (hasHashParams) {
    console.log('🔑 Extracting tokens from hash...');
    const params = new URLSearchParams(window.location.hash.substring(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      console.log('🔄 Setting session with tokens...');
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('❌ setSession error:', error);
        throw error;
      }

      console.log('✅ Session created from hash!');
    }
  }

  // For code param (PKCE flow), wait for Supabase to exchange it
  if (hasCodeParam) {
    console.log('⏳ Waiting for PKCE exchange...');
    // Wait up to 5 seconds for session to be created
    let attempts = 0;
    while (attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ PKCE session found!');
        break;
      }
      attempts++;
    }
  }

  // Now get the session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('❌ Session Error:', error);
    throw error;
  }

  if (!session?.user) {
    console.error('❌ No session found after OAuth redirect');
    throw new Error('No session found after OAuth redirect');
  }

  const googleUser = session.user;
  const email = googleUser.email;
  const name = googleUser.user_metadata?.full_name || googleUser.email?.split('@')[0] || 'User';
  const authUserId = googleUser.id;

  console.log('✅ Google user:', email);

  if (!email) {
    throw new Error('No email in Google account');
  }

  // Check if user exists
  const exists = await checkUserExists(email);

  let authResult: GoogleAuthResult;

  if (exists) {
    // Login existing user
    authResult = await loginExistingUser(email, authUserId);
  } else {
    // Register new user
    authResult = await registerNewUser(name, email, authUserId);
  }

  // Clean URL
  window.history.replaceState({}, document.title, window.location.pathname);

  return authResult;
}