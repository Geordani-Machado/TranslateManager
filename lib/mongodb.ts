import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable inside .env.local")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore
let cached = global.mongo

if (!cached) {
  // @ts-ignore
  cached = global.mongo = { conn: null, promise: null }
}

interface MongoConnection {
  conn: Db | null
  promise: Promise<Db> | null
}

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  if (cached.conn) {
    return { db: cached.conn, client: cached.conn.client }
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    cached.promise = MongoClient.connect(MONGODB_URI, opts as any).then((client) => {
      return client.db(MONGODB_DB)
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return { db: cached.conn, client: cached.conn.client }
}

