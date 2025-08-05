import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import ConnectDb from "@/config/db";
import Receipt from "@/models/receiptModel";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Please sign in to view receipts" },
                { status: 401 }
            );
        }

        await ConnectDb();

        const { searchParams } = new URL(req.url);
        const receiptId = searchParams.get('receiptId');
        const orderId = searchParams.get('orderId');

        if (receiptId) {
            // Get specific receipt
            const receipt = await Receipt.findById(receiptId);
            if (!receipt) {
                return NextResponse.json(
                    { success: false, message: "Receipt not found" },
                    { status: 404 }
                );
            }

            // Verify the receipt belongs to the user
            if (receipt.userId !== userId) {
                return NextResponse.json(
                    { success: false, message: "Access denied" },
                    { status: 403 }
                );
            }

            return NextResponse.json({
                success: true,
                receipt: receipt
            });
        }

        if (orderId) {
            // Get receipt by order ID
            const receipt = await Receipt.findOne({ orderId, userId });
            if (!receipt) {
                return NextResponse.json(
                    { success: false, message: "Receipt not found for this order" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                receipt: receipt
            });
        }

        // Get all receipts for the user
        const receipts = await Receipt.find({ userId })
            .sort({ receiptDate: -1 })
            .limit(50); // Limit to last 50 receipts

        return NextResponse.json({
            success: true,
            receipts: receipts
        });

    } catch (error) {
        console.error("Receipt fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Unable to fetch receipts. Please try again." },
            { status: 500 }
        );
    }
} 