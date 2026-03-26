import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface NotificationDebuggerProps {
  userId: string | null;
}

export function NotificationDebugger({ userId }: NotificationDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const runDiagnostics = async () => {
    console.clear();
    console.log('🔍 ===== NOTIFICATION DIAGNOSTICS START =====');
    console.log('');

    // 1. User Info
    console.log('👤 USER INFO:');
    console.log('  userId:', userId);
    console.log('  userId type:', typeof userId);
    console.log('');

    // 2. Supabase Auth
    console.log('🔐 SUPABASE AUTH:');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('  Authenticated user:', user?.id);
    console.log('  Auth error:', authError);
    console.log('');

    // 3. Check if notifications table exists
    console.log('📋 TABLE CHECK:');
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('notifications')
        .select('count')
        .limit(0);
      
      if (tableError) {
        console.error('  ❌ Table error:', tableError);
        console.log('  Error code:', (tableError as any).code);
        console.log('  Error message:', (tableError as any).message);
        console.log('  Full error:', JSON.stringify(tableError, null, 2));
      } else {
        console.log('  ✅ Notifications table exists');
      }
    } catch (e) {
      console.error('  ❌ Table check failed:', e);
    }
    console.log('');

    if (!userId) {
      console.log('⚠️ No userId - stopping diagnostics');
      console.log('🔍 ===== NOTIFICATION DIAGNOSTICS END =====');
      return;
    }

    // 4. Get notifications with detailed error
    console.log('📨 FETCH NOTIFICATIONS:');
    try {
      const { data: notifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('  ❌ Fetch error:', fetchError);
        console.log('  Error code:', (fetchError as any).code);
        console.log('  Error message:', (fetchError as any).message);
        console.log('  Error details:', (fetchError as any).details);
        console.log('  Error hint:', (fetchError as any).hint);
        console.log('  Full error:', JSON.stringify(fetchError, null, 2));
      } else {
        console.log('  ✅ Successfully fetched notifications');
        console.log('  Count:', notifications?.length || 0);
        if (notifications && notifications.length > 0) {
          console.log('  Sample notification:', notifications[0]);
        }
      }
    } catch (e) {
      console.error('  ❌ Fetch failed (exception):', e);
    }
    console.log('');

    // 5. Get unread count
    console.log('📬 UNREAD COUNT:');
    try {
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (countError) {
        console.error('  ❌ Count error:', countError);
        console.log('  Full error:', JSON.stringify(countError, null, 2));
      } else {
        console.log('  ✅ Unread count:', count);
      }
    } catch (e) {
      console.error('  ❌ Count failed (exception):', e);
    }
    console.log('');

    // 6. Check RLS policies
    console.log('🔒 RLS POLICIES CHECK:');
    try {
      const { data: policies, error: policyError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            SELECT schemaname, tablename, policyname, permissive, roles, cmd
            FROM pg_policies
            WHERE tablename = 'notifications'
            ORDER BY policyname;
          `
        });

      if (policyError) {
        console.log('  ⚠️ Cannot check policies (requires custom function):', policyError.message);
        console.log('  Run this query in Supabase SQL Editor to see policies:');
        console.log(`
          SELECT schemaname, tablename, policyname, permissive, roles, cmd
          FROM pg_policies
          WHERE tablename = 'notifications'
          ORDER BY policyname;
        `);
      } else {
        console.log('  ✅ Policies:', policies);
      }
    } catch (e) {
      console.log('  ⚠️ Policy check not available');
    }
    console.log('');

    // 7. Test insert notification (to check INSERT permission)
    console.log('✏️ TEST INSERT (checking permissions):');
    try {
      const testNotif = {
        user_id: userId,
        title: 'Debug Test',
        message: 'Testing notification insert',
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      console.log('  Attempting to insert:', testNotif);

      const { data: insertData, error: insertError } = await supabase
        .from('notifications')
        .insert(testNotif)
        .select();

      if (insertError) {
        console.error('  ❌ Insert error:', insertError);
        console.log('  Error code:', (insertError as any).code);
        console.log('  Error message:', (insertError as any).message);
        console.log('  Full error:', JSON.stringify(insertError, null, 2));
        
        // Special handling for RLS error
        if ((insertError as any).code === '42501') {
          console.log('');
          console.log('  🚨 RLS POLICY VIOLATION DETECTED!');
          console.log('  This means:');
          console.log('    1. Table permissions might be missing (GRANT not set)');
          console.log('    2. INSERT policy is not matching your user_id');
          console.log('    3. Policy might have wrong type casting');
          console.log('');
          console.log('  ✅ SOLUTION: Run /FIX_NOTIFICATIONS_COMPLETE_V3.sql');
          console.log('');
        }
      } else {
        console.log('  ✅ Test notification inserted successfully');
        console.log('  Notification ID:', insertData?.[0]?.id);
        
        // Clean up test notification
        if (insertData?.[0]?.id) {
          await supabase
            .from('notifications')
            .delete()
            .eq('id', insertData[0].id);
          console.log('  🧹 Test notification cleaned up');
        }
      }
    } catch (e) {
      console.error('  ❌ Insert failed (exception):', e);
    }
    console.log('');

    // 8. Check constraints
    console.log('⚙️ CHECK CONSTRAINTS:');
    console.log('  Run this query in Supabase SQL Editor to verify constraints:');
    console.log(`
      SELECT 
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'notifications'::regclass
        AND conname LIKE '%check%'
      ORDER BY conname;
    `);
    console.log('');

    // 9. Summary
    console.log('📊 SUMMARY:');
    console.log('  1. Check console output above for errors');
    console.log('  2. If you see policy errors, run /FIX_NOTIFICATIONS_COMPLETE.sql');
    console.log('  3. If you see constraint errors, run /FIX_NOTIFICATIONS_COMPLETE.sql');
    console.log('  4. If table not found, run /DATABASE_SETUP_NOTIFICATIONS.sql');
    console.log('');
    console.log('🔍 ===== NOTIFICATION DIAGNOSTICS END =====');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors font-semibold"
        title="Debug Notifications"
      >
        🐛 Debug Notifications
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-red-600 rounded-lg shadow-2xl p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-red-600">Notification Debugger</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={runDiagnostics}
          className="w-full bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition-colors font-semibold"
        >
          🔍 Run Full Diagnostics
        </button>

        <div className="text-sm text-gray-600 space-y-1">
          <p>This will:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Check Supabase connection</li>
            <li>Verify notifications table</li>
            <li>Test RLS policies</li>
            <li>Check constraints</li>
            <li>Test insert permissions</li>
          </ul>
          <p className="mt-2 font-semibold">✅ Open Console (F12) to see results</p>
        </div>
      </div>
    </div>
  );
}