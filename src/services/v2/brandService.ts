import { api, endpoints } from '@/lib/api';
import { 
  Brand, 
  V2ApiResponse, 
  V2PaginatedResponse 
} from '@/types';

export interface BrandFilters {
  page?: number;
  limit?: number;
  sort?: string;
  isActive?: boolean;
  search?: string;
}

export class BrandService {
  // Get brands with filtering
  static async getBrands(filters: BrandFilters = {}): Promise<V2PaginatedResponse<Brand>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${endpoints.brands.list}?${params.toString()}`);
    return response.data;
  }

  // Get brand by ID
  static async getBrandById(id: string): Promise<V2ApiResponse<Brand>> {
    const response = await api.get(endpoints.brands.detail(id));
    return response.data;
  }

  // Get brand by slug
  static async getBrandBySlug(slug: string): Promise<V2ApiResponse<Brand>> {
    const response = await api.get(endpoints.brands.bySlug(slug));
    return response.data;
  }

  // Create brand
  static async createBrand(brandData: Partial<Brand>): Promise<V2ApiResponse<Brand>> {
    const response = await api.post(endpoints.brands.create, brandData);
    return response.data;
  }

  // Create brand with logo (FormData)
  static async createBrandWithLogo(formData: FormData): Promise<V2ApiResponse<Brand>> {
    const response = await api.post(endpoints.brands.create, formData);
    return response.data;
  }

  // Update brand
  static async updateBrand(id: string, brandData: Partial<Brand>): Promise<V2ApiResponse<Brand>> {
    const response = await api.put(endpoints.brands.update(id), brandData);
    return response.data;
  }

  // Update brand with logo (FormData)
  static async updateBrandWithLogo(id: string, formData: FormData): Promise<V2ApiResponse<Brand>> {
    const response = await api.put(endpoints.brands.update(id), formData);
    return response.data;
  }

  // Delete brand
  static async deleteBrand(id: string): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoints.brands.delete(id));
    return response.data;
  }

  // Search brands
  static async searchBrands(query: string): Promise<V2PaginatedResponse<Brand>> {
    return this.getBrands({ search: query });
  }
}

export default BrandService;
