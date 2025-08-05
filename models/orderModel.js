import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        items: [
            {
                product: {
                    type: String,
                    required: true,
                    ref : 'product'
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        amount: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        },
        shipping: {
            type: Number,
            required: true,
            default: 10
        },
        tax: {
            type: Number,
            required: true,
            default: 0
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref : 'address'
        },
        status: {
            type: String,
            enum: ["order placed", "processing", "shipped", "delivered", "cancelled"],
            required: true,
            default: "order placed"
        },
                 date: {
             type: Date,
             default: Date.now
         },
         paymentIntentId: {
             type: String
         },
         paymentMethod: {
             type: String,
             enum: ["cod", "stripe"],
             default: "cod"
         },
         paymentStatus: {
             type: String,
             enum: ["pending", "completed", "failed"],
             default: "pending"
         }
     }
);

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;