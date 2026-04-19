/**
 * Order Service
 * Business logic for order management
 */

import {
  orderRepository,
  sessionRepository,
  menuItemRepository,
  restaurantRepository,
  tableRepository,
  generateId,
  now,
} from '../models';
import { Order, OrderStatus, CreateOrderDTO, OrderItem, Language, getLocalizedText } from '../types';
import { NotFoundError, ValidationError, ConflictError } from '../middleware/errorHandler';
import { canTransitionOrderStatus } from '../config/constants';
import { DEFAULT_TAX_RATE } from '../config/constants';

/**
 * Create new order
 */
export async function createOrder(data: CreateOrderDTO, lang: Language = 'en'): Promise<Order> {
  // Verify restaurant exists
  const restaurant = restaurantRepository.findById(data.restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  // Verify table exists
  const table = tableRepository.findById(data.tableId);
  if (!table || table.restaurantId !== data.restaurantId) {
    throw new NotFoundError('Table');
  }

  // Verify session exists and is active
  const session = sessionRepository.findById(data.sessionId);
  if (!session || !session.isActive) {
    throw new ValidationError('Session is not active');
  }

  if (session.tableId !== data.tableId) {
    throw new ValidationError('Session does not belong to this table');
  }

  // Build order items
  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of data.items) {
    const menuItem = menuItemRepository.findById(item.menuItemId);
    if (!menuItem || menuItem.restaurantId !== data.restaurantId) {
      throw new NotFoundError('Menu item');
    }

    if (!menuItem.isAvailable || !menuItem.isActive) {
      throw new ValidationError(`Menu item "${getLocalizedText(menuItem.name, lang)}" is not available`);
    }

    const itemSubtotal = menuItem.price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      id: generateId('oi'),
      orderId: '', // Will be set when order is created
      menuItemId: menuItem.id,
      menuItemName: getLocalizedText(menuItem.name, lang),
      quantity: item.quantity,
      unitPrice: menuItem.price,
      notes: item.notes,
      subtotal: Math.round(itemSubtotal * 100) / 100,
    });
  }

  // Calculate totals
  const tax = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax + (data.tip || 0)) * 100) / 100;

  // Create order
  const order = orderRepository.create(
    {
      ...data,
      tip: data.tip || 0,
    },
    orderItems,
    restaurant.currency
  );

  // Update order ID in items
  orderItems.forEach((item) => {
    item.orderId = order.id;
  });

  // Clear the session cart
  sessionRepository.clearCart(data.sessionId);

  return order;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const order = orderRepository.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }
  return order;
}

/**
 * Get orders for restaurant
 */
export async function getRestaurantOrders(
  restaurantId: string,
  filters?: { status?: OrderStatus; limit?: number }
): Promise<Order[]> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  return orderRepository.findByRestaurant(restaurantId, filters);
}

/**
 * Get orders for table
 */
export async function getTableOrders(tableId: string): Promise<Order[]> {
  return orderRepository.findByTable(tableId);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<Order> {
  const order = orderRepository.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  // Validate status transition
  if (!canTransitionOrderStatus(order.status, newStatus)) {
    throw new ValidationError(
      `Cannot transition from "${order.status}" to "${newStatus}"`
    );
  }

  const updated = orderRepository.updateStatus(orderId, newStatus);
  if (!updated) {
    throw new NotFoundError('Order');
  }

  return updated;
}

/**
 * Add items to existing order
 */
export async function addOrderItems(
  orderId: string,
  items: { menuItemId: string; quantity: number; notes?: string }[],
  lang: Language = 'en'
): Promise<Order> {
  const order = orderRepository.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  // Can only add items to pending/confirmed orders
  if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
    throw new ValidationError('Cannot add items to this order');
  }

  const newItems: OrderItem[] = [];

  for (const item of items) {
    const menuItem = menuItemRepository.findById(item.menuItemId);
    if (!menuItem || menuItem.restaurantId !== order.restaurantId) {
      throw new NotFoundError('Menu item');
    }

    if (!menuItem.isAvailable || !menuItem.isActive) {
      throw new ValidationError(`Menu item "${getLocalizedText(menuItem.name, lang)}" is not available`);
    }

    const itemSubtotal = menuItem.price * item.quantity;

    newItems.push({
      id: generateId('oi'),
      orderId,
      menuItemId: menuItem.id,
      menuItemName: getLocalizedText(menuItem.name, lang),
      quantity: item.quantity,
      unitPrice: menuItem.price,
      notes: item.notes,
      subtotal: Math.round(itemSubtotal * 100) / 100,
    });

    // Add to order
    orderRepository.addItem(orderId, newItems[newItems.length - 1]);
  }

  // Return updated order
  return orderRepository.findById(orderId)!;
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  return updateOrderStatus(orderId, OrderStatus.CANCELLED);
}

/**
 * Get order statistics for restaurant
 */
export async function getOrderStats(restaurantId: string): Promise<{
  total: number;
  byStatus: Record<string, number>;
  revenue: number;
}> {
  return orderRepository.getStats(restaurantId);
}

/**
 * Get recent orders with pagination
 */
export async function getRecentOrders(
  restaurantId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ orders: Order[]; total: number }> {
  const allOrders = orderRepository.findByRestaurant(restaurantId);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    orders: allOrders.slice(start, end),
    total: allOrders.length,
  };
}