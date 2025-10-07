export { default as ProductService } from './productService';
export { default as CategoryService } from './categoryService';
export { default as BrandService } from './brandService';
export { default as AttributeService } from './attributeService';
export { default as UserService } from './userService';
export { default as OrderService } from './orderService';
export { default as CartService } from './cartService';
export { default as DeliveryService } from './deliveryService';
export { StatsService } from './statsService';

// Re-export types for convenience
export type {
  ProductFilters,
  V2ProductResponse,
  V2ApiResponse,
  V2PaginatedResponse,
  V2CategoryTreeResponse,
  V2AllAttributesResponse
} from '@/types';

export type {
  CategoryFilters
} from './categoryService';

export type {
  BrandFilters
} from './brandService';

export type {
  AttributeFilters
} from './attributeService';

export type {
  UserFilters,
  LoginCredentials,
  RegisterCredentials,
  ChangePasswordData
} from './userService';

export type {
  OrderFilters,
  CheckoutInitiateData,
  CheckoutCompleteData
} from './orderService';

export type {
  AddToCartData,
  UpdateCartItemData,
  ApplyCouponData,
  MergeCartData
} from './cartService';

export type {
  DeliveryFilters,
  AvailableDeliveryOptionsParams
} from './deliveryService';
