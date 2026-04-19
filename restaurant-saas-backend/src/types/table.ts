/**
 * Table entity for QR code system
 */
export interface Table {
  id: string;
  restaurantId: string;
  number: string; // Table number (e.g., "A1", "12", "VIP-1")
  capacity: number;
  posX?: number; // For visual floor plan
  posY?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session entity for customer ordering
 */
export interface Session {
  id: string;
  tableId: string;
  restaurantId: string;
  customerId?: string;
  customerName?: string;
  language: string;
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  cart: CartItem[];
}

/**
 * Cart item in session
 */
export interface CartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
  price: number; // Snapshot at time of adding
}

/**
 * Create table DTO
 */
export interface CreateTableDTO {
  number: string;
  capacity: number;
  posX?: number;
  posY?: number;
}

/**
 * Update table DTO
 */
export interface UpdateTableDTO extends Partial<CreateTableDTO> {
  isActive?: boolean;
}

/**
 * Create session DTO
 */
export interface CreateSessionDTO {
  tableId: string;
  restaurantId: string;
  customerName?: string;
  language?: string;
}