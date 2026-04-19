/**
 * Menu Service Unit Tests
 */

import { categoryRepository, menuItemRepository, restaurantRepository, initializeData } from '../../src/models';
import * as menuService from '../../src/services/menu.service';
import { Language } from '../../src/types';

describe('MenuService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestaurantMenu', () => {
    it('should throw error if restaurant not found', async () => {
      (restaurantRepository.findById as jest.Mock).mockReturnValue(null);

      await expect(menuService.getRestaurantMenu('rest_999')).rejects.toThrow('Restaurant');
    });

    it('should return formatted menu with localized content', async () => {
      const mockRestaurant = {
        id: 'rest_1',
        name: 'Test Restaurant',
        currency: 'TRY',
      };

      const mockCategories = [
        {
          id: 'cat_1',
          restaurantId: 'rest_1',
          name: { en: 'Starters', tr: 'Başlangıçlar' },
          description: { en: 'Starters description' },
          sortOrder: 1,
          isActive: true,
        },
      ];

      const mockItems = [
        {
          id: 'item_1',
          categoryId: 'cat_1',
          name: { en: 'Soup', tr: 'Çorba' },
          description: { en: 'Delicious soup' },
          price: 50,
          currency: 'TRY',
          isAvailable: true,
          isActive: true,
          options: [],
        },
      ];

      (restaurantRepository.findById as jest.Mock).mockReturnValue(mockRestaurant);
      (categoryRepository.findByRestaurant as jest.Mock).mockReturnValue(mockCategories);
      (menuItemRepository.findByCategory as jest.Mock).mockReturnValue(mockItems);

      const result = await menuService.getRestaurantMenu('rest_1', 'en');

      expect(result.restaurant.id).toBe('rest_1');
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe('Starters');
      expect(result.categories[0].items).toHaveLength(1);
      expect(result.categories[0].items[0].name).toBe('Soup');
    });

    it('should return localized content when language is Turkish', async () => {
      const mockRestaurant = {
        id: 'rest_1',
        name: 'Test Restaurant',
        currency: 'TRY',
      };

      const mockCategories = [
        {
          id: 'cat_1',
          restaurantId: 'rest_1',
          name: { en: 'Starters', tr: 'Başlangıçlar' },
          description: { en: 'Starters description' },
          sortOrder: 1,
          isActive: true,
        },
      ];

      const mockItems = [
        {
          id: 'item_1',
          categoryId: 'cat_1',
          name: { en: 'Soup', tr: 'Çorba' },
          description: { en: 'Delicious soup', tr: 'Lezzetli çorba' },
          price: 50,
          currency: 'TRY',
          isAvailable: true,
          isActive: true,
          options: [],
        },
      ];

      (restaurantRepository.findById as jest.Mock).mockReturnValue(mockRestaurant);
      (categoryRepository.findByRestaurant as jest.Mock).mockReturnValue(mockCategories);
      (menuItemRepository.findByCategory as jest.Mock).mockReturnValue(mockItems);

      const result = await menuService.getRestaurantMenu('rest_1', 'tr');

      expect(result.categories[0].name).toBe('Başlangıçlar');
      expect(result.categories[0].items[0].name).toBe('Çorba');
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      (restaurantRepository.findById as jest.Mock).mockReturnValue({ id: 'rest_1' });
      (categoryRepository.create as jest.Mock).mockReturnValue({
        id: 'cat_new',
        restaurantId: 'rest_1',
        name: { en: 'New Category' },
      });

      const result = await menuService.createCategory('rest_1', {
        name: { en: 'New Category' },
      });

      expect(result.id).toBe('cat_new');
    });
  });

  describe('createMenuItem', () => {
    it('should throw error if restaurant not found', async () => {
      (restaurantRepository.findById as jest.Mock).mockReturnValue(null);

      await expect(menuService.createMenuItem('rest_999', {
        categoryId: 'cat_1',
        name: { en: 'Test' },
        price: 100,
      })).rejects.toThrow('Restaurant');
    });

    it('should throw error if category not found', async () => {
      (restaurantRepository.findById as jest.Mock).mockReturnValue({ id: 'rest_1' });
      (categoryRepository.findById as jest.Mock).mockReturnValue(null);

      await expect(menuService.createMenuItem('rest_1', {
        categoryId: 'cat_999',
        name: { en: 'Test' },
        price: 100,
      })).rejects.toThrow('Category');
    });
  });

  describe('toggleItemAvailability', () => {
    it('should toggle availability successfully', async () => {
      const mockItem = {
        id: 'item_1',
        isAvailable: true,
      };

      const updatedItem = {
        ...mockItem,
        isAvailable: false,
      };

      (menuItemRepository.findById as jest.Mock).mockReturnValue(mockItem);
      (menuItemRepository.update as jest.Mock).mockReturnValue(updatedItem);

      const result = await menuService.toggleItemAvailability('item_1', false);

      expect(result.isAvailable).toBe(false);
    });
  });
});