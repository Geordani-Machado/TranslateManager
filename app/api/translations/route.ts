import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const translations = await db.collection("translations").find({}).toArray()

    return NextResponse.json(translations)
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validate required fields
    if (!data.key) {
      return NextResponse.json({ error: "Translation key is required" }, { status: 400 })
    }

    // Check if key already exists
    const existingTranslation = await db.collection("translations").findOne({ key: data.key })
    if (existingTranslation) {
      return NextResponse.json({ error: "Translation key already exists" }, { status: 400 })
    }

    // Insert new translation
    const result = await db.collection("translations").insertOne({
      key: data.key,
      values: data.values || {},
    })

    return NextResponse.json(
      {
        _id: result.insertedId,
        key: data.key,
        values: data.values || {},
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating translation:", error)
    return NextResponse.json({ error: "Failed to create translation" }, { status: 500 })
  }
}

