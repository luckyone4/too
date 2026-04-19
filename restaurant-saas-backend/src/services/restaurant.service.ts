/**
 * Restaurant Service
 * Business logic for restaurant management
 */

import { restaurantRepository, tableRepository } from '../models';
import { Restaurant, CreateRestaurantDTO, UpdateRestaurantDTO, Table, CreateTableDTO, UpdateTableDTO } from '../types';
import { NotFoundError, ConflictError } from '../middleware/errorHandler';
import { createSlug } from '../utils/validation';

/**
 * Get all restaurants
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  return restaurantRepository.findAll();
}

/**
 * Get restaurant by ID
 */
export async function getRestaurantById(id: string): Promise<Restaurant> {
  const restaurant = restaurantRepository.findById(id);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }
  return restaurant;
}

/**
 * Get restaurant by slug
 */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant> {
  const restaurant = restaurantRepository.findBySlug(slug);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }
  return restaurant;
}

/**
 * Create new restaurant
 */
export async function createRestaurant(data: CreateRestaurantDTO): Promise<Restaurant> {
  // Check if slug already exists
  const slug = data.slug || createSlug(data.name);
  const existing = restaurantRepository.findBySlug(slug);
  if (existing) {
    throw new ConflictError('Restaurant with this slug already exists');
  }

  return restaurantRepository.create({
    ...data,
    slug,
  });
}

/**
 * Update restaurant
 */
export async function updateRestaurant(
  id: string,
  data: UpdateRestaurantDTO
): Promise<Restaurant> {
  const restaurant = restaurantRepository.findById(id);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  // Check slug uniqueness if being updated
  if (data.slug && data.slug !== restaurant.slug) {
    const existing = restaurantRepository.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError('Restaurant with this slug already exists');
    }
  }

  const updated = restaurantRepository.update(id, data);
  if (!updated) {
    throw new NotFoundError('Restaurant');
  }

  return updated;
}

/**
 * Delete restaurant
 */
export async function deleteRestaurant(id: string): Promise<void> {
  const restaurant = restaurantRepository.findById(id);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  restaurantRepository.delete(id);
}

/**
 * Get restaurant tables
 */
export async function getRestaurantTables(restaurantId: string): Promise<Table[]> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  return tableRepository.findByRestaurant(restaurantId);
}

/**
 * Get table by ID
 */
export async function getTableById(tableId: string): Promise<Table> {
  const table = tableRepository.findById(tableId);
  if (!table) {
    throw new NotFoundError('Table');
  }
  return table;
}

/**
 * Create table
 */
export async function createTable(
  restaurantId: string,
  data: CreateTableDTO
): Promise<Table> {
  const restaurant = restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  // Check if table number already exists in restaurant
  const existing = tableRepository.findByNumber(restaurantId, data.number);
  if (existing) {
    throw new ConflictError('Table with this number already exists');
  }

  return tableRepository.create(restaurantId, data);
}

/**
 * Update table
 */
export async function updateTable(
  restaurantId: string,
  tableId: string,
  data: UpdateTableDTO
): Promise<Table> {
  const table = tableRepository.findById(tableId);
  if (!table) {
    throw new NotFoundError('Table');
  }

  if (table.restaurantId !== restaurantId) {
    throw new NotFoundError('Table');
  }

  // Check if new number conflicts with existing
  if (data.number && data.number !== table.number) {
    const existing = tableRepository.findByNumber(restaurantId, data.number);
    if (existing) {
      throw new ConflictError('Table with this number already exists');
    }
  }

  const updated = tableRepository.update(tableId, data);
  if (!updated) {
    throw new NotFoundError('Table');
  }

  return updated;
}

/**
 * Delete table
 */
export async function deleteTable(
  restaurantId: string,
  tableId: string
): Promise<void> {
  const table = tableRepository.findById(tableId);
  if (!table) {
    throw new NotFoundError('Table');
  }

  if (table.restaurantId !== restaurantId) {
    throw new NotFoundError('Table');
  }

  tableRepository.delete(tableId);
}