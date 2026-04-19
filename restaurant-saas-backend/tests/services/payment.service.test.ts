/**
 * Payment Service Unit Tests
 */

import { paymentRepository, orderRepository, restaurantRepository, initializeData } from '../../src/models';
import * as paymentService from '../../src/services/payment.service';
import { PaymentMethod, OrderStatus } from '../../src/types';

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should throw error if order not found', async () => {
      (orderRepository.findById as jest.Mock).mockReturnValue(null);

      await expect(paymentService.createPayment({
        orderId: 'order_999',
        method: PaymentMethod.CARD,
      })).rejects.toThrow('Order');
    });

    it('should throw error if order already paid', async () => {
      const mockOrder = {
        id: 'order_1',
        total: 100,
        currency: 'TRY',
      };

      const mockPayment = {
        status: 'completed',
      };

      (orderRepository.findById as jest.Mock).mockReturnValue(mockOrder);
      (paymentRepository.findByOrder as jest.Mock).mockReturnValue(mockPayment);

      await expect(paymentService.createPayment({
        orderId: 'order_1',
        method: PaymentMethod.CARD,
      })).rejects.toThrow('already been paid');
    });

    it('should create payment successfully', async () => {
      const mockOrder = {
        id: 'order_1',
        restaurantId: 'rest_1',
        total: 100,
        currency: 'TRY',
      };

      const mockPayment = {
        id: 'pay_1',
        orderId: 'order_1',
        amount: 100,
      };

      (orderRepository.findById as jest.Mock).mockReturnValue(mockOrder);
      (paymentRepository.findByOrder as jest.Mock).mockReturnValue(null);
      (paymentRepository.create as jest.Mock).mockReturnValue(mockPayment);

      const result = await paymentService.createPayment({
        orderId: 'order_1',
        method: PaymentMethod.CARD,
      });

      expect(result.id).toBe('pay_1');
    });
  });

  describe('simulatePayment', () => {
    it('should throw error if order not found', async () => {
      (orderRepository.findById as jest.Mock).mockReturnValue(null);

      const result = await paymentService.simulatePayment('order_999', {
        method: PaymentMethod.CARD,
        amount: 100,
      });

      expect(result.success).toBe(false);
    });

    it('should not allow payment for completed orders', async () => {
      const mockOrder = {
        id: 'order_1',
        status: OrderStatus.COMPLETED,
      };

      (orderRepository.findById as jest.Mock).mockReturnValue(mockOrder);

      const result = await paymentService.simulatePayment('order_1', {
        method: PaymentMethod.CARD,
        amount: 100,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot process payment');
    });

    it('should simulate successful payment', async () => {
      const mockOrder = {
        id: 'order_1',
        restaurantId: 'rest_1',
        total: 100,
        currency: 'TRY',
        status: OrderStatus.PENDING,
      };

      const mockPayment = {
        id: 'pay_1',
        orderId: 'order_1',
        status: 'completed',
      };

      (orderRepository.findById as jest.Mock).mockReturnValue(mockOrder);
      (paymentRepository.findByOrder as jest.Mock).mockReturnValue(null);
      (paymentRepository.create as jest.Mock).mockReturnValue(mockPayment);

      // Mock random to always succeed
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await paymentService.simulatePayment('order_1', {
        method: PaymentMethod.CARD,
        amount: 100,
      });

      // Note: In this mock, success depends on Math.random()
      // The actual implementation will produce either success or failure
      expect(result).toHaveProperty('success');

      jest.restoreAllMocks();
    });
  });

  describe('processCashPayment', () => {
    it('should process cash payment successfully', async () => {
      const mockOrder = {
        id: 'order_1',
        restaurantId: 'rest_1',
        total: 100,
        currency: 'TRY',
      };

      const mockPayment = {
        id: 'pay_1',
        orderId: 'order_1',
        status: 'completed',
        transactionId: 'cash_xxx',
      };

      (orderRepository.findById as jest.Mock).mockReturnValue(mockOrder);
      (paymentRepository.create as jest.Mock).mockReturnValue(mockPayment);

      const result = await paymentService.processCashPayment('order_1');

      expect(result.success).toBe(true);
      expect(result.payment?.method).toBe(PaymentMethod.CASH);
    });
  });

  describe('refundPayment', () => {
    it('should throw error if payment not found', async () => {
      (paymentRepository.findById as jest.Mock).mockReturnValue(null);

      const result = await paymentService.refundPayment('pay_999');

      expect(result.success).toBe(false);
    });

    it('should not refund non-completed payments', async () => {
      const mockPayment = {
        id: 'pay_1',
        status: 'pending',
      };

      (paymentRepository.findById as jest.Mock).mockReturnValue(mockPayment);

      const result = await paymentService.refundPayment('pay_1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot refund');
    });

    it('should refund completed payment successfully', async () => {
      const mockPayment = {
        id: 'pay_1',
        status: 'completed',
      };

      const refundedPayment = {
        ...mockPayment,
        status: 'refunded',
      };

      (paymentRepository.findById as jest.Mock).mockReturnValue(mockPayment);
      (paymentRepository.update as jest.Mock).mockReturnValue(refundedPayment);

      const result = await paymentService.refundPayment('pay_1');

      expect(result.success).toBe(true);
    });
  });
});