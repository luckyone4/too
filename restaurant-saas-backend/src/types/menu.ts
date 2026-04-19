import { Language } from './language';

/**
 * Multi-language text content
 */
export interface LocalizedText {
  [key: string]: string; // e.g., { en: "Pizza", tr: "Pizza", de: "Pizza" }
}

/**
 * Category entity for menu organization
 */
export interface Category {
  id: string;
  restaurantId: string;
  name: LocalizedText;
  description: LocalizedText;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Menu item entity
 */
export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: string;
  image?: string;
  images?: string[];
  options?: MenuItemOption[];
  tags?: string[];
  isAvailable: boolean;
  preparationTime?: number; // minutes
  calories?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Menu item option (e.g., size, extras)
 */
export interface MenuItemOption {
  id: string;
  name: LocalizedText;
  choices: MenuItemOptionChoice[];
  required: boolean;
  multiSelect: boolean;
}

/**
 * Menu item option choice
 */
export interface MenuItemOptionChoice {
  id: string;
  name: LocalizedText;
  price: number; // Additional price
}

/**
 * Create category DTO
 */
export interface CreateCategoryDTO {
  name: LocalizedText;
  description?: LocalizedText;
  image?: string;
  sortOrder?: number;
}

/**
 * Update category DTO
 */
export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  isActive?: boolean;
}

/**
 * Create menu item DTO
 */
export interface CreateMenuItemDTO {
  categoryId: string;
  name: LocalizedText;
  description?: LocalizedText;
  price: number;
  currency?: string;
  image?: string;
  images?: string[];
  options?: MenuItemOption[];
  tags?: string[];
  isAvailable?: boolean;
  preparationTime?: number;
  calories?: number;
  sortOrder?: number;
}

/**
 * Update menu item DTO
 */
export interface UpdateMenuItemDTO extends Partial<CreateMenuItemDTO> {
  isActive?: boolean;
}

/**
 * Get localized text in specified language
 */
export function getLocalizedText(text: LocalizedText, lang: Language): string {
  return text[lang] || text['en'] || Object.values(text)[0] || '';
}