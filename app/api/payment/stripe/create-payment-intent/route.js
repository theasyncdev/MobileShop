import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { stripe } from "@/config/stripe";
import ConnectDb from "@/config/db";
import Order from "@/models/orderModel";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { orderId, amount } = await req.json();
    
    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order data - orderId and amount are required" },
        { status: 400 }
      );
    }

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe secret key not found");
      return NextResponse.json(
        { success: false, message: "Payment service not configured" },
        { status: 500 }
      );
    }

    await ConnectDb();
    
    // Verify order exists and belongs to user (with retry for timing issues)
    let order = null;
    let retries = 0;
    const maxRetries = 3;
    
    while (!order && retries < maxRetries) {
      order = await Order.findById(orderId);
      if (!order || order.userId !== userId) {
        if (retries < maxRetries - 1) {
          console.log(`Order not found, retrying... (${retries + 1}/${maxRetries})`);
          // Wait a bit before retrying (for Inngest timing issues)
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
        } else {
          console.log(`Order not found after ${maxRetries} retries: ${orderId}`);
          return NextResponse.json(
            { success: false, message: "Order not found or unauthorized" },
            { status: 404 }
          );
        }
      } else {
        console.log(`Order found successfully: ${orderId}`);
      }
    }

    // Validate amount matches order amount
    if (Math.abs(order.amount - amount) > 0.01) {
      return NextResponse.json(
        { success: false, message: "Amount mismatch with order" },
        { status: 400 }
      );
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'npr',
      metadata: {
        orderId: orderId,
        userId: userId,
        orderAmount: amount.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Order ${orderId} - ${order.items.length} items`,
    });

    // Update order with payment intent ID
    await Order.findByIdAndUpdate(orderId, {
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
      paymentStatus: 'completed'
    });

    console.log(`Payment intent created for order ${orderId}: ${paymentIntent.id}`);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("Stripe payment intent error:", error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    } else if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { success: false, message: "Invalid payment request" },
        { status: 400 }
      );
    } else if (error.type === 'StripeAPIError') {
      return NextResponse.json(
        { success: false, message: "Payment service temporarily unavailable" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Payment initialization failed" },
      { status: 500 }
    );
  }
} 