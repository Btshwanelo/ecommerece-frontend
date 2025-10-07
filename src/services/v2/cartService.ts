import { api, endpoints } from '@/lib/api';
import { 
  Cart, 
  CartItem, 
  V2ApiResponse 
} from '@/types';

export interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface ApplyCouponData {
  couponCode: string;
}

export interface MergeCartData {
  sessionId: string;
  guestId?: string;
}

export class CartService {
  // Get cart
  static async getCart(): Promise<V2ApiResponse<Cart>> {
    const response = await api.get(endpoints.cart.get);
    return response.data;
  }

  // Add item to cart
  static async addToCart(data: AddToCartData): Promise<V2ApiResponse<Cart>> {
    const response = await api.post(endpoints.cart.add, data);
    return response.data;
  }

  // Update cart item
  static async updateCartItem(itemId: string, data: UpdateCartItemData): Promise<V2ApiResponse<Cart>> {
    const response = await api.put(endpoints.cart.updateItem(itemId), data);
    return response.data;
  }

  // Remove item from cart
  static async removeCartItem(itemId: string): Promise<V2ApiResponse<Cart>> {
    const response = await api.delete(endpoints.cart.removeItem(itemId));
    return response.data;
  }

  // Clear cart
  static async clearCart(): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoints.cart.clear);
    return response.data;
  }

  // Apply coupon
  static async applyCoupon(data: ApplyCouponData): Promise<V2ApiResponse<Cart>> {
    const response = await api.post(endpoints.cart.applyCoupon, data);
    return response.data;
  }

  // Remove coupon
  static async removeCoupon(): Promise<V2ApiResponse<Cart>> {
    const response = await api.delete(endpoints.cart.removeCoupon);
    return response.data;
  }

  // Merge guest cart with user cart
  static async mergeCart(data: MergeCartData): Promise<V2ApiResponse<Cart>> {
    const response = await api.post(endpoints.cart.merge, data);
    return response.data;
  }

  // Get cart with guest session
  static async getCartWithSession(sessionId: string, guestId?: string): Promise<V2ApiResponse<Cart>> {
    const headers: Record<string, string> = {
      'x-session-id': sessionId,
    };
    
    if (guestId) {
      headers['x-guest-id'] = guestId;
    }

    const response = await api.get(endpoints.cart.get, { headers });
    return response.data;
  }

  // Add to cart with guest session
  static async addToCartWithSession(data: AddToCartData, sessionId: string, guestId?: string): Promise<V2ApiResponse<Cart>> {
    const headers: Record<string, string> = {
      'x-session-id': sessionId,
    };
    
    if (guestId) {
      headers['x-guest-id'] = guestId;
    }

    const response = await api.post(endpoints.cart.add, data, { headers });
    return response.data;
  }
}

export default CartService;
