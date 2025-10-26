import { api, endpoints } from '@/lib/api';
import { 
  Product, 
  ProductVariant, 
  ProductFilters, 
  V2ProductResponse, 
  V2ApiResponse,
  V2PaginatedResponse 
} from '@/types';
import ErrorHandler from '@/utils/errorHandler';

export class ProductService {
  // Get products with advanced filtering
  static async getProducts(filters: ProductFilters = {}): Promise<V2ProductResponse> {
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}[]`, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const url = `${endpoints.products.list}?${params.toString()}`;
    console.log("Calling products API:", url);
    console.log("Filters:", filters);
    const response = await api.get(url);
    console.log("Raw API response:", response);
    console.log("Response data:", response.data);
    return response.data;
  }

  // Get products by category slug
  static async getProductsByCategorySlug(categorySlug: string, filters: ProductFilters = {}): Promise<V2ProductResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add all filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const url = `/products/category/slug/${categorySlug}?${params.toString()}`;
      console.log("Calling products by category slug API:", url);
      console.log("Filters:", filters);
      const response = await api.get(url);
      console.log("Raw API response:", response);
      console.log("Response data:", response.data);
      
      // Check if the response indicates a 404 (handled by interceptor)
      if (response.status === 404 || !response.data.success) {
        return {
          success: false,
          error: response.data.error || 'Category not found',
          products: [],
          total: 0,
          pages: 1,
        } as V2ProductResponse;
      }
      
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'ProductService.getProductsByCategorySlug');
      
      // This should rarely happen now since 404s are handled by the interceptor
      if (ErrorHandler.isNotFound(error)) {
        return {
          success: false,
          error: 'Category not found',
          products: [],
          total: 0,
          pages: 1,
        } as V2ProductResponse;
      }
      
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Search products
  static async searchProducts(query: string, filters: ProductFilters = {}): Promise<V2ProductResponse> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}[]`, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`${endpoints.products.search}?${params.toString()}`);
    return response.data;
  }

  // Get product by ID
  static async getProductById(id: string): Promise<V2ApiResponse<Product>> {
    const response = await api.get(endpoints.products.detail(id));
    return response.data;
  }

  // Get product by slug
  static async getProductBySlug(slug: string): Promise<V2ApiResponse<Product>> {
    try {
      const response = await api.get(endpoints.products.bySlug(slug));
      
      // Check if the response indicates a 404 (handled by interceptor)
      if (response.status === 404 || !response.data.success) {
        return {
          success: false,
          error: response.data.error || 'Product not found',
          data: null,
        } as V2ApiResponse<Product>;
      }
      
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'ProductService.getProductBySlug');
      
      // This should rarely happen now since 404s are handled by the interceptor
      if (ErrorHandler.isNotFound(error)) {
        return {
          success: false,
          error: 'Product not found',
          data: null,
        } as V2ApiResponse<Product>;
      }
      
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Get trending products
  static async getTrendingProducts(limit: number = 10): Promise<V2ApiResponse<Product[]>> {
    const response = await api.get(`${endpoints.products.trending}?limit=${limit}`);
    return response.data;
  }

  // Get new products
  static async getNewProducts(limit: number = 10): Promise<V2ApiResponse<Product[]>> {
    const response = await api.get(`${endpoints.products.new}?limit=${limit}`);
    return response.data;
  }

  // Create product
  static async createProduct(productData: Partial<Product>): Promise<V2ApiResponse<Product>> {
    const response = await api.post(endpoints.products.create, productData);
    return response.data;
  }

  // Create product with images (FormData)
  static async createProductWithImages(formData: FormData): Promise<V2ApiResponse<Product>> {
    const response = await api.post(endpoints.products.create, formData);
    return response.data;
  }

  // Update product
  static async updateProduct(id: string, productData: Partial<Product>): Promise<V2ApiResponse<Product>> {
    const response = await api.put(endpoints.products.update(id), productData);
    return response.data;
  }

  // Update product with images (FormData)
  static async updateProductWithImages(id: string, formData: FormData): Promise<V2ApiResponse<Product>> {
    const response = await api.put(endpoints.products.update(id), formData);
    return response.data;
  }

  // Delete product
  static async deleteProduct(id: string): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoints.products.delete(id));
    return response.data;
  }

  // Product Variants
  static async getProductVariants(productId: string): Promise<V2ApiResponse<ProductVariant[]>> {
    const response = await api.get(endpoints.products.variants(productId));
    return response.data;
  }

  static async createProductVariant(productId: string, variantData: Partial<ProductVariant>): Promise<V2ApiResponse<ProductVariant>> {
    const response = await api.post(endpoints.products.createVariant(productId), variantData);
    return response.data;
  }

  static async createProductVariantWithImages(productId: string, formData: FormData): Promise<V2ApiResponse<ProductVariant>> {
    const response = await api.post(endpoints.products.createVariant(productId), formData);
    return response.data;
  }

  static async updateProductVariant(variantId: string, variantData: Partial<ProductVariant>): Promise<V2ApiResponse<ProductVariant>> {
    const response = await api.put(endpoints.products.updateVariant(variantId), variantData);
    return response.data;
  }

  static async updateProductVariantWithImages(variantId: string, formData: FormData): Promise<V2ApiResponse<ProductVariant>> {
    const response = await api.put(endpoints.products.updateVariant(variantId), formData);
    return response.data;
  }

  static async deleteProductVariant(variantId: string): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoints.products.deleteVariant(variantId));
    return response.data;
  }

  // Get filter options for category
  static async getCategoryFilters(categoryId: string, filters: ProductFilters = {}): Promise<V2ApiResponse<any>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}[]`, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`${endpoints.products.categoryFilters(categoryId)}?${params.toString()}`);
    return response.data;
  }
}

export default ProductService;
