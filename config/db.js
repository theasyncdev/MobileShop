import mongoose from "mongoose";

let cached = global.mongoose;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
}

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function ConnectDb() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGO_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
}

export default ConnectDb;