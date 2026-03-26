/**
 * Distance calculation utilities
 * Uses Haversine formula for accurate distance calculation
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Add distance to items (listings, tasks, wishes) based on user location
 * @param items - Array of items with latitude/longitude
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @returns Items with distance property added
 */
export function addDistanceToItems<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLat?: number,
  userLon?: number
): (T & { distance?: number })[] {
  if (!userLat || !userLon) {
    console.log('⚠️ [Distance] No user location, cannot calculate distances');
    return items;
  }

  return items.map(item => {
    if (!item.latitude || !item.longitude) {
      return { ...item, distance: undefined };
    }

    const distance = calculateDistance(
      userLat,
      userLon,
      item.latitude,
      item.longitude
    );

    return { ...item, distance };
  });
}

/**
 * Sort items by distance (nearest first)
 * Items without distance are placed at the end
 */
export function sortByDistance<T extends { distance?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // Items without distance go to the end
    if (a.distance === undefined && b.distance === undefined) return 0;
    if (a.distance === undefined) return 1;
    if (b.distance === undefined) return -1;
    
    // Sort by distance ascending (nearest first)
    return a.distance - b.distance;
  });
}

/**
 * Filter items by area
 * @param items - Array of items
 * @param areaId - Area ID to filter by
 * @param areaName - Area name to filter by (fallback)
 * @returns Filtered items
 */
export function filterByArea<T extends { areaId?: string; area?: string }>(
  items: T[],
  areaId?: string,
  areaName?: string
): T[] {
  if (!areaId && !areaName) {
    return items;
  }

  return items.filter(item => {
    if (areaId && item.areaId === areaId) return true;
    if (areaName && item.area === areaName) return true;
    return false;
  });
}

/**
 * Format distance for display
 * @param distance - Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "350 m")
 */
export function formatDistance(distance?: number): string {
  if (distance === undefined) return '';
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  
  return `${distance.toFixed(1)} km`;
}

/**
 * Check if item is within radius
 * @param distance - Distance in km
 * @param radiusKm - Radius in km
 * @returns true if within radius
 */
export function isWithinRadius(distance?: number, radiusKm: number = 10): boolean {
  if (distance === undefined) return false;
  return distance <= radiusKm;
}
