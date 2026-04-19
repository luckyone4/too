/**
 * Application constants
 */

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

  // Business logic
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TABLE_OCCUPIED: 'TABLE_OCCUPIED',
  ORDER_INVALID_STATUS: 'ORDER_INVALID_STATUS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// Order status flow
export const ORDER_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
} as const;

// Valid order status transitions
export function canTransitionOrderStatus(
  from: string,
  to: string
): boolean {
  const allowedTransitions = ORDER_STATUS_FLOW[from as keyof typeof ORDER_STATUS_FLOW];
  return allowedTransitions?.includes(to as any) || false;
}

// Tax rates by country/region
export const TAX_RATES = {
  TR: 0.18, // Turkey VAT
  DE: 0.19, // Germany VAT
  FR: 0.20, // France VAT
  US: 0.08, // US average
  UK: 0.20, // UK VAT
} as const;

// Default tax rate
export const DEFAULT_TAX_RATE = 0.18;

// Currencies
export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
  TRY: { symbol: '₺', code: 'TRY', name: 'Turkish Lira' },
  RUB: { symbol: '₽', code: 'RUB', name: 'Russian Ruble' },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound' },
} as const;