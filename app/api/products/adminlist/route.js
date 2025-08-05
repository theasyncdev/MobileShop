import ConnectDb from "@/config/db";
import authAdmin from "@/lib/authAdmin";
import Product from "@/models/productModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(req){
    try {
        
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);

        if(!isAdmin){
            return NextResponse.json({success: false, message : "Not Authorized!"});
        }

        await ConnectDb();
        const products = await Product.find({});

        return NextResponse.json({success : true, products})
    } catch (error) {
        return NextResponse.json({success: false, message : "Something went wrong"});
    }
}