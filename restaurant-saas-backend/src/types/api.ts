/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

/**
 * API error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Pagination query params
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/**
 * Date range query
 */
export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

/**
 * Language query param
 */
export interface LanguageQuery {
  lang?: string;
}

/**
 * Build API response
 */
export function successResponse<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta
  };
}

/**
 * Build error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, any>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}