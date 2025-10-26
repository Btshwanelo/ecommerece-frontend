"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { CartService } from "@/services/v2";
import { useCurrency, useFeatures } from "@/hooks/useStoreConfig";

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
      console.log("Adding to cart:", product.name);

      // Call the v2 cart API
      const response = await CartService.addToCart({
        productId: product._id,
        quantity: 1,
        // For variable products, you might need to specify variantId
        // variantId: selectedVariant?._id
      });

      console.log("Cart API response:", response);

      if (response.success) {
        setCartMessage("Added to cart!");
        // Clear success message after 2 seconds
        setTimeout(() => setCartMessage(null), 2000);
      } else {
        setCartMessage("Failed to add to cart");
        setTimeout(() => setCartMessage(null), 2000);
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      setCartMessage("Failed to add to cart");
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
    console.log("Toggle wishlist:", product._id);
  };

  const formatPrice = (price: number) => {
    return format(price);
  };

  // Handle both v1 and v2 API structures
  const basePrice = product.pricing?.basePrice || 0;
  const salePrice = product.pricing?.salePrice;

  const discountPercentage = salePrice
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : 0;

  // Get the primary image or first image
  const getProductImage = () => {
    console.log("Product images:", product.images); // Debug log
    if (product.images && product.images.length > 0) {
      // If images is an array of strings (URLs) - v1 API
      if (typeof product.images[0] === "string") {
        return product.images[0];
      }
      // If images is an array of objects - v2 API
      if (typeof product.images[0] === "object") {
        // First try to find the primary image
        const primaryImage = product.images.find((img) => img.isPrimary);
        if (primaryImage) {
          // v2 API uses 'url' property
          if (primaryImage.url) {
            console.log("Using primary image (v2):", primaryImage.url); // Debug log
            return primaryImage.url;
          }
          // v1 API fallback
          if (primaryImage.url) {
            console.log("Using primary image (v1):", primaryImage.url); // Debug log
            return primaryImage.url;
          }
        }
        // If no primary image, use the first image
        if (product.images[0].url) {
          console.log("Using first image (v2):", product.images[0].url); // Debug log
          return product.images[0].url;
        }
        if (product.images[0].url) {
          console.log("Using first image (v1):", product.images[0].url); // Debug log
          return product.images[0].url;
        }
      }
    }
    console.log("No image found for product:", product.name); // Debug log
    return null;
  };

  const productImage = getProductImage();

  const handleImageError = () => {
    setImageError(true);
  };

  const isInStock = (product.inventory?.stockQuantity || 0) > 0;
  const showNewBadge = product.tags?.includes("new");

  return (
    <motion.div
      className="group min-h-[300px] max-w-[350px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      {/* Product Image Container */}
      <div className="relative cursor-pointer hover:text-orange-500 mb-3 overflow-hidden bg-[url(https://res.cloudinary.com/shelflife-online/image/upload/f_auto,q_auto:eco/v1700810497/img/product-overlay.png)]">
        {/* NEW Badge or Sale Badge */}
        {showNewBadge ? (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-black px-2 py-1 text-base font-bold">
              NEW
            </span>
          </div>
        ) : salePrice ? (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-black px-2 py-1 text-base font-bold">
              -{discountPercentage}%
            </span>
          </div>
        ) : null}

        {/* Quick Action Icons - Top Right */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {enableWishlist && (
            <button
              onClick={handleWishlist}
              className="text-black hover:text-orange-500 transition-colors"
            >
              <Heart
                className="h-5 w-5"
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>
          )}
          <button className="text-black hover:text-orange-500 transition-colors">
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Add to Cart Button - Bottom Right */}
        <div className="absolute bottom-2 right-2 z-10">
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || isAddingToCart}
            className={`flex text-black px-2 py-1 text-base font-bold gap-2 transition-colors ${
              isInStock && !isAddingToCart
                ? "hover:text-orange-500 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            {isAddingToCart ? (
              <>
                Adding...{" "}
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              </>
            ) : (
              <>
                {isInStock ? "Add To Cart" : "Out of Stock"} <Plus size={20} />
              </>
            )}
          </button>
        </div>

        {/* Product Image */}
        <Link href={`/products/${product._id}`}>
          <div className="relative aspect-square">
            {productImage && !imageError ? (
              <Image
                src={productImage}
                alt={product.name}
                fill
                className="object-scale-down pt-[50px] pb-[72px] px-2 transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError}
                unoptimized={productImage.includes("localhost")} // Disable optimization for local images
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 pt-[50px] pb-[72px] px-2">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Cart Message Toast */}
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20"
          >
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  cartMessage === "Added to cart!"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-800">
                {cartMessage}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1 py-5 mb-2">
        {/* Category/Brand */}
        <div className="text-xs text-black uppercase">
          <strong>
            {product.categoryId?.name || "Uncategorized"}
          </strong>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="font-medium cursor-pointer line-clamp-2 text-[#2f2f2f] mb-2 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="text-black font-semibold">
          {salePrice ? (
            <>
              {formatPrice(salePrice)}{" "}
              <span className="text-gray-500 line-through text-sm font-normal ml-1">
                {formatPrice(basePrice)}
              </span>
            </>
          ) : (
            formatPrice(basePrice)
          )}
        </div>

        {/* Stock Status */}
        {!isInStock && <div className="text-red-500 text-sm">Out of Stock</div>}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags
              .filter((tag) => tag !== "new")
              .map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
