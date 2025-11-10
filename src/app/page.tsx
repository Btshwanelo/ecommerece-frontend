"use client";

import { useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types";
import { ProductService } from "@/services/v2";
import { useApi } from "@/hooks/useApi";
import { V2ProductResponse } from "@/types";
import { useStoreConfig, useFeatures } from "@/hooks/useStoreConfig";

export default function Home() {
  const { storeDescription } = useStoreConfig();
  const { enableNewsletter } = useFeatures();
  console.log("Render Home Page");

  // Fetch featured products
  const {
    data: featuredProductsData,
    loading: featuredLoading,
    error: featuredError,
    execute: fetchFeaturedProducts,
  } = useApi<V2ProductResponse>(() =>
    ProductService.getProducts({ limit: 12, sort: "newest" })
  );

  // Memoize the fetch function to prevent infinite loops
  const fetchFeatured = useCallback(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const featuredProducts = featuredProductsData?.products || [];

  return (
    <Layout>
      {/* Product Grid - Yeezy Style */}
      <section className="py-8 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          {featuredLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-9">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-neutral-100 aspect-square rounded-sm mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-100 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredError ? (
            <div className="text-center py-20">
              <p className="text-neutral-600 mb-6 text-sm uppercase tracking-wide">
                Unable to load products
              </p>
              <button
                onClick={() => fetchFeaturedProducts()}
                className="px-8 py-3 bg-neutral-900 text-white text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-9">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
