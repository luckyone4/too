/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}

/**
 * Payment entity
 */
export interface Payment {
  id: string;
  orderId: string;
  restaurantId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string; // Mock external transaction ID
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create payment DTO
 */
export interface CreatePaymentDTO {
  orderId: string;
  method: PaymentMethod;
  amount?: number; // If not provided, uses order total
}

/**
 * Simulate payment request
 */
export interface SimulatePaymentDTO {
  method: PaymentMethod;
  amount: number;
  cardLast4?: string;
  cardBrand?: string;
}

/**
 * Payment result (mock)
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  payment?: Payment;
}