"use client";

import { useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/ui/HeroSection";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types";
import productService from "@/services/productService";
import { useApi } from "@/hooks/useApi";
import { ProductResponse } from "@/services/productService";

export default function Home() {
  // Fetch featured products
  const {
    data: featuredProductsData,
    loading: featuredLoading,
    error: featuredError,
    execute: fetchFeaturedProducts,
  } = useApi<ProductResponse>(
    productService.getFeaturedProducts.bind(productService)
  );

  // Memoize the fetch function to prevent infinite loops
  const fetchFeatured = useCallback(() => {
    fetchFeaturedProducts(8);
  }, [fetchFeaturedProducts]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const featuredProducts = featuredProductsData?.products || [];

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our latest collection of premium athletic footwear and
              apparel
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                Error loading featured products
              </p>
              <button
                onClick={() => fetchFeaturedProducts(8)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <div className="text-center mt-12">
                <a
                  href="/products"
                  className="inline-flex items-center px-8 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200"
                >
                  View All Products
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Running */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Running</h3>
                <p className="mb-6 text-blue-100">
                  From daily training to race day, we have the perfect shoe for
                  every runner.
                </p>
                <a
                  href="/products?category=running"
                  className="inline-flex items-center text-sm font-semibold hover:underline"
                >
                  Shop Running
                </a>
              </div>
            </div>

            {/* Basketball */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Basketball</h3>
                <p className="mb-6 text-orange-100">
                  Dominate the court with our performance basketball shoes.
                </p>
                <a
                  href="/products?category=basketball"
                  className="inline-flex items-center text-sm font-semibold hover:underline"
                >
                  Shop Basketball
                </a>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-white">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Lifestyle</h3>
                <p className="mb-6 text-gray-300">
                  Street style meets comfort in our lifestyle collection.
                </p>
                <a
                  href="/products?category=lifestyle"
                  className="inline-flex items-center text-sm font-semibold hover:underline"
                >
                  Shop Lifestyle
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-gray-300 mb-8">
            Get the latest updates on new releases, exclusive offers, and more.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
