import ConnectDb from "@/config/db";
import Address from "@/models/addressModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Please sign in to view your addresses" }, { status: 401 });
        }


        await ConnectDb();

        const addresses = await Address.find({ userId: userId });

        return NextResponse.json({ success: true, addresses: addresses });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Unable to load your addresses. Please try again" });
    }
}