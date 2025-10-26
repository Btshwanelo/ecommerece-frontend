import { api, endpoints } from '@/lib/api';
import { 
  Category, 
  V2ApiResponse, 
  V2PaginatedResponse, 
  V2CategoryTreeResponse 
} from '@/types';
import ErrorHandler from '@/utils/errorHandler';

export interface CategoryFilters {
  page?: number;
  limit?: number;
  sort?: string;
  parentCategory?: string;
  level?: number;
  isActive?: boolean;
  search?: string;
}

export class CategoryService {
  // Get categories with filtering
  static async getCategories(filters: CategoryFilters = {}): Promise<V2PaginatedResponse<Category>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${endpoints.categories.list}?${params.toString()}`);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.getCategories');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Get category tree (hierarchical)
  static async getCategoryTree(): Promise<V2CategoryTreeResponse> {
    try {
      const response = await api.get(endpoints.categories.tree);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.getCategoryTree');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<V2ApiResponse<Category>> {
    try {
      const response = await api.get(endpoints.categories.detail(id));
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.getCategoryById');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<V2ApiResponse<Category>> {
    try {
      const response = await api.get(endpoints.categories.bySlug(slug));
      
      // Check if the response indicates a 404 (handled by interceptor)
      if (response.status === 404 || !response.data.success) {
        return {
          success: false,
          error: response.data.error || 'Category not found',
          data: undefined,
        } as V2ApiResponse<Category>;
      }
      
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.getCategoryBySlug');
      
      // This should rarely happen now since 404s are handled by the interceptor
      if (ErrorHandler.isNotFound(error)) {
        return {
          success: false,
          error: 'Category not found',
          data: undefined,
        } as V2ApiResponse<Category>;
      }
      
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Get category breadcrumb
  static async getCategoryBreadcrumb(id: string): Promise<V2ApiResponse<Category[]>> {
    try {
      const response = await api.get(endpoints.categories.breadcrumb(id));
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.getCategoryBreadcrumb');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Create category
  static async createCategory(categoryData: Partial<Category>): Promise<V2ApiResponse<Category>> {
    try {
      const response = await api.post(endpoints.categories.create, categoryData);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.createCategory');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Create category with image (FormData)
  static async createCategoryWithImage(formData: FormData): Promise<V2ApiResponse<Category>> {
    try {
      const response = await api.post(endpoints.categories.create, formData);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.createCategoryWithImage');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Update category
  static async updateCategory(id: string, categoryData: Partial<Category>): Promise<V2ApiResponse<Category>> {
    try {
      const response = await api.put(endpoints.categories.update(id), categoryData);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.updateCategory');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Update category with image (FormData)
  static async updateCategoryWithImage(id: string, formData: FormData): Promise<V2ApiResponse<Category>> {
    try {
      const response = await api.put(endpoints.categories.update(id), formData);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.updateCategoryWithImage');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Delete category
  static async deleteCategory(id: string): Promise<V2ApiResponse<void>> {
    try {
      const response = await api.delete(endpoints.categories.delete(id));
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, 'CategoryService.deleteCategory');
      throw ErrorHandler.handleApiError(error);
    }
  }

  // Get categories by level
  static async getCategoriesByLevel(level: number): Promise<V2PaginatedResponse<Category>> {
    return this.getCategories({ level });
  }

  // Get categories by parent
  static async getCategoriesByParent(parentId: string | null): Promise<V2PaginatedResponse<Category>> {
    return this.getCategories({ parentCategory: parentId || undefined });
  }

  // Search categories
  static async searchCategories(query: string): Promise<V2PaginatedResponse<Category>> {
    return this.getCategories({ search: query });
  }
}

export default CategoryService;
