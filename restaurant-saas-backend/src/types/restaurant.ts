/**
 * Restaurant entity interface
 */
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  coverImage?: string;
  timezone: string;
  currency: string;
  isActive: boolean;
  settings: RestaurantSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Restaurant-specific settings
 */
export interface RestaurantSettings {
  orderTimeoutMinutes: number;
  maxItemsPerOrder: number;
  allowTips: boolean;
  tipOptions: number[];
  requireCustomerName: boolean;
  enablePayments: boolean;
}

/**
 * Create restaurant DTO
 */
export interface CreateRestaurantDTO {
  name: string;
  slug?: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  coverImage?: string;
  timezone?: string;
  currency?: string;
  settings?: Partial<RestaurantSettings>;
}

/**
 * Update restaurant DTO
 */
export interface UpdateRestaurantDTO extends Partial<CreateRestaurantDTO> {
  isActive?: boolean;
}