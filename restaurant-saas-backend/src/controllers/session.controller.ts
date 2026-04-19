/**
 * Session Controller
 * Handles QR table session HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { normalizeLanguage } from '../utils/i18n';
import * as sessionService from '../services/session.service';
import { Language } from '../types';

/**
 * Get or create session for table
 * GET /api/tables/:tableId/session
 */
export const getOrCreateSession = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;
  const lang = normalizeLanguage(req.query.lang as string) as Language;

  const { session, isNew } = await sessionService.getOrCreateSession(tableId, lang);

  sendSuccess(res, {
    session: {
      ...session,
      expiresIn: Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000 / 60)),
    },
    isNew,
  });
});

/**
 * Update session
 * PATCH /api/tables/:tableId/session
 */
export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;
  const { language, customerName } = req.body;

  const session = await sessionService.getOrCreateSession(tableId);

  let updated;
  if (language) {
    updated = await sessionService.updateSessionLanguage(session.session.id, language);
  }

  sendSuccess(res, updated || session.session);
});

/**
 * Get cart
 * GET /api/tables/:tableId/cart
 */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;

  // First get the session
  const { session } = await sessionService.getOrCreateSession(tableId);

  const cart = await sessionService.getCartTotal(session.id);

  sendSuccess(res, cart);
});

/**
 * Add item to cart
 * POST /api/tables/:tableId/cart
 */
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;
  const { menuItemId, quantity, notes } = req.body;

  // Get session
  const { session } = await sessionService.getOrCreateSession(tableId);

  // Add to cart
  const updatedSession = await sessionService.addToCart(
    session.id,
    menuItemId,
    quantity,
    notes
  );

  sendSuccess(res, {
    cart: updatedSession.cart,
    cartTotal: await sessionService.getCartTotal(session.id),
  });
});

/**
 * Update cart item quantity
 * PATCH /api/tables/:tableId/cart/:menuItemId
 */
export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
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

  sendSuccess(res, {
    cart: updatedSession.cart,
    cartTotal: await sessionService.getCartTotal(session.id),
  });
});

/**
 * Remove item from cart
 * DELETE /api/tables/:tableId/cart/:menuItemId
 */
export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId, menuItemId } = req.params;

  // Get session
  const { session } = await sessionService.getOrCreateSession(tableId);

  // Remove from cart
  const updatedSession = await sessionService.removeFromCart(session.id, menuItemId);

  sendSuccess(res, {
    cart: updatedSession.cart,
    cartTotal: await sessionService.getCartTotal(session.id),
  });
});

/**
 * Clear cart
 * DELETE /api/tables/:tableId/cart
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;

  // Get session
  const { session } = await sessionService.getOrCreateSession(tableId);

  // Clear cart
  await sessionService.clearCart(session.id);

  sendSuccess(res, {
    cart: [],
    cartTotal: { items: [], subtotal: 0, itemCount: 0 },
  });
});

/**
 * End session
 * DELETE /api/tables/:tableId/session
 */
export const endSession = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;

  // Get session
  const { session } = await sessionService.getOrCreateSession(tableId);

  // End session
  const endedSession = await sessionService.endSession(session.id);

  sendSuccess(res, endedSession);
});