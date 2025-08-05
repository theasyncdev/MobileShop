const fs = require("fs");
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://bisheshsedhai12:MMh6Dh2zSb7yAF6d@cluster0.8rxnffm.mongodb.net/test?retryWrites=true&w=majority";
const dbName = "test";
const collectionName = "products";

async function insertPhones() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = JSON.parse(fs.readFileSync("mock_products_real_images.json", "utf-8"));

    const result = await collection.insertMany(data);
    console.log(`✅ Inserted ${result.insertedCount} documents successfully.`);
  } catch (error) {
    console.error("❌ Error inserting documents:", error);
  } finally {
    await client.close();
  }
}

insertPhones();
