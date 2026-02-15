// =====================================================
// OldCycle Type Definitions
// =====================================================

// Location Data Interface
export interface LocationData {
  latitude: number;
  longitude: number;
  isManual: boolean;
}

// User Profile Interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappSame: boolean;
  whatsappNumber?: string;
  authUserId?: string;
  clientToken: string;
  profilePic?: string;
  reliabilityScore?: number; // NEW: Reliability score (0-100, default 100)
  isVerified?: boolean; // NEW: Verified badge
  isTrusted?: boolean; // NEW: Trusted badge
  totalTasksCompleted?: number; // NEW: Count of completed tasks
  totalWishesGranted?: number; // NEW: Count of granted wishes
  badgeNotes?: string; // NEW: Admin notes for badges
  city?: string; // NEW: User's city
  area?: string; // NEW: User's area
  latitude?: number; // NEW: User's latitude
  longitude?: number; // NEW: User's longitude
  isBlocked?: boolean; // NEW: Is user blocked
  isSuspended?: boolean; // NEW: Is user suspended
  suspendedUntil?: string; // NEW: Suspension end date
  blockReason?: string; // NEW: Reason for blocking
  suspensionReason?: string; // NEW: Reason for suspension
}

// Auth Result Interface
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Category Interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string;
}

// Area Interface
export interface Area {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  latitude?: number; // Representative coordinate for area center
  longitude?: number; // Representative coordinate for area center
  sub_areas?: SubArea[]; // NEW: 3rd level locations
}

// Sub-Area Interface (NEW - 3rd Level)
export interface SubArea {
  id: string;
  area_id: string;
  name: string;
  slug: string;
  latitude: number; // Precise coordinates for navigation
  longitude: number; // Precise coordinates for navigation
  landmark?: string; // Optional landmark for easier identification
}

// City Interface
export interface City {
  id: string;
  name: string;
  areas?: Area[];
}

// User Activity Log Interface
export interface UserActivityLog {
  id: string;
  userId: string;
  activityType: 'reliability_update' | 'badge_change' | 'task_completed' | 'wish_granted' | 'listing_posted' | 'account_action';
  activityDescription: string;
  metadata?: any;
  createdAt: string;
}

// Wish Interface
export interface Wish {
  id: string;
  title: string;
  description: string;
  categoryId: string | number; // Support both string and number for compatibility
  categoryName: string;
  categoryEmoji: string;
  cityId: string;
  cityName: string;
  areaId: string;
  areaName: string;
  subAreaId?: string; // NEW: 3rd level location
  subAreaName?: string; // NEW: 3rd level location name
  budgetMin?: number; // Minimum budget (optional)
  budgetMax?: number; // Maximum budget (optional)
  urgency: 'asap' | 'today' | 'flexible'; // Urgency level
  phone: string;
  whatsapp?: string;
  hasWhatsapp: boolean;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  isHidden: boolean;
  latitude?: number; // For distance calculation
  longitude?: number; // For distance calculation
  distance?: number; // Calculated distance in km (road distance!)
  status?: 'open' | 'active' | 'negotiating' | 'accepted' | 'in_progress' | 'completed' | 'fulfilled' | 'expired'; // Wish status
  exactLocation?: string; // Google Maps deep link
  address?: string; // Full street address (building, floor, landmarks)
  helperCategory?: string; // Helper category for help-type wishes
  intentType?: string; // Intent type: buy/rent/find-used/find-service/find-help/find-deal/other
  acceptedBy?: string; // NEW: User ID who accepted
  acceptedAt?: string; // NEW: When wish was accepted
  acceptedPrice?: number; // NEW: Final negotiated price
}

// Create Wish Data Interface
export interface CreateWishData {
  title: string;
  description: string;
  categoryId: string | number; // Support both string and number for compatibility
  budgetMin?: number;
  budgetMax?: number;
  urgency: 'asap' | 'today' | 'flexible';
  cityId: string | null;
  areaId?: string | null; // Optional - can be empty for "All Locations"
  subAreaId?: string; // NEW: 3rd level location
  areaName?: string; // NEW: Area name for direct display
  cityName?: string; // NEW: City name for direct display
  latitude?: number;
  longitude?: number;
  phone: string;
  whatsapp: string;
  hasWhatsapp: boolean;
  exactLocation?: string;
  address?: string; // NEW: Full street address
}

