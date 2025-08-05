import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    console.log("Test auth - userId:", userId);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authentication working",
      userId: userId
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication error", error: error.message },
      { status: 500 }
    );
  }
} 