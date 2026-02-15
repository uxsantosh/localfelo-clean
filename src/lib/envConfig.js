// Environment Configuration Helper
// Safely access environment variables in both browser and server contexts

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Environment variable value or default
 */
export function getEnvVar(key, defaultValue = '') {
  // Try to access process.env safely
  if (typeof window === 'undefined') {
    // Server-side: process.env is available
    return process.env[key] || defaultValue;
  }
  
  // Client-side: Check if process exists (should be polyfilled)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // Fallback: Check window object for injected env vars
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__[key] || defaultValue;
  }
  
  return defaultValue;
}

export default getEnvVar;
