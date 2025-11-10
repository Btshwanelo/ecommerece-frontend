"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  X,
  HelpCircle,
} from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { ProductService } from "@/services/v2";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const dispatch = useAppDispatch();
  const cartItemCount = useAppSelector((state) => state.cart.itemCount);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [buttonAnimation, setButtonAnimation] = useState(false);

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

  const formatPrice = (price: number, currency: string = "USD") => {
    const currencySymbol = currency === "R" ? "R" : "$";
    return `${currencySymbol}${price.toFixed(2)}`;
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

  // Get available attributes based on current selections (product matrix logic) - for v2 variants
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

          // Simplified variant matching - can be enhanced later
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

          // Simplified variant matching - can be enhanced later
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
          // Simplified variant matching - can be enhanced later
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

  // Get available sizes (from v3 product or v2 variants)
  const getAvailableSizes = () => {
    // V3 products have sizes array directly on product
    if ((product as any)?.sizes && Array.isArray((product as any).sizes)) {
      return (product as any)?.sizes.map((size: any) => ({
        name: size.name || size,
        id: size.name || size,
      }));
    }

    // V2 variable products use variants
    if (product?.productType === "variable" && variants.length > 0) {
      const { sizes } = getAvailableAttributes("size");
      return sizes.map((size: any) => ({
        name: size.name,
        id: size.id || size._id,
      }));
    }

    return [];
  };

  const availableSizes = getAvailableSizes();

  const handleAddToCart = async () => {
    if (!product) return;

    // For v2 variable products, require size selection
    if (
      product.productType === "variable" &&
      !selectedSize &&
      availableSizes.length > 0
    ) {
      return; // Don't add to cart if size is required but not selected
    }

    setIsAddingToCart(true);
    setButtonAnimation(true);

    const startTime = Date.now();
    const minDuration = 1000; // 2 seconds minimum

    try {
      // Add item to cart using Redux slice
      dispatch(
        addItem({
          product,
          variant: selectedVariant || undefined,
          size: selectedSize || undefined,
          quantity,
        })
      );

      // Reset quantity after adding to cart
      setQuantity(1);

      // Success feedback can be added later if needed
      console.log("Added to cart");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
    } finally {
      // Ensure minimum duration of 2 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDuration - elapsedTime);

      setTimeout(() => {
        setIsAddingToCart(false);
        // Reset animation after a short delay
        setTimeout(() => setButtonAnimation(false), 300);
      }, remainingTime);
    }
  };

  const handleSizeSelect = (sizeName: string) => {
    setSelectedSize(selectedSize === sizeName ? null : sizeName);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev === 0 ? productImages.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === productImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (productLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex flex-col">
          {/* Main Content - Scrollable layout */}
          <div className="flex-1 flex flex-col pt-16 pb-8 max-w-4xl mx-auto px-6 w-full">
            {/* Product Image Skeleton */}
            <div className="flex-shrink-0 flex items-center justify-center py-6 h-[24rem]">
              <div className="relative w-full">
                <div className="relative aspect-square w-full h-[24rem]">
                  <div className="w-full h-full bg-neutral-100 animate-pulse rounded-sm"></div>
                </div>
                {/* Image Indicators Skeleton */}
                <div className="flex justify-center gap-2 mt-4">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-neutral-200 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details Section Skeleton */}
            <div className="flex-1 z-auto overflow-y-auto space-y-6 mt-6 py-6 max-w-[24rem] mx-auto w-full">
              {/* Price Skeleton */}
              <div className="text-center mb-6">
                <div className="h-6 w-24 bg-neutral-100 animate-pulse rounded mx-auto"></div>
              </div>

              {/* Size Section Skeleton */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
                  <div className="h-4 w-4 bg-neutral-100 animate-pulse rounded"></div>
                  <div className="h-4 w-24 bg-neutral-100 animate-pulse rounded"></div>
                  <div className="h-4 w-4 bg-neutral-100 animate-pulse rounded"></div>
                </div>

                {/* Size Options Skeleton */}
                <div className="flex gap-4 flex-wrap pb-3">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="h-8 w-12 bg-neutral-100 animate-pulse rounded"
                    />
                  ))}
                </div>
              </div>

              {/* Add to Cart Button Skeleton */}
              <div className="w-full h-12 bg-neutral-100 animate-pulse rounded"></div>
            </div>
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
            <p className="text-sm uppercase tracking-wide text-black mb-4">
              {productError || "Product not found"}
            </p>
            <Link
              href="/products"
              className="text-sm uppercase tracking-wide text-black underline"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content - Scrollable layout */}
        <div className="flex-1 flex flex-col pt-16 pb-8 max-w-4xl mx-auto px-6 w-full">
          {/* Product Image with Carousel Navigation - Centered */}
          <div className="flex-shrink-0 flex items-center justify-center py-6 h-[24rem]">
            <div className="relative w-full ">
              {/* Main Image Container */}
              <div className="relative aspect-square w-full h-[24rem]">
                {/* Left Arrow */}
                {productImages.length > 1 && (
                  <button
                    onClick={() => navigateImage("prev")}
                    className="absolute left-2 sm:-left-[2rem] top-1/2 -translate-y-1/2 z-10  text-black cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                  </button>
                )}

                {/* Product Image */}
                {currentImage && !imageErrors.has(selectedImageIndex) ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-scale-down w-[min(100%,560px)] max-w-[calc(100vh-20rem)] mx-auto bg-[url(https://res.cloudinary.com/shelflife-online/image/upload/f_auto,q_auto:eco/v1700810497/img/product-overlay.png)]"
                    onError={() => handleImageError(selectedImageIndex)}
                    unoptimized={currentImage.includes("localhost")}
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                    <div className="text-center text-neutral-400">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm">No Image</div>
                    </div>
                  </div>
                )}

                {/* Right Arrow */}
                {productImages.length > 1 && (
                  <button
                    onClick={() => navigateImage("next")}
                    className="absolute right-2 sm:-right-[2rem] top-1/2 -translate-y-1/2 z-10  text-black cursor-pointer "
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                  </button>
                )}
              </div>

              {/* Image Indicators */}
              {productImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImageIndex === index
                          ? " bg-black"
                          : " bg-neutral-400"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section - Scrollable */}
          <div className="flex-1 z-auto overflow-y-auto space-y-6 mt-6 py-6 max-w-[24rem] mx-auto w-full">
            {/* Price */}
            <div className="text-center mb-6">
              <p className="text-base text-black font-bold">
                {formatPrice(salePrice || basePrice, currency)}
              </p>
            </div>
            {/* SELECT SIZE Section */}
            {availableSizes.length > 0 && (
              <div className="flex items-center justify-between border-b border-black pb-5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSizeModal(!showSizeModal)}
                    className="text-black hover:opacity-70 transition-opacity cursor-pointer"
                    aria-label="Size guide"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                <span className=" uppercase font-medium tracking-widest text-black">
                  SELECT SIZE
                </span>
                <button
                  disabled={selectedSize === null}
                  onClick={() => setSelectedSize(null)}
                  className="text-black hover:opacity-70 transition-opacity cursor-pointer"
                  aria-label="Clear size selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Size Options */}
            {availableSizes.length > 0 && (
              <div className="flex  gap-4 flex-wrap pb-3">
                {availableSizes.map((size: { id: string; name: string }) => (
                  <button
                    key={size.id}
                    onClick={() => handleSizeSelect(size.name)}
                    className={`text-sm uppercase tracking-wide font-bold transition-all py-1 px-1 cursor-pointer ${
                      selectedSize === size.name ? " border" : ""
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            )}

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCart}
              disabled={
                isAddingToCart ||
                (availableSizes.length > 0 && !selectedSize) ||
                (product.productType === "variable" && !selectedVariant)
              }
              animate={buttonAnimation ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="w-full border border-black  text-black cursor-pointer py-4 px-6 text-xs uppercase tracking-widest font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingToCart ? "ADDING..." : "ADD TO CART"}
            </motion.button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
