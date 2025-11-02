"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Get the primary image or first image
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      // If images is an array of strings (URLs) - v1 API
      if (typeof product.images[0] === "string") {
        return product.images[0];
      }
      // If images is an array of objects - v2/v3 API
      if (typeof product.images[0] === "object") {
        // First try to find the primary image
        const primaryImage = product.images.find((img) => img.isPrimary);
        if (primaryImage?.url) {
          return primaryImage.url;
        }
        // If no primary image, use the first image
        if (product.images[0].url) {
          return product.images[0].url;
        }
      }
    }
    return null;
  };

  const productImage = getProductImage();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={`/products/${product._id}`}>
      <div className="group cursor-pointer">
        {/* Product Image */}
        <div className="aspect-square mb-3 overflow-hidden bg-[url(https://res.cloudinary.com/shelflife-online/image/upload/f_auto,q_auto:eco/v1700810497/img/product-overlay.png)]">
          <div className="relative w-full h-full">
            {productImage && !imageError ? (
              <Image
                src={productImage}
                alt={product.name}
                fill
                className="object-scale-down pt-[50px] pb-[72px] px-2 transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError}
                unoptimized={productImage.includes("localhost")}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 pt-[50px] pb-[72px] px-2">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Name Only */}
        <h3 className="text-sm uppercase text-center tracking-wide font-medium text-neutral-900">
          {product.name}
        </h3>
      </div>
    </Link>
  );
};

export default ProductCard;
