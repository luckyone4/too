#!/bin/bash

# Restaurant QR Ordering SaaS - Startup Script
# ===========================================

# Set NODE_PATH to include global modules and local lib folder
export NODE_PATH=/tmp/.npm-global/lib/node_modules:/workspace/restaurant-saas-backend/lib/node_modules

# Navigate to project directory
cd /workspace/restaurant-saas-backend

echo "Starting Restaurant QR Ordering SaaS Backend..."
echo "================================================"

# Check if ts-node exists
if [ -d "lib/node_modules/ts-node" ]; then
    echo "Using local ts-node..."
    node lib/node_modules/ts-node/dist/bin.js --transpile-only src/index.ts
elif [ -f "/tmp/.npm-global/lib/node_modules/ts-node/dist/bin.js" ]; then
    echo "Using global ts-node..."
    node /tmp/.npm-global/lib/node_modules/ts-node/dist/bin.js --transpile-only src/index.ts
else
    echo "Error: ts-node not found."
    echo "Please install with: npm install -g ts-node express cors dotenv helmet jsonwebtoken morgan uuid zod"
    exit 1
fi
