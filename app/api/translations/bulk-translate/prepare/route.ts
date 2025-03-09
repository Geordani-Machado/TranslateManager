import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Translation } from "@/lib/models"

export async function POST(req: NextRequest) {
  try {
    const { sourceLanguage, targetLanguage } = await req.json()

    if (!sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: "Idiomas de origem e destino são obrigatórios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se os idiomas existem
    const languages = await db
      .collection("languages")
      .find({
        code: { $in: [sourceLanguage, targetLanguage] },
        isActive: true,
      })
      .toArray()

    if (languages.length !== 2) {
      return NextResponse.json({ error: "Um ou ambos os idiomas não existem ou não estão ativos" }, { status: 400 })
    }

    // Buscar todas as traduções que têm o idioma de origem mas não o de destino
    // ou o valor do destino está vazio
    const translations = await db
      .collection("translations")
      .find({
        [`values.${sourceLanguage}`]: { $exists: true, $ne: "" },
        $or: [{ [`values.${targetLanguage}`]: { $exists: false } }, { [`values.${targetLanguage}`]: "" }],
      })
      .toArray()

    // Extrair apenas os IDs e chaves
    const keys = translations.map((t: Translation) => ({
      id: t._id,
      key: t.key,
      sourceText: t.values[sourceLanguage],
    }))

    return NextResponse.json({
      keys,
      total: keys.length,
    })
  } catch (error: any) {
    console.error("Erro ao preparar tradução em massa:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

