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
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  deliveryOption?: DeliveryOption;
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
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'public' | 'private' | 'hidden';
  search?: string;
  sort?: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating' | 'popular' | 'trending' | 'relevance';
  page?: number;
  limit?: number;
}

// V2 API Response types
export interface V2ApiResponse<T> {
  success: boolean;
  data?: T;
  product?: T; // For product responses
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
