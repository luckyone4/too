/**
 * Analytics time range
 */
export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom';

/**
 * Analytics date range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Revenue analytics
 */
export interface RevenueAnalytics {
  total: number;
  currency: string;
  orders: number;
  averageOrderValue: number;
  comparison?: {
    previous: number;
    changePercent: number;
  };
}

/**
 * Top product analytics
 */
export interface ProductAnalytics {
  menuItemId: string;
  name: string;
  quantity: number;
  revenue: number;
  percentOfTotal: number;
}

/**
 * Table performance analytics
 */
export interface TableAnalytics {
  tableId: string;
  tableNumber: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

/**
 * Analytics response
 */
export interface AnalyticsResponse {
  revenue: RevenueAnalytics;
  topProducts: ProductAnalytics[];
  tablePerformance: TableAnalytics[];
  timeRange: TimeRange;
  dateRange: DateRange;
}

/**
 * Sales by hour (for charts)
 */
export interface SalesByHour {
  hour: number;
  orders: number;
  revenue: number;
}

/**
 * Sales by day (for charts)
 */
export interface SalesByDay {
  date: string;
  orders: number;
  revenue: number;
}