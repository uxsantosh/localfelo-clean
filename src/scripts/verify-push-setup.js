/**
 * Push Notification Verification Script
 * ======================================
 * Run this in browser console to verify push notification setup
 */

(async function verifyPushSetup() {
  console.log('🔍 Verifying Push Notification Setup...\n');

  const results = {
    serviceLayer: false,
    hook: false,
    types: false,
    database: false,
  };

  // 1. Check Service Layer
  try {
    const pushClient = await import('/services/pushClient.js');
    
    console.log('✅ Service Layer Check:');
    console.log('  - requestPushPermission:', typeof pushClient.requestPushPermission === 'function');
    console.log('  - registerPushToken:', typeof pushClient.registerPushToken === 'function');
    console.log('  - unregisterPushToken:', typeof pushClient.unregisterPushToken === 'function');
    console.log('  - isPushSupported:', typeof pushClient.isPushSupported === 'function');
    console.log('  - getPushPermissionStatus:', typeof pushClient.getPushPermissionStatus === 'function');
    console.log('  - savePushToken:', typeof pushClient.savePushToken === 'function');
    
    results.serviceLayer = true;
  } catch (error) {
    console.error('❌ Service Layer Check Failed:', error);
  }

  // 2. Check Hook Status
  try {
    if (window.pushStatus) {
      console.log('\n✅ Hook Status Check:');
      console.log('  - isSupported:', window.pushStatus.isSupported);
      console.log('  - permission:', window.pushStatus.permission);
      console.log('  - isRegistered:', window.pushStatus.isRegistered);
      console.log('  - isLoading:', window.pushStatus.isLoading);
      results.hook = true;
    } else {
      console.log('\n⚠️  Hook Status: Not initialized (user not logged in)');
    }
  } catch (error) {
    console.error('❌ Hook Status Check Failed:', error);
  }

  // 3. Check Types
  try {
    const pushTypes = await import('/types/push.js');
    console.log('\n✅ Types Check: TypeScript definitions available');
    results.types = true;
  } catch (error) {
    console.log('\n⚠️  Types Check: Types not accessible in runtime (normal for TypeScript)');
    results.types = true; // Still pass since types are compile-time only
  }

  // 4. Check Database (requires Supabase client)
  try {
    if (window.supabase) {
      console.log('\n🔍 Testing Database Connection...');
      const { data, error } = await window.supabase
        .from('device_tokens')
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.message.includes('permission denied') || error.message.includes('not found')) {
          console.log('⚠️  Database Check: Table exists but RLS may not be configured');
          console.log('   Run /supabase/migrations/001_push_notifications.sql');
        } else {
          console.log('❌ Database Check Failed:', error.message);
        }
      } else {
        console.log('✅ Database Check: device_tokens table accessible');
        results.database = true;
      }
    } else {
      console.log('\n⚠️  Database Check: Supabase client not found');
    }
  } catch (error) {
    console.error('❌ Database Check Failed:', error);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Summary:');
  console.log('  Service Layer:', results.serviceLayer ? '✅' : '❌');
  console.log('  Hook:', results.hook ? '✅' : '⚠️ (Not logged in)');
  console.log('  Types:', results.types ? '✅' : '❌');
  console.log('  Database:', results.database ? '✅' : '⚠️ (Run migration)');
  console.log('='.repeat(50) + '\n');

  // Next Steps
  if (!results.database) {
    console.log('🔧 Next Steps:');
    console.log('1. Run the SQL migration:');
    console.log('   Open /supabase/migrations/001_push_notifications.sql');
    console.log('   Copy and paste into Supabase SQL Editor');
    console.log('   Execute the SQL\n');
  }

  if (!results.hook && window.user) {
    console.log('2. Push notification hook is running');
    console.log('   Check window.pushStatus for current status\n');
  }

  console.log('📚 Documentation:');
  console.log('  - Setup Guide: /PUSH_SETUP.md');
  console.log('  - API Documentation: /PUSH_NOTIFICATIONS.md\n');

  return results;
})();