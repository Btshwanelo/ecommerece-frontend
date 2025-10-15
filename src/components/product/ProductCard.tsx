'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { CartService } from '@/services/v2';
import { useCurrency, useFeatures } from '@/hooks/useStoreConfig';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  
  const { format } = useCurrency();
  const { enableWishlist } = useFeatures();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    setCartMessage(null);
    
    try {
      console.log('Adding to cart:', product.name);
      
      // Call the v2 cart API
      const response = await CartService.addToCart({
        productId: product._id,
        quantity: 1,
        // For variable products, you might need to specify variantId
        // variantId: selectedVariant?._id
      });
      
      console.log('Cart API response:', response);
      
      if (response.success) {
        setCartMessage('Added to cart!');
        // Clear success message after 2 seconds
        setTimeout(() => setCartMessage(null), 2000);
      } else {
        setCartMessage('Failed to add to cart');
        setTimeout(() => setCartMessage(null), 2000);
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setCartMessage('Failed to add to cart');
      setTimeout(() => setCartMessage(null), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
    console.log('Toggle wishlist:', product._id);
  };

  const formatPrice = (price: number) => {
    return format(price);
  };

  // Handle both v1 and v2 API structures
  const basePrice = product.pricing?.basePrice || product.price || 0;
  const salePrice = product.pricing?.salePrice || product.salePrice;
  
  const discountPercentage = salePrice
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : 0;

  // Get the primary image or first image
  const getProductImage = () => {
    console.log('Product images:', product.images); // Debug log
    if (product.images && product.images.length > 0) {
      // If images is an array of strings (URLs) - v1 API
      if (typeof product.images[0] === 'string') {
        return product.images[0];
      }
      // If images is an array of objects - v2 API
      if (typeof product.images[0] === 'object') {
        // First try to find the primary image
        const primaryImage = product.images.find(img => img.isPrimary);
        if (primaryImage) {
          // v2 API uses 'url' property
          if (primaryImage.url) {
            console.log('Using primary image (v2):', primaryImage.url); // Debug log
            return primaryImage.url;
          }
          // v1 API fallback
          if (primaryImage.downloadUrl) {
            console.log('Using primary image (v1):', primaryImage.downloadUrl); // Debug log
            return primaryImage.downloadUrl;
          }
        }
        // If no primary image, use the first image
        if (product.images[0].url) {
          console.log('Using first image (v2):', product.images[0].url); // Debug log
          return product.images[0].url;
        }
        if (product.images[0].downloadUrl) {
          console.log('Using first image (v1):', product.images[0].downloadUrl); // Debug log
          return product.images[0].downloadUrl;
        }
        // Fallback to directUrl if downloadUrl is not available
        if (product.images[0].directUrl) {
          console.log('Using directUrl:', product.images[0].directUrl); // Debug log
          return product.images[0].directUrl;
        }
      }
    }
    console.log('No image found for product:', product.name); // Debug log
    return null;
  };

  const productImage = getProductImage();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <Link href={`/products/${product._id}`}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {productImage && !imageError ? (
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
              unoptimized={productImage.includes('localhost')} // Disable optimization for local images
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm">No Image</div>
              </div>
            </div>
          )}

          {/* Sale badge */}
          {salePrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {enableWishlist && (
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-full shadow-lg transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            )}
            <button className="p-2 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Add to cart button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isAddingToCart || (product.inventory?.stockQuantity || product.inventory?.quantity || 0) === 0}
            className="absolute bottom-4 left-4 right-4 bg-black text-white py-3 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4 inline mr-2" />
                {(product.inventory?.stockQuantity || product.inventory?.quantity || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </motion.button>

          {/* Cart Message Toast */}
          {cartMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
            >
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  cartMessage === 'Added to cart!' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-800">{cartMessage}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-sm text-gray-500 mb-1">
            {product.categoryId?.name || product.category?.name || 'Uncategorized'}
          </p>
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {salePrice ? (
              <>
                <span className="text-lg font-bold text-black">
                  {formatPrice(salePrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(basePrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-black">
                {formatPrice(basePrice)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-2">
            {(product.inventory?.stockQuantity || product.inventory?.quantity || 0) > 0 ? (
              <span className="text-sm text-green-600">In Stock</span>
            ) : (
              <span className="text-sm text-red-600">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
