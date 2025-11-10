import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product, ProductVariant } from '@/types';

// Local cart item interface (simplified from API structure)
export interface LocalCartItem {
  id: string; // Unique identifier for cart item
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

interface CartState {
  items: LocalCartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
  coupon?: {
    code: string;
    discount: number;
  };
}

// Calculate cart totals
const calculateTotals = (items: LocalCartItem[]): Omit<CartState, 'items' | 'coupon'> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // For now, tax and shipping are 0 (can be calculated later)
  const tax = 0;
  const shipping = 0;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;

  return {
    subtotal,
    tax,
    shipping,
    discount,
    total,
    itemCount,
  };
};

// Load cart from localStorage on initialization
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return {
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
    };
  }

  try {
    const stored = localStorage.getItem('cart');
    if (stored) {
      const parsedCart = JSON.parse(stored);
      // Validate and calculate totals
      const validItems = Array.isArray(parsedCart.items) ? parsedCart.items : [];
      const totals = calculateTotals(validItems);
      
      return {
        items: validItems,
        ...totals,
        coupon: parsedCart.coupon,
      };
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }

  return {
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    itemCount: 0,
  };
};

const initialState: CartState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addItem: (state, action: PayloadAction<{
      product: Product;
      variant?: ProductVariant;
      size?: string;
      quantity: number;
    }>) => {
      const { product, variant, size, quantity } = action.payload;
      
      // Calculate price (use variant price if available, otherwise product price)
      const unitPrice = variant?.pricing?.salePrice || variant?.pricing?.basePrice || 
                       product.pricing?.salePrice || product.pricing?.basePrice || 0;
      const totalPrice = unitPrice * quantity;

      // Create unique ID for cart item
      const itemId = `${product._id}-${variant?._id || 'none'}-${size || 'none'}`;

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === itemId
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex];
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
        state.items[existingItemIndex] = existingItem;
      } else {
        // Add new item
        const newItem: LocalCartItem = {
          id: itemId,
          productId: product._id,
          product,
          variantId: variant?._id,
          variant,
          size,
          quantity,
          unitPrice,
          totalPrice,
          addedAt: new Date().toISOString(),
        };
        state.items.push(newItem);
      }

      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
      
      // Save to localStorage
      saveCartToStorage(state);
    },

    // Remove item from cart
    removeItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
      
      // Save to localStorage
      saveCartToStorage(state);
    },

    // Update item quantity
    updateItemQuantity: (state, action: PayloadAction<{
      itemId: string;
      quantity: number;
    }>) => {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        state.items = state.items.filter((item) => item.id !== itemId);
      } else {
        const item = state.items.find((item) => item.id === itemId);
        if (item) {
          item.quantity = quantity;
          item.totalPrice = item.unitPrice * quantity;
        }
      }
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
      
      // Save to localStorage
      saveCartToStorage(state);
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.shipping = 0;
      state.discount = 0;
      state.total = 0;
      state.itemCount = 0;
      state.coupon = undefined;
      
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    },

    // Apply coupon (placeholder for future implementation)
    applyCoupon: (state, action: PayloadAction<{
      code: string;
      discount: number;
    }>) => {
      state.coupon = {
        code: action.payload.code,
        discount: action.payload.discount,
      };
      
      // Recalculate totals with discount
      const totals = calculateTotals(state.items);
      totals.discount = action.payload.discount;
      totals.total = totals.subtotal + totals.tax + totals.shipping - totals.discount;
      Object.assign(state, totals);
      
      // Save to localStorage
      saveCartToStorage(state);
    },

    // Remove coupon
    removeCoupon: (state) => {
      state.coupon = undefined;
      
      // Recalculate totals without discount
      const totals = calculateTotals(state.items);
      totals.discount = 0;
      totals.total = totals.subtotal + totals.tax + totals.shipping;
      Object.assign(state, totals);
      
      // Save to localStorage
      saveCartToStorage(state);
    },

    // Set shipping cost
    setShipping: (state, action: PayloadAction<number>) => {
      state.shipping = action.payload;
      
      // Recalculate total
      const totals = calculateTotals(state.items);
      totals.shipping = action.payload;
      totals.total = totals.subtotal + totals.tax + totals.shipping - totals.discount;
      Object.assign(state, totals);
      
      // Save to localStorage
      saveCartToStorage(state);
    },
  },
});

// Helper function to save cart to localStorage
function saveCartToStorage(state: CartState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cart', JSON.stringify({
        items: state.items,
        coupon: state.coupon,
      }));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }
};

export const {
  addItem,
  removeItem,
  updateItemQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  setShipping,
} = cartSlice.actions;

export default cartSlice.reducer;

