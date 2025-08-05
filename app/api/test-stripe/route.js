import { NextResponse } from "next/server";

export async function GET() {
  const stripeConfig = {
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'missing',
    secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'missing',
    webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 6) || 'missing'
  };

  return NextResponse.json({
    success: true,
    message: "Stripe configuration check",
    config: stripeConfig,
    environment: process.env.NODE_ENV || 'development'
  });
} 