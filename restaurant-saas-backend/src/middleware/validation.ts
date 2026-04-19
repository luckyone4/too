/**
 * Validation middleware using Zod
 * Provides request validation for all endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

/**
 * Generic validation middleware factory
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace with validated data (may have defaults applied)
      if (result.body) req.body = result.body;
      if (result.query) req.query = result.query;
      if (result.params) req.params = result.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            details,
          },
        });
        return;
      }
      next(error);
    }
  };
}

// ============================================================================
// AUTH VALIDATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['admin', 'staff']).optional(),
    restaurantId: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// ============================================================================
// RESTAURANT VALIDATION SCHEMAS
// ============================================================================

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email').optional(),
    logo: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    timezone: z.string().optional(),
    currency: z.string().length(3).optional(),
    settings: z.object({
      orderTimeoutMinutes: z.number().optional(),
      maxItemsPerOrder: z.number().optional(),
      allowTips: z.boolean().optional(),
      tipOptions: z.array(z.number()).optional(),
      requireCustomerName: z.boolean().optional(),
      enablePayments: z.boolean().optional(),
    }).optional(),
  }),
});

export const updateRestaurantSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Restaurant ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ============================================================================
// TABLE VALIDATION SCHEMAS
// ============================================================================

export const createTableSchema = z.object({
  params: z.object({
    restaurantId: z.string().min(1),
  }),
  body: z.object({
    number: z.string().min(1, 'Table number is required'),
    capacity: z.number().int().min(1, 'Capacity must be at least 1'),
    posX: z.number().optional(),
    posY: z.number().optional(),
  }),
});

export const updateTableSchema = z.object({
  params: z.object({
    restaurantId: z.string().min(1),
    tableId: z.string().min(1),
  }),
  body: z.object({
    number: z.string().min(1).optional(),
    capacity: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

// ============================================================================
// MENU VALIDATION SCHEMAS
// ============================================================================

export const createCategorySchema = z.object({
  params: z.object({
    restaurantId: z.string().min(1),
  }),
  body: z.object({
    name: z.record(z.string(), z.string(), {
      message: 'Name must be an object with language codes as keys',
    }),
    description: z.record(z.string(), z.string()).optional(),
    image: z.string().url().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const createMenuItemSchema = z.object({
  params: z.object({
    restaurantId: z.string().min(1),
  }),
  body: z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    name: z.record(z.string(), z.string()),
    description: z.record(z.string(), z.string()).optional(),
    price: z.number().positive('Price must be positive'),
    currency: z.string().length(3).optional(),
    image: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    options: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    preparationTime: z.number().int().optional(),
    calories: z.number().int().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({
    restaurantId: z.string().min(1),
    itemId: z.string().min(1),
  }),
  body: z.object({
    categoryId: z.string().optional(),
    name: z.record(z.string(), z.string()).optional(),
    description: z.record(z.string(), z.string()).optional(),
    price: z.number().positive().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

// ============================================================================
// SESSION VALIDATION SCHEMAS
// ============================================================================

export const createSessionSchema = z.object({
  params: z.object({
    tableId: z.string().min(1),
  }),
  body: z.object({
    customerName: z.string().optional(),
    language: z.enum(['en', 'tr', 'de', 'ru', 'fr', 'ar']).optional(),
  }),
});

export const updateSessionSchema = z.object({
  params: z.object({
    tableId: z.string().min(1),
  }),
  body: z.object({
    language: z.enum(['en', 'tr', 'de', 'ru', 'fr', 'ar']).optional(),
    customerName: z.string().optional(),
  }),
});

// ============================================================================
// ORDER VALIDATION SCHEMAS
// ============================================================================

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().min(1, 'Restaurant ID is required'),
    tableId: z.string().min(1, 'Table ID is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    customerName: z.string().optional(),
    items: z.array(z.object({
      menuItemId: z.string().min(1, 'Menu item ID is required'),
      quantity: z.number().int().positive('Quantity must be positive'),
      notes: z.string().optional(),
    })).min(1, 'At least one item is required'),
    notes: z.string().optional(),
    tip: z.number().min(0).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
  }),
});

// ============================================================================
// PAYMENT VALIDATION SCHEMAS
// ============================================================================

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    method: z.enum(['card', 'cash', 'apple_pay', 'google_pay']),
    amount: z.number().positive().optional(),
  }),
});

export const simulatePaymentSchema = z.object({
  params: z.object({
    orderId: z.string().min(1),
  }),
  body: z.object({
    method: z.enum(['card', 'cash', 'apple_pay', 'google_pay']),
    amount: z.number().positive(),
    cardLast4: z.string().length(4).optional(),
    cardBrand: z.string().optional(),
  }),
});

// ============================================================================
// ANALYTICS VALIDATION SCHEMAS
// ============================================================================

export const analyticsQuerySchema = z.object({
  query: z.object({
    restaurantId: z.string().min(1),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    range: z.enum(['today', 'week', 'month', 'year']).optional(),
  }),
});

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
});

// ============================================================================
// LANGUAGE SCHEMA
// ============================================================================

export const languageSchema = z.object({
  query: z.object({
    lang: z.enum(['en', 'tr', 'de', 'ru', 'fr', 'ar']).optional(),
  }),
});