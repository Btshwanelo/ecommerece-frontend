import { api, endpoints } from '@/lib/api';
import { 
  User, 
  Address, 
  V2ApiResponse, 
  V2PaginatedResponse 
} from '@/types';

export interface UserFilters {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  role?: 'admin' | 'user' | 'guest';
  isEmailVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  // Authentication
  static async login(credentials: LoginCredentials): Promise<V2ApiResponse<{ user: User; token: string }>> {
    const response = await api.post(endpoints.auth.login, credentials);
    return response.data;
  }

  static async register(credentials: RegisterCredentials): Promise<V2ApiResponse<{ user: User; token: string }>> {
    const response = await api.post(endpoints.auth.register, credentials);
    return response.data;
  }

  static async getProfile(): Promise<V2ApiResponse<User>> {
    const response = await api.get(endpoints.auth.profile);
    return response.data;
  }

  static async updateProfile(userData: Partial<User>): Promise<V2ApiResponse<User>> {
    const response = await api.put(endpoints.auth.profile, userData);
    return response.data;
  }

  static async updateProfileWithAvatar(formData: FormData): Promise<V2ApiResponse<User>> {
    const response = await api.put(endpoints.auth.profile, formData);
    return response.data;
  }

  static async changePassword(passwordData: ChangePasswordData): Promise<V2ApiResponse<void>> {
    const response = await api.put(endpoints.auth.changePassword, passwordData);
    return response.data;
  }

  // User Management (Admin only)
  static async getUsers(filters: UserFilters = {}): Promise<V2PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${endpoints.users.list}?${params.toString()}`);
    return response.data;
  }

  static async getUserById(id: string): Promise<V2ApiResponse<User>> {
    const response = await api.get(endpoints.users.detail(id));
    return response.data;
  }

  static async createUser(userData: Partial<User>): Promise<V2ApiResponse<User>> {
    const response = await api.post(endpoints.users.create, userData);
    return response.data;
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<V2ApiResponse<User>> {
    const response = await api.put(endpoints.users.update(id), userData);
    return response.data;
  }

  static async deleteUser(id: string): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoints.users.delete(id));
    return response.data;
  }

  // Address Management
  static async getAddresses(): Promise<V2ApiResponse<Address[]>> {
    const response = await api.get(endpoints.users.addresses);
    return response.data;
  }

  static async getAddressById(id: string): Promise<V2ApiResponse<Address>> {
    const response = await api.get(endpoints.users.addressDetail(id));
    return response.data;
  }

  static async createAddress(addressData: Partial<Address>): Promise<V2ApiResponse<Address>> {
    const response = await api.post(endpoints.users.createAddress, addressData);
    return response.data;
  }

  static async updateAddress(id: string, addressData: Partial<Address>): Promise<V2ApiResponse<Address>> {
    const response = await api.put(endpoints.users.updateAddress(id), addressData);
    return response.data;
  }

  static async deleteAddress(id: string): Promise<V2ApiResponse<void>> {
    const response = await api.delete(endpoints.users.deleteAddress(id));
    return response.data;
  }

  // Search users
  static async searchUsers(query: string): Promise<V2PaginatedResponse<User>> {
    return this.getUsers({ search: query });
  }

  // Get users by role
  static async getUsersByRole(role: 'admin' | 'user' | 'guest'): Promise<V2PaginatedResponse<User>> {
    return this.getUsers({ role });
  }
}

export default UserService;
