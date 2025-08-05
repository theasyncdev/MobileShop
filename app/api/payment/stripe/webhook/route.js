import { NextResponse } from "next/server";
import { stripe } from "@/config/stripe";
import ConnectDb from "@/config/db";
import Order from "@/models/orderModel";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');
    
    console.log('Webhook received:', { signature: !!signature, bodyLength: body.length });
    
    if (!signature) {
      console.error('No signature in webhook request');
      return NextResponse.json(
        { success: false, message: "No signature" },
        { status: 400 }
      );
    }

    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('Webhook event parsed successfully:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      
      // Check if webhook secret is missing
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return NextResponse.json(
          { success: false, message: "Webhook secret not configured" },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    await ConnectDb();

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Processing payment_intent.succeeded event');
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        console.log('Processing payment_intent.payment_failed event');
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    console.log(`Processing payment success for order: ${orderId}`);
    console.log(`Payment intent ID: ${paymentIntent.id}`);
    console.log(`Payment amount: ${paymentIntent.amount}`);
    
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'completed',
      status: 'processing' // Move order to processing
    }, { new: true });
    
    if (updatedOrder) {
      console.log(`Order ${orderId} updated successfully. New status: ${updatedOrder.status}, Payment status: ${updatedOrder.paymentStatus}`);
    } else {
      console.error(`Failed to update order ${orderId} - order not found`);
    }
    
    console.log(`Payment succeeded for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed'
    });
    
    console.log(`Payment failed for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
} 