/**
 * API Examples and Testing Guide
 *
 * This file contains curl commands and example API calls
 * for testing the Restaurant QR Ordering SaaS Backend
 */

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// Login and get token
curl -X POST ${API_BASE}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "admin123"
  }'

// Register new user
curl -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@restaurant.com",
    "password": "password123",
    "name": "New User",
    "role": "staff",
    "restaurantId": "rest_1"
  }'

// Get profile (requires auth token)
curl -X GET ${API_BASE}/auth/profile \
  -H "Authorization: Bearer <your_token_here>"

// ============================================================================
// RESTAURANT ENDPOINTS
// ============================================================================

// List all restaurants
curl -X GET ${API_BASE}/restaurants

// Get restaurant by ID
curl -X GET ${API_BASE}/restaurants/rest_1

// Create restaurant (admin only)
curl -X POST ${API_BASE}/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "My New Restaurant",
    "address": "123 Main Street",
    "phone": "+90 212 555 1234",
    "email": "info@newrestaurant.com",
    "currency": "TRY"
  }'

// Update restaurant
curl -X PATCH ${API_BASE}/restaurants/rest_1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Updated Restaurant Name"
  }'

// ============================================================================
// TABLE ENDPOINTS
// ============================================================================

// List restaurant tables
curl -X GET ${API_BASE}/restaurants/rest_1/tables \
  -H "Authorization: Bearer <token>"

// Create table
curl -X POST ${API_BASE}/restaurants/rest_1/tables \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "number": "A3",
    "capacity": 4
  }'

// Get or create session for table
curl -X GET ${API_BASE}/tables/table_1/session

// Get or create session with language
curl -X GET "${API_BASE}/tables/table_1/session?lang=tr"

// ============================================================================
// MENU ENDPOINTS
// ============================================================================

// Get restaurant menu (public endpoint)
curl -X GET ${API_BASE}/restaurants/rest_1/menu

// Get menu in Turkish
curl -X GET "${API_BASE}/restaurants/rest_1/menu?lang=tr"

// Get menu in German
curl -X GET "${API_BASE}/restaurants/rest_1/menu?lang=de"

// Get menu in Arabic (includes RTL flag)
curl -X GET "${API_BASE}/restaurants/rest_1/menu?lang=ar"

// Create category
curl -X POST ${API_BASE}/restaurants/rest_1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": {
      "en": "Appetizers",
      "tr": "Aperatifler",
      "de": "Vorspeisen"
    },
    "description": {
      "en": "Light starters",
      "tr": "Hafif başlangıçlar",
      "de": "Leichte Vorspeisen"
    }
  }'

// Create menu item
curl -X POST ${API_BASE}/restaurants/rest_1/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "categoryId": "cat_1",
    "name": {
      "en": "French Fries",
      "tr": "Patates Kızartması",
      "de": "Pommes Frites"
    },
    "description": {
      "en": "Crispy golden fries with dipping sauce",
      "tr": "Sos ile servis edilen çıtır altın patatesler",
      "de": "Knusprige goldene Pommes mit Dip-Sauce"
    },
    "price": 45,
    "currency": "TRY",
    "isAvailable": true
  }'

// Update menu item availability
curl -X PATCH ${API_BASE}/restaurants/rest_1/items/item_1/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "isAvailable": false
  }'

// Search menu items
curl -X GET "${API_BASE}/restaurants/rest_1/menu/search?q=salmon"

# ============================================================================
// CART/SESSION ENDPOINTS
# ============================================================================

// Get cart
curl -X GET ${API_BASE}/tables/table_1/cart

// Add to cart
curl -X POST ${API_BASE}/tables/table_1/cart \
  -H "Content-Type: application/json" \
  -d '{
    "menuItemId": "item_1",
    "quantity": 2,
    "notes": "No onions please"
  }'

// Update cart item quantity
curl -X PATCH ${API_BASE}/tables/table_1/cart/item_1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'

// Remove from cart
curl -X DELETE ${API_BASE}/tables/table_1/cart/item_1

// Clear cart
curl -X DELETE ${API_BASE}/tables/table_1/cart

