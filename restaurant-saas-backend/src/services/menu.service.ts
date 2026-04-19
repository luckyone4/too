/**
 * Menu Service
 * Business logic for menu, categories, and items
 */

import { categoryRepository, menuItemRepository, restaurantRepository } from '../models';
import { Category, MenuItem, CreateCategoryDTO, UpdateCategoryDTO, CreateMenuItemDTO, UpdateMenuItemDTO, Language, getLocalizedText } from '../types';
import { NotFoundError, ConflictError } from '../middleware/errorHandler';

/**
 * Get full menu for restaurant with categories
 */
export async function getRestaurantMenu(
  restaurantId: string,
  lang: Language = 'en'
): Promise<{ restaurant: any; categories: any[] }> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  const categories = categoryRepository.findByRestaurant(restaurantId);

  // Transform categories with localized content
  const transformedCategories = categories.map((category) => ({
    id: category.id,
    name: getLocalizedText(category.name, lang),
    description: getLocalizedText(category.description, lang),
    image: category.image,
    sortOrder: category.sortOrder,
    items: menuItemRepository
      .findByCategory(category.id)
      .filter((item) => item.isActive && item.isAvailable)
      .map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        name: getLocalizedText(item.name, lang),
        description: getLocalizedText(item.description, lang),
        price: item.price,
        currency: item.currency,
        image: item.image,
        options: item.options?.map((opt) => ({
          id: opt.id,
          name: getLocalizedText(opt.name, lang),
          choices: opt.choices.map((choice) => ({
            id: choice.id,
            name: getLocalizedText(choice.name, lang),
            price: choice.price,
          })),
          required: opt.required,
          multiSelect: opt.multiSelect,
        })),
        tags: item.tags,
        preparationTime: item.preparationTime,
        calories: item.calories,
      })),
  }));

  return {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      logo: restaurant.logo,
      currency: restaurant.currency,
      settings: restaurant.settings,
    },
    categories: transformedCategories,
  };
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category> {
  const category = categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError('Category');
  }
  return category;
}

/**
 * Create category
 */
export async function createCategory(
  restaurantId: string,
  data: CreateCategoryDTO
): Promise<Category> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  return categoryRepository.create(restaurantId, data);
}

/**
 * Update category
 */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryDTO
): Promise<Category> {
  const category = categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError('Category');
  }

  const updated = categoryRepository.update(categoryId, data);
  if (!updated) {
    throw new NotFoundError('Category');
  }

  return updated;
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const category = categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError('Category');
  }

  // Check if category has items
  const items = menuItemRepository.findByCategory(categoryId);
  if (items.length > 0) {
    throw new ConflictError('Cannot delete category with menu items');
  }

  categoryRepository.delete(categoryId);
}

/**
 * Get menu item by ID
 */
export async function getMenuItemById(itemId: string): Promise<MenuItem> {
  const item = menuItemRepository.findById(itemId);
  if (!item) {
    throw new NotFoundError('Menu item');
  }
  return item;
}

/**
 * Create menu item
 */
export async function createMenuItem(
  restaurantId: string,
  data: CreateMenuItemDTO
): Promise<MenuItem> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  // Verify category belongs to restaurant
  const category = categoryRepository.findById(data.categoryId);
  if (!category || category.restaurantId !== restaurantId) {
    throw new NotFoundError('Category');
  }

  return menuItemRepository.create(restaurantId, {
    ...data,
    currency: data.currency || restaurant.currency,
  });
}

/**
 * Update menu item
 */
export async function updateMenuItem(
  itemId: string,
  data: UpdateMenuItemDTO
): Promise<MenuItem> {
  const item = menuItemRepository.findById(itemId);
  if (!item) {
    throw new NotFoundError('Menu item');
  }

  // Verify category if being changed
  if (data.categoryId && data.categoryId !== item.categoryId) {
    const category = categoryRepository.findById(data.categoryId);
    if (!category || category.restaurantId !== item.restaurantId) {
      throw new NotFoundError('Category');
    }
  }

  const updated = menuItemRepository.update(itemId, data);
  if (!updated) {
    throw new NotFoundError('Menu item');
  }

  return updated;
}

/**
 * Delete menu item
 */
export async function deleteMenuItem(itemId: string): Promise<void> {
  const item = menuItemRepository.findById(itemId);
  if (!item) {
    throw new NotFoundError('Menu item');
  }

  menuItemRepository.delete(itemId);
}

/**
 * Search menu items
 */
export async function searchMenuItems(
  restaurantId: string,
  query: string,
  lang: Language = 'en'
): Promise<any[]> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  const items = menuItemRepository.search(restaurantId, query);

  return items.map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    name: getLocalizedText(item.name, lang),
    description: getLocalizedText(item.description, lang),
    price: item.price,
    currency: item.currency,
    image: item.image,
  }));
}

/**
 * Toggle item availability
 */
export async function toggleItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<MenuItem> {
  const item = menuItemRepository.findById(itemId);
  if (!item) {
    throw new NotFoundError('Menu item');
  }

  const updated = menuItemRepository.update(itemId, { isAvailable });
  if (!updated) {
    throw new NotFoundError('Menu item');
  }

  return updated;
}