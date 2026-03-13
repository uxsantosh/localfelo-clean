// Android Back Button Handler - Only runs on native platforms
// This file is separate to avoid import errors in web builds

export async function setupAndroidBackButton(
  currentScreen: string,
  chatConversationId: string | null,
  selectedListing: any,
  selectedWishId: string | null,
  selectedTaskId: string | null,
  setChatConversationId: (id: string | null) => void,
  setSelectedListing: (listing: any) => void,
  setCurrentScreen: (screen: any) => void,
  setSelectedWishId: (id: string | null) => void,
  setSelectedTaskId: (id: string | null) => void
): Promise<(() => void) | null> {
  try {
    // Check if Capacitor is available (native platform)
    const CapacitorCore = (window as any).Capacitor;
    if (!CapacitorCore || !CapacitorCore.isNativePlatform()) {
      console.log('🌐 Web platform - skipping back button handler');
      return null;
    }

    // Dynamically import App plugin (only available on native)
    const { App } = await import('@capacitor/app');
    console.log('📱 Native platform - setting up back button handler');

    // Add back button listener
    const backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
      console.log('🔙 Back button pressed, canGoBack:', canGoBack);
      
      // Handle back navigation
      if (currentScreen === 'home') {
        // On home screen, minimize app
        App.minimizeApp();
      } else if (currentScreen === 'chat' && chatConversationId) {
        // In chat with conversation, go back to chat list
        setChatConversationId(null);
      } else if (currentScreen === 'listing' && selectedListing) {
        // On listing detail, go back to previous screen
        setSelectedListing(null);
        setCurrentScreen('marketplace');
      } else if (currentScreen === 'wish-detail' && selectedWishId) {
        // On wish detail, go back to wishes
        setSelectedWishId(null);
        setCurrentScreen('wishes');
      } else if (currentScreen === 'task-detail' && selectedTaskId) {
        // On task detail, go back to tasks
        setSelectedTaskId(null);
        setCurrentScreen('tasks');
      } else if (currentScreen === 'edit') {
        // On edit screen, go back to profile
        setSelectedListing(null);
        setCurrentScreen('profile');
      } else if (['create', 'create-wish', 'create-task'].includes(currentScreen)) {
        // On create screens, go back to home
        setCurrentScreen('home');
      } else if (['marketplace', 'wishes', 'tasks', 'profile'].includes(currentScreen)) {
        // On main tabs, go to home
        setCurrentScreen('home');
      } else if (['about', 'terms', 'privacy', 'safety', 'contact', 'prohibited', 'notifications'].includes(currentScreen)) {
        // On info pages, go back to home
        setCurrentScreen('home');
      } else if (canGoBack) {
        // Default: use browser history if available
        window.history.back();
      } else {
        // Fallback: go to home
        setCurrentScreen('home');
      }
    });

    console.log('✅ Back button listener registered');

    // Return cleanup function
    return () => {
      backButtonListener.remove();
      console.log('🧹 Back button listener removed');
    };
  } catch (error) {
    console.log('⚠️ Could not set up back button handler:', error);
    return null;
  }
}
