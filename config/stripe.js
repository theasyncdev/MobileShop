// Stripe Configuration for Workbench
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Updated to latest API version
});

// Validate environment variables
const validateStripeConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing Stripe environment variables:', missingVars);
    throw new Error(`Missing required Stripe environment variables: ${missingVars.join(', ')}`);
  }

  // Validate key formats
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
    throw new Error('Invalid STRIPE_SECRET_KEY format. Should start with "sk_test_" or "sk_live_"');
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_')) {
    throw new Error('Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format. Should start with "pk_test_" or "pk_live_"');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) {
    throw new Error('Invalid STRIPE_WEBHOOK_SECRET format. Should start with "whsec_"');
  }
};

// Validate on module load (only in production)
if (process.env.NODE_ENV === 'production') {
  try {
    validateStripeConfig();
  } catch (error) {
    console.error('Stripe configuration error:', error.message);
  }
} else {
  // In development, just log missing variables without throwing
  const missingVars = ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
    .filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing Stripe environment variables in development:', missingVars);
    console.warn('Please add them to your .env.local file for full functionality');
  }
}

const STRIPE_CONFIG = {
  // Test keys (for development)
  test: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  
  // Live keys (for production)
  live: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  }
};

// Get current environment
const getStripeConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? STRIPE_CONFIG.live : STRIPE_CONFIG.test;
};

export { stripe, STRIPE_CONFIG, getStripeConfig, validateStripeConfig }; 