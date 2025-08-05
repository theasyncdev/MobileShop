import ConnectDb from "./config/db.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";

const testStockRestoration = async () => {
  try {
    await ConnectDb();
    
    console.log("🧪 Testing Stock Restoration Functionality");
    console.log("==========================================");
    
    // Find a product to test with
    const testProduct = await Product.findOne({ stock: { $gt: 0 } });
    
    if (!testProduct) {
      console.log("❌ No products with stock found. Please add some products first.");
      return;
    }
    
    console.log(`📦 Testing with product: ${testProduct.name}`);
    console.log(`📊 Initial stock: ${testProduct.stock}`);
    
    // Create a test order
    const testOrder = new Order({
      userId: "test_user",
      items: [
        {
          product: testProduct._id,
          quantity: 2
        }
      ],
      amount: testProduct.offerPrice * 2,
      subtotal: testProduct.offerPrice * 2,
      shipping: 10,
      tax: (testProduct.offerPrice * 2) * 0.08,
      address: "test_address",
      status: "order placed",
      paymentMethod: "cod",
      paymentStatus: "pending"
    });
    
    await testOrder.save();
    console.log(`📋 Created test order: ${testOrder._id}`);
    
    // Simulate stock decrease (as happens in order creation)
    const afterOrderProduct = await Product.findByIdAndUpdate(
      testProduct._id,
      { $inc: { stock: -2 } },
      { new: true }
    );
    
    console.log(`📉 Stock after order: ${afterOrderProduct.stock}`);
    
    // Simulate order cancellation and stock restoration
    const restoredProduct = await Product.findByIdAndUpdate(
      testProduct._id,
      { $inc: { stock: 2 } },
      { new: true }
    );
    
    console.log(`📈 Stock after cancellation: ${restoredProduct.stock}`);
    
    // Verify stock is restored correctly
    if (restoredProduct.stock === testProduct.stock) {
      console.log("✅ Stock restoration working correctly!");
    } else {
      console.log("❌ Stock restoration failed!");
      console.log(`Expected: ${testProduct.stock}, Got: ${restoredProduct.stock}`);
    }
    
    // Clean up test order
    await Order.findByIdAndDelete(testOrder._id);
    console.log("🧹 Cleaned up test order");
    
    console.log("🎉 Test completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
};

testStockRestoration(); 