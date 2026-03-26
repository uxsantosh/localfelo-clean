// =====================================================
// WhatsApp Notification Test Panel
// For testing Interakt WhatsApp notifications
// =====================================================

import React, { useState } from 'react';
import { Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { sendWhatsAppNotification } from '../../services/interaktWhatsApp';

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export default function WhatsAppTestPanel() {
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const addResult = (success: boolean, message: string) => {
    setTestResults(prev => [
      {
        success,
        message,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  const testOTP = async () => {
    setLoading('otp');
    try {
      const result = await sendWhatsAppNotification({
        phoneNumber: phoneNumber,
        templateName: 'otp_verification',
        variables: {
          customer_name: 'Test User',
          otp_code: '123456'
        }
      });
      if (result.success) {
        addResult(true, '✅ OTP sent successfully!');
      } else {
        addResult(false, `❌ OTP failed: ${result.error}`);
      }
    } catch (error: any) {
      addResult(false, `❌ Error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const testTaskRequest = async () => {
    setLoading('task');
    try {
      const result = await sendWhatsAppNotification({
        phoneNumber: phoneNumber,
        templateName: 'new_task_request',
        variables: {
          helper_name: 'Test Helper',
          task_title: 'Fix WiFi Router Issue',
          category_name: 'Tech Help',
          budget_amount: '500',
          distance_km: '2.5 km'
        }
      });
      if (result.success) {
        addResult(true, '✅ Task notification sent successfully!');
      } else {
        addResult(false, `❌ Task notification failed: ${result.error}`);
      }
    } catch (error: any) {
      addResult(false, `❌ Error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const testListingInterest = async () => {
    setLoading('listing');
    try {
      const result = await sendWhatsAppNotification({
        phoneNumber: phoneNumber,
        templateName: 'listing_interest',
        variables: {
          seller_name: 'Seller Name',
          buyer_name: 'Buyer Name',
          listing_title: 'iPhone 12 - Mint Condition'
        }
      });
      if (result.success) {
        addResult(true, '✅ Listing interest notification sent successfully!');
      } else {
        addResult(false, `❌ Listing notification failed: ${result.error}`);
      }
    } catch (error: any) {
      addResult(false, `❌ Error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-2">WhatsApp Notification Tester</h1>
        <p className="text-gray-600">Test your Interakt WhatsApp templates</p>
      </div>

      {/* Phone Number Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium mb-2">
          Test Phone Number (with country code)
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+919876543210"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-2">
          ⚠️ Make sure this number is added to Interakt sandbox during testing
        </p>
      </div>

      {/* Test Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold mb-4">Quick Tests</h2>

        {/* Test OTP */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium">1. OTP Verification</h3>
            <p className="text-sm text-gray-600">
              Template: <code className="bg-gray-100 px-2 py-1 rounded text-xs">otp_verification</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sends: "Hello Test User! Your LocalFelo OTP is: 123456"
            </p>
          </div>
          <button
            onClick={testOTP}
            disabled={!phoneNumber || loading !== null}
            className="px-6 py-3 bg-[#CDFF00] text-black rounded-lg font-medium hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading === 'otp' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Test OTP
              </>
            )}
          </button>
        </div>

        {/* Test Task Request */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium">2. New Task Request</h3>
            <p className="text-sm text-gray-600">
              Template: <code className="bg-gray-100 px-2 py-1 rounded text-xs">new_task_request</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sends: Task notification for "Fix WiFi Router Issue"
            </p>
          </div>
          <button
            onClick={testTaskRequest}
            disabled={!phoneNumber || loading !== null}
            className="px-6 py-3 bg-[#CDFF00] text-black rounded-lg font-medium hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading === 'task' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Test Task
              </>
            )}
          </button>
        </div>

        {/* Test Listing Interest */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium">3. Listing Interest</h3>
            <p className="text-sm text-gray-600">
              Template: <code className="bg-gray-100 px-2 py-1 rounded text-xs">listing_interest</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sends: "Buyer Name is interested in your listing"
            </p>
          </div>
          <button
            onClick={testListingInterest}
            disabled={!phoneNumber || loading !== null}
            className="px-6 py-3 bg-[#CDFF00] text-black rounded-lg font-medium hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading === 'listing' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Test Listing
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Log */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Test Results</h2>
        {testResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tests run yet. Click a test button above!</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2 text-blue-900">📋 Before Testing:</h3>
        <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
          <li>Create templates in Interakt dashboard</li>
          <li>Wait for Meta approval (1-24 hours)</li>
          <li>Add API credentials to Supabase secrets</li>
          <li>Deploy Edge Function: <code className="bg-blue-100 px-2 py-1 rounded">send-whatsapp-notification</code></li>
          <li>Add your test phone number to Interakt sandbox</li>
          <li>Click test buttons above!</li>
        </ol>
      </div>

      {/* Setup Guide Link */}
      <div className="bg-[#CDFF00] rounded-lg p-6 text-center">
        <p className="font-medium mb-2">Need setup help?</p>
        <p className="text-sm mb-4">
          Check the complete guide in <code className="bg-black text-white px-2 py-1 rounded">/INTERAKT_SETUP_GUIDE.md</code>
        </p>
        <a
          href="/INTERAKT_SETUP_GUIDE.md"
          target="_blank"
          className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          View Setup Guide
        </a>
      </div>
    </div>
  );
}