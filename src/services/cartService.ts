import { api, endpoints } from '@/lib/api';
import { Cart, CartItem } from '@/types';

export interface CartResponse {
  success: boolean;
  cart: Cart;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

class CartService {
  // Get user's cart
  async getCart(): Promise<CartResponse> {
    try {
      const response = await api.get(endpoints.cart.get);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<CartResponse> {
    try {
      const response = await api.post(endpoints.cart.add, {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<CartResponse> {
    try {
      const response = await api.put(endpoints.cart.update, {
        itemId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<CartResponse> {
    try {
      const response = await api.delete(endpoints.cart.remove, {
        data: { itemId },
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<CartResponse> {
    try {
      const response = await api.delete(endpoints.cart.clear);
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export const cartService = new CartService();
export default cartService;

