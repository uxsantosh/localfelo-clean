/**
 * Version Manager
 * Handles automatic version detection and refresh prompts
 */

export interface VersionInfo {
  version: string;
  buildTime: string;
}

class VersionManager {
  private currentVersion: string;
  private checkInterval: number = 5 * 60 * 1000; // Check every 5 minutes
  private intervalId: number | null = null;
  private onUpdateAvailable?: () => void;

  constructor() {
    // Version is injected at build time via vite
    // Use try-catch to handle cases where import.meta.env might not be available
    try {
      this.currentVersion = import.meta.env?.VITE_APP_VERSION || 'dev';
    } catch (error) {
      this.currentVersion = 'dev';
    }
  }

  /**
   * Start periodic version checking
   */
  startVersionCheck(onUpdateAvailable?: () => void) {
    this.onUpdateAvailable = onUpdateAvailable;
    
    // Check immediately on start
    this.checkVersion();
    
    // Then check periodically
    this.intervalId = setInterval(() => {
      this.checkVersion();
    }, this.checkInterval);
  }

  /**
   * Stop version checking
   */
  stopVersionCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if a new version is available
   */
  private async checkVersion() {
    try {
      // Skip in development mode
      if (this.currentVersion === 'dev') {
        return;
      }

      // Fetch version.json with cache-busting timestamp
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        // Silently fail in development
        return;
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Not a JSON response, silently fail (likely in development)
        return;
      }

      const versionInfo: VersionInfo = await response.json();
      
      // Compare versions
      if (versionInfo.version !== this.currentVersion) {
        console.log(`New version available: ${versionInfo.version} (current: ${this.currentVersion})`);
        
        if (this.onUpdateAvailable) {
          this.onUpdateAvailable();
        }
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience or log errors in development
      // Only log in production if it's an unexpected error
      if (this.currentVersion !== 'dev') {
        console.debug('Version check skipped:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  /**
   * Force reload the application
   */
  reloadApp() {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Force reload from server, bypassing cache
    window.location.reload();
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }
}

export const versionManager = new VersionManager();