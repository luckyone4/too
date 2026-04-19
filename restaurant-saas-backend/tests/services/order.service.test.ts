/**
 * Order Service Unit Tests
 */

import { orderRepository, menuItemRepository, restaurantRepository, initializeData } from '../../src/models';
import * as orderService from '../../src/services/order.service';
import { OrderStatus, CreateOrderDTO } from '../../src/types';

// Mock the repositories
jest.mock('../../src/models', () => ({
  orderRepository: {
    findById: jest.fn(),
    findByRestaurant: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    addItem: jest.fn(),
    getStats: jest.fn(),
  },
  menuItemRepository: {
    findById: jest.fn(),
  },
  restaurantRepository: {
    findById: jest.fn(),
  },
  tableRepository: {
    findById: jest.fn(),
  },
  sessionRepository: {
    findById: jest.fn(),
    clearCart: jest.fn(),
  },
}));

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should throw error if restaurant not found', async () => {
      (restaurantRepository.findById as jest.Mock).mockReturnValue(null);

      const orderData: CreateOrderDTO = {
        restaurantId: 'rest_999',
        tableId: 'table_1',
        sessionId: 'sess_1',
        items: [{ menuItemId: 'item_1', quantity: 2 }],
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow('Restaurant');
    });

    it('should throw error if table not found', async () => {
      (restaurantRepository.findById as jest.Mock).mockReturnValue({
        id: 'rest_1',
        currency: 'TRY',
      });
      (restaurantRepository.findById as jest.Mock).mockReturnValue(null);

      const orderData: CreateOrderDTO = {
        restaurantId: 'rest_1',
        tableId: 'table_999',
        sessionId: 'sess_1',
        items: [{ menuItemId: 'item_1', quantity: 2 }],
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow('Table');
    });

    it('should create order successfully', async () => {
      const mockMenuItem = {
        id: 'item_1',
        restaurantId: 'rest_1',
        name: { en: 'Test Item' },
        price: 100,
        isAvailable: true,
        isActive: true,
      };

      const mockSession = {
        id: 'sess_1',
        tableId: 'table_1',
        isActive: true,
      };

      const mockOrder = {
        id: 'order_1',
        restaurantId: 'rest_1',
        tableId: 'table_1',
        sessionId: 'sess_1',
        items: [],
        subtotal: 200,
        status: OrderStatus.PENDING,
      };

      (restaurantRepository.findById as jest.Mock).mockReturnValue({
        id: 'rest_1',
        currency: 'TRY',
      });
      (require('../../src/models').tableRepository.findById as jest.Mock).mockReturnValue({
        id: 'table_1',
        restaurantId: 'rest_1',
      });
      (require('../../src/models').sessionRepository.findById as jest.Mock).mockReturnValue(mockSession);
      (menuItemRepository.findById as jest.Mock).mockReturnValue(mockMenuItem);
      (orderRepository.create as jest.Mock).mockReturnValue(mockOrder);
      (require('../../src/models').sessionRepository.clearCart as jest.Mock).mockReturnValue({});

      const orderData: CreateOrderDTO = {
        restaurantId: 'rest_1',
        tableId: 'table_1',
        sessionId: 'sess_1',
        items: [{ menuItemId: 'item_1', quantity: 2 }],
      };

      const result = await orderService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(orderRepository.create).toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw error if order not found', async () => {
      (orderRepository.findById as jest.Mock).mockReturnValue(null);

      await expect(orderService.updateOrderStatus('order_999', OrderStatus.CONFIRMED))
        .rejects.toThrow('Order');
    });

    it('should throw error for invalid status transition', async () => {
      const order = {
        id: 'order_1',
        status: OrderStatus.COMPLETED,
      };

      (orderRepository.findById as jest.Mock).mockReturnValue(order);

      await expect(orderService.updateOrderStatus('order_1', OrderStatus.PENDING))
        .rejects.toThrow('Cannot transition');
    });

    it('should update status successfully', async () => {
      const order = {
        id: 'order_1',
        status: OrderStatus.PENDING,
      };

      const updatedOrder = {
        ...order,
        status: OrderStatus.CONFIRMED,
      };

      (orderRepository.findById as jest.Mock).mockReturnValue(order);
      (orderRepository.updateStatus as jest.Mock).mockReturnValue(updatedOrder);

      const result = await orderService.updateOrderStatus('order_1', OrderStatus.CONFIRMED);

      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const mockStats = {
        total: 50,
        byStatus: {
          pending: 10,
          completed: 35,
          cancelled: 5,
        },
        revenue: 5000,
      };

      (require('../../src/models').restaurantRepository.findById as jest.Mock).mockReturnValue({
        id: 'rest_1',
      });
      (orderRepository.getStats as jest.Mock).mockReturnValue(mockStats);

      const stats = await orderService.getOrderStats('rest_1');

      expect(stats).toEqual(mockStats);
    });
  });
});