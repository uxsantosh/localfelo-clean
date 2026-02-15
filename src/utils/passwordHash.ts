// =====================================================
// Password Hashing Utilities
// Simple hash for client-side (not production-grade encryption)
// =====================================================

/**
 * Simple hash function for password storage
 * NOTE: In production, use proper backend hashing (bcrypt, argon2)
 */
export async function hashPassword(password: string): Promise<string> {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Get password hint (show last 2 characters only)
 */
export function getPasswordHint(password: string): string {
  if (password.length <= 2) {
    return '*'.repeat(password.length);
  }
  const maskedPart = '*'.repeat(password.length - 2);
  const visiblePart = password.slice(-2);
  return maskedPart + visiblePart;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 4) {
    return { valid: false, message: 'Password must be at least 4 characters' };
  }
  if (password.length > 50) {
    return { valid: false, message: 'Password is too long (max 50 characters)' };
  }
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): boolean {
  // Remove spaces, dashes, and +91
  const cleaned = phone.replace(/[\s\-+]/g, '');
  // Check if it's 10 digits (after removing country code)
  const phoneRegex = /^(91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Format phone number for storage (remove formatting)
 */
export function formatPhoneForStorage(phone: string): string {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  // Remove leading 91 if present
  return cleaned.startsWith('91') ? cleaned.slice(2) : cleaned;
}
