/**
 * Session Service
 * Business logic for QR table sessions
 */

import { sessionRepository, tableRepository, menuItemRepository, restaurantRepository } from '../models';
import { Session, CreateSessionDTO, CartItem } from '../types';
import { NotFoundError, ConflictError, ValidationError } from '../middleware/errorHandler';
import { config } from '../config';

/**
 * Create or get existing session for table
 */
export async function getOrCreateSession(
  tableId: string,
  language: string = 'en'
): Promise<{ session: Session; isNew: boolean }> {
  // Get table
  const table = tableRepository.findById(tableId);
  if (!table) {
    throw new NotFoundError('Table');
  }

  // Check for existing active session
  const existingSession = sessionRepository.findByTable(tableId);
  if (existingSession && existingSession.isActive) {
    // Extend session expiry
    const extended = sessionRepository.update(existingSession.id, {
      expiresAt: new Date(Date.now() + config.sessionTimeoutMinutes * 60 * 1000),
    });
    return { session: extended!, isNew: false };
  }

  // Create new session
  const session = sessionRepository.create({
    tableId,
    restaurantId: table.restaurantId,
    language,
  });

  return { session, isNew: true };
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session> {
  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }
  return session;
}

/**
 * Update session language
 */
export async function updateSessionLanguage(
  sessionId: string,
  language: string
): Promise<Session> {
  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (!session.isActive) {
    throw new ConflictError('Session has expired');
  }

  const updated = sessionRepository.update(sessionId, { language });
  if (!updated) {
    throw new NotFoundError('Session');
  }

  return updated;
}

/**
 * Add item to cart
 */
export async function addToCart(
  sessionId: string,
  menuItemId: string,
  quantity: number,
  notes?: string
): Promise<Session> {
  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (!session.isActive) {
    throw new ConflictError('Session has expired');
  }

  // Get menu item to verify price
  const menuItem = menuItemRepository.findById(menuItemId);
  if (!menuItem) {
    throw new NotFoundError('Menu item');
  }

  if (!menuItem.isAvailable) {
    throw new ValidationError('Menu item is not available');
  }

  if (!menuItem.isActive) {
    throw new ValidationError('Menu item is not active');
  }

  const updated = sessionRepository.addToCart(sessionId, {
    menuItemId,
    quantity,
    notes,
    price: menuItem.price,
  });

  if (!updated) {
    throw new NotFoundError('Session');
  }

  return updated;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  sessionId: string,
  menuItemId: string
): Promise<Session> {
  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (!session.isActive) {
    throw new ConflictError('Session has expired');
  }

  const updated = sessionRepository.removeFromCart(sessionId, menuItemId);
  if (!updated) {
    throw new NotFoundError('Session');
  }

  return updated;
}

/**
 * Update item quantity in cart
 */
export async function updateCartItemQuantity(
  sessionId: string,
  menuItemId: string,
  quantity: number
): Promise<Session> {
  if (quantity <= 0) {
    return removeFromCart(sessionId, menuItemId);
  }

  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (!session.isActive) {
    throw new ConflictError('Session has expired');
  }

  // Get current cart item
  const cartItem = session.cart.find((c) => c.menuItemId === menuItemId);
  if (!cartItem) {
    throw new NotFoundError('Item not in cart');
  }

  // Remove and re-add with new quantity
  sessionRepository.removeFromCart(sessionId, menuItemId);
  const updated = sessionRepository.addToCart(sessionId, {
    menuItemId,
    quantity,
    notes: cartItem.notes,
    price: cartItem.price,
  });

  return updated!;
}

/**
 * Clear cart
 */
export async function clearCart(sessionId: string): Promise<Session> {
  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (!session.isActive) {
    throw new ConflictError('Session has expired');
  }

  const updated = sessionRepository.clearCart(sessionId);
  if (!updated) {
    throw new NotFoundError('Session');
  }

  return updated;
}

/**
 * Get cart total
 */
export async function getCartTotal(sessionId: string): Promise<{
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}> {
  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }

  const subtotal = session.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    items: session.cart,
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount: session.cart.reduce((sum, item) => sum + item.quantity, 0),
  };
}

/**
 * End session
 */
export async function endSession(sessionId: string): Promise<Session> {
  const session = sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('Session');
  }

  const updated = sessionRepository.expire(sessionId);
  if (!updated) {
    throw new NotFoundError('Session');
  }

  return updated;
}

/**
 * Get active sessions for restaurant
 */
export async function getRestaurantSessions(restaurantId: string): Promise<Session[]> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  return sessionRepository.findByRestaurant(restaurantId);
}