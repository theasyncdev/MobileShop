import { inngest } from "@/config/ingest";
import Product from "@/models/productModel";
import User from "@/models/userModel";
import Order from "@/models/orderModel";
import Receipt from "@/models/receiptModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ConnectDb from "@/config/db";
import mongoose from "mongoose";


export async function POST(req){
    try {
        
        const {userId} = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Please sign in to place an order" },
                { status: 401 }
            );
        }

        const {address , items, paymentMethod = 'cod', paymentIntentId} = await req.json();

        if(!address || !items || items.length === 0){
            return NextResponse.json(
                { success: false, message: 'Please select a delivery address and add items to your cart before placing an order.' },
                { status: 400 }
            );
        }

        // Connect to database
        await ConnectDb();

        // Validate stock availability and calculate total amount
        let subtotal = 0;
        const stockValidation = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return NextResponse.json(
                    { success: false, message: `Product not found for item: ${item.product}` },
                    { status: 404 }
                );
            }

            // Check stock availability
            if (product.stock < item.quantity) {
                stockValidation.push({
                    productName: product.name,
                    requested: item.quantity,
                    available: product.stock
                });
            }

            const effectivePrice = product.offerPrice || product.price;
            subtotal += effectivePrice * item.quantity;
        }

        // If any products are out of stock, return error
        if (stockValidation.length > 0) {
            const errorMessage = stockValidation.map(item => 
                `${item.productName}: requested ${item.requested}, available ${item.available}`
            ).join(', ');
            return NextResponse.json(
                { success: false, message: `Insufficient stock: ${errorMessage}` },
                { status: 400 }
            );
        }

        // Add shipping and tax to match frontend calculation
        const shipping = 10; // Fixed shipping cost
        const tax = subtotal * 0.08; // 8% tax
        const totalAmount = subtotal + shipping + tax;

        // Generate a temporary order ID for reference
        const tempOrderId = new mongoose.Types.ObjectId();

        // Decrease stock for all products in the order
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product, 
                { $inc: { stock: -item.quantity } }, 
                { new: true }
            );
        }

        // For Stripe payments, create order with payment intent ID
        if (paymentMethod === 'stripe') {
            // Create order with payment intent ID
            const order = new Order({
                _id: tempOrderId,
                userId,
                amount: totalAmount,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                items,
                address,
                status: "processing",
                date: new Date(),
                paymentMethod: paymentMethod,
                paymentStatus: 'completed',
                paymentIntentId: paymentIntentId
            });
            await order.save();
            console.log(`Order created with payment intent: ${tempOrderId}`);
            
            // Generate receipt for successful Stripe payment
            try {
                const receiptResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/receipt/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${req.headers.get('authorization')}`
                    },
                    body: JSON.stringify({ orderId: tempOrderId })
                });
                
                if (receiptResponse.ok) {
                    console.log(`Receipt generated for order: ${tempOrderId}`);
                } else {
                    console.error(`Failed to generate receipt for order: ${tempOrderId}`);
                }
            } catch (error) {
                console.error('Error generating receipt:', error);
            }
        } else {
            // Create COD order directly in database
            const order = new Order({
                _id: tempOrderId,
                userId,
                amount: totalAmount,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                items,
                address,
                status: "order placed",
                date: new Date(),
                paymentMethod: paymentMethod,
                paymentStatus: 'pending'
            });
            await order.save();
            console.log(`COD Order created directly: ${tempOrderId}`);
        }

        // Clear user's cart
        const user = await User.findById(userId);
        if (user) {
            user.cartItems = {};
            await user.save();
        }
        
        return NextResponse.json({
            success: true, 
            message: "Order created successfully! Please complete your payment to confirm your order.",
            orderId: tempOrderId
        });


    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { success: false, message: "Unable to create your order. Please try again or contact support if the problem persists." },
            { status: 500 }
        );
    }
}