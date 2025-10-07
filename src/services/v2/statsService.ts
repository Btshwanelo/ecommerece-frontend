import { api, endpoints } from '@/lib/api';
import { ProductService } from './productService';
import { UserService } from './userService';
import { OrderService } from './orderService';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  ordersByStatus: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

export class StatsService {
  // Get dashboard statistics by aggregating data from multiple endpoints
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch data from multiple endpoints in parallel
      const [productsResponse, usersResponse, ordersResponse] = await Promise.all([
        ProductService.getProducts({ limit: 1000 }), // Get all products
        UserService.getUsers({ limit: 1000 }), // Get all users
        OrderService.getOrders({ limit: 1000 }) // Get all orders
      ]);

      // Calculate total products
      const totalProducts = productsResponse.products?.length || 0;

      // Calculate total customers (filter by role 'customer')
      const users = (usersResponse as any).users || usersResponse.data || [];
      const totalCustomers = users.filter((user: any) => 
        user.role === 'customer' || user.role === 'user'
      ).length;

      // Calculate total orders and revenue
      const orders = (ordersResponse as any).orders || ordersResponse.data || [];
      const totalOrders = orders.length;
      
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + (order.total || 0);
      }, 0);

      // Calculate orders by status
      const ordersByStatus = orders.reduce((acc: any, order: any) => {
        const status = order.status || 'unknown';
        const existing = acc.find((item: any) => item._id === status);
        
        if (existing) {
          existing.count += 1;
          existing.totalValue += order.total || 0;
        } else {
          acc.push({
            _id: status,
            count: 1,
            totalValue: order.total || 0
          });
        }
        
        return acc;
      }, []);

      return {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        ordersByStatus
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if there's an error
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        ordersByStatus: []
      };
    }
  }

  // Get product statistics
  static async getProductStats() {
    try {
      const response = await ProductService.getProducts({ limit: 1000 });
      const products = response.products || [];
      
      const stats = {
        total: products.length,
        byStatus: products.reduce((acc: any, product: any) => {
          const status = product.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        byType: products.reduce((acc: any, product: any) => {
          const type = product.productType || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        lowStock: products.filter((product: any) => 
          product.inventory?.stockQuantity < (product.inventory?.lowStockThreshold || 5)
        ).length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return {
        total: 0,
        byStatus: {},
        byType: {},
        lowStock: 0
      };
    }
  }

  // Get order statistics
  static async getOrderStats() {
    try {
      const response = await OrderService.getOrders({ limit: 1000 });
      const orders = (response as any).orders || response.data || [];
      
      const stats = {
        total: orders.length,
        byStatus: orders.reduce((acc: any, order: any) => {
          const status = order.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        totalRevenue: orders.reduce((sum: number, order: any) => {
          return sum + (order.total || 0);
        }, 0),
        averageOrderValue: orders.length > 0 ? 
          orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0) / orders.length : 0
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        total: 0,
        byStatus: {},
        totalRevenue: 0,
        averageOrderValue: 0
      };
    }
  }
}
