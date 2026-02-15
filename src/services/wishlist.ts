// Wishlist service for managing favorite listings (user-specific)

const WISHLIST_PREFIX = 'oldcycle_wishlist_';
const GUEST_WISHLIST_KEY = 'oldcycle_wishlist_guest';

/**
 * Get the wishlist key for the current user
 * Uses client_token for logged-in users, 'guest' for non-logged-in users
 */
function getWishlistKey(): string {
  const clientToken = localStorage.getItem('oldcycle_token');
  if (clientToken) {
    // Use a hash or substring of the token to create a unique key
    return `${WISHLIST_PREFIX}${clientToken.substring(0, 16)}`;
  }
  return GUEST_WISHLIST_KEY;
}

export function getWishlist(): string[] {
  try {
    const key = getWishlistKey();
    const wishlist = localStorage.getItem(key);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error reading wishlist:', error);
    return [];
  }
}

export function addToWishlist(listingId: string): void {
  try {
    const key = getWishlistKey();
    const wishlist = getWishlist();
    if (!wishlist.includes(listingId)) {
      wishlist.push(listingId);
      localStorage.setItem(key, JSON.stringify(wishlist));
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
  }
}

export function removeFromWishlist(listingId: string): void {
  try {
    const key = getWishlistKey();
    const wishlist = getWishlist();
    const filtered = wishlist.filter(id => id !== listingId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from wishlist:', error);
  }
}

export function isInWishlist(listingId: string): boolean {
  const wishlist = getWishlist();
  return wishlist.includes(listingId);
}

export function toggleWishlist(listingId: string): boolean {
  if (isInWishlist(listingId)) {
    removeFromWishlist(listingId);
    return false;
  } else {
    addToWishlist(listingId);
    return true;
  }
}

/**
 * Clear the wishlist for the current user
 * Useful when logging out
 */
export function clearWishlist(): void {
  try {
    const key = getWishlistKey();
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing wishlist:', error);
  }
}

/**
 * Migrate guest wishlist to logged-in user's wishlist
 * Called after user logs in
 */
export function migrateGuestWishlist(): void {
  try {
    const guestWishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (guestWishlist) {
      const clientToken = localStorage.getItem('oldcycle_token');
      if (clientToken) {
        const userKey = `${WISHLIST_PREFIX}${clientToken.substring(0, 16)}`;
        const existingWishlist = localStorage.getItem(userKey);
        
        if (existingWishlist) {
          // Merge guest and user wishlists
          const guestItems: string[] = JSON.parse(guestWishlist);
          const userItems: string[] = JSON.parse(existingWishlist);
          const merged = [...new Set([...userItems, ...guestItems])];
          localStorage.setItem(userKey, JSON.stringify(merged));
        } else {
          // Just copy guest wishlist to user
          localStorage.setItem(userKey, guestWishlist);
        }
        
        // Clear guest wishlist
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
    }
  } catch (error) {
    console.error('Error migrating guest wishlist:', error);
  }
}