import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Translation } from "@/lib/models"

// Esta API é pública e não requer autenticação
export async function GET(request: Request, { params }: { params: { locale: string } }) {
  try {
    const { locale } = params

    if (!locale) {
      return NextResponse.json({ error: "Locale is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Retornar traduções para um idioma específico no formato { key: value }
    const translations = await db.collection("translations").find({}).toArray()
    const result: Record<string, string> = {}

    translations.forEach((translation: Translation) => {
      if (translation.values[locale]) {
        result[translation.key] = translation.values[locale]
      }
    })

    // Configurar cabeçalhos CORS para esta resposta específica
    const response = NextResponse.json(result)

    // Permitir acesso de qualquer origem
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")

    return response
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 })
  }
}

// Lidar com requisições OPTIONS (preflight)
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })

  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type")

  return response
}

