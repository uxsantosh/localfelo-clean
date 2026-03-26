// =====================================================
// Notification System Configuration
// Centralized settings for matching and notifications
// =====================================================

/**
 * Maximum notifications a user can receive per hour
 * Prevents notification spam
 */
export const MAX_NOTIFICATIONS_PER_HOUR = 10;

/**
 * Matching radius in kilometers
 * Users will only see matches within this distance
 */
export const MATCHING_RADIUS_KM = 5;

/**
 * Duplicate prevention window in minutes
 * Users won't receive duplicate notifications within this window
 */
export const DUPLICATE_WINDOW_MINUTES = 30;

/**
 * Rate limit window in minutes
 * Time window for counting notification rate limit
 */
export const RATE_LIMIT_WINDOW_MINUTES = 60;
