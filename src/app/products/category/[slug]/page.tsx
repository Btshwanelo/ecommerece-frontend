"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import {
  Product,
  Category,
  Color,
  Size,
  Material,
  Gender,
  Season,
  Style,
  Pattern,
  ShoeHeight,
  Fit,
  Occasion,
  CollarType,
} from "@/types";
import { Search, Filter, Grid, List, ChevronDown, X } from "lucide-react";
import {
  ProductService,
  CategoryService,
  AttributeService,
} from "@/services/v2";
import { ProductFilters } from "@/types";

export default function CategoryProductsPage() {
  const params = useParams();
  const categorySlug = params.slug as string;

  // State for products and categories
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Attribute filters
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [selectedShoeHeights, setSelectedShoeHeights] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedCollarTypes, setSelectedCollarTypes] = useState<string[]>([]);

  // Available attributes
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [shoeHeights, setShoeHeights] = useState<ShoeHeight[]>([]);
  const [fits, setFits] = useState<Fit[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [collarTypes, setCollarTypes] = useState<CollarType[]>([]);

  // Get category display name
  const getCategoryDisplayName = (slug: string) => {
    switch (slug) {
      case "kids":
        return "Kids";
      case "men":
        return "Men";
      case "women":
        return "Women";
      case "sales":
        return "Sale";
      case "new":
        return "New Arrivals";
      default:
        return category?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
    }
  };

  // Check if it's a special category
  const isSpecialCategory = (slug: string) => {
    return ["sales", "new"].includes(slug);
  };

  // Build filters object
  const buildFilters = useCallback((): ProductFilters => {
    const filters: ProductFilters = {
      page: currentPage,
      limit: 12,
      status: ["published"],
    };

    // Handle special categories
    if (isSpecialCategory(categorySlug)) {
      if (categorySlug === "sales") {
        // Filter for products with sale prices
        filters.salePrice = true;
      } else if (categorySlug === "new") {
        // Filter for new products (you might want to add a date filter here)
        filters.sort = "newest";
      }
    } else {
      // Regular category filter
      if (category?._id) {
        filters.categoryId = category._id;
      }
    }

    if (searchQuery) {
      filters.search = searchQuery;
    }

    if (priceRange.min) {
      filters.minPrice = Number(priceRange.min);
    }

    if (priceRange.max) {
      filters.maxPrice = Number(priceRange.max);
    }

    // Handle sorting
    if (sortBy === "price") {
      filters.sort = sortOrder === "asc" ? "price_asc" : "price_desc";
    } else if (sortBy === "name") {
      filters.sort = sortOrder === "asc" ? "name_asc" : "name_desc";
    } else if (sortBy === "newest") {
      filters.sort = sortOrder === "asc" ? "newest" : "oldest";
    }

    // Add attribute filters
    if (selectedColors.length > 0) {
      filters.colorIds = selectedColors;
    }
    if (selectedSizes.length > 0) {
      filters.sizeIds = selectedSizes;
    }
    if (selectedMaterials.length > 0) {
      filters.materialIds = selectedMaterials;
    }
    if (selectedGenders.length > 0) {
      filters.genderIds = selectedGenders;
    }
    if (selectedSeasons.length > 0) {
      filters.seasonIds = selectedSeasons;
    }
    if (selectedStyles.length > 0) {
      filters.styleIds = selectedStyles;
    }
    if (selectedPatterns.length > 0) {
      filters.patternIds = selectedPatterns;
    }
    if (selectedShoeHeights.length > 0) {
      filters.shoeHeightIds = selectedShoeHeights;
    }
    if (selectedFits.length > 0) {
      filters.fitIds = selectedFits;
    }
    if (selectedOccasions.length > 0) {
      filters.occasionIds = selectedOccasions;
    }
    if (selectedCollarTypes.length > 0) {
      filters.collarTypeIds = selectedCollarTypes;
    }

    return filters;
  }, [
    categorySlug,
    category,
    searchQuery,
    priceRange,
    sortBy,
    sortOrder,
    currentPage,
    selectedColors,
    selectedSizes,
    selectedMaterials,
    selectedGenders,
    selectedSeasons,
    selectedStyles,
    selectedPatterns,
    selectedShoeHeights,
    selectedFits,
    selectedOccasions,
    selectedCollarTypes,
  ]);

  // Fetch products with filters
  const fetchProductsWithFilters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Don't fetch products if category doesn't exist (for non-special categories)
      if (!isSpecialCategory(categorySlug) && category === null) {
        console.warn("Skipping product fetch - category not found:", categorySlug);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
        return;
      }

      const filters = buildFilters();
      console.log("Fetching products with filters:", filters);

      // Use the new API endpoint that accepts category slug
      const response = await ProductService.getProductsByCategorySlug(
        categorySlug,
        filters
      );
      console.log("Products API response:", response);

      if (response.success) {
        const productsData = response.products || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setTotalProducts(response.total || 0);
        setTotalPages(response.pages || 1);
      } else {
        console.warn("Failed to fetch products:", response.error);
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
  }, [categorySlug, buildFilters, category]);

  // Fetch category details
  const fetchCategory = useCallback(async () => {
    if (isSpecialCategory(categorySlug)) {
      return;
    }

    try {
      const response = await CategoryService.getCategoryBySlug(categorySlug);
      console.log("Category API response:", response);

      if (response.success) {
        setCategory(response.category || response.data || null);
      } else {
        console.warn("Category not found:", response.error);
        // Set category to null to show "not found" state
        setCategory(null);
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      // Set category to null to show "not found" state
      setCategory(null);
    }
  }, [categorySlug]);

  // Fetch attributes
  const fetchAttributes = useCallback(async () => {
    try {
      const [
        colorsRes,
        sizesRes,
        materialsRes,
        gendersRes,
        seasonsRes,
        stylesRes,
        patternsRes,
        shoeHeightsRes,
        fitsRes,
        occasionsRes,
        collarTypesRes,
      ] = await Promise.all([
        AttributeService.getColors(),
        AttributeService.getSizes(),
        AttributeService.getMaterials(),
        AttributeService.getGenders(),
        AttributeService.getSeasons(),
        AttributeService.getStyles(),
        AttributeService.getPatterns(),
        AttributeService.getShoeHeights(),
        AttributeService.getFits(),
        AttributeService.getOccasions(),
        AttributeService.getCollarTypes(),
      ]);

      if (colorsRes.success)
        setColors((colorsRes as any).colors || colorsRes.data || []);
      if (sizesRes.success) setSizes((sizesRes as any).sizes || sizesRes.data || []);
      if (materialsRes.success)
        setMaterials((materialsRes as any).materials || materialsRes.data || []);
      if (gendersRes.success)
        setGenders((gendersRes as any).genders || gendersRes.data || []);
      if (seasonsRes.success)
        setSeasons((seasonsRes as any).seasons || seasonsRes.data || []);
      if (stylesRes.success)
        setStyles((stylesRes as any).styles || stylesRes.data || []);
      if (patternsRes.success)
        setPatterns((patternsRes as any).patterns || patternsRes.data || []);
      if (shoeHeightsRes.success)
        setShoeHeights((shoeHeightsRes as any).shoeHeights || shoeHeightsRes.data || []);
      if (fitsRes.success) setFits((fitsRes as any).fits || fitsRes.data || []);
      if (occasionsRes.success)
        setOccasions((occasionsRes as any).occasions || occasionsRes.data || []);
      if (collarTypesRes.success)
        setCollarTypes((collarTypesRes as any).collarTypes || collarTypesRes.data || []);
    } catch (err) {
      console.error("Error fetching attributes:", err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCategory();
    fetchAttributes();
  }, [fetchCategory, fetchAttributes]);

  // Fetch products when filters change or category is loaded
  useEffect(() => {
    fetchProductsWithFilters();
  }, [fetchProductsWithFilters]);

  // Toggle attribute filter
  const toggleAttribute = (type: string, id: string) => {
    switch (type) {
      case "color":
        setSelectedColors((prev) =>
          prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
        break;
      case "size":
        setSelectedSizes((prev) =>
          prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
        break;
      case "material":
        setSelectedMaterials((prev) =>
          prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
        break;
      case "gender":
        setSelectedGenders((prev) =>
          prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
        break;
      case "season":
        setSelectedSeasons((prev) =>
          prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
        break;
      case "style":
        setSelectedStyles((prev) =>
          prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
        break;
      case "pattern":
        setSelectedPatterns((prev) =>
          prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
        break;
      case "shoeHeight":
        setSelectedShoeHeights((prev) =>
          prev.includes(id) ? prev.filter((sh) => sh !== id) : [...prev, id]
        );
        break;
      case "fit":
        setSelectedFits((prev) =>
          prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
        break;
      case "occasion":
        setSelectedOccasions((prev) =>
          prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
        break;
      case "collarType":
        setSelectedCollarTypes((prev) =>
          prev.includes(id) ? prev.filter((ct) => ct !== id) : [...prev, id]
        );
        break;
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setSelectedGenders([]);
    setSelectedSeasons([]);
    setSelectedStyles([]);
    setSelectedPatterns([]);
    setSelectedShoeHeights([]);
    setSelectedFits([]);
    setSelectedOccasions([]);
    setSelectedCollarTypes([]);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      searchQuery ||
      priceRange.min ||
      priceRange.max ||
      selectedColors.length > 0 ||
      selectedSizes.length > 0 ||
      selectedMaterials.length > 0 ||
      selectedGenders.length > 0 ||
      selectedSeasons.length > 0 ||
      selectedStyles.length > 0 ||
      selectedPatterns.length > 0 ||
      selectedShoeHeights.length > 0 ||
      selectedFits.length > 0 ||
      selectedOccasions.length > 0 ||
      selectedCollarTypes.length > 0
    );
  };

  // Handle category not found
  if (!isSpecialCategory(categorySlug) && category === null && !loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0112 4c-2.34 0-4.29 1.009-5.824 2.709" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
              <p className="text-gray-600 mb-6">
                The category "{categorySlug}" you're looking for doesn't exist or has been removed.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.href = '/products'}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md hover:bg-orange-600 transition-colors"
                >
                  Browse All Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-black mb-2">
              {getCategoryDisplayName(categorySlug)}
            </h1>
            <p className="text-gray-600">
              {totalProducts} {totalProducts === 1 ? "product" : "products"}{" "}
              available
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                onClick={clearAllFilters}
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

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Colors */}
                {colors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-black mb-3">
                      Colors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color._id}
                          onClick={() => toggleAttribute("color", color._id)}
                          className={`w-8 h-8 cursor-pointer border transition-all ${
                            selectedColors.includes(color._id)
                              ? "border-orange-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color.hexCode }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {sizes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-black mb-3">
                      Sizes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size._id}
                          onClick={() => toggleAttribute("size", size._id)}
                          className={`px-3 py-1 text-sm border transition-colors ${
                            selectedSizes.includes(size._id)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white text-black border-gray-300 hover:border-orange-500"
                          }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genders */}
                {genders.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-black mb-3">
                      Gender
                    </h3>
                    <div className="space-y-2">
                      {genders.map((gender) => (
                        <label
                          key={gender._id}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGenders.includes(gender._id)}
                            onChange={() =>
                              toggleAttribute("gender", gender._id)
                            }
                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-black group-hover:text-orange-500 transition-colors">
                            {gender.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials */}
                {materials.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-black mb-3">
                      Materials
                    </h3>
                    <div className="space-y-2">
                      {materials.map((material) => (
                        <label
                          key={material._id}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material._id)}
                            onChange={() =>
                              toggleAttribute("material", material._id)
                            }
                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-black group-hover:text-orange-500 transition-colors">
                            {material.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Styles */}
                {styles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-black mb-3">
                      Styles
                    </h3>
                    <div className="space-y-2">
                      {styles.map((style) => (
                        <label
                          key={style._id}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStyles.includes(style._id)}
                            onChange={() => toggleAttribute("style", style._id)}
                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-black group-hover:text-orange-500 transition-colors">
                            {style.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className=" p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium text-black border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-black">
                        Sort by:
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      >
                        <option value="newest">Newest</option>
                        <option value="price">Price</option>
                        <option value="name">Name</option>
                      </select>
                      {/* <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transform ${
                            sortOrder === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      </button> */}
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

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">
                      Loading products...
                    </div>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-xl text-gray-600 mb-4">
                    No products found
                  </p>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearAllFilters}
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Clear filters to see all products
                    </button>
                  )}
                </div>
              ) : (
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
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-black border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === page
                              ? "bg-orange-500 text-white"
                              : "text-black border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-black border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
