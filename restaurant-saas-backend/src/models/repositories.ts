/**
 * Repository pattern for data access
 * This provides a clean abstraction layer for database operations
 * In production, these would connect to MongoDB/PostgreSQL
 */

// Import storage
import {
  users,
  restaurants,
  tables,
  sessions,
  categories,
  menuItems,
  orders,
  payments,
  generateId,
  now,
  addMinutes,
} from './store';

// Import types
import {
  User,
  UserRole,
  UserStatus,
  Restaurant,
  Table,
  Session,
  Category,
  MenuItem,
  Order,
  OrderStatus,
  OrderItem,
  Payment,
  PaymentStatus,
  PaymentMethod,
  CreateOrderDTO,
  CreateOrderItemDTO,
  Language,
} from '../types';

import { config } from '../config';
import { DEFAULT_TAX_RATE } from '../config/constants';

// ============================================================================
// USER REPOSITORY
// ============================================================================

export const userRepository = {
  findById(id: string): User | undefined {
    return users.get(id);
  },

  findByEmail(email: string): User | undefined {
    return Array.from(users.values()).find((u) => u.email === email);
  },

  findByRestaurant(restaurantId: string): User[] {
    return Array.from(users.values()).filter((u) => u.restaurantId === restaurantId);
  },

  create(data: Partial<User>): User {
    const user: User = {
      id: generateId('user'),
      email: data.email || '',
      password: data.password || '',
      name: data.name || '',
      role: data.role || UserRole.STAFF,
      restaurantId: data.restaurantId || null,
      status: UserStatus.ACTIVE,
      createdAt: now(),
      updatedAt: now(),
    };
    users.set(user.id, user);
    return user;
  },

  update(id: string, data: Partial<User>): User | null {
    const user = users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: now() };
    users.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return users.delete(id);
  },
};

// ============================================================================
// RESTAURANT REPOSITORY
// ============================================================================

export const restaurantRepository = {
  findById(id: string): Restaurant | undefined {
    return restaurants.get(id);
  },

  findBySlug(slug: string): Restaurant | undefined {
    return Array.from(restaurants.values()).find((r) => r.slug === slug);
  },

  findAll(): Restaurant[] {
    return Array.from(restaurants.values());
  },

  findActive(): Restaurant[] {
    return Array.from(restaurants.values()).filter((r) => r.isActive);
  },

  create(data: Partial<Restaurant>): Restaurant {
    const restaurant: Restaurant = {
      id: generateId('rest'),
      name: data.name || '',
      slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || '',
      description: data.description || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      logo: data.logo,
      coverImage: data.coverImage,
      timezone: data.timezone || 'Europe/Istanbul',
      currency: data.currency || 'TRY',
      isActive: true,
      settings: data.settings || {
        orderTimeoutMinutes: 30,
        maxItemsPerOrder: 20,
        allowTips: true,
        tipOptions: [10, 15, 20],
        requireCustomerName: false,
        enablePayments: true,
      },
      createdAt: now(),
      updatedAt: now(),
    };
    restaurants.set(restaurant.id, restaurant);
    return restaurant;
  },

  update(id: string, data: Partial<Restaurant>): Restaurant | null {
    const restaurant = restaurants.get(id);
    if (!restaurant) return null;
    const updated = { ...restaurant, ...data, updatedAt: now() };
    restaurants.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return restaurants.delete(id);
  },
};

// ============================================================================
// TABLE REPOSITORY
// ============================================================================

