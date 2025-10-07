"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import productService from "@/services/productService";
import { useApi } from "@/hooks/useApi";
import { SingleProductResponse } from "@/services/productService";
import Link from "next/link";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Fetch product data
  const {
    data: productData,
    loading: productLoading,
    error: productError,
    execute: fetchProduct,
  } = useApi<SingleProductResponse>(
    productService.getProductById.bind(productService)
  );

  const product = productData?.product;

  // Memoize the fetch function to prevent infinite loops
  const fetchProductData = useCallback(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const discountPercentage = product?.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Get product images
  const getProductImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images
        .map((image, index) => {
          if (typeof image === "string") {
            return image;
          }
          return image.downloadUrl || image.directUrl;
        })
        .filter(Boolean);
    }
    return [];
  };

  const productImages = getProductImages();
  const currentImage = productImages[selectedImageIndex];

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || !product) return;

    setIsAddingToCart(true);
    try {
      // TODO: Implement cart service integration
      console.log("Added to cart:", product.name, "Quantity:", quantity);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
    console.log("Toggle wishlist:", product?._id);
  };

  if (productLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="aspect-square bg-gray-200 rounded-2xl max-w-md"></div>
                  <div className="flex space-x-3">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 bg-gray-200 rounded-xl"
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (productError || !product) {
    return (
      <Layout>
        <div className="min-h-screen bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Product Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                The product you're looking for doesn't exist or has been
                removed.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/products"
              className="hover:text-black transition-colors"
            >
              Products
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-black font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <motion.div
                className="aspect-square relative bg-gray-50 rounded-2xl overflow-hidden shadow-lg max-w-md mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {currentImage && !imageErrors.has(selectedImageIndex) ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={currentImage.includes("localhost")}
                    onError={() => handleImageError(selectedImageIndex)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📷</div>
                      <div className="text-lg font-medium">No Image</div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 max-w-md mx-auto lg:mx-0">
                  {productImages.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? "border-black shadow-md scale-105"
                          : "border-gray-200 hover:border-gray-300 hover:scale-105"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {image && !imageErrors.has(index) ? (
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={image.includes("localhost")}
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <div className="text-sm">📷</div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <motion.div
              className="space-y-6 lg:pl-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Category */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {product.category?.name}{" "}
                  {product.subcategory && `• ${product.subcategory.name}`}
                </p>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="space-y-2">
                {product.salePrice ? (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl lg:text-4xl font-bold text-black">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl lg:text-2xl text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {discountPercentage}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl lg:text-4xl font-bold text-black">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {product.inventory?.quantity > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-semibold">
                      In Stock
                    </span>
                    <span className="text-sm text-gray-500">
                      ({product.inventory.quantity} available)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-semibold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              {product.inventory?.quantity > 0 && (
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-900">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-20 text-center font-bold text-xl">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.inventory.quantity, quantity + 1)
                        )
                      }
                      className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.inventory?.quantity === 0}
                  className="w-full bg-black text-white py-5 px-8 rounded-2xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Adding to Cart...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 mr-3" />
                      {product.inventory?.quantity === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </div>
                  )}
                </motion.button>

                <motion.button
                  onClick={handleWishlist}
                  className={`w-full py-4 px-8 rounded-2xl border-2 font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                    isWishlisted
                      ? "border-red-500 text-red-500 hover:bg-red-50"
                      : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <Heart
                      className="h-6 w-6 mr-3"
                      fill={isWishlisted ? "currentColor" : "none"}
                    />
                    {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  </div>
                </motion.button>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Free Shipping
                      </p>
                      <p className="text-xs text-gray-500">
                        On orders over $50
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Secure Payment
                      </p>
                      <p className="text-xs text-gray-500">
                        100% secure checkout
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Quality Guarantee
                      </p>
                      <p className="text-xs text-gray-500">30-day returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
