import ConnectDb from "@/config/db";
import User from "@/models/userModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(req){

    try {
        
        const {userId} = getAuth(req);

        await ConnectDb();

        const user = await User.findById(userId)

        const {cartItems} = user

        return NextResponse.json({success : true , cartItems});

    } catch (error) {
            return NextResponse.json({success : false , message : "something went wrong!"});        
    }
}