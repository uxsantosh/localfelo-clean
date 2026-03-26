import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import { AuthDebugPanel } from '../components/AuthDebugPanel';

interface DiagnosticScreenProps {
  onNavigate: (tab: 'home' | 'create' | 'profile' | 'admin' | 'chat') => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
}

export function DiagnosticScreen({ onNavigate }: DiagnosticScreenProps) {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthDebug, setShowAuthDebug] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const clientToken = localStorage.getItem('oldcycle_token');
      const authToken = localStorage.getItem('oldcycle-auth-token');
      const userJson = localStorage.getItem('oldcycle_user');
      
      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('client_token', clientToken)
        .single();

      const { data: allListings } = await supabase
        .from('listings')
        .select('id, title, owner_token, owner_name, owner_phone, created_at');

      setDiagnosticData({
        clientToken,
        authToken: authToken ? 'Present (Supabase)' : 'Not found',
        userJson: userJson ? JSON.parse(userJson) : null,
        supabaseSession: session ? {
          user_email: session.user?.email,
          user_id: session.user?.id,
          expires_at: new Date(session.expires_at! * 1000).toLocaleString(),
        } : 'No session',
        sessionError: sessionError?.message || 'None',
        profile,
        allListings,
        currentUrl: window.location.href,
        origin: window.location.origin,
      });
    } catch (error) {
      console.error('Diagnostic error:', error);
    }
    setLoading(false);
  };

  const fixListings = async () => {
    if (!diagnosticData?.profile) return;
    
    const { owner_token } = diagnosticData.profile;
    
    const userListings = diagnosticData.allListings.filter((listing: any) => 
      listing.owner_phone === diagnosticData.profile.phone
    );

    console.log('Found listings by phone:', userListings);

    if (userListings.length === 0) {
      alert('No listings found matching your phone number');
      return;
    }

    const updates = userListings.map((listing: any) => 
      supabase
        .from('listings')
        .update({ owner_token: owner_token })
        .eq('id', listing.id)
    );

    await Promise.all(updates);
    alert(`Fixed ${userListings.length} listing(s)!`);
    runDiagnostic();
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => onNavigate('profile')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl">🔍 Diagnostic Tool</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="w-full bg-[#FF6B35] text-white px-4 py-3 rounded-lg hover:bg-[#E85A28] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Running...' : 'Run Diagnostic'}
        </button>

        <button
          onClick={() => setShowAuthDebug(true)}
          className="w-full bg-[#FFC107] text-[#1A1410] px-4 py-3 rounded-lg hover:bg-[#FFB300] transition-colors"
        >
          🔐 Open Auth Debug Panel
        </button>

        {diagnosticData && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Client Token (localStorage)</h3>
              <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                {diagnosticData.clientToken}
              </code>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Profile Data</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {diagnosticData.profile?.name}
                </div>
                <div>
                  <strong>Phone:</strong> {diagnosticData.profile?.phone}
                </div>
                <div>
                  <strong>Client Token:</strong>
                  <code className="text-xs bg-gray-100 p-1 rounded block break-all mt-1">
                    {diagnosticData.profile?.client_token}
                  </code>
                </div>
                <div>
                  <strong>Owner Token:</strong>
                  <code className="text-xs bg-orange-100 p-1 rounded block break-all mt-1">
                    {diagnosticData.profile?.owner_token}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">
                All Listings in Database ({diagnosticData.allListings?.length || 0})
              </h3>
              <div className="space-y-4">
                {diagnosticData.allListings?.map((listing: any) => (
                  <div key={listing.id} className="border-l-4 border-orange-500 pl-3 py-2 bg-gray-50">
                    <div className="font-medium">{listing.title}</div>
                    <div className="text-xs space-y-1 mt-2">
                      <div>
                        <strong>Owner Token:</strong>
                        <code className="bg-white p-1 rounded block break-all mt-1">
                          {listing.owner_token}
                        </code>
                      </div>
                      <div><strong>Phone:</strong> {listing.owner_phone}</div>
                      <div><strong>Name:</strong> {listing.owner_name}</div>
                      <div className="text-gray-500">
                        {new Date(listing.created_at).toLocaleString()}
                      </div>
                      {listing.owner_token === diagnosticData.profile?.owner_token && (
                        <div className="text-[#52B788] font-medium">✅ Matches Profile Owner Token</div>
                      )}
                      {listing.owner_token === diagnosticData.profile?.client_token && (
                        <div className="text-amber-600 font-medium">⚠️ Using Client Token (WRONG)</div>
                      )}
                      {listing.owner_phone === diagnosticData.profile?.phone && (
                        <div className="text-[#FF6B35] font-medium">📞 Phone Matches</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={fixListings}
              className="w-full bg-[#52B788] text-white px-4 py-3 rounded-lg hover:bg-[#40916C] transition-colors"
            >
              🔧 Fix My Listings by Phone Number
            </button>
          </div>
        )}
      </div>

      {showAuthDebug && (
        <AuthDebugPanel onClose={() => setShowAuthDebug(false)} />
      )}
    </div>
  );
}