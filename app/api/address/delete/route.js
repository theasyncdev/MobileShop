import ConnectDb from "@/config/db";
import Address from "@/models/addressModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Please sign in to delete an address" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId');

    if (!addressId) {
      return NextResponse.json({ success: false, message: "Address ID is required" }, { status: 400 });
    }

    await ConnectDb();

    // Check if address belongs to user
    const existingAddress = await Address.findOne({ _id: addressId, userId });
    if (!existingAddress) {
      return NextResponse.json({ success: false, message: "Address not found or access denied" }, { status: 404 });
    }

    // Delete the address
    await Address.findByIdAndDelete(addressId);

    return NextResponse.json({ 
      success: true, 
      message: "Your address has been deleted successfully!"
    });
  } catch (error) {
    console.error("Address deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete your address. Please try again." },
      { status: 500 }
    );
  }
} 