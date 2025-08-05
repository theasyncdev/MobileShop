import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import ConnectDb from "@/config/db";
import Receipt from "@/models/receiptModel";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";
import User from "@/models/userModel";
import Address from "@/models/addressModel";

export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Please sign in to generate receipt" },
                { status: 401 }
            );
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }

        await ConnectDb();

        // Get the order with populated data
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // Verify the order belongs to the user
        if (order.userId !== userId) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            );
        }

        // Check if receipt already exists
        const existingReceipt = await Receipt.findOne({ orderId });
        if (existingReceipt) {
            return NextResponse.json({
                success: true,
                message: "Receipt already exists",
                receipt: existingReceipt
            });
        }

        // Get user data
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Get address data
        const address = await Address.findById(order.address);
        if (!address) {
            return NextResponse.json(
                { success: false, message: "Address not found" },
                { status: 404 }
            );
        }

        // Get product details for each item
        const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findById(item.product);
                return {
                    productId: item.product,
                    productName: product ? product.name : 'Unknown Product',
                    quantity: item.quantity,
                    unitPrice: product ? product.offerPrice || product.price : 0,
                    totalPrice: (product ? product.offerPrice || product.price : 0) * item.quantity
                };
            })
        );

        // Calculate financial summary if missing from order
        const subtotal = order.subtotal || itemsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);
        const shipping = order.shipping || 10; // Default shipping cost
        const tax = order.tax || (subtotal * 0.08); // 8% tax
        
        // Create receipt data
        const receiptData = {
            orderId: order._id,
            userId: order.userId,
            receiptNumber: `RCP-${Date.now()}`, // Temporary receipt number
            billingInfo: {
                customerName: user.name,
                customerEmail: user.email,
                billingAddress: {
                    fullName: address.fullName,
                    streetAddress: address.streetAddress,
                    city: address.city,
                    state: address.state,
                    postalCode: address.postalCode,
                    phoneNumber: address.phoneNumber
                }
            },
            items: itemsWithDetails,
            paymentDetails: {
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                paymentIntentId: order.paymentIntentId,
                transactionId: order.paymentIntentId // For Stripe payments
            },
            financialSummary: {
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: order.amount
            },
            receiptDate: order.date
        };

        // Create and save receipt
        const receipt = new Receipt(receiptData);
        await receipt.save();

        return NextResponse.json({
            success: true,
            message: "Receipt generated successfully",
            receipt: receipt
        });

    } catch (error) {
        console.error("Receipt creation error:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json(
            { success: false, message: "Unable to generate receipt. Please try again." },
            { status: 500 }
        );
    }
} 