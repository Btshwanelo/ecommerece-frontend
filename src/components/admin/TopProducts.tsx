"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/storeConfig";

export default function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=5&sort=-views`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Top Products API Response:", data); // Debug log
          const productsArray = Array.isArray(data.products) ? data.products : [];
          setProducts(productsArray);
        } else {
          console.error("Failed to fetch top products:", response.status, response.statusText);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching top products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="h-12 w-12 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No products found</p>
        ) : (
          products.map((product, index) => (
            <div key={product._id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(product?.pricing?.basePrice)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-sm text-gray-500">
                  {product.views || 0} views
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
