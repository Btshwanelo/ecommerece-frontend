import { api, endpoints } from '@/lib/api';
import { 
  DeliveryOption, 
  V2ApiResponse, 
  V2PaginatedResponse 
} from '@/types';

export interface DeliveryFilters {
  page?: number;
  limit?: number;
  sort?: string;
  isActive?: boolean;
  region?: string;
}

export interface AvailableDeliveryOptionsParams {
  cartTotal: number;
  weight: number;
  region: string;
}

export class DeliveryService {
  // Get delivery options with filtering
  static async getDeliveryOptions(filters: DeliveryFilters = {}): Promise<V2PaginatedResponse<DeliveryOption>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${endpoints.delivery.list}?${params.toString()}`);
    return response.data;
  }

  // Get available delivery options for checkout
  static async getAvailableDeliveryOptions(params: AvailableDeliveryOptionsParams): Promise<V2ApiResponse<DeliveryOption[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('cartTotal', params.cartTotal.toString());
    queryParams.append('weight', params.weight.toString());
    queryParams.append('region', params.region);

    const response = await api.get(`${endpoints.delivery.available}?${queryParams.toString()}`);
    return response.data;
  }

  // Create delivery option (Admin only)
  static async createDeliveryOption(deliveryData: Partial<DeliveryOption>): Promise<V2ApiResponse<DeliveryOption>> {
    const response = await api.post(endpoints.delivery.create, deliveryData);
    return response.data;
  }

  // Update delivery option (Admin only)
  static async updateDeliveryOption(id: string, deliveryData: Partial<DeliveryOption>): Promise<V2ApiResponse<DeliveryOption>> {
    const response = await api.put(endpoints.delivery.update(id), deliveryData);
    return response.data;
  }

  // Delete delivery option (Admin only)
  static async deleteDeliveryOption(id: string): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoints.delivery.delete(id));
    return response.data;
  }

  // Get active delivery options
  static async getActiveDeliveryOptions(): Promise<V2PaginatedResponse<DeliveryOption>> {
    return this.getDeliveryOptions({ isActive: true });
  }

  // Get delivery options by region
  static async getDeliveryOptionsByRegion(region: string): Promise<V2PaginatedResponse<DeliveryOption>> {
    return this.getDeliveryOptions({ region });
  }
}

export default DeliveryService;


