// TypeScript declarations for listings.js

export interface ListingFilters {
  categorySlug?: string;
  city?: string;
  areaSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  cursor?: string;
  limit?: number;
  userLat?: number;
  userLon?: number;
}

export interface ListingsResult {
  data: any[];
  nextCursor: string | null;
}

export function getListings(filters?: ListingFilters): Promise<ListingsResult>;

export function getAllListings(): Promise<any[]>;

export function getListingById(id: string, userLat?: number, userLon?: number): Promise<any>;

export function createListing(payload: any): Promise<any>;

export function editListing(listingId: string, payload: any): Promise<any>;

export function uploadListingImages(files: File[], listingId: string): Promise<string[]>;

export function getMyListings(clientToken: string): Promise<any[]>;

export function getListingsByIds(listingIds: string[]): Promise<any[]>;

export function deleteListing(listingId: string, clientToken: string): Promise<void>;

export function toggleListingVisibility(listingId: string, isActive: boolean, ownerToken?: string): Promise<void>;

export function updateListing(listingId: string, updates: any): Promise<any>;

export function deleteListingImages(listingId: string, imageUrls: string[]): Promise<void>;
