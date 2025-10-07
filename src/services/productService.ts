import { api, endpoints } from "@/lib/api";
import { Product, PaginatedResponse } from "@/types";

export interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  tags?: string | string[];
  search?: string;
}

export interface ProductResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface SingleProductResponse {
  success: boolean;
  product: Product;
}

class ProductService {
  // Get all products with filters
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await api.get(
        `${endpoints.products.list}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  // Get a single product by ID
  async getProductById(id: string): Promise<SingleProductResponse> {
    try {
      const response = await api.get(endpoints.products.detail(id));
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  // Get a single product by slug
  async getProductBySlug(slug: string): Promise<SingleProductResponse> {
    try {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      throw error;
    }
  }

  // Search products
  async searchProducts(
    query: string,
    filters: Omit<ProductFilters, "search"> = {}
  ): Promise<ProductResponse> {
    return this.getProducts({ ...filters, search: query });
  }

  // Get featured products (products with high views or specific tags)
  async getFeaturedProducts(limit: number = 8): Promise<ProductResponse> {
    return this.getProducts({
      limit,
      sort: "newest", // Use v2 compatible sort
      status: "published", // Use v2 compatible status
    });
  }

  // Get products by category
  async getProductsByCategory(
    categoryId: string,
    filters: Omit<ProductFilters, "category"> = {}
  ): Promise<ProductResponse> {
    return this.getProducts({ ...filters, category: categoryId });
  }

  // Get products by brand
  async getProductsByBrand(
    brandId: string,
    filters: Omit<ProductFilters, "brand"> = {}
  ): Promise<ProductResponse> {
    return this.getProducts({ ...filters, brand: brandId });
  }

  // Get products on sale
  async getSaleProducts(
    filters: Omit<ProductFilters, "salePrice"> = {}
  ): Promise<ProductResponse> {
    // This would need backend support for filtering by salePrice > 0
    return this.getProducts({ ...filters, status: "active" });
  }
}

export const productService = new ProductService();
export default productService;

