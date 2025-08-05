import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "Please sign in to complete your payment" 
      }, { status: 401 });
    }

    const { amount, currency } = await req.json();

    if (!amount || !currency) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required payment information" 
      }, { status: 400 });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is in cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created successfully"
    });

  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create payment intent. Please try again." 
    }, { status: 500 });
  }
} 