// Task Status Type
export type TaskStatus = 'open' | 'negotiating' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'closed';

// Wish Status Type
export type WishStatus = 'open' | 'negotiating' | 'accepted' | 'in_progress' | 'granted' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji?: string;
  price?: number; // Task price (can be null if negotiable)
  budgetMin?: number; // Legacy field for backward compatibility
  budgetMax?: number; // Legacy field for backward compatibility
  isNegotiable?: boolean; // Whether price is negotiable
  cityId: string;
  cityName: string;
  areaId: string;
  areaName: string;
  subAreaId?: string; // NEW: 3rd level location
  subAreaName?: string; // NEW: 3rd level location name
  userId: string;
  userName: string;
  userAvatar?: string;
  status: TaskStatus;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Road distance in km
  completedAt?: string;
  exactLocation?: string;
  address?: string; // Full street address (building, floor, landmarks)
  timeWindow?: string;
  acceptedBy?: string;
  acceptedAt?: string;
  acceptedPrice?: number;
  userRatingCount?: number;
  userRating?: number;
  phone?: string;
  whatsapp?: string;
  hasWhatsapp?: boolean;
  helperId?: string;
  helperName?: string;
  helperAvatar?: string;
  helperCompleted?: boolean; // NEW: Helper confirmed completion
  creatorCompleted?: boolean; // NEW: Creator confirmed completion
}

// Create Task Data Interface
export interface CreateTaskData {
  title: string;
  description: string;
  categoryId: number;
  price?: number; // NEW: Task price (replaces budgetMin/budgetMax)
  isNegotiable?: boolean; // NEW: Whether price is negotiable
  budgetMin?: number; // Legacy field (deprecated)
  budgetMax?: number; // Legacy field (deprecated)
  timeWindow?: string; // NEW: 'asap' | 'today' | 'tomorrow'
  cityId: string | null;
  areaId?: string | null;
  subAreaId?: string; // NEW: 3rd level location
  exactLocation?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  hasWhatsapp?: boolean;
  address?: string; // Full street address
  areaName?: string; // Area name for direct display
  cityName?: string; // City name for direct display
}

// Listing Interface (Marketplace)
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string | number; // Support both string and number for compatibility
  categoryName: string;
  categoryEmoji: string;
  cityId: string;
  cityName: string;
  areaId: string;
  areaName: string;
  subAreaId?: string; // NEW: 3rd level location
  subAreaName?: string; // NEW: 3rd level location name
  phone: string;
  whatsapp?: string;
  hasWhatsapp: boolean;
  userId: string;
  userName: string;
  images: string[];
  createdAt: string;
  isHidden: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number; // Road distance in km
  exactLocation?: string;
  address?: string; // Full street address (building, floor, landmarks)
  owner_token?: string; // Owner token for listing management
  userAvatar?: string; // User avatar
}

// Task Negotiation Interface
export interface TaskNegotiation {
  id: string;
  taskId: string;
  helperId: string;
  helperName: string;
  helperAvatar?: string;
  offeredPrice: number;
  message?: string;
  round: 1 | 2;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
  respondedAt?: string;
}

// Task Rating Interface
export interface TaskRating {
  id: string;
  taskId: string;
  raterId: string;
  ratedId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Notification Interface
export interface Notification {
  id: string;
  user_id: string; // Using snake_case to match database
  type: 'task' | 'wish' | 'listing' | 'chat' | 'system' | 'admin' | 'broadcast';
  title: string;
  message: string;
  action_url?: string; // Using snake_case to match database
  related_type?: string; // Using snake_case to match database
  related_id?: string; // Using snake_case to match database
  is_read: boolean; // Using snake_case to match database
  created_at: string; // Using snake_case to match database
}

// =====================================================
// Push Notification Types
// =====================================================
// Re-export push notification types from push.ts
export type {
  PushPlatform,
  PushToken,
  SendPushNotificationRequest,
  SendPushNotificationResponse,
  PushNotificationStatus,
  PushNotificationPayload,
} from './push';