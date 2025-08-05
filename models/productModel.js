import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            ref: 'user'
        },
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
        },
        brand: {
            type: String,
            required: [true, "Brand is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
        },
        offerPrice: {
            type: Number,
            default: null,
        },
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: [0, "Stock cannot be negative"],
            default: 0
        },
        images: 
            {
                type: Array,
                required: true,
            },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.models.product || mongoose.model("product", productSchema);

export default Product;
