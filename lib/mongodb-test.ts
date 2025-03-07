import { connectToDatabase } from "./mongodb";

async function testConnection() {
  try {
    const { db, client } = await connectToDatabase();
    console.log("Connected to MongoDB successfully!");
    
    // Test a simple query
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Close the connection
    await client.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

testConnection();