import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

async function getLanguageNames(): Promise<Record<string, string>> {
  try {
    const { db } = await connectToDatabase()
    const languages = await db.collection("languages").find({ isActive: true }).toArray()

    const languageMap: Record<string, string> = {}
    languages.forEach((lang) => {
      languageMap[lang.code] = lang.name
    })

    return languageMap
  } catch (error) {
    console.error("Error fetching language names:", error)
    // Fallback para os idiomas padrão
    return {
      en: "English",
      pt: "Portuguese",
      es: "Spanish",
    }
  }
}

async function translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  try {
    // Obter os nomes dos idiomas do banco de dados
    const languageNames = await getLanguageNames()

    // Verificar se os idiomas existem
    if (!languageNames[sourceLanguage] || !languageNames[targetLanguage]) {
      throw new Error(`Idioma não suportado: ${!languageNames[sourceLanguage] ? sourceLanguage : targetLanguage}`)
    }

    // Construir o prompt para a tradução
    const prompt = `Translate the following text from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]}. Return only the translated text without any quotation marks, explanations, or additional text:

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
        model: "openai/gpt-oss-120b",
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

export async function POST(req: NextRequest) {
  try {
    const { keys, sourceLanguage, targetLanguage } = await req.json()

    if (!keys || !Array.isArray(keys) || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const results = []

    // Processar cada chave
    for (const item of keys) {
      try {
        // Traduzir o texto
        const translatedText = await translateText(item.sourceText, sourceLanguage, targetLanguage)

        // Atualizar no banco de dados
        await db
          .collection("translations")
          .updateOne({ _id: new ObjectId(item.id) }, { $set: { [`values.${targetLanguage}`]: translatedText } })

        results.push({
          key: item.key,
          success: true,
          translation: translatedText,
        })
      } catch (error) {
        console.error(`Error translating key ${item.key}:`, error)
        results.push({
          key: item.key,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error("Erro ao processar tradução em massa:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

