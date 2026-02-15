// DIAGNOSTIC COMPONENT - Add this temporarily to see what's happening
// You can add this to your App.tsx or any component

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { getCurrentUser } from './services/auth.ts';

export function ChatDiagnostics() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    async function checkAuth() {
      const currentUser = getCurrentUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Try to check if user can access conversations
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('count');
      
      // Try to check if user can access messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('count');

      setInfo({
        currentUser: currentUser ? {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          authUserId: currentUser.authUserId,
          clientToken: currentUser.clientToken,
        } : null,
        sessionAuthId: session?.user?.id,
        conversationsAccess: convError ? `ERROR: ${convError.message}` : 'OK',
        messagesAccess: msgError ? `ERROR: ${msgError.message}` : 'OK',
      });
    }

    checkAuth();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'black',
      color: 'lime',
      padding: '10px',
      fontSize: '12px',
      maxHeight: '200px',
      overflow: 'auto',
      zIndex: 99999,
      fontFamily: 'monospace',
    }}>
      <div><strong>🔍 CHAT DIAGNOSTICS</strong></div>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}