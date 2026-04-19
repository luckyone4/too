# Restaurant QR Ordering SaaS Platform - Backend

A production-ready backend system for multi-tenant restaurant QR-based ordering (similar to Sunday App).

## 🎯 Features

- **Multi-tenant Architecture**: Support multiple restaurants with isolated data
- **Multi-language Support**: Turkish, English, German, Russian, French, Arabic (RTL)
- **QR Code Ordering**: Table-based session management for customer ordering
- **Order Management**: Full order lifecycle (pending → completed)
- **Payment Simulation**: Mock payment processing without real integrations
- **Admin Dashboard API**: Menu, tables, orders, and analytics management
- **Role-based Access**: Admin and Staff roles with permissions

## ⚙️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Architecture**: Clean Architecture (Controllers → Services → Repositories)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
NODE_ENV=development
DEFAULT_LANGUAGE=en
SESSION_TIMEOUT_MINUTES=60
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## 📁 Project Structure

```
restaurant-saas-backend/
├── src/
│   ├── config/           # Environment & app configuration
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API route definitions
│   ├── middleware/       # Auth, validation, logging
│   ├── models/           # Data models & in-memory storage
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Helper functions
│   └── app.ts            # Express app setup
├── tests/                # Unit & integration tests
├── scripts/              # Utility scripts
└── docs/                # API documentation
```

## 🌐 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/profile` | Get current user profile |

### Restaurants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | List all restaurants |
| GET | `/api/restaurants/:id` | Get restaurant details |
| POST | `/api/restaurants` | Create restaurant (admin) |
| PATCH | `/api/restaurants/:id` | Update restaurant |

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/:restaurantId/menu` | Get menu with categories |
| POST | `/api/restaurants/:restaurantId/categories` | Create category |
| POST | `/api/restaurants/:restaurantId/items` | Create menu item |
| PATCH | `/api/restaurants/:restaurantId/items/:itemId` | Update menu item |
| DELETE | `/api/restaurants/:restaurantId/items/:itemId` | Delete menu item |

### Tables & QR Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/:restaurantId/tables` | List tables |
| POST | `/api/restaurants/:restaurantId/tables` | Create table |
| GET | `/api/tables/:tableId/session` | Get or create session |
| PATCH | `/api/tables/:tableId/session` | Update session |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders` | List orders (with filters) |
| GET | `/api/orders/:id` | Get order details |
| PATCH | `/api/orders/:id/status` | Update order status |
| POST | `/api/orders/:id/items` | Add items to order |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| GET | `/api/payments/:id` | Get payment details |
| POST | `/api/orders/:orderId/pay` | Simulate payment for order |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/revenue` | Daily revenue |
| GET | `/api/analytics/orders` | Order statistics |
| GET | `/api/analytics/products` | Top products |
| GET | `/api/analytics/tables` | Table performance |

### Public QR Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurant/:restaurantId/table/:tableId` | Get table session |
| GET | `/restaurant/:restaurantId/menu` | Get public menu |

## 🌐 Multi-language Support

All endpoints support language selection via `?lang=` query parameter:

```
GET /api/restaurants/1/menu?lang=tr
GET /api/restaurants/1/menu?lang=de
```

Supported languages: `en`, `tr`, `de`, `ru`, `fr`, `ar`

For Arabic (RTL), add `?lang=ar` and the frontend should apply RTL styling.

## 📋 Order Status Flow

```
pending → confirmed → preparing → ready → completed
         ↓
      cancelled
```

## 🔐 Role Permissions

### Admin
- Full CRUD on all resources
- Manage users and permissions
- View all analytics

### Staff
- View orders
- Update order status
- View menu (read-only)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/services/order.service.test.ts
```

## 📝 Example API Calls

### Quick Start - Test the API

```bash
# Start the server
./start.sh

# Check health
curl http://localhost:3000/api/health

# Get API stats
curl http://localhost:3000/api/stats
```

### Authentication

```bash
# Login (default credentials)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'

# Response: {"success":true,"data":{"token":"eyJ...","user":{...}}}
```

### Multi-language Menu

```bash
# Get menu in English (default)
curl "http://localhost:3000/api/restaurants/rest_1/menu?lang=en"

# Get menu in Turkish
curl "http://localhost:3000/api/restaurants/rest_1/menu?lang=tr"

# Get menu in German
curl "http://localhost:3000/api/restaurants/rest_1/menu?lang=de"

# Get menu in Arabic (RTL support)
curl "http://localhost:3000/api/restaurants/rest_1/menu?lang=ar"
```

### QR Code Public Endpoints

```bash
# Scan table QR to get session (creates 60-min session)
curl "http://localhost:3000/api/restaurant/rest_1/table/table_1"

# Get public menu for QR scan
curl "http://localhost:3000/api/restaurant/rest_1/menu?lang=en"
```

### Authenticated Operations

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Get tables list
curl "http://localhost:3000/api/restaurants/rest_1/tables" \
  -H "Authorization: Bearer $TOKEN"

# Get orders
curl "http://localhost:3000/api/orders?restaurantId=rest_1" \
  -H "Authorization: Bearer $TOKEN"

# Get analytics
curl "http://localhost:3000/api/analytics/revenue?restaurantId=rest_1" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Order

```bash
# Create order with auth
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "restaurantId": "rest_1",
    "tableId": "table_1",
    "sessionId": "sess_abc123",
    "items": [
      { "menuItemId": "item_1", "quantity": 2, "notes": "No onions" }
    ],
    "customerName": "John Doe"
  }'
```

### Simulate Payment

```bash
curl -X POST http://localhost:3000/api/orders/order_1/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "method": "card",
    "amount": 45.99
  }'
```

## 🔒 Security Notes

- Input validation on all endpoints
- JWT-based authentication
- Role-based access control middleware
- Rate limiting ready (not implemented)
- CORS configuration ready
- SQL injection prevention (when DB connected)

## 🔄 Future Integrations

### Database
- MongoDB/PostgreSQL connection points ready
- Repository pattern for data access

### Payment
- Stripe integration points marked
- Payment service interface ready
- Webhook handlers scaffolded

### Authentication
- OAuth2 providers ready (Google, Facebook)
- 2FA support scaffolded

### Notifications
- SMS provider interface ready (Twilio)
- Email provider interface ready (SendGrid)
- Push notification service ready

## 📄 License

MIT