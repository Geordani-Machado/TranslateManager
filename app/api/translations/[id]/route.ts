import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Obter uma tradução específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const translation = await db.collection("translations").findOne({ _id: new ObjectId(id) })

    if (!translation) {
      return NextResponse.json({ error: "Tradução não encontrada" }, { status: 404 })
    }

    return NextResponse.json(translation)
  } catch (error) {
    console.error("Error fetching translation:", error)
    return NextResponse.json({ error: "Failed to fetch translation" }, { status: 500 })
  }
}

// Atualizar uma tradução
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params
    const data = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar se a tradução existe
    const existingTranslation = await db.collection("translations").findOne({ _id: new ObjectId(id) })
    if (!existingTranslation) {
      return NextResponse.json({ error: "Tradução não encontrada" }, { status: 404 })
    }

    // Atualizar tradução
    const updateData: any = {}
    if (data.key !== undefined) updateData.key = data.key
    if (data.values !== undefined) updateData.values = data.values

    await db.collection("translations").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    // Obter a tradução atualizada
    const updatedTranslation = await db.collection("translations").findOne({ _id: new ObjectId(id) })
    return NextResponse.json(updatedTranslation)
  } catch (error) {
    console.error("Error updating translation:", error)
    return NextResponse.json({ error: "Failed to update translation" }, { status: 500 })
  }
}

// Excluir uma tradução
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar se a tradução existe
    const existingTranslation = await db.collection("translations").findOne({ _id: new ObjectId(id) })
    if (!existingTranslation) {
      return NextResponse.json({ error: "Tradução não encontrada" }, { status: 404 })
    }

    // Excluir tradução
    await db.collection("translations").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting translation:", error)
    return NextResponse.json({ error: "Failed to delete translation" }, { status: 500 })
  }
}

