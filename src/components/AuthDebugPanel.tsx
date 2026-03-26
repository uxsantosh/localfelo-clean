import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, RefreshCw } from 'lucide-react';

export function AuthDebugPanel({ onClose }: { onClose: () => void }) {
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const loadData = async () => {
    setLoading(true);
    
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    setSession(sessionData.session);

    // Try to get current user
    const { data: userData } = await supabase.auth.getUser();
    console.log('Current user:', userData);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const testSupabaseEmailService = async () => {
    setLoading(true);
    setResult('');
    try {
      console.log('🧪 Testing Supabase email service...');
      
      // Test 1: Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', { session, sessionError });
      
      // Test 2: Try to signup with a test email
      const testEmail = `test-${Date.now()}@example.com`;
      console.log('🧪 Attempting signup with:', testEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: 'Test User'
          }
        }
      });
      
      console.log('📧 Signup response:', { data, error });
      
      // Check if user was created but not confirmed
      if (data?.user && !data?.user?.email_confirmed_at) {
        setResult('✅ User created but email NOT confirmed\n\n' +
          'Email Status: Pending verification\n' +
          'User ID: ' + data.user.id + '\n' +
          'Email: ' + data.user.email + '\n\n' +
          '⚠️ EMAIL NOT SENT or FAILED\n\n' +
          'Possible Issues:\n' +
          '1. Email confirmation is disabled in Supabase\n' +
          '2. Supabase email service not configured\n' +
          '3. Rate limit reached\n' +
          '4. Email domain blocked'
        );
      } else if (data?.user?.email_confirmed_at) {
        setResult('⚠️ Email was auto-confirmed (email confirmation is OFF in Supabase)\n\n' +
          'User ID: ' + data.user.id + '\n' +
          'Email: ' + data.user.email + '\n\n' +
          '❌ This means "Confirm email" setting is OFF in your Supabase Dashboard'
        );
      } else if (error) {
        setResult('❌ Signup Failed:\n\n' + 
          'Error: ' + error.message + '\n' +
          'Code: ' + error.code + '\n\n' +
          JSON.stringify(error, null, 2)
        );
      }
      
    } catch (err: any) {
      console.error('Test failed:', err);
      setResult('❌ Test Failed:\n\n' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg">🔍 Auth Debug Panel</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Session */}
          <div className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Current Session</h3>
              <button onClick={loadData} className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {session ? JSON.stringify(session.user, null, 2) : 'No session'}
            </pre>
          </div>

          {/* Test Buttons */}
          <div className="border rounded p-3">
            <h3 className="font-medium mb-3">Test Functions</h3>
            <div className="space-y-2">
              <button
                onClick={testSupabaseEmailService}
                className="w-full btn-secondary text-sm"
              >
                🧪 Test Supabase Email Service
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="border rounded p-3 bg-orange-50">
            <h3 className="font-medium mb-2">Instructions</h3>
            <ul className="text-sm space-y-1 text-orange-900">
              <li>• Open browser console (F12) to see detailed logs</li>
              <li>• Test signup will create a user with temp password</li>
              <li>• Test resend will attempt to resend verification</li>
              <li>• Check Supabase Dashboard → Auth → Users after each test</li>
            </ul>
          </div>

          {/* Checklist */}
          <div className="border rounded p-3 bg-amber-50">
            <h3 className="font-medium mb-2">⚠️ Supabase Settings Checklist</h3>
            <ul className="text-sm space-y-1 text-amber-900">
              <li>✅ Email provider enabled?</li>
              <li>✅ "Confirm email" turned ON? (CRITICAL!)</li>
              <li>✅ Site URL = http://localhost:5173</li>
              <li>✅ Redirect URLs include http://localhost:5173/**</li>
            </ul>
          </div>

          {/* Common Issues */}
          <div className="border rounded p-3 bg-rose-50">
            <h3 className="font-medium mb-2">🚨 Common Issues</h3>
            <ul className="text-sm space-y-1 text-rose-900">
              <li><strong>No email sent:</strong> Check "Confirm email" is ON</li>
              <li><strong>Resend fails:</strong> User might be already confirmed</li>
              <li><strong>Rate limited:</strong> Wait 60 seconds between attempts</li>
              <li><strong>Email in spam:</strong> Check spam folder!</li>
            </ul>
          </div>

          {/* Test Results */}
          <div className="border rounded p-3 bg-gray-50">
            <h3 className="font-medium mb-2">Test Results</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {result}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}