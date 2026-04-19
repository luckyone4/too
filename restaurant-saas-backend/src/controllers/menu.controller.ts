/**
 * Menu Controller
 * Handles menu, categories, and items HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { normalizeLanguage } from '../utils/i18n';
import * as menuService from '../services/menu.service';
import { Language } from '../types';

/**
 * Get restaurant menu
 * GET /api/restaurants/:restaurantId/menu
 */
export const getMenu = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const lang = normalizeLanguage(req.query.lang as string) as Language;

  const menu = await menuService.getRestaurantMenu(restaurantId, lang);

  // Add RTL metadata for Arabic
  const response: any = {
    ...menu,
    _meta: {
      language: lang,
      rtl: lang === 'ar',
    },
  };

  sendSuccess(res, response);
});

/**
 * Get category by ID
 * GET /api/restaurants/:restaurantId/categories/:categoryId
 */
export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const lang = normalizeLanguage(req.query.lang as string) as Language;

  const category = await menuService.getCategoryById(categoryId);

  sendSuccess(res, {
    ...category,
    name: category.name[lang] || category.name.en,
    description: category.description[lang] || category.description.en,
  });
});

/**
 * Create category
 * POST /api/restaurants/:restaurantId/categories
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const category = await menuService.createCategory(restaurantId, req.body);
  sendCreated(res, category);
});

/**
 * Update category
 * PATCH /api/restaurants/:restaurantId/categories/:categoryId
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const category = await menuService.updateCategory(categoryId, req.body);
  sendSuccess(res, category);
});

/**
 * Delete category
 * DELETE /api/restaurants/:restaurantId/categories/:categoryId
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  await menuService.deleteCategory(categoryId);
  sendNoContent(res);
});

// ============================================================================
// MENU ITEM ENDPOINTS
// ============================================================================

/**
 * Get menu item by ID
 * GET /api/restaurants/:restaurantId/items/:itemId
 */
export const getMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const lang = normalizeLanguage(req.query.lang as string) as Language;

  const item = await menuService.getMenuItemById(itemId);

  sendSuccess(res, {
    ...item,
    name: item.name[lang] || item.name.en,
    description: item.description[lang] || item.description.en,
  });
});

/**
 * Create menu item
 * POST /api/restaurants/:restaurantId/items
 */
export const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const item = await menuService.createMenuItem(restaurantId, req.body);
  sendCreated(res, item);
});

/**
 * Update menu item
 * PATCH /api/restaurants/:restaurantId/items/:itemId
 */
export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const item = await menuService.updateMenuItem(itemId, req.body);
  sendSuccess(res, item);
});

/**
 * Delete menu item
 * DELETE /api/restaurants/:restaurantId/items/:itemId
 */
export const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  await menuService.deleteMenuItem(itemId);
  sendNoContent(res);
});

/**
 * Toggle item availability
 * PATCH /api/restaurants/:restaurantId/items/:itemId/availability
 */
export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { isAvailable } = req.body;

  const item = await menuService.toggleItemAvailability(itemId, isAvailable);
  sendSuccess(res, item);
});

/**
 * Search menu items
 * GET /api/restaurants/:restaurantId/menu/search?q=xxx
 */
export const searchItems = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const { q } = req.query;
  const lang = normalizeLanguage(req.query.lang as string) as Language;

  if (!q || typeof q !== 'string') {
    sendSuccess(res, []);
    return;
  }

  const items = await menuService.searchMenuItems(restaurantId, q, lang);
  sendSuccess(res, items);
});