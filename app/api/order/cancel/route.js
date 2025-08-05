import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import ConnectDb from "@/config/db";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";

export async function PUT(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
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

    // Find the order and verify ownership
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify that the order belongs to the authenticated user
    if (order.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Check if the order can be cancelled
    const allowedStatuses = ["order placed", "processing"];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Order cannot be cancelled. Current status: ${order.status}. Only orders with status "order placed" or "processing" can be cancelled.` 
        },
        { status: 400 }
      );
    }

    // Restore stock for all products in the cancelled order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // Update the order status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: "cancelled",
        paymentStatus: order.paymentMethod === "stripe" ? "failed" : "pending"
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel order" },
      { status: 500 }
    );
  }
} 