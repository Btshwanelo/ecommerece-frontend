import { api, endpoints } from '@/lib/api';
import { Category } from '@/types';

export interface CategoryResponse {
  success: boolean;
  categories: Category[];
}

export interface SingleCategoryResponse {
  success: boolean;
  category: Category;
}

class CategoryService {
  // Get all categories
  async getCategories(): Promise<CategoryResponse> {
    try {
      const response = await api.get(endpoints.categories.list);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get a single category by ID
  async getCategoryById(id: string): Promise<SingleCategoryResponse> {
    try {
      const response = await api.get(endpoints.categories.detail(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // Get a single category by slug
  async getCategoryBySlug(slug: string): Promise<SingleCategoryResponse> {
    try {
      const response = await api.get(`/categories/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }

  // Get categories by type
  async getCategoriesByType(type: string): Promise<CategoryResponse> {
    try {
      const response = await api.get(`/categories/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories by type:', error);
      throw error;
    }
  }

  // Get category with subcategories
  async getCategoryWithSubcategories(slug: string): Promise<SingleCategoryResponse> {
    try {
      const response = await api.get(`/categories/${slug}/subcategories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category with subcategories:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;

