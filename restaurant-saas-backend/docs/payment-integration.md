# Payment Integration Guide

This document outlines how to integrate real payment providers.

## Current Implementation (Mock)

The current payment service simulates payment processing with:
- Random success/failure (95% success rate)
- Mock transaction IDs
- No actual payment processing

## Payment Provider Options

### 1. Stripe (Recommended)
- Excellent developer experience
- Global coverage
- Strong fraud protection
- Comprehensive API

### 2. PayPal
- Widely recognized
- Multiple payment methods
- Good for international

### 3. Square
- Great for in-person payments
- Integrated POS
- Simple pricing

## Integration with Stripe

### 1. Install Stripe SDK

```bash
npm install stripe @types/stripe
```

### 2. Create Stripe Configuration

```typescript
// src/config/payment.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Webhook secret
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
```

### 3. Create Payment Intent

```typescript
// src/services/payment/stripe.service.ts
import { stripe } from '../config/payment';
import { PaymentMethod, Order } from '../types';

export async function createPaymentIntent(
  order: Order,
  paymentMethod: PaymentMethod
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // Stripe uses cents
    currency: order.currency.toLowerCase(),
    metadata: {
      orderId: order.id,
      restaurantId: order.restaurantId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}
```

### 4. Handle Webhooks

```typescript
// src/routes/webhook.routes.ts
import express from 'express';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/payment';
import { orderRepository, paymentRepository } from '../models';

const router = express.Router();

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        await handlePaymentFailure(failedIntent);
        break;

      case 'charge.refunded':
        const charge = event.data.object;
        await handleRefund(charge);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send('Webhook error');
  }
});

async function handlePaymentSuccess(paymentIntent: any) {
  // Update order status
  const orderId = paymentIntent.metadata.orderId;
  await orderRepository.updateStatus(orderId, 'completed');

  // Create payment record
  await paymentRepository.create({
    orderId,
    transactionId: paymentIntent.id,
    status: 'completed',
    amount: paymentIntent.amount / 100,
  });
}

async function handlePaymentFailure(paymentIntent: any) {
  // Update payment status
  const orderId = paymentIntent.metadata.orderId;
  // Notify customer, retry logic, etc.
}

async function handleRefund(charge: any) {
  // Update payment status to refunded
}

export default router;
```

### 5. Client-Side Integration

```typescript
// Frontend (React/Next.js example)
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

async function handlePayment(orderId: string, total: number) {
  // Create payment intent on server
  const { clientSecret } = await fetch('/api/orders/${orderId}/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'card' }),
  }).then(r => r.json());

  // Confirm payment with Stripe
  const result = await stripe.confirmPayment({
    clientSecret,
    payment_method: {
      card: cardElement,
    },
  });

  if (result.error) {
    // Show error
    console.error(result.error.message);
  } else {
    // Payment succeeded
    // Redirect to success page
  }
}
```

## Multi-Payment Support

```typescript
// src/services/payment/PaymentFactory.ts
import { PaymentProvider } from './providers/StripeProvider';
import { PaymentProvider } from './providers/PayPalProvider';

export interface PaymentProvider {
  createPayment(order: Order): Promise<PaymentResult>;
  processRefund(transactionId: string): Promise<RefundResult>;
}

export class PaymentFactory {
  static getProvider(method: PaymentMethod): PaymentProvider {
    switch (method) {
      case PaymentMethod.CARD:
        // Could be Stripe, Square, etc.
        return new StripeProvider();
      case PaymentMethod.APPLE_PAY:
        return new ApplePayProvider();
      case PaymentMethod.GOOGLE_PAY:
        return new GooglePayProvider();
      default:
        throw new Error('Unsupported payment method');
    }
  }
}
```

## Testing Payments

### Stripe Test Mode

```bash
# Test card numbers
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# Requires auth: 4000 0025 0000 3155
```

### Environment Variables

```bash
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

## Security Best Practices

1. **Never store card numbers** - Use tokenization
2. **Use HTTPS** - All payment data must be encrypted
3. **Validate amounts** - Server-side validation
4. **Implement idempotency** - Prevent duplicate charges
5. **Log all transactions** - For debugging and compliance
6. **Use webhooks** - For reliable status updates