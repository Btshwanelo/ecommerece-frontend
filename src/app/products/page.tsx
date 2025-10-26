"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { Product, Category } from "@/types";
import { Search, Filter, Grid, List, ChevronDown, X } from "lucide-react";
import { ProductService, CategoryService } from "@/services/v2";
import { ProductFilters } from "@/types";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // State for products and categories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build filters object
  const buildFilters = useCallback((): ProductFilters => {
    const filters: ProductFilters = {
      page: currentPage,
      limit: 12,
      status: ["published"], // Use v2 compatible status
    };

    if (searchQuery) {
      filters.search = searchQuery;
    }

    if (selectedCategory) {
      filters.categoryId = selectedCategory;
    }

    if (priceRange.min) {
      filters.minPrice = Number(priceRange.min);
    }

    if (priceRange.max) {
      filters.maxPrice = Number(priceRange.max);
    }

    // Handle sorting - use v2 compatible sort values
    if (sortBy === "price") {
      filters.sort = sortOrder === "asc" ? "price_asc" : "price_desc";
    } else if (sortBy === "name") {
      filters.sort = sortOrder === "asc" ? "name_asc" : "name_desc";
    } else {
      filters.sort = sortOrder === "asc" ? "newest" : "oldest";
    }

    return filters;
  }, [
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  // Fetch products with filters
  const fetchProductsWithFilters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = buildFilters();
      console.log("Fetching products with filters:", filters);

      const response = await ProductService.getProducts(filters);
      console.log("Products API response:", response);

      if (response.success) {
        const productsData = response.products || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setTotalProducts(response.total || 0);
        setTotalPages(response.pages || 1);
      } else {
        console.error("Failed to fetch products:", response.error);
        setError(response.error || "Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await CategoryService.getCategories();
      console.log("Categories API response:", response);

      if (response.success) {
        const categoriesData = response.categories || response.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        console.error("Failed to fetch categories:", response.error);
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProductsWithFilters();
  }, [fetchProductsWithFilters]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchQuery || selectedCategory || priceRange.min || priceRange.max;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-black mb-2">All Products</h1>
            <p className="text-gray-600">Discover our complete collection</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          {/* <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div> */}

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-black">
                Active Filters:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-orange-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                  Category:{" "}
                  {categories.find((c) => c._id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-orange-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                  Price: {priceRange.min || "0"} - {priceRange.max || "∞"}
                  <button
                    onClick={() => setPriceRange({ min: "", max: "" })}
                    className="hover:text-orange-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div
              className={`${
                showFilters
                  ? "fixed inset-0 z-50 bg-white overflow-y-auto lg:relative lg:block"
                  : "hidden lg:block"
              } lg:w-64 flex-shrink-0`}
            >
              <div className="lg:sticky lg:top-4 p-6 ">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-black uppercase">
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-black"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-black hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium text-black border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                    <p className="text-sm text-gray-600">
                      Showing {products.length} of {totalProducts} products
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-black">
                        Sort by:
                      </label>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split("-");
                          setSortBy(field);
                          setSortOrder(order as "asc" | "desc");
                        }}
                        className="px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      >
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="price-asc">Price Low to High</option>
                        <option value="price-desc">Price High to Low</option>
                      </select>
                    </div>

                    {/* View Mode */}
                    {/* <div className="flex items-center gap-1 border border-gray-300 rounded-md overflow-hidden">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 transition-colors ${
                          viewMode === "grid"
                            ? "bg-orange-500 text-white"
                            : "text-gray-500 hover:text-orange-500 hover:bg-gray-50"
                        }`}
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 transition-colors ${
                          viewMode === "list"
                            ? "bg-orange-500 text-white"
                            : "text-gray-500 hover:text-orange-500 hover:bg-gray-50"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">
                      Loading products...
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-24">
                  <p className="text-red-600 text-lg mb-4">
                    Error loading products: {error}
                  </p>
                  <button
                    onClick={() => fetchProductsWithFilters()}
                    className="px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-xl text-gray-600 mb-4">
                    No products found
                  </p>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Clear filters to see all products
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    }`}
                  >
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <nav className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium text-black border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>

                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              currentPage === page
                                ? "bg-orange-500 text-white"
                                : "text-black border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm font-medium text-black border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
