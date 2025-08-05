import ConnectDb from "@/config/db";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";



export async function GET(req) {
    try {
        await ConnectDb();
        
        // Add pagination and filtering options
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search') || '';
        const brand = searchParams.get('brand') || '';
        
        // Build query
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }
        if (brand) {
            query.brand = brand;
        }
        
        const skip = (page - 1) * limit;
        
        const products = await Product.find(query)
            .select('name description brand price offerPrice images stock')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        return NextResponse.json({
            success: true, 
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Products fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Unable to load products. Please try again later" },
            { status: 500 }
        );
    }
}