/**
 * Public QR Controller
 * Handles public-facing endpoints for QR-based ordering
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { normalizeLanguage } from '../utils/i18n';
import * as restaurantService from '../services/restaurant.service';
import * as menuService from '../services/menu.service';
import * as sessionService from '../services/session.service';
import { Language } from '../types';

/**
 * Get public restaurant info
 * GET /restaurant/:restaurantId
 */
export const getPublicRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;

  const restaurant = await restaurantService.getRestaurantById(restaurantId);

  sendSuccess(res, {
    id: restaurant.id,
    name: restaurant.name,
    logo: restaurant.logo,
    coverImage: restaurant.coverImage,
    address: restaurant.address,
    phone: restaurant.phone,
    currency: restaurant.currency,
    settings: restaurant.settings,
  });
});

/**
 * Get table info and create session
 * GET /restaurant/:restaurantId/table/:tableId
 */
export const getTableSession = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, tableId } = req.params;
  const lang = normalizeLanguage(req.query.lang as string) as Language;

  // Verify restaurant and table exist
  const restaurant = await restaurantService.getRestaurantById(restaurantId);
  const table = await restaurantService.getTableById(tableId);

  if (table.restaurantId !== restaurantId) {
    throw new Error('Table does not belong to this restaurant');
  }

  // Get or create session
  const { session, isNew } = await sessionService.getOrCreateSession(tableId, lang);

  sendSuccess(res, {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      logo: restaurant.logo,
      currency: restaurant.currency,
      settings: restaurant.settings,
    },
    table: {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      expiresIn: Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000 / 60)),
    },
    isNew,
  });
});

/**
 * Get public menu
 * GET /restaurant/:restaurantId/menu
 */
export const getPublicMenu = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const lang = normalizeLanguage(req.query.lang as string) as Language;

  const menu = await menuService.getRestaurantMenu(restaurantId, lang);

  sendSuccess(res, {
    ...menu,
    _meta: {
      language: lang,
      rtl: lang === 'ar',
    },
  });
});

/**
 * Get cart for session
 * GET /restaurant/:restaurantId/table/:tableId/cart
 */
export const getPublicCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;

  // Get or create session
  const { session } = await sessionService.getOrCreateSession(tableId);

  const cart = await sessionService.getCartTotal(session.id);

  sendSuccess(res, cart);
});

/**
 * Add to cart (public)
 * POST /restaurant/:restaurantId/table/:tableId/cart
 */
export const addToPublicCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;
  const { menuItemId, quantity, notes } = req.body;

  // Get or create session
  const { session } = await sessionService.getOrCreateSession(tableId);

  // Add to cart
  const updatedSession = await sessionService.addToCart(
    session.id,
    menuItemId,
    quantity,
    notes
  );

  const cart = await sessionService.getCartTotal(session.id);

  sendSuccess(res, {
    cart,
    message: 'Item added to cart',
  });
});

/**
 * Update cart item (public)
 * PATCH /restaurant/:restaurantId/table/:tableId/cart/:menuItemId
 */
export const updatePublicCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { tableId, menuItemId } = req.params;
  const { quantity } = req.body;

  // Get session
  const { session } = await sessionService.getOrCreateSession(tableId);

  // Update quantity
  const updatedSession = await sessionService.updateCartItemQuantity(
    session.id,
    menuItemId,
    quantity
  );

  const cart = await sessionService.getCartTotal(session.id);

  sendSuccess(res, { cart });
});

/**
 * Remove from cart (public)
 * DELETE /restaurant/:restaurantId/table/:tableId/cart/:menuItemId
 */
export const removeFromPublicCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId, menuItemId } = req.params;

  // Get session
  const { session } = await sessionService.getOrCreateSession(tableId);

  // Remove from cart
  await sessionService.removeFromCart(session.id, menuItemId);

  const cart = await sessionService.getCartTotal(session.id);

  sendSuccess(res, { cart });
});