export const tableRepository = {
  findById(id: string): Table | undefined {
    return tables.get(id);
  },

  findByRestaurant(restaurantId: string): Table[] {
    return Array.from(tables.values())
      .filter((t) => t.restaurantId === restaurantId)
      .sort((a, b) => a.number.localeCompare(b.number));
  },

  findByNumber(restaurantId: string, number: string): Table | undefined {
    return Array.from(tables.values()).find(
      (t) => t.restaurantId === restaurantId && t.number === number
    );
  },

  create(restaurantId: string, data: Partial<Table>): Table {
    const table: Table = {
      id: generateId('table'),
      restaurantId,
      number: data.number || '',
      capacity: data.capacity || 2,
      posX: data.posX,
      posY: data.posY,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    tables.set(table.id, table);
    return table;
  },

  update(id: string, data: Partial<Table>): Table | null {
    const table = tables.get(id);
    if (!table) return null;
    const updated = { ...table, ...data, updatedAt: now() };
    tables.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return tables.delete(id);
  },
};

// ============================================================================
// SESSION REPOSITORY
// ============================================================================

export const sessionRepository = {
  findById(id: string): Session | undefined {
    return sessions.get(id);
  },

  findByTable(tableId: string): Session | undefined {
    return Array.from(sessions.values()).find(
      (s) => s.tableId === tableId && s.isActive
    );
  },

  findByRestaurant(restaurantId: string): Session[] {
    return Array.from(sessions.values()).filter(
      (s) => s.restaurantId === restaurantId && s.isActive
    );
  },

  create(data: Partial<Session>): Session {
    const session: Session = {
      id: generateId('sess'),
      tableId: data.tableId || '',
      restaurantId: data.restaurantId || '',
      customerId: data.customerId,
      customerName: data.customerName,
      language: data.language || config.defaultLanguage,
      startedAt: now(),
      expiresAt: addMinutes(now(), config.sessionTimeoutMinutes),
      isActive: true,
      cart: data.cart || [],
    };
    sessions.set(session.id, session);
    return session;
  },

  update(id: string, data: Partial<Session>): Session | null {
    const session = sessions.get(id);
    if (!session) return null;
    const updated = { ...session, ...data };
    sessions.set(id, updated);
    return updated;
  },

  addToCart(sessionId: string, item: { menuItemId: string; quantity: number; notes?: string; price: number }): Session | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const existingIndex = session.cart.findIndex((c) => c.menuItemId === item.menuItemId);
    if (existingIndex >= 0) {
      session.cart[existingIndex].quantity += item.quantity;
    } else {
      session.cart.push({ ...item, quantity: item.quantity, notes: item.notes });
    }

    sessions.set(sessionId, session);
    return session;
  },

  removeFromCart(sessionId: string, menuItemId: string): Session | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    session.cart = session.cart.filter((c) => c.menuItemId !== menuItemId);
    sessions.set(sessionId, session);
    return session;
  },

  clearCart(sessionId: string): Session | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    session.cart = [];
    sessions.set(sessionId, session);
    return session;
  },

  expire(id: string): Session | null {
    return this.update(id, { isActive: false });
  },

  delete(id: string): boolean {
    return sessions.delete(id);
  },

  // Clean up expired sessions
  cleanupExpired(): number {
    let cleaned = 0;
    sessions.forEach((session) => {
      if (session.isActive && session.expiresAt < now()) {
        session.isActive = false;
        cleaned++;
      }
    });
    return cleaned;
  },
};

// ============================================================================
// CATEGORY REPOSITORY
// ============================================================================

