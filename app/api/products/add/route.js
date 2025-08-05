import ConnectDb from "@/config/db";
import authAdmin from "@/lib/authAdmin";
import Product from "@/models/productModel";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to add products" },
        { status: 401 }
      );
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "You need admin privileges to add products" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const brand = formData.get("brand");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");

    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please upload at least one product image" },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(buffer);
        });
      })
    );

    const imageUrls = uploads.map((result) => result.secure_url);

    await ConnectDb();

    // Validate required fields
    if (!name || !description || !brand || !price || !stock) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required product information" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
        userId,
        name,
        description,
        brand,  
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        stock: Number(stock),
        images: imageUrls
    });

    return NextResponse.json({
      success: true,
      message: `Product "${name}" has been added successfully!`,
      newProduct
      });

  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create product. Please check your information and try again." },
      { status: 500 }
    );
  }
}
