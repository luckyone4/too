/**
 * Restaurant Controller
 * Handles restaurant and table management HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendNoContent, sendNotFound } from '../utils/response';
import { normalizeLanguage } from '../utils/i18n';
import * as restaurantService from '../services/restaurant.service';
import { Language } from '../types';

/**
 * Get all restaurants
 * GET /api/restaurants
 */
export const getAllRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const restaurants = await restaurantService.getAllRestaurants();
  sendSuccess(res, restaurants);
});

/**
 * Get restaurant by ID
 * GET /api/restaurants/:id
 */
export const getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const restaurant = await restaurantService.getRestaurantById(id);
  sendSuccess(res, restaurant);
});

/**
 * Create restaurant
 * POST /api/restaurants
 */
export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.createRestaurant(req.body);
  sendCreated(res, restaurant);
});

/**
 * Update restaurant
 * PATCH /api/restaurants/:id
 */
export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const restaurant = await restaurantService.updateRestaurant(id, req.body);
  sendSuccess(res, restaurant);
});

/**
 * Delete restaurant
 * DELETE /api/restaurants/:id
 */
export const deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await restaurantService.deleteRestaurant(id);
  sendNoContent(res);
});

// ============================================================================
// TABLE ENDPOINTS
// ============================================================================

/**
 * Get restaurant tables
 * GET /api/restaurants/:restaurantId/tables
 */
export const getTables = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const tables = await restaurantService.getRestaurantTables(restaurantId);
  sendSuccess(res, tables);
});

/**
 * Create table
 * POST /api/restaurants/:restaurantId/tables
 */
export const createTable = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const table = await restaurantService.createTable(restaurantId, req.body);
  sendCreated(res, table);
});

/**
 * Get table by ID
 * GET /api/restaurants/:restaurantId/tables/:tableId
 */
export const getTableById = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;
  const table = await restaurantService.getTableById(tableId);
  sendSuccess(res, table);
});

/**
 * Update table
 * PATCH /api/restaurants/:restaurantId/tables/:tableId
 */
export const updateTable = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, tableId } = req.params;
  const table = await restaurantService.updateTable(restaurantId, tableId, req.body);
  sendSuccess(res, table);
});

/**
 * Delete table
 * DELETE /api/restaurants/:restaurantId/tables/:tableId
 */
export const deleteTable = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, tableId } = req.params;
  await restaurantService.deleteTable(restaurantId, tableId);
  sendNoContent(res);
});