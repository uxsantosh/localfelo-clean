/**
 * Error Boundary Component
 * ========================
 * Catches React errors and displays them on screen instead of white screen
 */

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ [ErrorBoundary] Caught error:', error);
    console.error('❌ [ErrorBoundary] Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-800 mb-4">
                ❌ App Crashed
              </h1>
              
              <div className="bg-white rounded p-4 mb-4">
                <h2 className="font-bold text-red-700 mb-2">Error:</h2>
                <pre className="text-sm text-red-900 whitespace-pre-wrap break-all font-mono">
                  {this.state.error?.toString()}
                </pre>
              </div>

              {this.state.error?.stack && (
                <div className="bg-white rounded p-4 mb-4">
                  <h2 className="font-bold text-red-700 mb-2">Stack Trace:</h2>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all font-mono max-h-64 overflow-y-auto">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {this.state.errorInfo && (
                <div className="bg-white rounded p-4 mb-4">
                  <h2 className="font-bold text-red-700 mb-2">Component Stack:</h2>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all font-mono max-h-64 overflow-y-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="w-full bg-red-600 text-white py-3 px-4 rounded font-bold hover:bg-red-700 transition-colors"
              >
                🔄 Reload App
              </button>

              <div className="mt-4 text-sm text-gray-600 text-center">
                Take a screenshot and share this error message
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
