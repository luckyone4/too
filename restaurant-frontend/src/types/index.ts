// Types for the Restaurant QR Ordering System

export type Language = 'en' | 'tr' | 'de' | 'ru' | 'fr' | 'ar';

export const RTL_LANGUAGES: Language[] = ['ar'];

export interface LocalizedText {
  en: string;
  tr: string;
  de: string;
  ru: string;
  fr: string;
  ar: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  coverImage: string;
  timezone: string;
  currency: string;
  isActive: boolean;
  settings: RestaurantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantSettings {
  orderTimeoutMinutes: number;
  maxItemsPerOrder: number;
  allowTips: boolean;
  tipOptions: number[];
  requireCustomerName: boolean;
  enablePayments: boolean;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: LocalizedText | string;
  description: LocalizedText | string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: LocalizedText | string;
  description: LocalizedText | string;
  price: number;
  currency: string;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime?: number;
  allergens?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  number: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  tableId: string;
  restaurantId: string;
  language: Language;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
  expiresIn: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  sessionId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  currency: string;
  status: OrderStatus;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'card' | 'cash' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  restaurantId: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface MenuResponse {
  restaurant: Restaurant;
  categories: Category[];
}

export interface TableSessionResponse {
  restaurant: Restaurant;
  table: Table;
  session: Session;
  isNew: boolean;
}

export interface AnalyticsData {
  total: number;
  currency: string;
  orders: number;
  averageOrderValue: number;
  comparison: {
    previous: number;
    changePercent: number;
  };
}
