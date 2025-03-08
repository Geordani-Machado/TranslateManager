import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { publishToQueue } from "@/lib/rabbitmq"
import { v4 as uuidv4 } from "uuid"
import type { TranslationJob } from "@/lib/models"

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
    const translations = await db
      .collection("translations")
      .find({
        [`values.${sourceLanguage}`]: { $exists: true, $ne: "" },
      })
      .toArray()

    if (translations.length === 0) {
      return NextResponse.json({ error: "Não há traduções disponíveis para o idioma de origem" }, { status: 400 })
    }

    // Criar um ID de trabalho único
    const jobId = uuidv4()

    // Criar um registro de trabalho no banco de dados
    const job: TranslationJob = {
      jobId,
      sourceLanguage,
      targetLanguage,
      status: "pending",
      progress: {
        total: translations.length,
        completed: 0,
        failed: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("translationJobs").insertOne(job)

    // Publicar o trabalho na fila
    await publishToQueue("translation_queue", {
      jobId,
      sourceLanguage,
      targetLanguage,
      translations: translations.map((t) => ({
        id: t._id,
        key: t.key,
        sourceText: t.values[sourceLanguage],
      })),
    })

    return NextResponse.json({
      success: true,
      jobId,
      message: `Iniciada tradução em massa de ${translations.length} chaves de ${sourceLanguage} para ${targetLanguage}`,
    })
  } catch (error: any) {
    console.error("Erro ao iniciar tradução em massa:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