export const categoryRepository = {
  findById(id: string): Category | undefined {
    return categories.get(id);
  },

  findByRestaurant(restaurantId: string): Category[] {
    return Array.from(categories.values())
      .filter((c) => c.restaurantId === restaurantId && c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  create(restaurantId: string, data: Partial<Category>): Category {
    const category: Category = {
      id: generateId('cat'),
      restaurantId,
      name: data.name || { en: '' },
      description: data.description || { en: '' },
      image: data.image,
      sortOrder: data.sortOrder || categories.size + 1,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    categories.set(category.id, category);
    return category;
  },

  update(id: string, data: Partial<Category>): Category | null {
    const category = categories.get(id);
    if (!category) return null;
    const updated = { ...category, ...data, updatedAt: now() };
    categories.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return categories.delete(id);
  },
};

// ============================================================================
// MENU ITEM REPOSITORY
// ============================================================================

export const menuItemRepository = {
  findById(id: string): MenuItem | undefined {
    return menuItems.get(id);
  },

  findByCategory(categoryId: string): MenuItem[] {
    return Array.from(menuItems.values())
      .filter((m) => m.categoryId === categoryId && m.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  findByRestaurant(restaurantId: string): MenuItem[] {
    return Array.from(menuItems.values())
      .filter((m) => m.restaurantId === restaurantId && m.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  search(restaurantId: string, query: string): MenuItem[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(menuItems.values()).filter(
      (m) =>
        m.restaurantId === restaurantId &&
        m.isActive &&
        (m.name.en?.toLowerCase().includes(lowerQuery) ||
          m.description.en?.toLowerCase().includes(lowerQuery))
    );
  },

  create(restaurantId: string, data: Partial<MenuItem>): MenuItem {
    const menuItem: MenuItem = {
      id: generateId('item'),
      restaurantId,
      categoryId: data.categoryId || '',
      name: data.name || { en: '' },
      description: data.description || { en: '' },
      price: data.price || 0,
      currency: data.currency || 'TRY',
      image: data.image,
      images: data.images,
      options: data.options,
      tags: data.tags,
      isAvailable: data.isAvailable !== false,
      preparationTime: data.preparationTime,
      calories: data.calories,
      sortOrder: data.sortOrder || menuItems.size + 1,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    menuItems.set(menuItem.id, menuItem);
    return menuItem;
  },

  update(id: string, data: Partial<MenuItem>): MenuItem | null {
    const menuItem = menuItems.get(id);
    if (!menuItem) return null;
    const updated = { ...menuItem, ...data, updatedAt: now() };
    menuItems.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return menuItems.delete(id);
  },
};

// ============================================================================
// ORDER REPOSITORY
// ============================================================================

export const orderRepository = {
  findById(id: string): Order | undefined {
    return orders.get(id);
  },

  findByRestaurant(restaurantId: string, filters?: { status?: OrderStatus; limit?: number }): Order[] {
    let result = Array.from(orders.values()).filter(
      (o) => o.restaurantId === restaurantId
    );

    if (filters?.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    return result
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, filters?.limit || 100);
  },

  findByTable(tableId: string): Order[] {
    return Array.from(orders.values())
      .filter((o) => o.tableId === tableId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  findBySession(sessionId: string): Order[] {
    return Array.from(orders.values()).filter((o) => o.sessionId === sessionId);
  },

  create(data: CreateOrderDTO, items: OrderItem[], restaurantCurrency: string): Order {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * DEFAULT_TAX_RATE;
    const orderNumber = `ORD-${(orders.size + 1).toString().padStart(3, '0')}`;

    const order: Order = {
      id: generateId('order'),
      restaurantId: data.restaurantId,
      tableId: data.tableId,
      sessionId: data.sessionId,
      orderNumber,
      customerName: data.customerName,
      items,
      subtotal,
      tax: Math.round(tax * 100) / 100,
      discount: 0,
      tip: data.tip || 0,
      total: Math.round((subtotal + tax + (data.tip || 0)) * 100) / 100,
      currency: restaurantCurrency,
      status: OrderStatus.PENDING,
      notes: data.notes,
      createdAt: now(),
      updatedAt: now(),
    };
    orders.set(order.id, order);
    return order;
  },

  updateStatus(id: string, status: OrderStatus): Order | null {
    const order = orders.get(id);
    if (!order) return null;

    const updated: Order = {
      ...order,
      status,
      updatedAt: now(),
      completedAt: status === OrderStatus.COMPLETED ? now() : order.completedAt,
    };
    orders.set(id, updated);
    return updated;
  },

  addItem(id: string, item: OrderItem): Order | null {
    const order = orders.get(id);
    if (!order) return null;

    order.items.push(item);
    order.subtotal += item.subtotal;
    order.tax = Math.round(order.subtotal * DEFAULT_TAX_RATE * 100) / 100;
    order.total = Math.round((order.subtotal + order.tax + order.tip) * 100) / 100;
    order.updatedAt = now();

    orders.set(id, order);
    return order;
  },

  update(id: string, data: Partial<Order>): Order | null {
    const order = orders.get(id);
    if (!order) return null;
    const updated = { ...order, ...data, updatedAt: now() };
    orders.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return orders.delete(id);
  },

  getStats(restaurantId: string): {
    total: number;
    byStatus: Record<string, number>;
    revenue: number;
  } {
    const restaurantOrders = this.findByRestaurant(restaurantId);

    return {
      total: restaurantOrders.length,
      byStatus: restaurantOrders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      revenue: restaurantOrders
        .filter((o) => o.status === OrderStatus.COMPLETED)
        .reduce((sum, o) => sum + o.total, 0),
    };
  },
};

// ============================================================================
// PAYMENT REPOSITORY
// ============================================================================

export const paymentRepository = {
  findById(id: string): Payment | undefined {
    return payments.get(id);
  },

  findByOrder(orderId: string): Payment | undefined {
    return Array.from(payments.values()).find((p) => p.orderId === orderId);
  },

  findByRestaurant(restaurantId: string): Payment[] {
    return Array.from(payments.values()).filter(
      (p) => p.restaurantId === restaurantId
    );
  },

  create(data: Partial<Payment>): Payment {
    const payment: Payment = {
      id: generateId('pay'),
      orderId: data.orderId || '',
      restaurantId: data.restaurantId || '',
      amount: data.amount || 0,
      currency: data.currency || 'TRY',
      method: data.method || PaymentMethod.CARD,
      status: data.status || PaymentStatus.PENDING,
      transactionId: data.transactionId,
      metadata: data.metadata,
      createdAt: now(),
      updatedAt: now(),
    };
    payments.set(payment.id, payment);
    return payment;
  },

  update(id: string, data: Partial<Payment>): Payment | null {
    const payment = payments.get(id);
    if (!payment) return null;
    const updated = { ...payment, ...data, updatedAt: now() };
    payments.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return payments.delete(id);
  },
};