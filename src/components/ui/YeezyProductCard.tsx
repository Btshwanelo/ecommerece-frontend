import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface YeezyProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string; alt?: string }>;
    pricing: {
      basePrice: number;
      salePrice?: number;
      currency?: string;
    };
    categoryId?: {
      name?: string;
    } | string;
  };
  className?: string;
}

export function YeezyProductCard({ product, className }: YeezyProductCardProps) {
  const imageUrl = product.images?.[0]?.url || '/placeholder-product.jpg';
  const price = product.pricing.salePrice || product.pricing.basePrice;
  const currency = product.pricing.currency || '$';
  const categoryName = typeof product.categoryId === 'object' && product.categoryId !== null
    ? product.categoryId?.name 
    : undefined;

  return (
    <Link href={`/products/${product.slug || product._id}`}>
      <div className={cn("group cursor-pointer", className)}>
        <div className="aspect-square bg-neutral-50 mb-3 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={product.images?.[0]?.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </div>
        </div>
        <h3 className="text-sm uppercase tracking-wide font-medium mb-1 text-neutral-900">
          {product.name}
        </h3>
        {categoryName && (
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">
            {categoryName}
          </p>
        )}
        <p className="text-sm text-neutral-900 font-medium">
          {currency}{price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
