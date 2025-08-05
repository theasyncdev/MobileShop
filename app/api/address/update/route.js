import ConnectDb from "@/config/db";
import Address from "@/models/addressModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Postal code validation function
const validatePostalCode = (postalCode) => {
  // Remove spaces and convert to string
  const cleanPostalCode = postalCode.toString().replace(/\s/g, '');
  
  // Check if it's a valid postal code format (5 digits or 5+4 format)
  const postalCodeRegex = /^\d{5}(-\d{4})?$/;
  
  if (!postalCodeRegex.test(cleanPostalCode)) {
    return false;
  }
  
  // Additional validation: check if it's not all zeros or obvious invalid patterns
  if (cleanPostalCode === '00000' || cleanPostalCode === '00000-0000') {
    return false;
  }
  
  return true;
};

export async function PUT(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Please sign in to update an address" }, { status: 401 });
    }

    const { addressId, address } = await req.json();

    if (!addressId) {
      return NextResponse.json({ success: false, message: "Address ID is required" }, { status: 400 });
    }

    // Validate postal code
    if (!validatePostalCode(address.postalCode)) {
      return NextResponse.json(
        { success: false, message: "Invalid postal code format. Please enter a valid 5-digit postal code." },
        { status: 400 }
      );
    }

    await ConnectDb();

    // Check if address belongs to user
    const existingAddress = await Address.findOne({ _id: addressId, userId });
    if (!existingAddress) {
      return NextResponse.json({ success: false, message: "Address not found or access denied" }, { status: 404 });
    }

    // If isDefault is true, unset other default addresses
    if (address.isDefault) {
      await Address.updateMany({ userId, _id: { $ne: addressId } }, { isDefault: false });
    }

    // Update the address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { ...address },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Your address has been updated successfully!",
      address: updatedAddress
    });
  } catch (error) {
    console.error("Address update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update your address. Please check the information and try again." },
      { status: 500 }
    );
  }
} 