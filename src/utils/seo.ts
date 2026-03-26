/**
 * Dynamic SEO Utility for LocalFelo
 * Updates all meta tags, Open Graph, Twitter Cards, and canonical URLs per route
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

/**
 * Update all SEO meta tags dynamically
 */
export function updateSEO(config: SEOConfig): void {
  const {
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    canonicalUrl,
    noindex = false,
  } = config;

  // Update document title
  document.title = title;

  // Update or create meta tags
  updateMetaTag('name', 'description', description);
  
  if (keywords) {
    updateMetaTag('name', 'keywords', keywords);
  }

  // Robots
  updateMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

  // Open Graph tags
  updateMetaTag('property', 'og:title', ogTitle || title);
  updateMetaTag('property', 'og:description', ogDescription || description);
  updateMetaTag('property', 'og:url', canonicalUrl || window.location.href);
  
  if (ogImage) {
    updateMetaTag('property', 'og:image', ogImage);
  }

  // Twitter Card tags
  updateMetaTag('name', 'twitter:title', twitterTitle || ogTitle || title);
  updateMetaTag('name', 'twitter:description', twitterDescription || ogDescription || description);
  updateMetaTag('name', 'twitter:url', canonicalUrl || window.location.href);
  
  if (twitterImage) {
    updateMetaTag('name', 'twitter:image', twitterImage);
  }

  // Canonical URL
  updateCanonicalLink(canonicalUrl || window.location.href);
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(attribute: 'name' | 'property', attributeValue: string, content: string): void {
  let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }
  
  element.content = content;
}

/**
 * Update canonical link
 */
function updateCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  
  link.href = url;
}

/**
 * Get SEO config for each screen/route
 */
