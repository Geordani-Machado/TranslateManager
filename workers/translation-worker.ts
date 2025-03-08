import { connectToDatabase } from "@/lib/mongodb"
import { consumeFromQueue, publishToQueue, connectToRabbitMQ } from "@/lib/rabbitmq"
import { ObjectId } from "mongodb"

// Função para traduzir texto usando a API da Groq
async function translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  try {
    // Obter os nomes dos idiomas do banco de dados
    const { db } = await connectToDatabase()
    const languages = await db
      .collection("languages")
      .find({
        code: { $in: [sourceLanguage, targetLanguage] },
      })
      .toArray()

    const languageMap: Record<string, string> = {}
    languages.forEach((lang) => {
      languageMap[lang.code] = lang.name
    })

    // Verificar se os idiomas existem
    if (!languageMap[sourceLanguage] || !languageMap[targetLanguage]) {
      throw new Error(`Idioma não suportado: ${!languageMap[sourceLanguage] ? sourceLanguage : targetLanguage}`)
    }

    // Construir o prompt para a tradução
    const prompt = `Translate the following text from ${languageMap[sourceLanguage]} to ${languageMap[targetLanguage]}. Return only the translated text without any quotation marks, explanations, or additional text:

"${text}"`

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set")
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error("Groq API error:", response.status, response.statusText)
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No translation found in Groq response")
    }

    const translatedText = data.choices[0].message.content.trim()
    return translatedText
  } catch (error: any) {
    console.error("Translation error:", error)
    throw new Error(`Translation failed: ${error.message}`)
  }
}

// Função para atualizar o progresso do trabalho
async function updateJobProgress(jobId: string, update: any) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("translationJobs").updateOne(
      { jobId },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
        },
      },
    )

    // Publicar atualização de status
    await publishToQueue("translation_status", {
      jobId,
      ...update,
    })
  } catch (error) {
    console.error(`Erro ao atualizar progresso do trabalho ${jobId}:`, error)
  }
}

// Função principal do worker
export async function startWorker() {
  console.log("Iniciando worker de tradução...")

  // Garantir que a conexão com o RabbitMQ está estabelecida
  await connectToRabbitMQ()

  await consumeFromQueue("translation_queue", async (message) => {
    const { jobId, sourceLanguage, targetLanguage, translations } = message

    console.log(
      `Processando trabalho ${jobId}: ${translations.length} traduções de ${sourceLanguage} para ${targetLanguage}`,
    )

    // Atualizar status para 'processing'
    await updateJobProgress(jobId, {
      status: "processing",
      progress: {
        total: translations.length,
        completed: 0,
        failed: 0,
      },
    })

    const { db } = await connectToDatabase()

    // Processar cada tradução
    for (let i = 0; i < translations.length; i++) {
      const { id, key, sourceText } = translations[i]

      try {
        // Verificar se o trabalho foi cancelado
        const job = await db.collection("translationJobs").findOne({ jobId })
        if (job.status === "failed") {
          console.log(`Trabalho ${jobId} foi cancelado, interrompendo processamento`)
          break
        }

        console.log(`Traduzindo chave ${key} (${i + 1}/${translations.length})`)

        // Traduzir o texto
        const translatedText = await translateText(sourceText, sourceLanguage, targetLanguage)

        // Atualizar a tradução no banco de dados
        await db
          .collection("translations")
          .updateOne({ _id: new ObjectId(id) }, { $set: { [`values.${targetLanguage}`]: translatedText } })

        // Atualizar progresso
        await updateJobProgress(jobId, {
          progress: {
            total: translations.length,
            completed: i + 1,
            failed: job.progress?.failed || 0,
          },
        })

        // Aguardar um pequeno intervalo para não sobrecarregar a API
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Erro ao traduzir chave ${key}:`, error)

        // Atualizar contador de falhas
        const job = await db.collection("translationJobs").findOne({ jobId })
        await updateJobProgress(jobId, {
          progress: {
            total: translations.length,
            completed: job.progress?.completed || 0,
            failed: (job.progress?.failed || 0) + 1,
          },
        })
      }
    }

    // Verificar status final
    const job = await db.collection("translationJobs").findOne({ jobId })

    // Se o trabalho não foi cancelado, marcar como concluído
    if (job.status !== "failed") {
      const isCompleted = job.progress.completed + job.progress.failed >= job.progress.total

      await updateJobProgress(jobId, {
        status: isCompleted ? "completed" : "processing",
        error: job.progress.failed > 0 ? `${job.progress.failed} traduções falharam` : undefined,
      })
    }

    console.log(`Trabalho ${jobId} processado: ${job.progress.completed} concluídas, ${job.progress.failed} falhas`)
  })

  console.log("Worker de tradução iniciado e aguardando mensagens")
}

// Se este arquivo for executado diretamente
if (require.main === module) {
  startWorker().catch((error) => {
    console.error("Erro ao iniciar worker de tradução:", error)
    process.exit(1)
  })
}

