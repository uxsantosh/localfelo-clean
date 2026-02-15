// =====================================================
// REALTIME TEST SCRIPT
// =====================================================
// Open your browser console and paste this script to test Realtime

// 1. Test if Supabase client exists
console.log('🔍 Testing Realtime connection...');
console.log('Supabase client:', window.supabase ? '✅ Found' : '❌ Not found');

// 2. Create a test subscription
if (window.supabase) {
  const testChannel = window.supabase
    .channel('realtime-test')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('🎉 REALTIME WORKING! Received:', payload);
      }
    )
    .subscribe((status, err) => {
      console.log(`📡 Subscription status: ${status}`);
      if (err) console.error('❌ Error:', err);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed!');
        console.log('💡 Now send a message and you should see it appear here');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error - RLS policies might be blocking');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Connection timed out - check your Supabase URL');
      }
    });

  console.log('📝 Test subscription created. Send a message to test!');
  
  // Cleanup function (run this after testing)
  window.cleanupRealtimeTest = () => {
    testChannel.unsubscribe();
    console.log('🧹 Cleaned up test subscription');
  };
  
  console.log('💡 To cleanup, run: cleanupRealtimeTest()');
} else {
  console.error('❌ Supabase client not found on window object');
  console.log('💡 Check if supabaseClient.ts exports the client to window');
}
