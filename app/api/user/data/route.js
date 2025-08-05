import ConnectDb from "@/config/db";
import User from "@/models/userModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Please sign in to access your account information" },
                { status: 401 }
            );
        }

        await ConnectDb();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Account not found. Please sign in again" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("User data fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Unable to load your account information. Please try again" },
            { status: 500 }
        );
    }
}