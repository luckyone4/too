# Database Integration Guide

This document outlines how to transition from in-memory storage to a real database.

## Current Architecture

```
┌─────────────────────────────────────────────┐
│              Controllers                     │
│         (Request Handling)                  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              Services                        │
│         (Business Logic)                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Repositories                       │
│         (Data Access Layer)                  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         In-Memory Store                     │
│         (Mock Database)                    │
└─────────────────────────────────────────────┘
```

## Database Options

### Option 1: MongoDB (Recommended)
- Flexible schema for multi-language support
- Good for hierarchical data (categories, items)
- Easy horizontal scaling

### Option 2: PostgreSQL
- Strong relational integrity
- Better for complex queries and analytics
- JSON support for multi-language fields

### Option 3: MySQL
- Widely used, great community support
- Good performance for read-heavy workloads

## Integration Steps

### 1. Install Database Driver

```bash
# MongoDB
npm install mongoose

# PostgreSQL
npm install pg @types/pg

# MySQL
npm install mysql2
```

### 2. Create Database Connection

```typescript
// src/config/database.ts
import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-saas';

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB');
}
```

### 3. Define Models

```typescript
// src/models/mongodb/Restaurant.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  address: string;
  phone: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  currency: { type: String, default: 'TRY' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
```

### 4. Update Repository Pattern

```typescript
// src/models/repositories/mongo/RestaurantRepository.ts
import Restaurant from '../mongodb/Restaurant';

export const restaurantRepository = {
  async findById(id: string): Promise<IRestaurant | null> {
    return Restaurant.findById(id);
  },

  async findAll(): Promise<IRestaurant[]> {
    return Restaurant.find({ isActive: true });
  },

  async create(data: Partial<IRestaurant>): Promise<IRestaurant> {
    return Restaurant.create(data);
  },

  async update(id: string, data: Partial<IRestaurant>): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string): Promise<boolean> {
    const result = await Restaurant.findByIdAndDelete(id);
    return !!result;
  }
};
```

### 5. Update Entry Point

```typescript
// src/index.ts
import { connectDatabase } from './config/database';

async function start() {
  // Connect to database
  await connectDatabase();

  // Initialize seed data (optional, for development)
  initializeData();

  // Start server
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

start();
```

## Multi-Language Fields

For multi-language support in MongoDB:

```javascript
// Menu item schema
const MenuItemSchema = new Schema({
  name: {
    type: Map,
    of: String,
    required: true
  },
  description: {
    type: Map,
    of: String
  },
  // Alternative: nested object
  localizations: [{
    language: String,
    name: String,
    description: String
  }]
});

// Query with specific language
MenuItem.findOne({ _id: itemId })
  .then(item => ({
    name: item.name.get(lang) || item.name.get('en'),
    description: item.description.get(lang) || item.description.get('en')
  }));
```

## Indexes

```javascript
// Create indexes for better query performance
RestaurantSchema.index({ slug: 1 }, { unique: true });
RestaurantSchema.index({ isActive: 1 });
MenuItemSchema.index({ restaurantId: 1, categoryId: 1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
SessionSchema.index({ tableId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }); // For cleanup
```

## Next Steps

1. Choose database type
2. Create connection module
3. Define schemas/models
4. Update repositories
5. Add migrations
6. Update seed data logic
7. Test all endpoints