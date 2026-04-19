/**
 * Analytics Service
 * Mock implementation for reporting and analytics
 */

import {
  orderRepository,
  menuItemRepository,
  tableRepository,
  restaurantRepository,
} from '../models';
import {
  TimeRange,
  DateRange,
  RevenueAnalytics,
  ProductAnalytics,
  TableAnalytics,
  AnalyticsResponse,
  OrderStatus,
} from '../types';
import { NotFoundError } from '../middleware/errorHandler';
import { getDateRange, calculatePercentage, getLocalizedText } from '../utils';

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(
  restaurantId: string,
  range: TimeRange = 'today'
): Promise<RevenueAnalytics> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  const { start, end } = getDateRange(range);

  // Get all orders
  const orders = orderRepository.findByRestaurant(restaurantId);

  // Filter by date range
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= start && orderDate <= end;
  });

  // Calculate completed orders revenue
  const completedOrders = filteredOrders.filter(
    (o) => o.status === OrderStatus.COMPLETED
  );

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = completedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate comparison (mock - 10% variance)
  const previousRevenue = totalRevenue * (0.9 + Math.random() * 0.2);

  return {
    total: Math.round(totalRevenue * 100) / 100,
    currency: restaurant.currency,
    orders: totalOrders,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    comparison: {
      previous: Math.round(previousRevenue * 100) / 100,
      changePercent: calculatePercentage(totalRevenue - previousRevenue, previousRevenue),
    },
  };
}

/**
 * Get top products analytics
 */
export async function getTopProductsAnalytics(
  restaurantId: string,
  range: TimeRange = 'today',
  limit: number = 10
): Promise<ProductAnalytics[]> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  const { start, end } = getDateRange(range);

  // Get all orders
  const orders = orderRepository.findByRestaurant(restaurantId);

  // Filter by date range
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= start && orderDate <= end;
  });

  // Aggregate product sales
  const productSales: Record<string, { quantity: number; revenue: number }> = {};

  for (const order of filteredOrders) {
    for (const item of order.items) {
      if (!productSales[item.menuItemId]) {
        productSales[item.menuItemId] = { quantity: 0, revenue: 0 };
      }
      productSales[item.menuItemId].quantity += item.quantity;
      productSales[item.menuItemId].revenue += item.subtotal;
    }
  }

  // Convert to array and sort
  const productArray = Object.entries(productSales)
    .map(([menuItemId, data]) => {
      const menuItem = menuItemRepository.findById(menuItemId);
      return {
        menuItemId,
        name: menuItem ? getLocalizedText(menuItem.name, 'en') : 'Unknown Item',
        quantity: data.quantity,
        revenue: Math.round(data.revenue * 100) / 100,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  // Calculate total revenue for percentage
  const totalRevenue = productArray.reduce((sum, p) => sum + p.revenue, 0);

  // Add percentage
  return productArray.map((p) => ({
    ...p,
    percentOfTotal: totalRevenue > 0 ? calculatePercentage(p.revenue, totalRevenue) : 0,
  }));
}

/**
 * Get table performance analytics
 */
export async function getTableAnalytics(
  restaurantId: string,
  range: TimeRange = 'today'
): Promise<TableAnalytics[]> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  const { start, end } = getDateRange(range);

  // Get all orders
  const orders = orderRepository.findByRestaurant(restaurantId);
  const tables = tableRepository.findByRestaurant(restaurantId);

  // Filter by date range
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= start && orderDate <= end;
  });

  // Calculate per-table stats
  const tableStats: Record<string, { orders: number; revenue: number }> = {};

  for (const table of tables) {
    tableStats[table.id] = { orders: 0, revenue: 0 };
  }

  for (const order of filteredOrders) {
    if (order.status === OrderStatus.COMPLETED) {
      if (tableStats[order.tableId]) {
        tableStats[order.tableId].orders += 1;
        tableStats[order.tableId].revenue += order.total;
      }
    }
  }

  // Transform to response
  return tables.map((table) => {
    const stats = tableStats[table.id] || { orders: 0, revenue: 0 };
    return {
      tableId: table.id,
      tableNumber: table.number,
      totalOrders: stats.orders,
      totalRevenue: Math.round(stats.revenue * 100) / 100,
      averageOrderValue: stats.orders > 0
        ? Math.round((stats.revenue / stats.orders) * 100) / 100
        : 0,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Get full analytics response
 */
export async function getFullAnalytics(
  restaurantId: string,
  range: TimeRange = 'today'
): Promise<AnalyticsResponse> {
  const { start, end } = getDateRange(range);

  const [revenue, topProducts, tablePerformance] = await Promise.all([
    getRevenueAnalytics(restaurantId, range),
    getTopProductsAnalytics(restaurantId, range),
    getTableAnalytics(restaurantId, range),
  ]);

  return {
    revenue,
    topProducts,
    tablePerformance,
    timeRange: range,
    dateRange: { start, end },
  };
}

/**
 * Get sales by hour (for charts)
 */
export async function getSalesByHour(
  restaurantId: string,
  date: string
): Promise<{ hour: number; orders: number; revenue: number }[]> {
  const orders = orderRepository.findByRestaurant(restaurantId);
  const targetDate = new Date(date);

  const hourlyData: Record<number, { orders: number; revenue: number }> = {};

  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    hourlyData[hour] = { orders: 0, revenue: 0 };
  }

  // Aggregate data
  for (const order of orders) {
    if (order.status !== OrderStatus.COMPLETED) continue;

    const orderDate = new Date(order.createdAt);
    if (
      orderDate.getDate() === targetDate.getDate() &&
      orderDate.getMonth() === targetDate.getMonth() &&
      orderDate.getFullYear() === targetDate.getFullYear()
    ) {
      const hour = orderDate.getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += order.total;
    }
  }

  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour),
    orders: data.orders,
    revenue: Math.round(data.revenue * 100) / 100,
  }));
}

/**
 * Get dashboard summary
 */
export async function getDashboardSummary(restaurantId: string): Promise<{
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  activeSessions: number;
}> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  const { start, end } = getDateRange('today');

  const orders = orderRepository.findByRestaurant(restaurantId);
  const todayOrders = orders.filter((o) => {
    const date = new Date(o.createdAt);
    return date >= start && date <= end;
  });

  const completedToday = todayOrders.filter(
    (o) => o.status === OrderStatus.COMPLETED
  );

  const pendingOrders = orders.filter(
    (o) => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED
  );

  return {
    todayRevenue: Math.round(completedToday.reduce((sum, o) => sum + o.total, 0) * 100) / 100,
    todayOrders: completedToday.length,
    pendingOrders: pendingOrders.length,
    activeSessions: 0, // Would come from session service
  };
}