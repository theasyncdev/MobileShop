import ConnectDb from "./config/db.js";
import Product from "./models/productModel.js";

const migrateStock = async () => {
  try {
    await ConnectDb();
    
    // Find all products that don't have a stock field
    const products = await Product.find({ stock: { $exists: false } });
    
    console.log(`Found ${products.length} products without stock field`);
    
    // Update all products to have a default stock of 10
    const result = await Product.updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 10 } }
    );
    
    console.log(`Updated ${result.modifiedCount} products with default stock of 10`);
    
    // Verify the update
    const updatedProducts = await Product.find({});
    console.log(`Total products in database: ${updatedProducts.length}`);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateStock(); 