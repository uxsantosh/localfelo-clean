// =====================================================
// Supabase Edge Function: Check Unread Message Reminders
// Scheduled to run every 6 hours via Supabase cron
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Unread Reminders] Starting unread reminder check...');

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the database function to check and send reminders
    const { data, error } = await supabase.rpc('check_and_send_unread_reminders');

    if (error) {
      console.error('[Unread Reminders] Error calling function:', error);
      throw error;
    }

    console.log('[Unread Reminders] Reminder check complete:', data);

    const reminderCount = data?.[0]?.reminder_count || 0;
    const usersNotified = data?.[0]?.users_notified || [];

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${reminderCount} unread reminders`,
        reminderCount,
        usersNotified,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[Unread Reminders] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to check unread reminders'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
