import { api, endpoints } from '@/lib/api';
import { 
  Attribute,
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
  V2ApiResponse, 
  V2PaginatedResponse,
  V2AllAttributesResponse
} from '@/types';

export interface AttributeFilters {
  page?: number;
  limit?: number;
  sort?: string;
  isActive?: boolean;
  search?: string;
  categoryId?: string;
}

export class AttributeService {
  // Generic attribute operations
  private static async getAttributes<T extends Attribute>(
    endpoint: string,
    filters: AttributeFilters = {}
  ): Promise<V2PaginatedResponse<T>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${endpoint}?${params.toString()}`);
    return response.data;
  }

  private static async getAttributeById<T extends Attribute>(
    endpoint: (id: string) => string,
    id: string
  ): Promise<V2ApiResponse<T>> {
    const response = await api.get(endpoint(id));
    return response.data;
  }

  private static async getAttributeBySlug<T extends Attribute>(
    endpoint: (slug: string) => string,
    slug: string
  ): Promise<V2ApiResponse<T>> {
    const response = await api.get(endpoint(slug));
    return response.data;
  }

  private static async createAttribute<T extends Attribute>(
    endpoint: string,
    data: Partial<T>
  ): Promise<V2ApiResponse<T>> {
    const response = await api.post(endpoint, data);
    return response.data;
  }

  private static async createAttributeWithFile<T extends Attribute>(
    endpoint: string,
    formData: FormData
  ): Promise<V2ApiResponse<T>> {
    const response = await api.post(endpoint, formData);
    return response.data;
  }

  private static async updateAttribute<T extends Attribute>(
    endpoint: (id: string) => string,
    id: string,
    data: Partial<T>
  ): Promise<V2ApiResponse<T>> {
    const response = await api.put(endpoint(id), data);
    return response.data;
  }

  private static async updateAttributeWithFile<T extends Attribute>(
    endpoint: (id: string) => string,
    id: string,
    formData: FormData
  ): Promise<V2ApiResponse<T>> {
    const response = await api.put(endpoint(id), formData);
    return response.data;
  }

  private static async deleteAttribute(
    endpoint: (id: string) => string,
    id: string
  ): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoint(id));
    return response.data;
  }

  // Colors
  static async getColors(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Color>> {
    return this.getAttributes<Color>(endpoints.attributes.colors.list, filters);
  }

  static async getColorById(id: string): Promise<V2ApiResponse<Color>> {
    return this.getAttributeById<Color>(endpoints.attributes.colors.detail, id);
  }

  static async getColorBySlug(slug: string): Promise<V2ApiResponse<Color>> {
    return this.getAttributeBySlug<Color>(endpoints.attributes.colors.bySlug, slug);
  }

  static async createColor(data: Partial<Color>): Promise<V2ApiResponse<Color>> {
    return this.createAttribute<Color>(endpoints.attributes.colors.create, data);
  }

  static async updateColor(id: string, data: Partial<Color>): Promise<V2ApiResponse<Color>> {
    return this.updateAttribute<Color>(endpoints.attributes.colors.update, id, data);
  }

  static async deleteColor(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.colors.delete, id);
  }

  // Sizes
  static async getSizes(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Size>> {
    return this.getAttributes<Size>(endpoints.attributes.sizes.list, filters);
  }

  static async getSizeById(id: string): Promise<V2ApiResponse<Size>> {
    return this.getAttributeById<Size>(endpoints.attributes.sizes.detail, id);
  }

  static async getSizeBySlug(slug: string): Promise<V2ApiResponse<Size>> {
    return this.getAttributeBySlug<Size>(endpoints.attributes.sizes.bySlug, slug);
  }

  static async createSize(data: Partial<Size>): Promise<V2ApiResponse<Size>> {
    return this.createAttribute<Size>(endpoints.attributes.sizes.create, data);
  }

  static async updateSize(id: string, data: Partial<Size>): Promise<V2ApiResponse<Size>> {
    return this.updateAttribute<Size>(endpoints.attributes.sizes.update, id, data);
  }

  static async deleteSize(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.sizes.delete, id);
  }

  // Materials
  static async getMaterials(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Material>> {
    return this.getAttributes<Material>(endpoints.attributes.materials.list, filters);
  }

  static async getMaterialById(id: string): Promise<V2ApiResponse<Material>> {
    return this.getAttributeById<Material>(endpoints.attributes.materials.detail, id);
  }

  static async getMaterialBySlug(slug: string): Promise<V2ApiResponse<Material>> {
    return this.getAttributeBySlug<Material>(endpoints.attributes.materials.bySlug, slug);
  }

  static async createMaterial(data: Partial<Material>): Promise<V2ApiResponse<Material>> {
    return this.createAttribute<Material>(endpoints.attributes.materials.create, data);
  }

  static async updateMaterial(id: string, data: Partial<Material>): Promise<V2ApiResponse<Material>> {
    return this.updateAttribute<Material>(endpoints.attributes.materials.update, id, data);
  }

  static async deleteMaterial(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.materials.delete, id);
  }

  // Genders
  static async getGenders(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Gender>> {
    return this.getAttributes<Gender>(endpoints.attributes.genders.list, filters);
  }

  static async getGenderById(id: string): Promise<V2ApiResponse<Gender>> {
    return this.getAttributeById<Gender>(endpoints.attributes.genders.detail, id);
  }

  static async getGenderBySlug(slug: string): Promise<V2ApiResponse<Gender>> {
    return this.getAttributeBySlug<Gender>(endpoints.attributes.genders.bySlug, slug);
  }

  static async createGender(data: Partial<Gender>): Promise<V2ApiResponse<Gender>> {
    return this.createAttribute<Gender>(endpoints.attributes.genders.create, data);
  }

  static async updateGender(id: string, data: Partial<Gender>): Promise<V2ApiResponse<Gender>> {
    return this.updateAttribute<Gender>(endpoints.attributes.genders.update, id, data);
  }

  static async deleteGender(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.genders.delete, id);
  }

  // Seasons
  static async getSeasons(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Season>> {
    return this.getAttributes<Season>(endpoints.attributes.seasons.list, filters);
  }

  static async getSeasonById(id: string): Promise<V2ApiResponse<Season>> {
    return this.getAttributeById<Season>(endpoints.attributes.seasons.detail, id);
  }

  static async getSeasonBySlug(slug: string): Promise<V2ApiResponse<Season>> {
    return this.getAttributeBySlug<Season>(endpoints.attributes.seasons.bySlug, slug);
  }

  static async createSeason(data: Partial<Season>): Promise<V2ApiResponse<Season>> {
    return this.createAttribute<Season>(endpoints.attributes.seasons.create, data);
  }

  static async updateSeason(id: string, data: Partial<Season>): Promise<V2ApiResponse<Season>> {
    return this.updateAttribute<Season>(endpoints.attributes.seasons.update, id, data);
  }

  static async deleteSeason(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.seasons.delete, id);
  }

  // Styles
  static async getStyles(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Style>> {
    return this.getAttributes<Style>(endpoints.attributes.styles.list, filters);
  }

  static async getStylesByCategory(categoryId: string): Promise<V2ApiResponse<Style[]>> {
    const response = await api.get(endpoints.attributes.styles.byCategory(categoryId));
    return response.data;
  }

  static async getStyleById(id: string): Promise<V2ApiResponse<Style>> {
    return this.getAttributeById<Style>(endpoints.attributes.styles.detail, id);
  }

  static async getStyleBySlug(slug: string): Promise<V2ApiResponse<Style>> {
    return this.getAttributeBySlug<Style>(endpoints.attributes.styles.bySlug, slug);
  }

  static async createStyle(data: Partial<Style>): Promise<V2ApiResponse<Style>> {
    return this.createAttribute<Style>(endpoints.attributes.styles.create, data);
  }

  static async updateStyle(id: string, data: Partial<Style>): Promise<V2ApiResponse<Style>> {
    return this.updateAttribute<Style>(endpoints.attributes.styles.update, id, data);
  }

  static async deleteStyle(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.styles.delete, id);
  }

  // Patterns
  static async getPatterns(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Pattern>> {
    return this.getAttributes<Pattern>(endpoints.attributes.patterns.list, filters);
  }

  static async getPatternById(id: string): Promise<V2ApiResponse<Pattern>> {
    return this.getAttributeById<Pattern>(endpoints.attributes.patterns.detail, id);
  }

  static async getPatternBySlug(slug: string): Promise<V2ApiResponse<Pattern>> {
    return this.getAttributeBySlug<Pattern>(endpoints.attributes.patterns.bySlug, slug);
  }

  static async createPattern(data: Partial<Pattern>): Promise<V2ApiResponse<Pattern>> {
    return this.createAttribute<Pattern>(endpoints.attributes.patterns.create, data);
  }

  static async createPatternWithImage(formData: FormData): Promise<V2ApiResponse<Pattern>> {
    return this.createAttributeWithFile<Pattern>(endpoints.attributes.patterns.create, formData);
  }

  static async updatePattern(id: string, data: Partial<Pattern>): Promise<V2ApiResponse<Pattern>> {
    return this.updateAttribute<Pattern>(endpoints.attributes.patterns.update, id, data);
  }

  static async updatePatternWithImage(id: string, formData: FormData): Promise<V2ApiResponse<Pattern>> {
    return this.updateAttributeWithFile<Pattern>(endpoints.attributes.patterns.update, id, formData);
  }

  static async deletePattern(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.patterns.delete, id);
  }

  // Shoe Heights
  static async getShoeHeights(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<ShoeHeight>> {
    return this.getAttributes<ShoeHeight>(endpoints.attributes.shoeHeights.list, filters);
  }

  static async getShoeHeightsByCategory(categoryId: string): Promise<V2ApiResponse<ShoeHeight[]>> {
    const response = await api.get(endpoints.attributes.shoeHeights.byCategory(categoryId));
    return response.data;
  }

  static async getShoeHeightById(id: string): Promise<V2ApiResponse<ShoeHeight>> {
    return this.getAttributeById<ShoeHeight>(endpoints.attributes.shoeHeights.detail, id);
  }

  static async getShoeHeightBySlug(slug: string): Promise<V2ApiResponse<ShoeHeight>> {
    return this.getAttributeBySlug<ShoeHeight>(endpoints.attributes.shoeHeights.bySlug, slug);
  }

  static async createShoeHeight(data: Partial<ShoeHeight>): Promise<V2ApiResponse<ShoeHeight>> {
    return this.createAttribute<ShoeHeight>(endpoints.attributes.shoeHeights.create, data);
  }

  static async updateShoeHeight(id: string, data: Partial<ShoeHeight>): Promise<V2ApiResponse<ShoeHeight>> {
    return this.updateAttribute<ShoeHeight>(endpoints.attributes.shoeHeights.update, id, data);
  }

  static async deleteShoeHeight(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.shoeHeights.delete, id);
  }

  // Fits
  static async getFits(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Fit>> {
    return this.getAttributes<Fit>(endpoints.attributes.fits.list, filters);
  }

  static async getFitsByCategory(categoryId: string): Promise<V2ApiResponse<Fit[]>> {
    const response = await api.get(endpoints.attributes.fits.byCategory(categoryId));
    return response.data;
  }

  static async getFitById(id: string): Promise<V2ApiResponse<Fit>> {
    return this.getAttributeById<Fit>(endpoints.attributes.fits.detail, id);
  }

  static async getFitBySlug(slug: string): Promise<V2ApiResponse<Fit>> {
    return this.getAttributeBySlug<Fit>(endpoints.attributes.fits.bySlug, slug);
  }

  static async createFit(data: Partial<Fit>): Promise<V2ApiResponse<Fit>> {
    return this.createAttribute<Fit>(endpoints.attributes.fits.create, data);
  }

  static async updateFit(id: string, data: Partial<Fit>): Promise<V2ApiResponse<Fit>> {
    return this.updateAttribute<Fit>(endpoints.attributes.fits.update, id, data);
  }

  static async deleteFit(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.fits.delete, id);
  }

  // Occasions
  static async getOccasions(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<Occasion>> {
    return this.getAttributes<Occasion>(endpoints.attributes.occasions.list, filters);
  }

  static async getOccasionById(id: string): Promise<V2ApiResponse<Occasion>> {
    return this.getAttributeById<Occasion>(endpoints.attributes.occasions.detail, id);
  }

  static async getOccasionBySlug(slug: string): Promise<V2ApiResponse<Occasion>> {
    return this.getAttributeBySlug<Occasion>(endpoints.attributes.occasions.bySlug, slug);
  }

  static async createOccasion(data: Partial<Occasion>): Promise<V2ApiResponse<Occasion>> {
    return this.createAttribute<Occasion>(endpoints.attributes.occasions.create, data);
  }

  static async updateOccasion(id: string, data: Partial<Occasion>): Promise<V2ApiResponse<Occasion>> {
    return this.updateAttribute<Occasion>(endpoints.attributes.occasions.update, id, data);
  }

  static async deleteOccasion(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.occasions.delete, id);
  }

  // Collar Types
  static async getCollarTypes(filters: AttributeFilters = {}): Promise<V2PaginatedResponse<CollarType>> {
    return this.getAttributes<CollarType>(endpoints.attributes.collarTypes.list, filters);
  }

  static async getCollarTypesByCategory(categoryId: string): Promise<V2ApiResponse<CollarType[]>> {
    const response = await api.get(endpoints.attributes.collarTypes.byCategory(categoryId));
    return response.data;
  }

  static async getCollarTypeById(id: string): Promise<V2ApiResponse<CollarType>> {
    return this.getAttributeById<CollarType>(endpoints.attributes.collarTypes.detail, id);
  }

  static async getCollarTypeBySlug(slug: string): Promise<V2ApiResponse<CollarType>> {
    return this.getAttributeBySlug<CollarType>(endpoints.attributes.collarTypes.bySlug, slug);
  }

  static async createCollarType(data: Partial<CollarType>): Promise<V2ApiResponse<CollarType>> {
    return this.createAttribute<CollarType>(endpoints.attributes.collarTypes.create, data);
  }

  static async updateCollarType(id: string, data: Partial<CollarType>): Promise<V2ApiResponse<CollarType>> {
    return this.updateAttribute<CollarType>(endpoints.attributes.collarTypes.update, id, data);
  }

  static async deleteCollarType(id: string): Promise<V2ApiResponse<void>> {
    return this.deleteAttribute(endpoints.attributes.collarTypes.delete, id);
  }

  // Get all attributes for a category
  static async getAllAttributesForCategory(categoryId: string): Promise<V2AllAttributesResponse> {
    const response = await api.get(endpoints.attributes.allForCategory(categoryId));
    return response.data;
  }
}

export default AttributeService;
