// Validation utilities for form inputs

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate price (positive number)
 * @param {string|number} price - Price to validate
 * @returns {boolean} True if valid
 */
export function validatePrice(price) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numPrice) && numPrice > 0;
}

/**
 * Validate required text field
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length (default 3)
 * @returns {boolean} True if valid
 */
export function validateRequired(text, minLength = 3) {
  return text && text.trim().length >= minLength;
}

/**
 * Validate listing title
 * @param {string} title - Title to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export function validateListingTitle(title) {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
  if (title.trim().length < 5) {
    return { isValid: false, error: 'Title must be at least 5 characters' };
  }
  if (title.trim().length > 100) {
    return { isValid: false, error: 'Title must be less than 100 characters' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validate listing description
 * @param {string} description - Description to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export function validateListingDescription(description) {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required' };
  }
  if (description.trim().length < 20) {
    return { isValid: false, error: 'Description must be at least 20 characters' };
  }
  if (description.trim().length > 1000) {
    return { isValid: false, error: 'Description must be less than 1000 characters' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export function validateImageFile(file) {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { isValid: true, error: '' };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}
