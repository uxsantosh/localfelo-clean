// Formatting utilities for display

/**
 * Format price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price (e.g., "₹75,000")
 */
export function formatPrice(price) {
  if (!price || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone (e.g., "98765 43210")
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (e.g., "22 Nov 2024")
 */
export function formatDate(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateObj);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate WhatsApp link with pre-filled message
 * @param {string} phone - Phone number (without country code)
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp URL
 */
export function generateWhatsAppLink(phone, message = '') {
  const cleaned = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${cleaned}${message ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Generate phone call link
 * @param {string} phone - Phone number
 * @returns {string} Tel URL
 */
export function generatePhoneLink(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return `tel:+91${cleaned}`;
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "RK" for "Rajesh Kumar")
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Slugify text for URLs
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
