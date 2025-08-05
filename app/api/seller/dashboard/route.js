import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import ConnectDb from "@/config/db";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";
import User from "@/models/userModel";
import authAdmin from "@/lib/authAdmin";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    
    console.log("Dashboard API called with userId:", userId);
    
    if (!userId) {
      console.log("No userId found in request");
      return NextResponse.json(
        { success: false, message: "Please sign in to access the dashboard" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const isAdmin = await authAdmin(userId);
    console.log("User admin check result:", isAdmin);
    
    if (!isAdmin) {
      console.log("User does not have admin role");
      return NextResponse.json(
        { success: false, message: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    console.log("Connecting to database...");
    await ConnectDb();
    console.log("Database connected successfully");

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get all orders in the date range
    console.log("Fetching orders from", startDate, "to", now);
    const orders = await Order.find({
      date: { $gte: startDate, $lte: now }
    }).sort({ date: -1 });
    console.log("Found", orders.length, "orders");

    // Calculate statistics
    const totalOrders = orders.length;
    
    // Calculate revenue excluding cancelled orders
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    const totalRevenue = Math.round(activeOrders.reduce((sum, order) => sum + order.amount, 0) * 100) / 100;
    
    const pendingOrders = orders.filter(order => 
      order.status === 'order placed' || order.status === 'processing'
    ).length;
    const completedOrders = orders.filter(order => 
      order.status === 'delivered'
    ).length;
    const cancelledOrders = orders.filter(order => 
      order.status === 'cancelled'
    ).length;

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get recent orders (last 10) with user data and quantities
    const recentOrdersData = orders.slice(0, 10);
    
    // Fetch user data for recent orders
    const recentOrders = await Promise.all(
      recentOrdersData.map(async (order) => {
        try {
          console.log('Fetching user data for userId:', order.userId);
          
          // Get user data from local database
          const user = await User.findOne({ _id: order.userId });
          console.log('Local user data:', {
            id: user?._id,
            name: user?.name,
            email: user?.email
          });
          
          let customerName = 'Unknown Customer';
          let userEmail = null;
          
          if (user) {
            customerName = user.name || user.email || 'Unknown Customer';
            userEmail = user.email;
          }
          
          console.log('Final customer name:', customerName);
          
          // Calculate total quantity for the order
          const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            ...order.toObject(),
            customerName,
            totalQuantity,
            userEmail
          };
        } catch (error) {
          console.error('Error fetching user data for order:', order._id, 'userId:', order.userId, error);
          return {
            ...order.toObject(),
            customerName: 'Unknown Customer',
            totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
            userEmail: null,
            error: error.message
          };
        }
      })
    );

    // Calculate additional metrics
    const averageOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;
    const completionRate = activeOrders.length > 0 ? (completedOrders / activeOrders.length) * 100 : 0;

    // Get orders by status
    const ordersByStatus = {
      'order placed': orders.filter(o => o.status === 'order placed').length,
      'processing': orders.filter(o => o.status === 'processing').length,
      'shipped': orders.filter(o => o.status === 'shipped').length,
      'delivered': orders.filter(o => o.status === 'delivered').length,
      'cancelled': orders.filter(o => o.status === 'cancelled').length
    };

    // Get payment method breakdown
    const paymentMethods = {
      'cod': orders.filter(o => o.paymentMethod === 'cod').length,
      'stripe': orders.filter(o => o.paymentMethod === 'stripe').length
    };

    // Get revenue by payment method (format as numbers for chart display) - excluding cancelled orders
    const revenueByPayment = {
      'cod': Math.round(activeOrders.filter(o => o.paymentMethod === 'cod').reduce((sum, o) => sum + o.amount, 0) * 100) / 100,
      'stripe': Math.round(activeOrders.filter(o => o.paymentMethod === 'stripe').reduce((sum, o) => sum + o.amount, 0) * 100) / 100
    };

    const stats = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      recentOrders,
      averageOrderValue,
      completionRate,
      ordersByStatus,
      paymentMethods,
      revenueByPayment,
      timeRange
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load dashboard data. Please try again" },
      { status: 500 }
    );
  }
} 