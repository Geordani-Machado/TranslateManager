import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Atualizar um idioma
export async function PUT(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { db } = await connectToDatabase()

    // Await the params object before accessing its properties
    const { code } = await params

    if (!code) {
      return NextResponse.json({ error: "Código do idioma é obrigatório" }, { status: 400 })
    }

    const data = await request.json()

    // Verificar se o idioma existe
    const existingLanguage = await db.collection("languages").findOne({ code })
    if (!existingLanguage) {
      return NextResponse.json({ error: "Idioma não encontrado" }, { status: 404 })
    }

    // Se for marcado como padrão, remover o padrão dos outros
    if (data.isDefault) {
      await db.collection("languages").updateMany({ isDefault: true }, { $set: { isDefault: false } })
    }

    // Atualizar idioma
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault

    await db.collection("languages").updateOne({ code }, { $set: updateData })

    // Obter o idioma atualizado
    const updatedLanguage = await db.collection("languages").findOne({ code })
    return NextResponse.json(updatedLanguage)
  } catch (error) {
    console.error("Error updating language:", error)
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 })
  }
}

// Excluir um idioma
export async function DELETE(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { db } = await connectToDatabase()

    // Await the params object before accessing its properties
    const { code } = await params

    if (!code) {
      return NextResponse.json({ error: "Código do idioma é obrigatório" }, { status: 400 })
    }

    // Verificar se é o idioma padrão
    const language = await db.collection("languages").findOne({ code })
    if (!language) {
      return NextResponse.json({ error: "Idioma não encontrado" }, { status: 404 })
    }

    if (language.isDefault) {
      return NextResponse.json({ error: "Não é possível excluir o idioma padrão" }, { status: 400 })
    }

    // Excluir idioma
    await db.collection("languages").deleteOne({ code })

    // Remover este idioma de todas as traduções
    await db.collection("translations").updateMany({}, { $unset: { [`values.${code}`]: "" } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting language:", error)
    return NextResponse.json({ error: "Failed to delete language" }, { status: 500 })
  }
}

