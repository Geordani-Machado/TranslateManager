import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Language } from "@/lib/models"
import { requireAuth } from "@/lib/auth"

// Obter todos os idiomas
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const languages = await db.collection("languages").find({}).toArray()

    // Se não houver idiomas, inicializar com os padrões
    if (languages.length === 0) {
      const defaultLanguages: Language[] = [
        { code: "pt", name: "Português", isDefault: true, isActive: true },
        { code: "en", name: "English", isActive: true },
        { code: "es", name: "Español", isActive: true },
      ]

      await db.collection("languages").insertMany(defaultLanguages)
      return NextResponse.json(defaultLanguages)
    }

    // Garantir que os idiomas estejam ordenados (padrão primeiro, depois alfabeticamente)
    const sortedLanguages = [...languages].sort((a, b) => {
      if (a.isDefault) return -1
      if (b.isDefault) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(sortedLanguages)
  } catch (error) {
    console.error("Error fetching languages:", error)
    return NextResponse.json({ error: "Failed to fetch languages" }, { status: 500 })
  }
}

// Adicionar um novo idioma
export async function POST(request: Request) {
  try {
    // Verificar autenticação para rotas protegidas
    requireAuth()

    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validar dados
    if (!data.code || !data.name) {
      return NextResponse.json({ error: "Código e nome do idioma são obrigatórios" }, { status: 400 })
    }

    // Verificar se o código já existe
    const existingLanguage = await db.collection("languages").findOne({ code: data.code })
    if (existingLanguage) {
      return NextResponse.json({ error: "Este código de idioma já existe" }, { status: 400 })
    }

    // Se for marcado como padrão, remover o padrão dos outros
    if (data.isDefault) {
      await db.collection("languages").updateMany({ isDefault: true }, { $set: { isDefault: false } })
    }

    // Inserir novo idioma
    const newLanguage: Language = {
      code: data.code,
      name: data.name,
      isDefault: !!data.isDefault,
      isActive: data.isActive !== false, // Padrão é true se não especificado
    }

    await db.collection("languages").insertOne(newLanguage)

    return NextResponse.json(newLanguage, { status: 201 })
  } catch (error) {
    console.error("Error creating language:", error)
    return NextResponse.json({ error: "Failed to create language" }, { status: 500 })
  }
}

