import { api, endpoints } from '@/lib/api';
import { 
  Order, 
  V2ApiResponse, 
  V2PaginatedResponse 
} from '@/types';

export interface OrderFilters {
  page?: number;
  limit?: number;
  sort?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  userId?: string;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface CheckoutInitiateData {
  sessionId?: string;
  guestId?: string;
}

export interface CheckoutCompleteData {
  orderId?: string;
  addressId?: string;
  deliveryOptionId?: string;
  paymentMethod: string;
  notes?: string;
  address?: {
    fullName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export class OrderService {
  // Get orders with filtering
  static async getOrders(filters: OrderFilters = {}): Promise<V2PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${endpoints.orders.list}?${params.toString()}`);
    return response.data;
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<V2ApiResponse<Order>> {
    const response = await api.get(endpoints.orders.detail(id));
    return response.data;
  }

  // Checkout process
  static async initiateCheckout(data: CheckoutInitiateData = {}): Promise<V2ApiResponse<any>> {
    const headers: Record<string, string> = {};
    
    if (data.sessionId) {
      headers['x-session-id'] = data.sessionId;
    }
    
    if (data.guestId) {
      headers['x-guest-id'] = data.guestId;
    }

    const response = await api.post(endpoints.orders.initiateCheckout, {}, { headers });
    return response.data;
  }

  static async completeCheckout(data: CheckoutCompleteData): Promise<V2ApiResponse<Order>> {
    try {
      const response = await api.post(endpoints.orders.completeCheckout, data);
      return response.data;
    } catch (error: any) {
      console.error('Checkout completion error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status: OrderFilters['status']): Promise<V2PaginatedResponse<Order>> {
    return this.getOrders({ status });
  }

  // Get orders by payment status
  static async getOrdersByPaymentStatus(paymentStatus: OrderFilters['paymentStatus']): Promise<V2PaginatedResponse<Order>> {
    return this.getOrders({ paymentStatus });
  }

  // Get orders by user
  static async getOrdersByUser(userId: string): Promise<V2PaginatedResponse<Order>> {
    return this.getOrders({ userId });
  }

  // Search orders
  static async searchOrders(query: string): Promise<V2PaginatedResponse<Order>> {
    return this.getOrders({ search: query });
  }

  // Get orders by date range
  static async getOrdersByDateRange(startDate: string, endDate: string): Promise<V2PaginatedResponse<Order>> {
    return this.getOrders({ createdAfter: startDate, createdBefore: endDate });
  }

  // Get recent orders
  static async getRecentOrders(limit: number = 10): Promise<V2PaginatedResponse<Order>> {
    return this.getOrders({ limit, sort: '-createdAt' });
  }
}

export default OrderService;
