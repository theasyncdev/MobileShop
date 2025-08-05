import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import ConnectDb from "@/config/db";
import User from "@/models/userModel";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    console.log('Test Clerk - Current userId:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    await ConnectDb();

    // Test getting current user data from local database
    const currentUser = await User.findById(userId);
    console.log('Current user data from local DB:', {
      id: currentUser?._id,
      name: currentUser?.name,
      email: currentUser?.email
    });

    // Test getting all users (for debugging)
    const allUsers = await User.find({});
    console.log('All users count:', allUsers.length);
    console.log('Sample users:', allUsers.slice(0, 3).map(u => ({
      id: u._id,
      name: u.name,
      email: u.email
    })));

    return NextResponse.json({
      success: true,
      message: "Local database user test successful",
      currentUser: {
        id: currentUser?._id,
        name: currentUser?.name,
        email: currentUser?.email
      },
      totalUsers: allUsers.length,
      sampleUsers: allUsers.slice(0, 3).map(u => ({
        id: u._id,
        name: u.name,
        email: u.email
      }))
    });
  } catch (error) {
    console.error("Local database test error:", error);
    return NextResponse.json(
      { success: false, message: "Local database test failed", error: error.message },
      { status: 500 }
    );
  }
} 