// ============================================================================
// ORDER ENDPOINTS
# ============================================================================

// Create order
curl -X POST ${API_BASE}/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "rest_1",
    "tableId": "table_1",
    "sessionId": "sess_1",
    "customerName": "John Doe",
    "items": [
      { "menuItemId": "item_1", "quantity": 2 },
      { "menuItemId": "item_3", "quantity": 1 }
    ],
    "tip": 50
  }'

// List orders for restaurant
curl -X GET "${API_BASE}/orders?restaurantId=rest_1&status=pending"

// List orders with pagination
curl -X GET "${API_BASE}/orders?restaurantId=rest_1&page=1&limit=10"

// Get order by ID
curl -X GET ${API_BASE}/orders/order_1

// Update order status
curl -X PATCH ${API_BASE}/orders/order_1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "confirmed"
  }'

// Add items to order
curl -X POST ${API_BASE}/orders/order_1/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "menuItemId": "item_5", "quantity": 1 }
    ]
  }'

// Cancel order
curl -X POST ${API_BASE}/orders/order_1/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "reason": "Customer requested cancellation"
  }'

// Get table orders
curl -X GET ${API_BASE}/tables/table_1/orders

// ============================================================================
// PAYMENT ENDPOINTS
# ============================================================================

// Simulate card payment
curl -X POST ${API_BASE}/orders/order_1/pay \
  -H "Content-Type: application/json" \
  -d '{
    "method": "card",
    "amount": 581,
    "cardLast4": "4242",
    "cardBrand": "Visa"
  }'

// Process cash payment
curl -X POST ${API_BASE}/orders/order_1/pay-cash

// Create payment record
curl -X POST ${API_BASE}/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "orderId": "order_2",
    "method": "card",
    "amount": 1300
  }'

// Get payment by ID
curl -X GET ${API_BASE}/payments/pay_1

// Refund payment
curl -X POST ${API_BASE}/payments/pay_1/refund

// ============================================================================
// ANALYTICS ENDPOINTS
# ============================================================================

// Get revenue analytics (today)
curl -X GET "${API_BASE}/analytics/revenue?restaurantId=rest_1"

// Get revenue for week
curl -X GET "${API_BASE}/analytics/revenue?restaurantId=rest_1&range=week"

// Get revenue for month
curl -X GET "${API_BASE}/analytics/revenue?restaurantId=rest_1&range=month"

// Get top products
curl -X GET "${API_BASE}/analytics/products?restaurantId=rest_1&limit=5"

// Get table performance
curl -X GET "${API_BASE}/analytics/tables?restaurantId=rest_1"

// Get full analytics
curl -X GET "${API_BASE}/analytics/full?restaurantId=rest_1&range=week"

// Get sales by hour
curl -X GET "${API_BASE}/analytics/sales-by-hour?restaurantId=rest_1&date=2024-01-15"

// Get dashboard summary
curl -X GET "${API_BASE}/analytics/dashboard?restaurantId=rest_1"

// ============================================================================
// PUBLIC QR ENDPOINTS (No Authentication Required)
// ============================================================================

// Get public restaurant info
curl -X GET ${BASE_URL}/restaurant/rest_1

// Get table session (QR scan endpoint)
curl -X GET "${BASE_URL}/restaurant/rest_1/table/table_1?lang=tr"

// Get public menu
curl -X GET "${BASE_URL}/restaurant/rest_1/menu?lang=de"

// Public cart operations
curl -X GET ${BASE_URL}/restaurant/rest_1/table/table_1/cart
curl -X POST ${BASE_URL}/restaurant/rest_1/table/table_1/cart \
  -H "Content-Type: application/json" \
  -d '{
    "menuItemId": "item_1",
    "quantity": 1
  }'

// ============================================================================
// HEALTH & INFO ENDPOINTS
# ============================================================================

// Health check
curl -X GET ${API_BASE}/health

// API documentation
curl -X GET ${API_BASE}/docs

// Data statistics
curl -X GET ${API_BASE}/stats

// Root endpoint
curl -X GET ${BASE_URL}/