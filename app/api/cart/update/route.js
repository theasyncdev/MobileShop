import ConnectDb from "@/config/db";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Please sign in to update your cart" }, { status: 401 });
    }

    const { cartItems } = await req.json(); 

    await ConnectDb();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Account not found. Please sign in again" }, { status: 404 });
    }

    console.log("Updating cartItems:", cartItems);
    
    // Explicitly set the cartItems field in the update
    const res = await User.findByIdAndUpdate(
      userId, 
      { $set: { cartItems: cartItems } }, 
      { new: true, runValidators: true }
    );
    
  
    return NextResponse.json({ 
      success: true, 
      message: "Your cart has been updated successfully",
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update your cart. Please try again" },
      { status: 500 }
    );
  }
}
