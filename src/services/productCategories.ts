// =====================================================
// PRODUCT CATEGORIES FOR SHOPS, MARKETPLACE & WISHES (PRODUCT FLOW)
// =====================================================
// CRITICAL: DO NOT USE FOR SERVICES (Tasks/Professionals)
// This is ONLY for physical products

export interface ProductSubcategory {
  id: string;
  name: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  emoji: string;
  subcategories: ProductSubcategory[];
}

// Type aliases for compatibility with different naming conventions
export type ProductMainCategory = ProductCategory;

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'mobiles-accessories',
    name: 'Mobiles & Accessories',
    emoji: '📱',
    subcategories: [
      { id: 'smartphones', name: 'Smartphones' },
      { id: 'feature-phones', name: 'Feature phones' },
      { id: 'chargers-cables', name: 'Chargers & cables' },
      { id: 'earphones-headphones', name: 'Earphones & headphones' },
      { id: 'smartwatches', name: 'Smartwatches' },
      { id: 'mobile-parts', name: 'Mobile parts' },
      { id: 'mobile-other', name: 'Other' },
    ],
  },
  {
    id: 'laptops-computers',
    name: 'Laptops & Computers',
    emoji: '💻',
    subcategories: [
      { id: 'laptops', name: 'Laptops' },
      { id: 'desktops', name: 'Desktops' },
      { id: 'computer-accessories', name: 'Accessories' },
      { id: 'printers-scanners', name: 'Printers & scanners' },
      { id: 'storage-devices', name: 'Storage devices' },
      { id: 'networking-devices', name: 'Networking devices' },
      { id: 'computer-other', name: 'Other' },
    ],
  },
  {
    id: 'electronics-gadgets',
    name: 'Electronics & Gadgets',
    emoji: '📺',
    subcategories: [
      { id: 'televisions', name: 'Televisions' },
      { id: 'speakers-audio', name: 'Speakers & audio' },
      { id: 'cameras', name: 'Cameras' },
      { id: 'gaming-consoles', name: 'Gaming consoles' },
      { id: 'smart-devices', name: 'Smart devices' },
      { id: 'electronics-other', name: 'Other' },
    ],
  },
  {
    id: 'home-appliances',
    name: 'Home Appliances',
    emoji: '🏠',
    subcategories: [
      { id: 'refrigerators', name: 'Refrigerators' },
      { id: 'washing-machines', name: 'Washing machines' },
      { id: 'air-conditioners', name: 'Air conditioners' },
      { id: 'microwave-ovens', name: 'Microwave ovens' },
      { id: 'water-purifiers', name: 'Water purifiers' },
      { id: 'kitchen-appliances', name: 'Kitchen appliances' },
      { id: 'geysers-heaters', name: 'Geysers & heaters' },
      { id: 'appliances-other', name: 'Other' },
    ],
  },
  {
    id: 'furniture',
    name: 'Furniture',
    emoji: '🛋️',
    subcategories: [
      { id: 'beds-mattresses', name: 'Beds & mattresses' },
      { id: 'sofas-chairs', name: 'Sofas & chairs' },
      { id: 'tables-desks', name: 'Tables & desks' },
      { id: 'wardrobes-storage', name: 'Wardrobes & storage' },
      { id: 'office-furniture', name: 'Office furniture' },
      { id: 'furniture-other', name: 'Other' },
    ],
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    emoji: '🍳',
    subcategories: [
      { id: 'cookware', name: 'Cookware' },
      { id: 'home-decor', name: 'Home decor' },
      { id: 'lighting', name: 'Lighting' },
      { id: 'curtains-furnishings', name: 'Curtains & furnishings' },
      { id: 'storage-organizers', name: 'Storage & organizers' },
      { id: 'home-kitchen-other', name: 'Other' },
    ],
  },
  {
    id: 'fashion-clothing',
    name: 'Fashion & Clothing',
    emoji: '👕',
    subcategories: [
      { id: 'mens-clothing', name: "Men's clothing" },
      { id: 'womens-clothing', name: "Women's clothing" },
      { id: 'kids-clothing', name: 'Kids clothing' },
      { id: 'footwear', name: 'Footwear' },
      { id: 'bags-wallets', name: 'Bags & wallets' },
      { id: 'fashion-accessories', name: 'Accessories' },
      { id: 'fashion-other', name: 'Other' },
    ],
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    emoji: '💄',
    subcategories: [
      { id: 'skincare', name: 'Skincare' },
      { id: 'hair-care', name: 'Hair care' },
      { id: 'makeup', name: 'Makeup' },
      { id: 'grooming-tools', name: 'Grooming tools' },
      { id: 'perfumes', name: 'Perfumes' },
      { id: 'beauty-other', name: 'Other' },
    ],
  },
  {
    id: 'health-fitness',
    name: 'Health & Fitness',
    emoji: '💪',
    subcategories: [
      { id: 'fitness-equipment', name: 'Fitness equipment' },
      { id: 'gym-accessories', name: 'Gym accessories' },
      { id: 'supplements', name: 'Supplements' },
      { id: 'medical-devices', name: 'Medical devices' },
      { id: 'health-other', name: 'Other' },
    ],
  },
  {
    id: 'books-stationery',
    name: 'Books & Stationery',
    emoji: '📚',
    subcategories: [
      { id: 'academic-books', name: 'Academic books' },
      { id: 'exam-prep-books', name: 'Exam preparation books' },
      { id: 'novels', name: 'Novels' },
      { id: 'stationery', name: 'Stationery' },
      { id: 'books-other', name: 'Other' },
    ],
  },
  {
    id: 'sports-outdoors',
    name: 'Sports & Outdoors',
    emoji: '⚽',
    subcategories: [
      { id: 'sports-equipment', name: 'Sports equipment' },
      { id: 'outdoor-gear', name: 'Outdoor gear' },
      { id: 'cycles', name: 'Cycles' },
      { id: 'fitness-gear', name: 'Fitness gear' },
      { id: 'sports-other', name: 'Other' },
    ],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    emoji: '🚗',
    subcategories: [
      { id: 'cars', name: 'Cars' },
      { id: 'bikes-scooters', name: 'Bikes & scooters' },
      { id: 'electric-vehicles', name: 'Electric vehicles' },
      { id: 'vehicle-accessories', name: 'Accessories' },
      { id: 'spare-parts', name: 'Spare parts' },
      { id: 'vehicles-other', name: 'Other' },
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    emoji: '🏘️',
    subcategories: [
      { id: 'flats-for-sale', name: 'Flats for sale' },
      { id: 'houses-for-sale', name: 'Houses for sale' },
      { id: 'plots-land', name: 'Plots / land' },
      { id: 'commercial-property', name: 'Commercial property' },
      { id: 'real-estate-other', name: 'Other' },
    ],
  },
  {
    id: 'rentals',
    name: 'Rentals',
    emoji: '🔄',
    subcategories: [
      { id: 'electronics-on-rent', name: 'Electronics on rent' },
      { id: 'furniture-on-rent', name: 'Furniture on rent' },
      { id: 'vehicles-on-rent', name: 'Vehicles on rent' },
      { id: 'event-items', name: 'Event items' },
      { id: 'rentals-other', name: 'Other' },
    ],
  },
  {
    id: 'pet-supplies',
    name: 'Pet Supplies',
    emoji: '🐾',
    subcategories: [
      { id: 'pet-food', name: 'Pet food' },
      { id: 'pet-accessories', name: 'Accessories' },
      { id: 'beds-cages', name: 'Beds & cages' },
      { id: 'grooming-products', name: 'Grooming products' },
      { id: 'pet-other', name: 'Other' },
    ],
  },
  {
    id: 'baby-kids',
    name: 'Baby & Kids',
    emoji: '👶',
    subcategories: [
      { id: 'baby-products', name: 'Baby products' },
      { id: 'toys', name: 'Toys' },
      { id: 'school-supplies', name: 'School supplies' },
      { id: 'baby-kids-other', name: 'Other' },
    ],
  },
  {
    id: 'industrial-business',
    name: 'Industrial & Business',
    emoji: '🏭',
    subcategories: [
      { id: 'machinery', name: 'Machinery' },
      { id: 'tools', name: 'Tools' },
      { id: 'shop-supplies', name: 'Shop supplies' },
      { id: 'office-supplies', name: 'Office supplies' },
      { id: 'industrial-other', name: 'Other' },
    ],
  },
  {
    id: 'food-grocery',
    name: 'Food & Grocery',
    emoji: '🛒',
    subcategories: [
      { id: 'fresh-groceries', name: 'Fresh groceries' },
      { id: 'packaged-food', name: 'Packaged food' },
      { id: 'homemade-food', name: 'Homemade food' },
      { id: 'beverages', name: 'Beverages' },
      { id: 'food-other', name: 'Other' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    emoji: '📦',
    subcategories: [
      { id: 'other-items', name: 'Other items' },
    ],
  },
];

/**
 * Get the full category path for display
 * @param categoryId - Main category ID
 * @param subcategoryId - Subcategory ID
 * @returns Promise<string> - Formatted path like "Electronics > Mobile Phones"
 */
export async function getProductCategoryPath(
  categoryId: string,
  subcategoryId: string
): Promise<string> {
  const category = PRODUCT_CATEGORIES.find((cat) => cat.id === categoryId);
  if (!category) return '';

  const subcategory = category.subcategories.find((sub) => sub.id === subcategoryId);
  if (!subcategory) return `${category.emoji} ${category.name}`;

  return `${category.emoji} ${category.name} > ${subcategory.name}`;
}

/**
 * Get all main product categories
 * @returns Promise<ProductMainCategory[]> - List of all main categories
 */
export async function getMainProductCategories(): Promise<ProductMainCategory[]> {
  return Promise.resolve(PRODUCT_CATEGORIES);
}

/**
 * Get subcategories for a specific main category
 * @param categoryId - Main category ID
 * @returns Promise<ProductSubcategory[]> - List of subcategories
 */
export async function getProductSubcategories(
  categoryId: string
): Promise<ProductSubcategory[]> {
  const category = PRODUCT_CATEGORIES.find((cat) => cat.id === categoryId);
  return Promise.resolve(category?.subcategories || []);
}

/**
 * Get a specific category by ID
 * @param categoryId - Main category ID
 * @returns ProductCategory | undefined
 */
export function getProductCategoryById(categoryId: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find((cat) => cat.id === categoryId);
}

/**
 * Get a specific subcategory by category ID and subcategory ID
 * @param categoryId - Main category ID
 * @param subcategoryId - Subcategory ID
 * @returns ProductSubcategory | undefined
 */
export function getProductSubcategoryById(
  categoryId: string,
  subcategoryId: string
): ProductSubcategory | undefined {
  const category = PRODUCT_CATEGORIES.find((cat) => cat.id === categoryId);
  return category?.subcategories.find((sub) => sub.id === subcategoryId);
}
