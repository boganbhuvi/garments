import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const rawUri = process.env.MONGODB_URI || "mongodb+srv://boganbhuvanesh2213_db_user:<db_password>@cluster0.2hlq3mi.mongodb.net/";
const dbPassword = process.env.DB_PASSWORD || "";

// Replace placeholder <db_password> with actual password if provided
export const uri = dbPassword 
  ? rawUri.replace('<db_password>', encodeURIComponent(dbPassword))
  : rawUri;

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToMongoDB() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✓ Successfully connected to MongoDB Atlas via MongoClient!");
    return client;
  } catch (err) {
    console.error("MongoDB Atlas connection error:", err);
    throw err;
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}
