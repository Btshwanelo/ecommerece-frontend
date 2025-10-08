// User types
export interface User {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  };
  isEmailVerified: boolean;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductPricing {
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency: string;
}

export interface ProductInventory {
  trackInventory: boolean;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'backorder';
  lowStockThreshold: number;
  allowBackorders: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: string;
}

export interface ProductSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  categoryId: Category;
  brandId?: Brand;
  genderId?: Attribute;
  seasonId?: Attribute;
  styleId?: Attribute;
  materialIds: Attribute[];
  patternId?: Attribute;
  shoeHeightId?: Attribute;
  fitId?: Attribute;
  occasionIds: Attribute[];
  collarTypeId?: Attribute;
  productType: 'simple' | 'variable' | 'grouped' | 'virtual' | 'downloadable';
  pricing: ProductPricing;
  inventory: ProductInventory;
  dimensions?: ProductDimensions;
  images: ProductImage[];
  seo?: ProductSEO;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'hidden';
  views: number;
  salesCount: number;
  rating: ProductRating;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Product Variant types
export interface ProductVariant {
  _id: string;
  productId: string;
  sku: string;
  colorId?: Attribute;
  sizeId?: Attribute;
  genderId?: Attribute;
  pricing: ProductPricing;
  inventory: {
    stockQuantity: number;
    stockStatus: 'in_stock' | 'out_of_stock' | 'backorder';
  };
  images: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string | Category;
  level: number;
  path: string;
  isActive: boolean;
  sortOrder: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Attribute types
export interface Attribute {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Color extends Attribute {
  hexCode: string;
  rgbCode: string;
}

export interface Size extends Attribute {
  category: string;
  numericValue?: number;
}

export interface Material extends Attribute {
  composition: {
    material: string;
    percentage: number;
  }[];
}

export interface Pattern extends Attribute {
  patternImage?: string;
}

export interface Style extends Attribute {
  categoryId?: string;
}

export interface ShoeHeight extends Attribute {
  categoryId?: string;
}

export interface Fit extends Attribute {
  categoryId?: string;
}

export interface Occasion extends Attribute {}

export interface CollarType extends Attribute {
  categoryId?: string;
}

export interface Gender extends Attribute {}

export interface Season extends Attribute {}

// Brand types
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  countryOrigin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface CartItem {
  _id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  user?: string;
  guestId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  coupon?: {
    code: string;
    discount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface OrderItem {
  _id: string;
  productId: Product;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderTotals {
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
}

export interface OrderPayment {
  method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface OrderShipping {
  method: string;
  carrier: string;
  estimatedDelivery: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  items: OrderItem[];
  totals: OrderTotals;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  payment: OrderPayment;
  shipping: OrderShipping;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery types
export interface DeliveryOption {
  _id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  regions: string[];
  weightLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Address types
export interface Address {
  _id: string;
  user: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter types
export interface Filter {
  _id: string;
  name: string;
  slug: string;
  type: 'select' | 'multi-select';
  options: {
    label: string;
    value: string;
    count: number;
  }[];
  filterGroup: string;
  isGlobal: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface FilterGroup {
  _id: string;
  name: string;
  filters: Filter[];
  isActive: boolean;
}

// Search and filter types
export interface OrderFilters {
  page?: number;
  limit?: number;
  sort?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | string;
  userId?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  genderId?: string;
  seasonId?: string;
  styleId?: string;
  patternId?: string;
  shoeHeightId?: string;
  fitId?: string;
  collarTypeId?: string;
  materialIds?: string[];
  occasionIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'backorder';
  minStock?: number;
  maxStock?: number;
  productType?: 'simple' | 'variable' | 'grouped' | 'virtual' | 'downloadable';
  minRating?: number;
  minSales?: number;
  minViews?: number;
  createdAfter?: string;
  createdBefore?: string;
  tags?: string[];
  status?: ('draft' | 'published' | 'archived')[];
  visibility?: 'public' | 'private' | 'hidden';
  search?: string;
  sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'trending' | 'relevance';
  page?: number;
  limit?: number;
}

// V2 API Response types
export interface V2ApiResponse<T> {
  success: boolean;
  data?: T;
  product?: T; // For product responses
  order?: T; // For order responses
  error?: string;
  message?: string;
}

// Flexible API response for attributes (handles different property names)
export interface V2AttributeResponse<T> {
  success: boolean;
  data?: T;
  color?: T; // For color responses
  size?: T; // For size responses
  material?: T; // For material responses
  gender?: T; // For gender responses
  season?: T; // For season responses
  style?: T; // For style responses
  pattern?: T; // For pattern responses
  shoeHeight?: T; // For shoe height responses
  fit?: T; // For fit responses
  occasion?: T; // For occasion responses
  collarType?: T; // For collar type responses
  error?: string;
  message?: string;
}

export interface V2PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
  error?: string;
}

export interface V2ProductResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  pages: number;
  filters?: {
    brands: Brand[];
    colors: Color[];
    sizes: Size[];
    materials: Material[];
    genders: Gender[];
    seasons: Season[];
    styles: Style[];
    patterns: Pattern[];
    shoeHeights: ShoeHeight[];
    fits: Fit[];
    occasions: Occasion[];
    collarTypes: CollarType[];
    priceRange: {
      minPrice: number;
      maxPrice: number;
      avgPrice: number;
    };
    ratingDistribution: any[];
  };
}

export interface V2CategoryTreeResponse {
  success: boolean;
  categories: Category[];
}

export interface V2AttributeResponse<T> {
  success: boolean;
  attributes: T[];
}

export interface V2AllAttributesResponse {
  success: boolean;
  attributes: {
    colors: Color[];
    sizes: Size[];
    materials: Material[];
    genders: Gender[];
    seasons: Season[];
    styles: Style[];
    patterns: Pattern[];
    shoeHeights: ShoeHeight[];
    fits: Fit[];
    occasions: Occasion[];
    collarTypes: CollarType[];
  };
}

// Store Configuration Types
export interface StoreConfig {
  // Store Identity
  store: {
    name: string;
    tagline?: string;
    description?: string;
    website?: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  // Branding & Logos
  branding: {
    logo: {
      primary: string; // Main logo URL
      secondary?: string; // Alternative logo
      favicon?: string; // Favicon URL
      mobile?: string; // Mobile-optimized logo
    };
    colors: {
      primary: string; // Main brand color
      secondary: string; // Secondary brand color
      accent: string; // Accent color
      background: string; // Background color
      surface: string; // Surface/card background
      text: {
        primary: string; // Primary text color
        secondary: string; // Secondary text color
        muted: string; // Muted text color
      };
      border: string; // Border color
      success: string; // Success state color
      warning: string; // Warning state color
      error: string; // Error state color
    };
    fonts: {
      primary: string; // Primary font family
      secondary?: string; // Secondary font family
    };
  };

  // Currency & Pricing
  currency: {
    code: string; // ISO currency code (e.g., 'USD', 'ZAR', 'EUR')
    symbol: string; // Currency symbol (e.g., '$', 'R', '€')
    position: 'before' | 'after'; // Symbol position
    decimalPlaces: number; // Number of decimal places
    thousandsSeparator: string; // Thousands separator (e.g., ',', '.')
    decimalSeparator: string; // Decimal separator (e.g., '.', ',')
  };

  // Theme Settings
  theme: {
    mode: 'light' | 'dark' | 'auto'; // Theme mode
    borderRadius: string; // Border radius for components
    spacing: {
      xs: string; // Extra small spacing
      sm: string; // Small spacing
      md: string; // Medium spacing
      lg: string; // Large spacing
      xl: string; // Extra large spacing
    };
    shadows: {
      sm: string; // Small shadow
      md: string; // Medium shadow
      lg: string; // Large shadow
    };
  };

  // Features & Functionality
  features: {
    enableReviews: boolean;
    enableWishlist: boolean;
    enableCompare: boolean;
    enableNewsletter: boolean;
    enableSocialLogin: boolean;
    enableGuestCheckout: boolean;
    enableMultiLanguage: boolean;
    enableMultiCurrency: boolean;
  };

  // Social Media
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  // SEO & Meta
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string[];
    ogImage?: string; // Open Graph image
    twitterCard?: 'summary' | 'summary_large_image';
  };

  // Payment & Shipping
  payment: {
    methods: string[]; // Available payment methods
    defaultMethod?: string;
  };

  shipping: {
    freeShippingThreshold?: number; // Minimum amount for free shipping
    defaultShippingCost?: number;
    estimatedDeliveryDays: {
      min: number;
      max: number;
    };
  };

  // Analytics & Tracking
  analytics: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
}
