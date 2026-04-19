/**
 * Payment Service
 * Simulates payment processing (mock implementation)
 */

import { v4 as uuidv4 } from 'uuid';
import { paymentRepository, orderRepository, restaurantRepository } from '../models';
import { Payment, PaymentStatus, PaymentMethod, CreatePaymentDTO, SimulatePaymentDTO, PaymentResult } from '../types';
import { NotFoundError, ValidationError, ConflictError } from '../middleware/errorHandler';
import { OrderStatus } from '../types';

/**
 * Create payment record
 */
export async function createPayment(data: CreatePaymentDTO): Promise<Payment> {
  // Get order
  const order = orderRepository.findById(data.orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  // Check if payment already exists
  const existingPayment = paymentRepository.findByOrder(data.orderId);
  if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
    throw new ConflictError('Order has already been paid');
  }

  // Use order total if amount not specified
  const amount = data.amount ?? order.total;

  return paymentRepository.create({
    orderId: data.orderId,
    restaurantId: order.restaurantId,
    amount,
    currency: order.currency,
    method: data.method,
    status: PaymentStatus.PENDING,
  });
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<Payment> {
  const payment = paymentRepository.findById(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment');
  }
  return payment;
}

/**
 * Simulate payment processing
 * This is a mock implementation - in production, integrate with Stripe/PayPal
 */
export async function simulatePayment(
  orderId: string,
  data: SimulatePaymentDTO
): Promise<PaymentResult> {
  // Get order
  const order = orderRepository.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  // Check if order is payable
  if (order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED &&
      order.status !== OrderStatus.PREPARING) {
    return {
      success: false,
      message: `Cannot process payment for order in "${order.status}" status`,
    };
  }

  // Check if already paid
  const existingPayment = paymentRepository.findByOrder(orderId);
  if (existingPayment?.status === PaymentStatus.COMPLETED) {
    return {
      success: false,
      message: 'Order has already been paid',
      transactionId: existingPayment.transactionId,
    };
  }

  // Simulate payment processing (mock 95% success rate)
  const success = Math.random() > 0.05;

  if (success) {
    // Generate mock transaction ID
    const transactionId = `txn_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

    // Create or update payment record
    let payment: Payment;

    if (existingPayment) {
      payment = paymentRepository.update(existingPayment.id, {
        status: PaymentStatus.COMPLETED,
        transactionId,
        amount: data.amount,
        metadata: {
          cardLast4: data.cardLast4,
          cardBrand: data.cardBrand,
          processedAt: new Date().toISOString(),
        },
      })!;
    } else {
      payment = paymentRepository.create({
        orderId,
        restaurantId: order.restaurantId,
        amount: data.amount,
        currency: order.currency,
        method: data.method,
        status: PaymentStatus.COMPLETED,
        transactionId,
        metadata: {
          cardLast4: data.cardLast4,
          cardBrand: data.cardBrand,
          processedAt: new Date().toISOString(),
        },
      });
    }

    return {
      success: true,
      transactionId,
      message: 'Payment processed successfully',
      payment,
    };
  } else {
    // Create failed payment record
    let payment: Payment;

    if (existingPayment) {
      payment = paymentRepository.update(existingPayment.id, {
        status: PaymentStatus.FAILED,
        metadata: {
          error: 'Payment declined by bank',
          failedAt: new Date().toISOString(),
        },
      })!;
    } else {
      payment = paymentRepository.create({
        orderId,
        restaurantId: order.restaurantId,
        amount: data.amount,
        currency: order.currency,
        method: data.method,
        status: PaymentStatus.FAILED,
        metadata: {
          error: 'Payment declined by bank',
          failedAt: new Date().toISOString(),
        },
      });
    }

    return {
      success: false,
      message: 'Payment was declined. Please try a different payment method.',
    };
  }
}

/**
 * Process cash payment
 */
export async function processCashPayment(orderId: string): Promise<PaymentResult> {
  const order = orderRepository.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order');
  }

  const transactionId = `cash_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

  const payment = paymentRepository.create({
    orderId,
    restaurantId: order.restaurantId,
    amount: order.total,
    currency: order.currency,
    method: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    transactionId,
    metadata: {
      type: 'cash',
      paidAt: new Date().toISOString(),
    },
  });

  return {
    success: true,
    transactionId,
    message: 'Cash payment recorded successfully',
    payment,
  };
}

/**
 * Refund payment
 * Mock implementation
 */
export async function refundPayment(paymentId: string): Promise<PaymentResult> {
  const payment = paymentRepository.findById(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment');
  }

  if (payment.status !== PaymentStatus.COMPLETED) {
    return {
      success: false,
      message: 'Cannot refund payment that is not completed',
    };
  }

  // Simulate refund
  const refundTransactionId = `ref_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

  const updated = paymentRepository.update(paymentId, {
    status: PaymentStatus.REFUNDED,
    metadata: {
      ...payment.metadata,
      refundedAt: new Date().toISOString(),
      refundTransactionId,
    },
  })!;

  return {
    success: true,
    transactionId: refundTransactionId,
    message: 'Refund processed successfully',
    payment: updated,
  };
}

/**
 * Get payments for restaurant
 */
export async function getRestaurantPayments(restaurantId: string): Promise<Payment[]> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  return paymentRepository.findByRestaurant(restaurantId);
}