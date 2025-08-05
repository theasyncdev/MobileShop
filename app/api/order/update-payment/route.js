import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import ConnectDb from "@/config/db";
import Order from "@/models/orderModel";

export async function PUT(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "Please sign in to update order payment" 
      }, { status: 401 });
    }

    const { orderId, paymentIntentId, status } = await req.json();

    if (!orderId || !paymentIntentId || !status) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required order information" 
      }, { status: 400 });
    }

    await ConnectDb();

    // Find and update the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: "Order not found" 
      }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: "You can only update your own orders" 
      }, { status: 403 });
    }

    // Update order with payment information
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: status,
        paymentStatus: "completed",
        paymentIntentId: paymentIntentId,
        paymentMethod: "stripe",
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Order payment updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Update order payment error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update order payment. Please try again." 
    }, { status: 500 });
  }
} 