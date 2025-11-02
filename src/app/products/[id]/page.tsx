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
import { ProductService, CartService } from "@/services/v2";
import Link from "next/link";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

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

    setIsAddingToCart(true);

    try {
      const response = await CartService.addToCart({
        productId: product._id,
        quantity: 1,
        variantId: selectedVariant?._id,
      });

      if (response.success) {
        // Success feedback can be added later if needed
        console.log("Added to cart");
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-neutral-900 mb-4">
            {productError || "Product not found"}
          </p>
          <Link
            href="/products"
            className="text-sm uppercase tracking-wide text-neutral-900 underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Minimal Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white">
        <button
          onClick={() => router.back()}
          className="text-neutral-900 hover:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <Link
          href="/cart"
          className="text-neutral-900 hover:opacity-70 transition-opacity"
          aria-label="View cart"
        >
          <ShoppingBag className="h-6 w-6" />
        </Link>
      </div>

      {/* Main Content - Centered with flex layout */}
      <div className="flex-1 flex flex-col justify-between pt-16 pb-32 max-w-4xl mx-auto px-6 w-full">
        {/* Product Image with Carousel Navigation - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-[31rem]">
            {/* Main Image Container */}
            <div className="relative aspect-square w-full">
              {/* Left Arrow */}
              {productImages.length > 1 && (
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-neutral-900 hover:opacity-70 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              )}

              {/* Product Image */}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-neutral-900 hover:opacity-70 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
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
                    className={`h-2 transition-all ${
                      selectedImageIndex === index
                        ? "w-6 bg-neutral-900"
                        : "w-2 bg-neutral-400"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section - Fixed at bottom */}
        <div className="space-y-6 py-6 max-w-[28rem] mx-auto w-full">
          {/* SELECT SIZE Section */}
          {availableSizes.length > 0 && (
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSizeModal(!showSizeModal)}
                  className="text-neutral-900 hover:opacity-70 transition-opacity"
                  aria-label="Size guide"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
                <span className="text-xs uppercase tracking-widest text-neutral-900">
                  SELECT SIZE
                </span>
              </div>
              <button
                onClick={() => setSelectedSize(null)}
                className="text-neutral-900 hover:opacity-70 transition-opacity"
                aria-label="Clear size selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Price */}
          <div className="text-center">
            <p className="text-xl text-neutral-900">
              {formatPrice(salePrice || basePrice, currency)}
            </p>
          </div>

          {/* Size Options */}
          {availableSizes.length > 0 && (
            <div className="flex justify-center gap-6">
              {availableSizes.map((size: { id: string; name: string }) => (
                <button
                  key={size.id}
                  onClick={() => handleSizeSelect(size.name)}
                  className={`text-sm uppercase tracking-wide transition-opacity ${
                    selectedSize === size.name
                      ? "text-neutral-900 font-medium"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}

          {/* INFORMATION Section */}
          <div className="border-t border-neutral-200 pt-6">
            <button className="text-xs uppercase tracking-widest text-neutral-900 w-full text-left">
              INFORMATION
            </button>
            {/* Product description could be shown here when expanded */}
          </div>
        </div>
      </div>
    </div>
  );
}
