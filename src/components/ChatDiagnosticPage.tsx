import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../services/auth.ts';

export function ChatDiagnosticPage() {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const testResults: any = {};

    // Test 1: Check current user
    const currentUser = getCurrentUser();
    testResults.currentUser = currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      authUserId: currentUser.authUserId,
      clientToken: currentUser.clientToken,
    } : 'NOT LOGGED IN';

    // Test 2: Check Supabase auth session
    const { data: { session } } = await supabase.auth.getSession();
    testResults.supabaseAuth = session ? {
      userId: session.user.id,
      email: session.user.email,
    } : 'NO SESSION';

    // Test 3: Check if conversations table exists
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    testResults.conversationsTable = convError 
      ? `ERROR: ${convError.message}` 
      : `OK (${convData?.length || 0} rows)`;

    // Test 4: Check if messages table exists
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);
    testResults.messagesTable = msgError 
      ? `ERROR: ${msgError.message}` 
      : `OK (${msgData?.length || 0} rows)`;

    // Test 5: Try to insert a test message (will fail if RLS is wrong)
    const testConvId = '00000000-0000-0000-0000-000000000000'; // Fake ID
    const { data: insertData, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: testConvId,
        sender_id: currentUser?.id || 'test',
        sender_name: currentUser?.name || 'Test',
        content: 'Test message',
        read: false,
      })
      .select();

    testResults.testInsert = insertError 
      ? {
          error: insertError.message,
          hint: insertError.hint,
          details: insertError.details,
          code: insertError.code,
        }
      : 'SUCCESS (unexpected!)';

    // Test 6: Check RLS helper function
    const { data: funcData, error: funcError } = await supabase.rpc('is_user_id_match', {
      user_id_to_check: currentUser?.id || 'test'
    });
    testResults.rlsFunction = funcError 
      ? `ERROR: ${funcError.message}` 
      : `OK - Returns: ${funcData}`;

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl mb-4">🔍 Chat Diagnostic Tool</h1>
        
        <button
          onClick={runTests}
          disabled={testing}
          className="bg-primary text-primary-foreground px-4 py-2 rounded mb-4"
        >
          {testing ? 'Testing...' : 'Run All Tests'}
        </button>

        {Object.keys(results).length > 0 && (
          <div className="bg-card border border-border rounded p-4">
            <h2 className="font-bold mb-2">Test Results:</h2>
            <pre className="text-xs overflow-auto bg-muted p-4 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>

            <div className="mt-4 space-y-2">
              <h3 className="font-bold">Quick Diagnosis:</h3>
              
              {!results.currentUser || results.currentUser === 'NOT LOGGED IN' ? (
                <p className="text-rose-600">❌ NOT LOGGED IN - Please log in first</p>
              ) : (
                <p className="text-[#52B788]">✅ Logged in as: {results.currentUser?.name}</p>
              )}

              {results.conversationsTable?.includes('ERROR') && (
                <p className="text-rose-600">❌ CONVERSATIONS TABLE ERROR - Run SQL script!</p>
              )}

              {results.messagesTable?.includes('ERROR') && (
                <p className="text-rose-600">❌ MESSAGES TABLE ERROR - Run SQL script!</p>
              )}

              {results.rlsFunction?.includes('ERROR') && (
                <p className="text-rose-600">❌ RLS FUNCTION MISSING - Run SQL script!</p>
              )}

              {results.testInsert?.error?.includes('new row violates row-level security') && (
                <p className="text-rose-600">❌ RLS POLICY BLOCKING - Run SQL script!</p>
              )}

              {results.testInsert?.error?.includes('relation') && results.testInsert?.error?.includes('does not exist') && (
                <p className="text-rose-600">❌ TABLE DOESN'T EXIST - Run SQL script!</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded p-4">
          <h3 className="font-bold mb-2">💡 What to do:</h3>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Click "Run All Tests" above</li>
            <li>Look for any ❌ errors</li>
            <li>If you see table errors or RLS errors, run <code className="bg-gray-200 px-1">/CHAT_SUPABASE_RESET_FIXED.sql</code> in Supabase</li>
            <li>Copy the "Test Results" JSON and send it to the developer</li>
          </ol>
        </div>
      </div>
    </div>
  );
}