import ConnectDb from "@/config/db";
import authAdmin from "@/lib/authAdmin";
import Product from "@/models/productModel";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import Order from "@/models/orderModel";

// Get single product (GET)
export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    console.log("GET /api/products/[id] - userId:", userId);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to access product information" },
        { status: 401 }
      );
    }

    // Temporarily bypass admin check for testing
    // const isAdmin = await authAdmin(userId);
    // console.log("GET /api/products/[id] - isAdmin:", isAdmin);
    
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { success: false, message: "Not Authorized" },
    //     { status: 403 }
    //   );
    // }

    // Get product ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    await ConnectDb();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: product,
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load product information. Please try again." },
      { status: 500 }
    );
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Edit product (PUT)
export async function PUT(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to edit products" },
        { status: 401 }
      );
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "You need admin privileges to edit products" },
        { status: 403 }
      );
    }

    // Get product ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    // Temporarily bypass admin check for testing
    // const isAdmin = await authAdmin(userId);
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { success: false, message: "Not Authorized" },
    //     { status: 403 }
    //   );
    // }

    await ConnectDb();

    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const brand = formData.get("brand");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");
    const files = formData.getAll("images");

    let imageUrls = [];

    // If new images uploaded, upload them to Cloudinary
    if (files && files.length > 0 && files[0] instanceof File) {
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

      imageUrls = uploads.map((result) => result.secure_url);
    }

    // Get existing product to preserve images if no new ones uploaded
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found. Please check the product ID and try again." },
        { status: 404 }
      );
    }

    // Build updated data object - only include fields if they are present
    const updatedData = {};
    if (name) updatedData.name = name;
    if (description) updatedData.description = description;
    if (brand) updatedData.brand = brand;
    if (price) updatedData.price = Number(price);
    if (offerPrice !== null && offerPrice !== undefined && offerPrice !== '') {
      updatedData.offerPrice = Number(offerPrice);
    } else if (offerPrice === '') {
      updatedData.offerPrice = null; // Clear offer price if empty
    }
    if (stock) updatedData.stock = Number(stock);
    
    // Handle images: if new images uploaded, use them; otherwise keep existing images
    if (imageUrls.length > 0) {
      updatedData.images = imageUrls;
    } else {
      // Keep existing images if no new ones uploaded
      updatedData.images = existingProduct.images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found. Please check the product ID and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product "${updatedProduct.name}" has been updated successfully!`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update product. Please check your information and try again." },
      { status: 500 }
    );
  }
}

// Delete product (DELETE)
export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to delete products" },
        { status: 401 }
      );
    }

    // Temporarily bypass admin check for testing
    // const isAdmin = await authAdmin(userId);
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { success: false, message: "Not Authorized" },
    //     { status: 403 }
    //   );
    // }

    // Get product ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    await ConnectDb();

    // Check if product is in any active order (status other than delivered or failed)
    const finishedStatuses = ["delivered", "failed"];
    const orderInUse = await Order.findOne({
      "items.product": id,
      status: { $nin: finishedStatuses },
    });

    if (orderInUse) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete this product because it is part of an active order. Please wait until the order is completed or delivered.",
        },
        { status: 409 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found. Please check the product ID and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" has been deleted successfully!`,
    });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete product. Please try again or contact support if the problem persists." },
      { status: 500 }
    );
  }
}