export function getSEOConfig(screen: string, params?: Record<string, any>): SEOConfig {
  const baseUrl = window.location.origin;
  
  const configs: Record<string, SEOConfig> = {
    home: {
      title: 'LocalFelo - India\'s Hyperlocal Marketplace | Buy, Sell & Get Tasks Done Nearby',
      description: 'LocalFelo is India\'s leading hyperlocal marketplace. Buy & sell locally, post wishes for products you need, and find nearby tasks & services. Connect with your community for safe, direct peer-to-peer transactions.',
      keywords: 'LocalFelo, hyperlocal marketplace, local marketplace India, nearby marketplace, community marketplace, buy sell locally, C2C marketplace, peer to peer, local services, task marketplace, gig platform India',
      canonicalUrl: `${baseUrl}/`,
      ogImage: `${baseUrl}/og-image.png`,
      twitterImage: `${baseUrl}/twitter-image.png`,
    },
    
    marketplace: {
      title: 'Marketplace - Buy & Sell Locally | LocalFelo',
      description: 'Browse products for sale in your area on LocalFelo. From electronics to furniture, find great deals nearby. Safe peer-to-peer transactions with no middleman fees. List your items for free!',
      keywords: 'local marketplace, buy sell nearby, classifieds India, local products, second hand items, nearby deals, peer to peer marketplace, local classifieds',
      canonicalUrl: `${baseUrl}/marketplace`,
      ogTitle: 'LocalFelo Marketplace - Buy & Sell Products Nearby',
      ogDescription: 'Discover great deals on products in your neighborhood. Buy directly from local sellers with no fees.',
    },
    
    tasks: {
      title: 'Tasks & Services - Find Local Help | LocalFelo',
      description: 'Find local helpers for tasks and services near you on LocalFelo. From home repairs to delivery, connect with skilled people in your area. Post tasks or offer your services to earn locally.',
      keywords: 'local tasks, nearby services, find help, local helpers, task marketplace, gig work India, local services, home services, task platform, local gigs',
      canonicalUrl: `${baseUrl}/tasks`,
      ogTitle: 'LocalFelo Tasks - Get Help from Local Experts',
      ogDescription: 'Need help with something? Find trusted local helpers for any task in your neighborhood.',
    },
    
    wishes: {
      title: 'Wishes - Post What You Need | LocalFelo',
      description: 'Post your wishes for products you want to buy on LocalFelo. Let local sellers come to you with offers. Find rare items, specific products, or services you need in your area.',
      keywords: 'wanted items, looking to buy, post wishes, find products, buyer requests, product wishes, local buying, wanted ads India',
      canonicalUrl: `${baseUrl}/wishes`,
      ogTitle: 'LocalFelo Wishes - Post What You\'re Looking For',
      ogDescription: 'Want something specific? Post a wish and let local sellers reach out to you with offers.',
    },
    
    create: {
      title: 'Create Listing - Sell Your Product | LocalFelo',
      description: 'List your product for sale on LocalFelo. Create a free listing, add photos, set your price, and connect with local buyers. No middleman fees, direct transactions only.',
      keywords: 'create listing, sell product, post ad, list item for sale, free classifieds, sell locally',
      canonicalUrl: `${baseUrl}/create`,
      noindex: true, // Forms typically shouldn't be indexed
    },
    
    'create-task': {
      title: 'Post a Task - Get Local Help | LocalFelo',
      description: 'Post a task on LocalFelo and find local helpers. Describe what you need, set your budget, and connect with skilled people nearby who can help.',
      keywords: 'post task, find helper, get help, hire locally, task posting, local services',
      canonicalUrl: `${baseUrl}/create-task`,
      noindex: true,
    },
    
    'create-wish': {
      title: 'Post a Wish - Find What You Need | LocalFelo',
      description: 'Post what you\'re looking for on LocalFelo. Describe the product or service you need, and let local sellers reach out with offers.',
      keywords: 'post wish, wanted ad, looking to buy, find product, buyer request',
      canonicalUrl: `${baseUrl}/create-wish`,
      noindex: true,
    },
    
    profile: {
      title: 'My Profile | LocalFelo',
      description: 'Manage your LocalFelo profile, listings, tasks, and wishes. View your activity and ratings in the community.',
      canonicalUrl: `${baseUrl}/profile`,
      noindex: true, // User profiles should not be indexed
    },
    
    chat: {
      title: 'Messages | LocalFelo',
      description: 'View and manage your messages with other LocalFelo users.',
      canonicalUrl: `${baseUrl}/chat`,
      noindex: true, // Private messages shouldn't be indexed
    },
    
    notifications: {
      title: 'Notifications | LocalFelo',
      description: 'View your LocalFelo notifications and stay updated on your listings, tasks, and wishes.',
      canonicalUrl: `${baseUrl}/notifications`,
      noindex: true,
    },
    
    about: {
      title: 'About LocalFelo - India\'s Trusted Hyperlocal Platform',
      description: 'Learn about LocalFelo, India\'s hyperlocal marketplace connecting communities for buying, selling, tasks, and services. Our mission is to empower local commerce and build trust in neighborhoods.',
      keywords: 'about LocalFelo, hyperlocal platform, local marketplace mission, community marketplace, about us',
      canonicalUrl: `${baseUrl}/about`,
    },
    
    'how-it-works': {
      title: 'How LocalFelo Works - Simple Guide to Get Started',
      description: 'Learn how to use LocalFelo. Step-by-step guide to buying, selling, posting tasks, and finding services in your local area. Safe, simple, and free to use.',
      keywords: 'how to use LocalFelo, getting started, user guide, how it works, LocalFelo tutorial',
      canonicalUrl: `${baseUrl}/how-it-works`,
    },
    
    safety: {
      title: 'Safety Guidelines - Stay Safe on LocalFelo',
      description: 'LocalFelo safety tips and guidelines for secure transactions. Learn how to verify users, meet safely, avoid scams, and protect yourself when buying, selling, or hiring locally.',
      keywords: 'LocalFelo safety, safety tips, secure transactions, avoid scams, safe trading, user safety',
      canonicalUrl: `${baseUrl}/safety`,
    },
    
    terms: {
      title: 'Terms of Service - LocalFelo',
      description: 'Read LocalFelo\'s Terms of Service. Understand your rights and responsibilities when using our hyperlocal marketplace platform.',
      keywords: 'terms of service, user agreement, terms and conditions, legal terms',
      canonicalUrl: `${baseUrl}/terms`,
    },
    
    privacy: {
      title: 'Privacy Policy - LocalFelo',
      description: 'LocalFelo Privacy Policy. Learn how we collect, use, and protect your personal information on our platform.',
      keywords: 'privacy policy, data protection, user privacy, personal information',
      canonicalUrl: `${baseUrl}/privacy`,
    },
    
    faq: {
      title: 'Frequently Asked Questions - LocalFelo Help',
      description: 'Find answers to common questions about using LocalFelo. Get help with listings, tasks, wishes, payments, safety, and more.',
      keywords: 'FAQ, help, questions, support, LocalFelo help center, user guide',
      canonicalUrl: `${baseUrl}/faq`,
    },
    
    prohibited: {
      title: 'Prohibited Items - What You Cannot Sell | LocalFelo',
      description: 'List of prohibited and restricted items on LocalFelo. Learn what products and services cannot be listed on our platform for safety and legal compliance.',
      keywords: 'prohibited items, restricted products, banned items, prohibited list, not allowed',
      canonicalUrl: `${baseUrl}/prohibited`,
    },
    
    contact: {
      title: 'Contact Us - Get in Touch with LocalFelo',
      description: 'Contact LocalFelo support team. Get help with your account, report issues, or send us your feedback and suggestions.',
      keywords: 'contact LocalFelo, support, help, customer service, get in touch',
      canonicalUrl: `${baseUrl}/contact`,
    },
    
    admin: {
      title: 'Admin Dashboard | LocalFelo',
      description: 'LocalFelo admin panel for platform management.',
      canonicalUrl: `${baseUrl}/admin`,
      noindex: true, // Admin pages should never be indexed
    },
  };

  // Dynamic pages
  if (screen === 'listing' && params?.listingId) {
    return {
      title: params.listingTitle ? `${params.listingTitle} - LocalFelo Marketplace` : 'Product Details | LocalFelo',
      description: params.listingDescription 
        ? `${params.listingDescription.substring(0, 150)}... View details, price, and seller info on LocalFelo.`
        : 'View product details, photos, price, and connect with the seller on LocalFelo marketplace.',
      keywords: 'product details, local product, buy locally, marketplace listing',
      canonicalUrl: `${baseUrl}/listing/${params.listingId}`,
      ogTitle: params.listingTitle || 'Product on LocalFelo',
      ogDescription: params.listingDescription?.substring(0, 200),
      ogImage: params.listingImage || `${baseUrl}/og-image.png`,
    };
  }

  if (screen === 'task-detail' && params?.taskId) {
    return {
      title: params.taskTitle ? `${params.taskTitle} - LocalFelo Tasks` : 'Task Details | LocalFelo',
      description: params.taskDescription
        ? `${params.taskDescription.substring(0, 150)}... View task details, budget, and helper info on LocalFelo.`
        : 'View task details, requirements, budget, and connect with the task poster on LocalFelo.',
      keywords: 'task details, local task, local service, find helper',
      canonicalUrl: `${baseUrl}/task-detail?id=${params.taskId}`,
      ogTitle: params.taskTitle || 'Task on LocalFelo',
      ogDescription: params.taskDescription?.substring(0, 200),
    };
  }

  if (screen === 'wish-detail' && params?.wishId) {
    return {
      title: params.wishTitle ? `${params.wishTitle} - LocalFelo Wishes` : 'Wish Details | LocalFelo',
      description: params.wishDescription
        ? `${params.wishDescription.substring(0, 150)}... View what someone is looking for on LocalFelo.`
        : 'View wish details and connect with the buyer on LocalFelo.',
      keywords: 'wish details, wanted item, buyer request, local buyer',
      canonicalUrl: `${baseUrl}/wish-detail?id=${params.wishId}`,
      ogTitle: params.wishTitle || 'Wish on LocalFelo',
      ogDescription: params.wishDescription?.substring(0, 200),
    };
  }

  // Professionals Pages
  if (screen === 'professionals') {
    return {
      title: 'Find Professionals Near You | LocalFelo',
      description: 'Discover verified professionals and service providers in your area on LocalFelo. From accountants to plumbers, find trusted experts for all your needs.',
      keywords: 'local professionals, service providers, verified experts, local services, professional directory India, find professionals nearby',
      canonicalUrl: `${baseUrl}/professionals`,
      ogTitle: 'LocalFelo Professionals - Find Trusted Experts Nearby',
      ogDescription: 'Connect with verified professionals and service providers in your local area.',
    };
  }

  if (screen === 'professionals-listing' && params?.categoryName) {
    return {
      title: `${params.categoryName} Professionals Near You | LocalFelo`,
      description: `Find ${params.categoryName} professionals in your area. Browse verified service providers, compare services and pricing, and connect directly via WhatsApp.`,
      keywords: `${params.categoryName.toLowerCase()}, local ${params.categoryName.toLowerCase()}, ${params.categoryName.toLowerCase()} near me, professional services`,
      canonicalUrl: `${baseUrl}/professionals/${params.categoryId}/${params.city}`,
      ogTitle: `${params.categoryName} Professionals in ${params.city}`,
      ogDescription: `Find verified ${params.categoryName} professionals in ${params.city} on LocalFelo.`,
    };
  }

  if (screen === 'professional-detail' && params?.professionalSlug) {
    return {
      title: params.professionalName ? `${params.professionalName} - Professional on LocalFelo` : 'Professional Profile | LocalFelo',
      description: params.professionalDescription
        ? `${params.professionalDescription.substring(0, 150)}... View profile and services on LocalFelo.`
        : 'View professional profile, services, and contact information on LocalFelo.',
      keywords: 'professional profile, service provider, local expert, professional services',
      canonicalUrl: `${baseUrl}/professional/${params.professionalSlug}`,
      ogTitle: params.professionalName || 'Professional on LocalFelo',
      ogDescription: params.professionalDescription?.substring(0, 200),
      ogImage: params.professionalImage,
    };
  }

  if (screen === 'register-professional') {
    return {
      title: 'Register as Professional | LocalFelo',
      description: 'Register your professional profile on LocalFelo and get discovered by thousands of potential customers in your area. List your services for free.',
      keywords: 'register professional, become service provider, list services, professional registration',
      canonicalUrl: `${baseUrl}/register-professional`,
      noindex: true,
    };
  }

  // Return config for the screen or fallback to home
  return configs[screen] || configs.home;
}