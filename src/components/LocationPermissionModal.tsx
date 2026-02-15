import { X, MapPin, Smartphone, Monitor, AlertCircle } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: 'denied' | 'unavailable' | 'blocked' | null;
}

export function LocationPermissionModal({ isOpen, onClose, errorType }: LocationPermissionModalProps) {
  if (!isOpen) return null;

  // Detect device and browser
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);

  const getInstructions = () => {
    if (errorType === 'unavailable') {
      return {
        title: 'Location Not Available',
        icon: <AlertCircle className="w-12 h-12 text-primary" />,
        description: 'Your device does not support geolocation services.',
        steps: [
          'Try using a modern browser like Chrome, Safari, or Firefox',
          'Make sure you are using HTTPS (secure connection)',
          'Check if location services are enabled on your device'
        ]
      };
    }

    if (errorType === 'denied' || errorType === 'blocked') {
      // iOS Safari
      if (isIOS && isSafari) {
        return {
          title: 'Enable Location Access',
          icon: <Smartphone className="w-12 h-12 text-primary" />,
          description: 'To auto-detect your location, please enable location permissions:',
          steps: [
            'Open your iPhone Settings app',
            'Scroll down and tap "Safari"',
            'Tap "Location"',
            'Select "Ask" or "Allow"',
            'Come back to OldCycle and try again'
          ]
        };
      }

      // iOS Chrome
      if (isIOS && isChrome) {
        return {
          title: 'Enable Location Access',
          icon: <Smartphone className="w-12 h-12 text-primary" />,
          description: 'To auto-detect your location, please enable location permissions:',
          steps: [
            'Open your iPhone Settings app',
            'Scroll down and tap "Chrome"',
            'Tap "Location"',
            'Select "Ask Next Time" or "While Using the App"',
            'Come back to LocalFelo and try again'
          ]
        };
      }

      // Android Chrome
      if (isAndroid && isChrome) {
        return {
          title: 'Enable Location Access',
          icon: <Smartphone className="w-12 h-12 text-primary" />,
          description: 'To auto-detect your location, please enable location permissions:',
          steps: [
            'Tap the lock icon or (i) in the address bar',
            'Tap "Permissions"',
            'Find "Location" and select "Allow"',
            'Refresh this page and try again'
          ]
        };
      }

      // Android Firefox
      if (isAndroid && isFirefox) {
        return {
          title: 'Enable Location Access',
          icon: <Smartphone className="w-12 h-12 text-primary" />,
          description: 'To auto-detect your location, please enable location permissions:',
          steps: [
            'Tap the lock icon in the address bar',
            'Tap "Edit Site Permissions"',
            'Find "Location" and select "Allow"',
            'Refresh this page and try again'
          ]
        };
      }

      // Desktop Chrome
      if (isChrome && !isAndroid && !isIOS) {
        return {
          title: 'Enable Location Access',
          icon: <Monitor className="w-12 h-12 text-primary" />,
          description: 'To auto-detect your location, please enable location permissions:',
          steps: [
            'Click the lock icon (🔒) in the address bar',
            'Click "Site settings"',
            'Find "Location" and change it to "Allow"',
            'Refresh this page and try again'
          ]
        };
      }

      // Desktop Firefox
      if (isFirefox && !isAndroid && !isIOS) {
        return {
          title: 'Enable Location Access',
          icon: <Monitor className="w-12 h-12 text-primary" />,
          description: 'To auto-detect your location, please enable location permissions:',
          steps: [
            'Click the lock icon (🔒) in the address bar',
            'Look for "Permissions"',
            'Find "Access Your Location" and click the X to clear',
            'Refresh this page and try again'
          ]
        };
      }

      // Desktop Safari
      if (isSafari && !isIOS) {
        return {
          title: 'Enable Location Access',
          icon: <Monitor className="w-12 h-12 text-primary" />,
          description: 'To auto-detect your location, please enable location permissions:',
          steps: [
            'Go to Safari menu → Preferences',
            'Click "Websites" tab',
            'Select "Location" from the left sidebar',
            'Find this website and select "Allow"',
            'Refresh this page and try again'
          ]
        };
      }

      // Generic fallback
      return {
        title: 'Enable Location Access',
        icon: <MapPin className="w-12 h-12 text-primary" />,
        description: 'To auto-detect your location, please enable location permissions in your browser settings.',
        steps: [
          'Look for a location icon in your browser\'s address bar',
          'Click it and select "Allow" for location access',
          'Refresh this page and try again',
          'Or manually select your city and area below'
        ]
      };
    }

    // Default
    return {
      title: 'Location Permission Needed',
      icon: <MapPin className="w-12 h-12 text-primary" />,
      description: 'Please allow location access to auto-detect your location.',
      steps: []
    };
  };

  const instructions = getInstructions();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[200] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90%] max-w-md bg-white rounded-lg overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div className="flex items-start gap-3">
            {instructions.icon}
            <div>
              <h2 className="text-heading m-0 mb-1">{instructions.title}</h2>
              <p className="text-sm text-body m-0">{instructions.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-input rounded transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Steps */}
        {instructions.steps.length > 0 && (
          <div className="px-5 py-4">
            <ol className="space-y-2.5 list-none p-0 m-0">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-sm shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-body pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 bg-input/30 border-t border-border">
          <p className="text-xs text-muted m-0 mb-3">
            Don't worry! You can also manually select your city and area without using auto-detect.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-black text-white rounded hover:bg-gray-800 transition-colors font-semibold"
          >
            Got it, I'll enable it
          </button>
        </div>
      </div>
    </>
  );
}