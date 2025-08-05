import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import ConnectDb from "@/config/db";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";

export async function PATCH(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { orderId, status } = await req.json();
    
    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "Order ID and status are required" },
        { status: 400 }
      );
    }

    await ConnectDb();
    
    console.log(`Updating order ${orderId} status to: ${status}`);
    
    // Get current order to check previous status
    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) {
      console.error(`Order ${orderId} not found`);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // If status is being changed to cancelled, restore stock
    if (status === "cancelled" && currentOrder.status !== "cancelled") {
      for (const item of currentOrder.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    console.log(`Order ${orderId} status updated successfully to: ${order.status}`);
    
    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 }
    );
  }
} 