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
import { Product, ProductVariant } from "@/types";
import { ProductService, CartService } from "@/services/v2";
import Link from "next/link";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [cartMessage, setCartMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Local state for v2 fetching
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Variant-related state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [variantsLoading, setVariantsLoading] = useState<boolean>(false);
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: string;
  }>({});

  // Fetch product from v2 API
  const fetchProductData = useCallback(async () => {
    if (!productId) return;
    try {
      setProductLoading(true);
      setProductError(null);
      const response = await ProductService.getProductById(productId);
      if (response.success) {
        const prod = response.product || (response as any).data;
        setProduct(prod || null);
        const rel = (response as any).relatedProducts || [];
        setRelatedProducts(Array.isArray(rel) ? rel : []);
      } else {
        setProduct(null);
        setProductError(response.error || "Failed to fetch product");
      }
    } catch (err: any) {
      setProduct(null);
      setProductError(err?.message || "Failed to fetch product");
    } finally {
      setProductLoading(false);
    }
  }, [productId]);

  // Fetch variants for variable products
  const fetchVariants = useCallback(async () => {
    if (!productId || !product || product.productType !== "variable") return;

    try {
      setVariantsLoading(true);
      const response = await ProductService.getProductVariants(productId);
      if (response.success) {
        const variantsData = (response as any).variants || response.data || [];
        setVariants(Array.isArray(variantsData) ? variantsData : []);

        // Auto-select first variant if available
        if (variantsData.length > 0) {
          setSelectedVariant(variantsData[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching variants:", err);
    } finally {
      setVariantsLoading(false);
    }
  }, [productId, product]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Support v2 pricing shape with fallback, use variant pricing if available
  const getPricing = () => {
    if (selectedVariant && product?.productType === "variable") {
      return {
        basePrice: selectedVariant.pricing?.basePrice ?? 0,
        salePrice: selectedVariant.pricing?.salePrice,
        currency: selectedVariant.pricing?.currency ?? "USD",
      };
    }
    return {
      basePrice: product?.pricing?.basePrice ?? (product as any)?.price ?? 0,
      salePrice: product?.pricing?.salePrice ?? (product as any)?.salePrice,
      currency: product?.pricing?.currency ?? "USD",
    };
  };

  const { basePrice, salePrice, currency } = getPricing();
  const discountPercentage = salePrice
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : 0;

  // Get product images (use variant images if available)
  const getProductImages = () => {
    // For variable products, use variant images if available
    if (
      selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
    ) {
      return selectedVariant.images
        .map((image) => {
          if (typeof image === "string") return image;
          return (
            (image as any).url ||
            (image as any).downloadUrl ||
            (image as any).directUrl ||
            null
          );
        })
        .filter(Boolean) as string[];
    }

    // Fallback to product images
    if (product?.images && product.images.length > 0) {
      return product.images
        .map((image) => {
          if (typeof image === "string") return image;
          // v2 uses url, v1 used downloadUrl/directUrl
          return (
            (image as any).url ||
            (image as any).downloadUrl ||
            (image as any).directUrl ||
            null
          );
        })
        .filter(Boolean) as string[];
    }
    return [] as string[];
  };

  const productImages = getProductImages();
  const currentImage = productImages[selectedImageIndex];

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  // Handle variant selection with product matrix logic
  const handleVariantSelection = (
    attributeType: string,
    attributeId: string
  ) => {
    const newSelectedAttributes = {
      ...selectedAttributes,
      [attributeType]: attributeId,
    };
    setSelectedAttributes(newSelectedAttributes);

    // Find matching variant
    const matchingVariant = variants.find((variant) => {
      return Object.entries(newSelectedAttributes).every(([type, id]) => {
        if (type === "color") {
          const colorId =
            typeof variant.colorId === "string"
              ? variant.colorId
              : variant.colorId?._id;
          return colorId === id;
        }
        if (type === "size") {
          const sizeId =
            typeof variant.sizeId === "string"
              ? variant.sizeId
              : variant.sizeId?._id;
          return sizeId === id;
        }
        if (type === "gender") {
          const genderId =
            typeof variant.genderId === "string"
              ? variant.genderId
              : variant.genderId?._id;
          return genderId === id;
        }
        return true;
      });
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      // Reset image index when variant changes
      setSelectedImageIndex(0);
    }
  };

  // Get available attributes based on current selections (product matrix logic)
  const getAvailableAttributes = (attributeType: string) => {
    if (
      !product ||
      product.productType !== "variable" ||
      variants.length === 0
    ) {
      return { colors: [], sizes: [], genders: [] };
    }

    // Get all unique attributes from variants
    const allColors = new Map();
    const allSizes = new Map();
    const allGenders = new Map();

    variants.forEach((variant) => {
      if (variant.colorId) {
        const color =
          typeof variant.colorId === "object" ? variant.colorId : null;
        if (color && color._id) {
          allColors.set(color._id, color);
        }
      }
      if (variant.sizeId) {
        const size = typeof variant.sizeId === "object" ? variant.sizeId : null;
        if (size && size._id) {
          allSizes.set(size._id, size);
        }
      }
      if (variant.genderId) {
        const gender =
          typeof variant.genderId === "object" ? variant.genderId : null;
        if (gender && gender._id) {
          allGenders.set(gender._id, gender);
        }
      }
    });

    // Filter based on current selections
    const availableColors: any[] = [];
    const availableSizes: any[] = [];
    const availableGenders: any[] = [];

    if (attributeType === "color") {
      // Show all colors that have at least one variant matching other selected attributes
      allColors.forEach((color, colorId) => {
        const hasMatchingVariant = variants.some((variant) => {
          const vColorId =
            typeof variant.colorId === "string"
              ? variant.colorId
              : variant.colorId?._id;
          if (vColorId !== colorId) return false;

          if (selectedAttributes.size) {
            const vSizeId =
              typeof variant.sizeId === "string"
                ? variant.sizeId
                : variant.sizeId?._id;
            if (vSizeId !== selectedAttributes.size) return false;
          }
          if (selectedAttributes.gender) {
            const vGenderId =
              typeof variant.genderId === "string"
                ? variant.genderId
                : variant.genderId?._id;
            if (vGenderId !== selectedAttributes.gender) return false;
          }
          return true;
        });
        if (hasMatchingVariant) {
          availableColors.push({ id: colorId, ...color });
        }
      });
    } else if (attributeType === "size") {
      allSizes.forEach((size, sizeId) => {
        const hasMatchingVariant = variants.some((variant) => {
          const vSizeId =
            typeof variant.sizeId === "string"
              ? variant.sizeId
              : variant.sizeId?._id;
          if (vSizeId !== sizeId) return false;

          if (selectedAttributes.color) {
            const vColorId =
              typeof variant.colorId === "string"
                ? variant.colorId
                : variant.colorId?._id;
            if (vColorId !== selectedAttributes.color) return false;
          }
          if (selectedAttributes.gender) {
            const vGenderId =
              typeof variant.genderId === "string"
                ? variant.genderId
                : variant.genderId?._id;
            if (vGenderId !== selectedAttributes.gender) return false;
          }
          return true;
        });
        if (hasMatchingVariant) {
          availableSizes.push({ id: sizeId, ...size });
        }
      });
    } else if (attributeType === "gender") {
      allGenders.forEach((gender, genderId) => {
        const hasMatchingVariant = variants.some((variant) => {
          const vGenderId =
            typeof variant.genderId === "string"
              ? variant.genderId
              : variant.genderId?._id;
          if (vGenderId !== genderId) return false;

          if (selectedAttributes.color) {
            const vColorId =
              typeof variant.colorId === "string"
                ? variant.colorId
                : variant.colorId?._id;
            if (vColorId !== selectedAttributes.color) return false;
          }
          if (selectedAttributes.size) {
            const vSizeId =
              typeof variant.sizeId === "string"
                ? variant.sizeId
                : variant.sizeId?._id;
            if (vSizeId !== selectedAttributes.size) return false;
          }
          return true;
        });
        if (hasMatchingVariant) {
          availableGenders.push({ id: genderId, ...gender });
        }
      });
    }

    return {
      colors: availableColors,
      sizes: availableSizes,
      genders: availableGenders,
    };
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    setCartMessage(null);

    try {
      const response = await CartService.addToCart({
        productId: product._id,
        quantity,
        variantId: selectedVariant?._id,
      });

      if (response.success) {
        setCartMessage({
          type: "success",
          message: "Added to cart successfully!",
        });
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        setCartMessage({
          type: "error",
          message: response.error || "Failed to add to cart",
        });
        setTimeout(() => setCartMessage(null), 3000);
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      setCartMessage({ type: "error", message: "Failed to add to cart" });
      setTimeout(() => setCartMessage(null), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement actual wishlist API call
  };

  if (productLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (productError || !product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4">
              {productError || "Product not found"}
            </p>
            <Link
              href="/products"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Get stock information
  const stockQuantity = selectedVariant
    ? selectedVariant.inventory?.stockQuantity || 0
    : product.inventory?.stockQuantity || 0;

  const allowBackorders = selectedVariant
    ? selectedVariant.inventory?.stockStatus === 'backorder'
    : product.inventory?.stockStatus === 'backorder';

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-orange-500 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/products"
              className="hover:text-orange-500 transition-colors"
            >
              Products
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-black font-medium">{product.name}</span>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden ">
                {/* {salePrice && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded">
                      -{discountPercentage}% OFF
                    </span>
                  </div>
                )} */}
                {currentImage && !imageErrors.has(selectedImageIndex) ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-scale-down pt-[50px] pb-[72px] bg-[url(https://res.cloudinary.com/shelflife-online/image/upload/f_auto,q_auto:eco/v1700810497/img/product-overlay.png)]"
                    onError={() => handleImageError(selectedImageIndex)}
                    unoptimized={currentImage.includes("localhost")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">📷</div>
                      <div className="text-lg">No Image Available</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square  overflow-hidden border transition-all ${
                        selectedImageIndex === index
                          ? "border-orange-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {!imageErrors.has(index) ? (
                        <Image
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          fill
                          className="object-contain"
                          onError={() => handleImageError(index)}
                          unoptimized={image.includes("localhost")}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <span className="text-2xl">📷</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Category */}

              {/* Product Name */}
              <h1 className="text-3xl text-center lg:text-4xl font-bold text-black">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {salePrice ? (
                  <>
                    <span className="text-xl font-bold text-black">
                      {formatPrice(salePrice)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(basePrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-black">
                    {formatPrice(basePrice)}
                  </span>
                )}
              </div>

              {/* Variant Selection for Variable Products */}
              {product.productType === "variable" && (
                <div className="space-y-6 py-6 border-t border-gray-200">
                  {variantsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading options...</p>
                    </div>
                  ) : (
                    <>
                      {/* Colors */}
                      {(() => {
                        const { colors } = getAvailableAttributes("color");
                        return (
                          colors.length > 0 && (
                            <div className="space-y-3">
                              <label className="block text-lg font-semibold text-black">
                                Color
                              </label>
                              <div className="flex flex-wrap gap-3">
                                {colors.map((color: any) => {
                                  const isSelected =
                                    selectedAttributes.color === color.id;
                                  const isAvailable = true; // Already filtered for availability
                                  return (
                                    <button
                                      key={color.id}
                                      onClick={() =>
                                        handleVariantSelection(
                                          "color",
                                          color.id
                                        )
                                      }
                                      disabled={!isAvailable}
                                      className={`w-12 h-12 border transition-all ${
                                        isSelected
                                          ? "border-orange-500"
                                          : isAvailable
                                          ? "border-gray-300 hover:border-gray-400 hover:scale-105"
                                          : "border-gray-200 opacity-50 cursor-not-allowed"
                                      }`}
                                      style={{ backgroundColor: color.hexCode }}
                                      title={color.name}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )
                        );
                      })()}

                      {/* Sizes */}
                      {(() => {
                        const { sizes } = getAvailableAttributes("size");
                        return (
                          sizes.length > 0 && (
                            <div className="space-y-3">
                              <label className="block text-lg font-semibold text-black">
                                Size
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {sizes.map((size: any) => {
                                  const isSelected =
                                    selectedAttributes.size === size.id;
                                  const isAvailable = true;
                                  return (
                                    <button
                                      key={size.id}
                                      onClick={() =>
                                        handleVariantSelection("size", size.id)
                                      }
                                      disabled={!isAvailable}
                                      className={`px-4 py-2 border font-medium transition-all ${
                                        isSelected
                                          ? "border-orange-500 bg-orange-500 text-white"
                                          : isAvailable
                                          ? "border-gray-300 hover:border-orange-500"
                                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                      }`}
                                    >
                                      {size.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        );
                      })()}

                      {/* Genders */}
                      {(() => {
                        const { genders } = getAvailableAttributes("gender");
                        return (
                          genders.length > 0 && (
                            <div className="space-y-3">
                              <label className="block text-lg font-semibold text-black">
                                Gender
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {genders.map((gender: any) => {
                                  const isSelected =
                                    selectedAttributes.gender === gender.id;
                                  const isAvailable = true;
                                  return (
                                    <button
                                      key={gender.id}
                                      onClick={() =>
                                        handleVariantSelection(
                                          "gender",
                                          gender.id
                                        )
                                      }
                                      disabled={!isAvailable}
                                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                                        isSelected
                                          ? "border-orange-500 bg-orange-500 text-white"
                                          : isAvailable
                                          ? "border-gray-300 hover:border-orange-500"
                                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                      }`}
                                    >
                                      {gender.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        );
                      })()}

                      {/* Selected Variant Info */}
                      {/* {selectedVariant && (
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-black mb-2">
                            Selected Variant
                          </h4>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>
                              <strong>SKU:</strong> {selectedVariant.sku}
                            </p>
                            <p>
                              <strong>Stock:</strong>{" "}
                              {selectedVariant.inventory?.stockQuantity || 0}{" "}
                              available
                            </p>
                            {selectedVariant.inventory?.stockStatus && (
                              <p>
                                <strong>Status:</strong>{" "}
                                {selectedVariant.inventory.stockStatus.replace(
                                  "_",
                                  " "
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      )} */}
                    </>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              {(stockQuantity > 0 || allowBackorders) && (
                <div className="space-y-1">
                  <label className="block text-lg font-semibold text-black">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-orange-500 transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-xl text-black">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        const maxQty = stockQuantity > 0 ? stockQuantity : 999;
                        setQuantity(Math.min(maxQty, quantity + 1));
                      }}
                      className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-orange-500 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {stockQuantity > 0 && (
                    <p className="text-sm text-gray-600">
                      {stockQuantity} available in stock
                    </p>
                  )}
                  {stockQuantity === 0 && allowBackorders && (
                    <p className="text-sm text-orange-600">
                      Out of stock - backorders allowed
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={
                    isAddingToCart ||
                    (stockQuantity === 0 && !allowBackorders) ||
                    (product.productType === "variable" && !selectedVariant)
                  }
                  className="w-full bg-orange-500 text-white py-4 px-8 font-bold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                      {stockQuantity === 0 && !allowBackorders
                        ? "Out of Stock"
                        : product.productType === "variable" && !selectedVariant
                        ? "Select Variant"
                        : "Add to Cart"}
                    </div>
                  )}
                </motion.button>

                {/* <motion.button
                  onClick={handleWishlist}
                  className={`w-full py-4 px-8 rounded-lg border-2 font-semibold text-lg transition-all ${
                    isWishlisted
                      ? "border-orange-500 text-orange-500 hover:bg-orange-50"
                      : "border-gray-300 text-black hover:border-orange-500 hover:bg-gray-50"
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
                </motion.button> */}
              </div>

              {/* Cart Message */}
              {cartMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg border-2 ${
                    cartMessage.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full mr-3 ${
                        cartMessage.type === "success"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="font-medium">{cartMessage.message}</span>
                  </div>
                </motion.div>
              )}

              {/* Description */}
              {product.description && (
                <div className="prose max-w-none">
                  <label className="block text-lg font-semibold text-black">
                    Description
                  </label>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-black text-sm">
                        Free Shipping
                      </p>
                      <p className="text-xs text-gray-500">
                        On orders over $50
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-black text-sm">
                        Secure Payment
                      </p>
                      <p className="text-xs text-gray-500">
                        100% secure checkout
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-black text-sm">
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
