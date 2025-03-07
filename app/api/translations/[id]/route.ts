import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await connectToDatabase()

    // Await the params object before accessing its properties
    const { id } = await params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid translation ID" }, { status: 400 })
    }

    const translation = await db.collection("translations").findOne({
      _id: new ObjectId(id),
    })

    if (!translation) {
      return NextResponse.json({ error: "Translation not found" }, { status: 404 })
    }

    return NextResponse.json(translation)
  } catch (error) {
    console.error("Error fetching translation:", error)
    return NextResponse.json({ error: "Failed to fetch translation" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await connectToDatabase()

    // Await the params object before accessing its properties
    const { id } = await params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid translation ID" }, { status: 400 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.key) {
      return NextResponse.json({ error: "Translation key is required" }, { status: 400 })
    }

    // Check if key already exists (but not for this ID)
    const existingTranslation = await db.collection("translations").findOne({
      key: data.key,
      _id: { $ne: new ObjectId(id) },
    })

    if (existingTranslation) {
      return NextResponse.json({ error: "Translation key already exists" }, { status: 400 })
    }

    // Update translation
    const result = await db.collection("translations").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          key: data.key,
          values: data.values || {},
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Translation not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: id,
      key: data.key,
      values: data.values || {},
    })
  } catch (error) {
    console.error("Error updating translation:", error)
    return NextResponse.json({ error: "Failed to update translation" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await connectToDatabase()

    // Await the params object before accessing its properties
    const { id } = await params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid translation ID" }, { status: 400 })
    }

    const result = await db.collection("translations").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Translation not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting translation:", error)
    return NextResponse.json({ error: "Failed to delete translation" }, { status: 500 })
  }
}

