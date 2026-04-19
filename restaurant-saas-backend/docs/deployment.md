# Deployment Guide

This guide covers deploying the Restaurant QR Ordering SaaS backend to production.

## Environment Configuration

### Required Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=your-secure-256-bit-secret-key-here
JWT_EXPIRES_IN=7d

# Database (when ready)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/restaurant-saas
# Or for PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/restaurant-saas

# Stripe (when ready)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
REDIS_URL=redis://localhost:6379
```

## Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY dist/ ./dist/ 2>/dev/null || true

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Redis for session storage
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

## Cloud Platform Deployment

### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p nodejs restaurant-saas-backend

# Create environment
eb create production-env

# Deploy
eb deploy
```

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/restaurant-api

# Deploy
gcloud run deploy restaurant-api \
  --image gcr.io/PROJECT_ID/restaurant-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Railway / Render / Fly.io

Simply connect your GitHub repository and they will auto-detect the Node.js setup.

## NGINX Configuration

```nginx
# /etc/nginx/sites-available/restaurant-api

upstream api_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.yourrestaurant.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourrestaurant.com;

    ssl_certificate /etc/letsencrypt/live/api.yourrestaurant.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourrestaurant.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types application/json text/plain text/css application/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=50 nodelay;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/health {
        proxy_pass http://api_backend;
        access_log off;
    }
}
```

## CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      # Add deployment steps based on your platform
      # AWS, GCP, Railway, etc.
```

## Monitoring & Logging

### Health Check Endpoint

```bash
# Should return 200 OK
curl https://api.yourrestaurant.com/api/health
```

### Log Management

```typescript
// src/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Use in services
logger.info('Payment processed', { orderId, amount });
logger.error('Payment failed', { orderId, error });
```

### APM Integration (Optional)

```typescript
// For New Relic, Datadog, etc.
import apm from 'elastic-apm-node';

if (process.env.APM_ENABLED === 'true') {
  apm.start({
    serviceName: 'restaurant-api',
    serverUrl: process.env.APM_SERVER_URL,
  });
}
```

## Security Checklist

- [ ] Use HTTPS (TLS 1.2+)
- [ ] Secure JWT secrets
- [ ] Enable CORS for specific domains only
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Enable security headers
- [ ] Use environment variables for secrets
- [ ] Regular dependency updates (`npm audit`)
- [ ] Database connection security
- [ ] API key rotation