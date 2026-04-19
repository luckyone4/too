/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Order item entity
 */
export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string; // Snapshot at order time
  quantity: number;
  unitPrice: number;
  options?: SelectedOption[];
  notes?: string;
  subtotal: number;
}

/**
 * Selected option for order item
 */
export interface SelectedOption {
  name: string;
  choices: string[];
  additionalPrice: number;
}

/**
 * Order entity
 */
export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  sessionId: string;
  orderNumber: string; // Human readable (e.g., "ORD-001")
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  currency: string;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Create order DTO
 */
export interface CreateOrderDTO {
  restaurantId: string;
  tableId: string;
  sessionId: string;
  customerName?: string;
  items: CreateOrderItemDTO[];
  notes?: string;
  tip?: number;
}

/**
 * Create order item DTO
 */
export interface CreateOrderItemDTO {
  menuItemId: string;
  quantity: number;
  notes?: string;
  options?: SelectedOption[];
}

/**
 * Update order status DTO
 */
export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}

/**
 * Order statistics
 */
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
}