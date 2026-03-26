/**
 * On-Screen Debug Console
 * =======================
 * Shows console logs directly on the screen for debugging without USB cable
 */

import { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  args: any[];
}

export function OnScreenDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logIdCounter = useRef(0);

  // Intercept console methods
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const addLog = (type: LogEntry['type'], args: any[]) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // ✅ FIX: Defer state update to avoid "setState during render" warning
      // Use queueMicrotask to run after current render cycle completes
      queueMicrotask(() => {
        setLogs(prev => {
          const newLogs = [...prev, {
            id: logIdCounter.current++,
            timestamp,
            type,
            message,
            args,
          }];
          
          // Keep only last 100 logs
          return newLogs.slice(-100);
        });
      });
    };

    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      addLog('log', args);
    };

    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      addLog('error', args);
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      addLog('warn', args);
    };

    console.info = (...args: any[]) => {
      originalInfo.apply(console, args);
      addLog('info', args);
    };

    // Restore original methods on cleanup
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
    logIdCounter.current = 0;
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warn': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-800';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <>
      {/* Floating Debug Button - Only show when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-50 bg-black text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-mono text-sm"
          style={{ backgroundColor: '#000000' }}
        >
          🐛 Debug ({logs.length})
        </button>
      )}

      {/* Debug Console Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-lg font-bold">🐛 Debug Console</h2>
              <span className="text-sm text-gray-400">({logs.length} logs)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="p-2 hover:bg-gray-800 rounded"
                title="Clear logs"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Auto-scroll toggle */}
          <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-sm border-b border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <span>Auto-scroll</span>
            </label>
            <span className="text-gray-400">Tap any log to copy</span>
          </div>

          {/* Logs Container */}
          <div className="flex-1 overflow-y-auto bg-gray-950 text-white p-4 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No logs yet. Console output will appear here.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded border-l-4 bg-gray-900 cursor-pointer hover:bg-gray-800"
                    style={{
                      borderLeftColor: 
                        log.type === 'error' ? '#ef4444' :
                        log.type === 'warn' ? '#f97316' :
                        log.type === 'info' ? '#3b82f6' :
                        '#6b7280'
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(log.message);
                      alert('Copied to clipboard!');
                    }}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span>{getLogIcon(log.type)}</span>
                      <span className="text-gray-500">{log.timestamp}</span>
                      <span className={getLogColor(log.type)}>{log.type.toUpperCase()}</span>
                    </div>
                    <div className="whitespace-pre-wrap break-all pl-6">
                      {log.message}
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>

          {/* Footer Instructions */}
          <div className="bg-gray-900 text-gray-400 px-4 py-3 text-xs border-t border-gray-700">
            Look for logs starting with:
            <div className="mt-1 space-y-1">
              <div>🔍 <span className="text-blue-400">[CapacitorStorage] GET</span> - Reading from storage</div>
              <div>💾 <span className="text-green-400">[CapacitorStorage] SET</span> - Saving to storage</div>
              <div>📱 <span className="text-purple-400">[usePushNotifications]</span> - Push notification status</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}