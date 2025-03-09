import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Translation } from "@/lib/models"

// Obter todas as traduções ou filtrar por idioma
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const locale = request.nextUrl.searchParams.get("locale")

    if (locale) {
      // Retornar traduções para um idioma específico no formato { key: value }
      const translations = await db.collection("translations").find({}).toArray()
      const result: Record<string, string> = {}

      translations.forEach((translation: Translation) => {
        if (translation.values[locale]) {
          result[translation.key] = translation.values[locale]
        }
      })

      return NextResponse.json(result)
    } else {
      // Retornar todas as traduções
      const translations = await db.collection("translations").find({}).toArray()
      return NextResponse.json(translations)
    }
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 })
  }
}

// Adicionar uma nova tradução
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validar dados
    if (!data.key) {
      return NextResponse.json({ error: "Chave de tradução é obrigatória" }, { status: 400 })
    }

    // Verificar se a chave já existe
    const existingTranslation = await db.collection("translations").findOne({ key: data.key })
    if (existingTranslation) {
      return NextResponse.json({ error: "Esta chave de tradução já existe" }, { status: 400 })
    }

    // Inserir nova tradução
    const newTranslation: Translation = {
      key: data.key,
      values: data.values || {},
    }

    await db.collection("translations").insertOne(newTranslation)

    return NextResponse.json(newTranslation, { status: 201 })
  } catch (error) {
    console.error("Error creating translation:", error)
    return NextResponse.json({ error: "Failed to create translation" }, { status: 500 })
  }
}

