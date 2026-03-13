🔔 [App] Unread count fetched: 0
(async function debugPushNotifications() {
  console.log('🔍 ===== PUSH NOTIFICATION DEBUG REPORT =====\n');
  
  // Check 1: LocalStorage tokens
  console.log('1️⃣ CHECKING LOCALSTORAGE...');
  const userId = localStorage.getItem('userId');
  const clientToken = localStorage.getItem('clientToken');
  
  if (!userId) {
    console.log('❌ PROBLEM FOUND: No userId in localStorage');
    console.log('➡️ User registration failed or data not saved');
    return;
  }
  console.log('✅ userId in localStorage:', userId);
  
  if (!clientToken) {
    console.log('❌ PROBLEM FOUND: No clientToken in localStorage');
    console.log('➡️ User registration failed');
    return;
  }
  console.log('✅ clientToken in localStorage: Present\n');
  
  // Check 2: Supabase session
  console.log('2️⃣ CHECKING SUPABASE SESSION...');
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.7');
  const supabase = createClient(
    'https://ypccxlltvlthihjcxdgz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY2N4bGx0dmx0aGloamN4ZGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MjI4MjAsImV4cCI6MjA1MTM5ODgyMH0.gxLcSY3yu8vTfcGQFF2qo7lD_YQf5tCfz8JBsF6KJB4'
  );
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (!session) {
    console.log('❌ PROBLEM FOUND: No Supabase session');
    console.log('➡️ This is why tokens are not saving!');
    console.log('➡️ The app uses localStorage but Supabase needs a real session\n');
    
    console.log('🔧 SOLUTION:');
    console.log('We need to create a Supabase session after registration');
    console.log('using supabase.auth.setSession() with the clientToken\n');
    return;
  }
  
  console.log('✅ Supabase session EXISTS');
  console.log('   User ID from session:', session.user.id);
  console.log('   Expires at:', new Date(session.expires_at * 1000).toLocaleString(), '\n');
  
  // Check 3: Device tokens in database
  console.log('3️⃣ CHECKING DATABASE...');
  const { data: tokens, error: dbError } = await supabase
    .from('device_tokens')
    .select('*')
    .eq('user_id', userId);
  
  if (dbError) {
    console.log('❌ DATABASE ERROR:', dbError.message);
    console.log('➡️ RLS policy or permission issue\n');
    return;
  }
  
  if (!tokens || tokens.length === 0) {
    console.log('❌ PROBLEM FOUND: No tokens in database');
    console.log('➡️ Token registration never happened or failed\n');
    
    console.log('🔧 NEXT STEP:');
    console.log('Check if push notification permission was granted');
    console.log('Check if FCM token was received\n');
    return;
  }
  
  console.log('✅ TOKENS FOUND IN DATABASE:', tokens.length);
  tokens.forEach((token, i) => {
    console.log(`\n   Token ${i + 1}:`);
    console.log('   - Platform:', token.platform);
    console.log('   - Enabled:', token.is_enabled);
    console.log('   - Created:', new Date(token.created_at).toLocaleString());
    console.log('   - Token:', token.device_token.substring(0, 20) + '...');
  });
  
  console.log('\n🎉 ===== SUCCESS! EVERYTHING IS WORKING! =====');
  console.log('Push notifications are properly configured!\n');
  
})().catch(err => {
  console.log('❌ SCRIPT ERROR:', err.message);
  console.log('Full error:', err);
});

VM13852:2 🔍 ===== PUSH NOTIFICATION DEBUG REPORT =====

VM13852:5 1️⃣ CHECKING LOCALSTORAGE...
VM13852:10 ❌ PROBLEM FOUND: No userId in localStorage
VM13852:11 ➡️ User registration failed or data not saved
Promise {<fulfilled>: undefined}
index-D83RvDZy.js:244 🔄 [App] Polling unread count (fallback)...
index-D83RvDZy.js:244 🔔 [App] Fetching unread count...
index-D83RvDZy.js:10 🔍 [CapacitorStorage] GET: sb-drofnrntrbedtjtpseve-auth-token
VM572:368 native Preferences.get (#33289056)
VM572:342 result Preferences.get (#33289056)
index-D83RvDZy.js:10 ❌ [CapacitorStorage] GET Result: sb-drofnrntrbedtjtpseve-auth-token → Not found
index-D83RvDZy.js:244 🔔 [App] Unread count fetched: 0
index-D83RvDZy.js:244 🔄 [App] Polling unread count (fallback)...
index-D83RvDZy.js:244 🔔 [App] Fetching unread count...
index-D83RvDZy.js:10 🔍 [CapacitorStorage] GET: sb-drofnrntrbedtjtpseve-auth-token
VM572:368 native Preferences.get (#33289057)
VM572:342 result Preferences.get (#33289057)
index-D83RvDZy.js:10 ❌ [CapacitorStorage] GET Result: sb-drofnrntrbedtjtpseve-auth-token → Not found
index-D83RvDZy.js:244 🔔 [App] Unread count fetched: 0
index-D83RvDZy.js:109 📋 [TaskService] Getting active tasks for user: d7f66c14-94af-41f4-8317-b6422c96a5ab
index-D83R