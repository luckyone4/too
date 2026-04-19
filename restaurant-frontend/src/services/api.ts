import {
  ApiResponse,
  MenuResponse,
  TableSessionResponse,
  Restaurant,
  Table,
  Order,
  CartItem,
  Language,
  AuthResponse,
  AnalyticsData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(): Promise<ApiResponse<AuthResponse['user']>> {
    return this.request('/auth/profile');
  }

  // Restaurants
  async getRestaurants(): Promise<ApiResponse<Restaurant[]>> {
    return this.request('/restaurants');
  }

  async getRestaurant(id: string): Promise<ApiResponse<Restaurant>> {
    return this.request(`/restaurants/${id}`);
  }

  // Menu
  async getMenu(restaurantId: string, lang: Language = 'en'): Promise<ApiResponse<MenuResponse>> {
    return this.request(`/restaurants/${restaurantId}/menu?lang=${lang}`);
  }

  async getPublicMenu(restaurantId: string, lang: Language = 'en'): Promise<ApiResponse<MenuResponse>> {
    return this.request(`/restaurant/${restaurantId}/menu?lang=${lang}`);
  }

  // Tables
  async getTables(restaurantId: string): Promise<ApiResponse<Table[]>> {
    return this.request(`/restaurants/${restaurantId}/tables`);
  }

  // Sessions (Public QR)
  async getTableSession(
    restaurantId: string,
    tableId: string
  ): Promise<ApiResponse<TableSessionResponse>> {
    return this.request(`/restaurant/${restaurantId}/table/${tableId}`);
  }

  async getOrCreateSession(
    tableId: string,
    customerName?: string
  ): Promise<ApiResponse<{ session: any; isNew: boolean }>> {
    const params = new URLSearchParams();
    if (customerName) params.append('customerName', customerName);
    return this.request(`/tables/${tableId}/session?${params}`);
  }

  // Cart
  async getCart(tableId: string): Promise<ApiResponse<{ items: CartItem[] }>> {
    return this.request(`/tables/${tableId}/cart`);
  }

  async addToCart(
    tableId: string,
    menuItemId: string,
    quantity: number,
    notes?: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/tables/${tableId}/cart`, {
      method: 'POST',
      body: JSON.stringify({ menuItemId, quantity, notes }),
    });
  }

  async updateCartItem(
    tableId: string,
    menuItemId: string,
    quantity: number
  ): Promise<ApiResponse<any>> {
    return this.request(`/tables/${tableId}/cart/${menuItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(tableId: string, menuItemId: string): Promise<ApiResponse<any>> {
    return this.request(`/tables/${tableId}/cart/${menuItemId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async createOrder(data: {
    restaurantId: string;
    tableId: string;
    sessionId: string;
    items: { menuItemId: string; quantity: number; notes?: string }[];
    customerName: string;
    tip?: number;
  }): Promise<ApiResponse<Order>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(restaurantId?: string): Promise<ApiResponse<Order[]>> {
    const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return this.request(`/orders${params}`);
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async simulatePayment(orderId: string, method: string = 'card'): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  // Analytics
  async getRevenueAnalytics(restaurantId: string): Promise<ApiResponse<AnalyticsData>> {
    return this.request(`/analytics/revenue?restaurantId=${restaurantId}`);
  }

  async getTopProducts(restaurantId: string): Promise<ApiResponse<any>> {
    return this.request(`/analytics/products?restaurantId=${restaurantId}`);
  }

  async getTableAnalytics(restaurantId: string): Promise<ApiResponse<any>> {
    return this.request(`/analytics/tables?restaurantId=${restaurantId}`);
  }
}

export const api = new ApiService();
