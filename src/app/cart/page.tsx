'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Cart, CartItem } from '@/types';
import cartService from '@/services/cartService';
import { useApi } from '@/hooks/useApi';
import { CartResponse } from '@/services/cartService';

export default function CartPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fetch cart data
  const {
    data: cartData,
    loading: cartLoading,
    error: cartError,
    execute: fetchCart,
  } = useApi<CartResponse>(cartService.getCart.bind(cartService));

  const cart = cartData?.cart;
  const cartItems = cart?.items || [];

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await cartService.updateCartItem(itemId, newQuantity);
      // Refresh cart data
      fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      // Refresh cart data
      fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = cart?.total || 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Get product image
  const getProductImage = (item: CartItem) => {
    if (item.product.images && item.product.images.length > 0) {
      // If images is an array of strings (URLs)
      if (typeof item.product.images[0] === 'string') {
        return item.product.images[0];
      }
      // If images is an array of objects with downloadUrl
      if (typeof item.product.images[0] === 'object') {
        // First try to find the primary image
        const primaryImage = item.product.images.find(img => img.isPrimary);
        if (primaryImage && primaryImage.downloadUrl) {
          return primaryImage.downloadUrl;
        }
        // If no primary image, use the first image
        if (item.product.images[0].downloadUrl) {
          return item.product.images[0].downloadUrl;
        }
        // Fallback to directUrl if downloadUrl is not available
        if (item.product.images[0].directUrl) {
          return item.product.images[0].directUrl;
        }
      }
    }
    return null;
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6">
                  <div className="space-y-6">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">NIKE</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Cart</h2>
            <p className="text-gray-600 mb-8">
              {cartError}
            </p>
          </div>
          
          <button
            onClick={() => fetchCart()}
            className="inline-flex items-center px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">NIKE</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
          </div>
          
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Items</h2>
                
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
                          {getProductImage(item) && !imageErrors.has(item._id) ? (
                            <Image
                              src={getProductImage(item)!}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              onError={() => handleImageError(item._id)}
                              unoptimized={getProductImage(item)?.includes('localhost')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              <div className="text-center">
                                <div className="text-lg mb-1">📷</div>
                                <div className="text-xs">No Image</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {item.product.category?.name || 'Uncategorized'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.product.salePrice || item.product.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Free shipping message */}
              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Add {formatPrice(50 - subtotal)} more for free shipping
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="mt-6 w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="mt-3 w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
