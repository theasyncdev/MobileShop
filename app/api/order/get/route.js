import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";
import Address from "@/models/addressModel";
import ConnectDb from "@/config/db";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        const { searchParams } = new URL(req.url);
        const fetchAll = searchParams.get('all') === 'true';
        const status = searchParams.get('status');
        const orderId = searchParams.get('orderId'); // NEW

        await ConnectDb();

        // Fetch a single order by ID (for Stripe payment flow)
        if (orderId) {
            const order = await Order.findById(orderId)
                .populate({
                    path: 'items.product',
                    model: Product,
                    select: 'name image offerPrice'
                })
                .populate({
                    path: 'address',
                    model: Address,
                    select: 'fullName streetAddress city state postalCode phoneNumber'
                });
            if (!order) {
                return NextResponse.json({ success: false, message: "Order not found. Please check your order ID and try again." }, { status: 404 });
            }
            // Only allow user to fetch their own order (unless admin)
            if (!fetchAll && order.userId !== userId) {
                return NextResponse.json({ success: false, message: "You can only view your own orders" }, { status: 403 });
            }
            return NextResponse.json({ success: true, order });
        }

        let query = {};
        if (!fetchAll) {
            if (!userId) {
                return NextResponse.json(
                    { success: false, message: "Please sign in to view your orders" },
                    { status: 401 }
                );
            }
            query.userId = userId;
        }
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate({
                path: 'items.product',
                model: Product,
                select: 'name image offerPrice'
            })
            .populate({
                path: 'address',
                model: Address,
                select: 'fullName streetAddress city state postalCode phoneNumber'
            })
            .sort({ date: -1 });

        return NextResponse.json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { success: false, message: "Unable to load your orders. Please try again" },
            { status: 500 }
        );
    }
} 