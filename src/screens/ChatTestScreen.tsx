import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../services/auth';
import { getConversations, getMessages, sendMessage, getOrCreateConversation } from '../services/chat';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function ChatTestScreen() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [testConvId, setTestConvId] = useState<string | null>(null);

  const addTest = (result: TestResult) => {
    setTests(prev => [...prev, result]);
  };

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(t => t.name === name ? { ...t, ...updates } : t));
  };

  const runTests = async () => {
    setTests([]);
    setRunning(true);

    // Test 1: Check Authentication
    addTest({ name: 'Authentication', status: 'pending', message: 'Checking user authentication...' });
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id) {
      updateTest('Authentication', {
        status: 'success',
        message: `Authenticated as: ${currentUser.name} (ID: ${currentUser.id})`,
        details: currentUser
      });
    } else {
      updateTest('Authentication', {
        status: 'error',
        message: 'Not authenticated! Please log in first.',
      });
      setRunning(false);
      return;
    }

    // Test 2: Check Supabase Connection
    addTest({ name: 'Supabase Connection', status: 'pending', message: 'Testing Supabase connection...' });
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      updateTest('Supabase Connection', {
        status: 'success',
        message: 'Supabase connected successfully'
      });
    } catch (error: any) {
      updateTest('Supabase Connection', {
        status: 'error',
        message: `Supabase connection failed: ${error.message}`
      });
      setRunning(false);
      return;
    }

    // Test 3: Check Conversations Table
    addTest({ name: 'Conversations Table', status: 'pending', message: 'Checking conversations table...' });
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          updateTest('Conversations Table', {
            status: 'error',
            message: 'Conversations table does not exist! Run migration SQL first.',
            details: error
          });
          setRunning(false);
          return;
        }
        throw error;
      }
      
      updateTest('Conversations Table', {
        status: 'success',
        message: 'Conversations table exists'
      });
    } catch (error: any) {
      updateTest('Conversations Table', {
        status: 'error',
        message: `Table check failed: ${error.message}`,
        details: error
      });
      setRunning(false);
      return;
    }

    // Test 4: Check Messages Table
    addTest({ name: 'Messages Table', status: 'pending', message: 'Checking messages table...' });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          updateTest('Messages Table', {
            status: 'error',
            message: 'Messages table does not exist! Run migration SQL first.',
            details: error
          });
          setRunning(false);
          return;
        }
        throw error;
      }
      
      updateTest('Messages Table', {
        status: 'success',
        message: 'Messages table exists'
      });
    } catch (error: any) {
      updateTest('Messages Table', {
        status: 'error',
        message: `Table check failed: ${error.message}`,
        details: error
      });
      setRunning(false);
      return;
    }

    // Test 5: Check RLS Policies for Conversations
    addTest({ name: 'Conversations RLS', status: 'pending', message: 'Testing Row Level Security for conversations...' });
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .limit(5);
      
      if (error) {
        updateTest('Conversations RLS', {
          status: 'error',
          message: `RLS policy blocking access: ${error.message}`,
          details: error
        });
      } else {
        updateTest('Conversations RLS', {
          status: 'success',
          message: `RLS allows read access. Found ${data.length} conversations.`,
          details: data
        });
      }
    } catch (error: any) {
      updateTest('Conversations RLS', {
        status: 'error',
        message: `RLS test failed: ${error.message}`,
        details: error
      });
    }

    // Test 6: Check RLS Policies for Messages
    addTest({ name: 'Messages RLS', status: 'pending', message: 'Testing Row Level Security for messages...' });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .limit(5);
      
      if (error) {
        updateTest('Messages RLS', {
          status: 'error',
          message: `RLS policy blocking access: ${error.message}`,
          details: error
        });
      } else {
        updateTest('Messages RLS', {
          status: 'success',
          message: `RLS allows read access. Found ${data.length} messages.`,
          details: data
        });
      }
    } catch (error: any) {
      updateTest('Messages RLS', {
        status: 'error',
        message: `RLS test failed: ${error.message}`,
        details: error
      });
    }

    // Test 7: Get Conversations using service
    addTest({ name: 'getConversations()', status: 'pending', message: 'Testing getConversations service...' });
    try {
      const { conversations, error } = await getConversations();
      if (error) {
        updateTest('getConversations()', {
          status: 'error',
          message: `Service error: ${error}`,
        });
      } else {
        updateTest('getConversations()', {
          status: 'success',
          message: `Successfully fetched ${conversations.length} conversations`,
          details: conversations
        });
        
        // Store first conversation for message test
        if (conversations.length > 0) {
          setTestConvId(conversations[0].id);
        }
      }
    } catch (error: any) {
      updateTest('getConversations()', {
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }

    // Test 8: Get Messages (if we have a conversation)
    if (testConvId) {
      addTest({ name: 'getMessages()', status: 'pending', message: 'Testing getMessages service...' });
      try {
        const { messages, error } = await getMessages(testConvId);
        if (error) {
          updateTest('getMessages()', {
            status: 'error',
            message: `Service error: ${error}`,
          });
        } else {
          updateTest('getMessages()', {
            status: 'success',
            message: `Successfully fetched ${messages.length} messages`,
            details: messages
          });
        }
      } catch (error: any) {
        updateTest('getMessages()', {
          status: 'error',
          message: `Exception: ${error.message}`,
          details: error
        });
      }
    }

    // Test 9: Check if user can create conversation
    addTest({ name: 'Create Conversation Test', status: 'pending', message: 'Testing conversation creation permissions...' });
    try {
      // Generate a valid UUID for buyer_id and seller_id
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const testListingId = generateUUID();
      const testBuyerId = generateUUID();
      const testSellerId = generateUUID();

      const testData = {
        listing_id: testListingId, // Use UUID instead of string
        listing_title: 'Test Listing',
        listing_price: 1000,
        buyer_id: testBuyerId,
        buyer_name: 'Test Buyer',
        seller_id: testSellerId,
        seller_name: 'Test Seller',
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert(testData)
        .select()
        .single();
      
      if (error) {
        updateTest('Create Conversation Test', {
          status: 'error',
          message: `Cannot create conversations: ${error.message}`,
          details: error
        });
      } else {
        // Clean up test data
        await supabase.from('conversations').delete().eq('id', data.id);
        
        updateTest('Create Conversation Test', {
          status: 'success',
          message: 'Can create conversations successfully',
        });
      }
    } catch (error: any) {
      updateTest('Create Conversation Test', {
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }

    // Test 10: Check Real-time Subscriptions
    addTest({ name: 'Real-time Subscriptions', status: 'pending', message: 'Testing real-time subscriptions...' });
    try {
      let subscriptionWorks = false;
      const channel = supabase
        .channel('test-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            subscriptionWorks = true;
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            updateTest('Real-time Subscriptions', {
              status: 'success',
              message: 'Real-time subscriptions are working',
            });
            setTimeout(() => {
              channel.unsubscribe();
              supabase.removeChannel(channel);
            }, 1000);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            updateTest('Real-time Subscriptions', {
              status: 'warning',
              message: 'Real-time not available, but polling will work',
            });
            channel.unsubscribe();
            supabase.removeChannel(channel);
          }
        });

      // Timeout check
      setTimeout(() => {
        if (tests.find(t => t.name === 'Real-time Subscriptions')?.status === 'pending') {
          updateTest('Real-time Subscriptions', {
            status: 'warning',
            message: 'Real-time subscription timeout, but polling will work',
          });
          channel.unsubscribe();
          supabase.removeChannel(channel);
        }
      }, 5000);
    } catch (error: any) {
      updateTest('Real-time Subscriptions', {
        status: 'warning',
        message: `Real-time not available: ${error.message}. Polling will work as fallback.`,
      });
    }

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBg = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">LocalFelo Chat Feature Test</h1>
          <p className="text-gray-600 mb-4">
            This page will test all aspects of the chat feature to identify any issues.
          </p>
          
          <button
            onClick={runTests}
            disabled={running}
            className="px-6 py-3 bg-[#CDFF00] text-black font-semibold rounded-lg hover:bg-[#B8E600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {running ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusBg(test.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {test.name}
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      {test.message}
                    </p>
                    {test.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tests.length > 0 && !running && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {tests.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            {tests.filter(t => t.status === 'error').length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
                <h3 className="font-bold text-red-900 mb-2">Critical Issues Found</h3>
                <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                  {tests.filter(t => t.status === 'error').map((test, idx) => (
                    <li key={idx}>{test.name}: {test.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {tests.filter(t => t.status === 'error').length === 0 && 
             tests.filter(t => t.status === 'warning').length === 0 && (
              <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-600 rounded">
                <h3 className="font-bold text-green-900 mb-2">✅ All Tests Passed!</h3>
                <p className="text-sm text-green-800">
                  Your chat feature is properly configured and ready to use.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Common Fixes</h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-900">Table doesn't exist:</strong>
              <p className="text-gray-700 mt-1">
                Run the chat migration SQL file in your Supabase SQL Editor. Look for files like 
                <code className="px-1 bg-gray-200 rounded"> CHAT_SUPABASE_RESET_FIXED.sql</code> or 
                <code className="px-1 bg-gray-200 rounded"> supabase_chat_schema_fixed.sql</code>
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-900">RLS Policy blocking access:</strong>
              <p className="text-gray-700 mt-1">
                The Row Level Security policies need to be configured. Check for SQL files with 
                <code className="px-1 bg-gray-200 rounded"> RLS</code> in the name and run them.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-900">Not authenticated:</strong>
              <p className="text-gray-700 mt-1">
                You need to be logged in to use the chat feature. Go back to the home screen and log in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}