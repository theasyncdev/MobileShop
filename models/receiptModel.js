import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'user'
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    billingInfo: {
        customerName: {
            type: String,
            required: true
        },
        customerEmail: {
            type: String,
            required: true
        },
        billingAddress: {
            fullName: String,
            streetAddress: String,
            city: String,
            state: String,
            postalCode: String,
            phoneNumber: String
        }
    },
    items: [
        {
            productId: {
                type: String,
                required: true,
                ref: 'product'
            },
            productName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            unitPrice: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            }
        }
    ],
    paymentDetails: {
        paymentMethod: {
            type: String,
            enum: ['cod', 'stripe'],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['completed', 'pending', 'failed'],
            required: true
        },
        paymentIntentId: String,
        transactionId: String
    },
    financialSummary: {
        subtotal: {
            type: Number,
            required: true
        },
        shipping: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    },
    receiptDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'refunded'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Generate receipt number before saving
receiptSchema.pre('save', async function(next) {
    if (this.isNew && !this.receiptNumber) {
        try {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            // Simple count of all receipts for today
            const count = await this.constructor.countDocuments({
                createdAt: {
                    $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                }
            });
            
            this.receiptNumber = `RCP-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
        } catch (error) {
            console.error("Error generating receipt number:", error);
            // Fallback receipt number
            this.receiptNumber = `RCP-${Date.now()}`;
        }
    }
    next();
});

const Receipt = mongoose.models.receipt || mongoose.model('receipt', receiptSchema);

export default Receipt; 