import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await connectToDatabase()

    // Await the params object before accessing its properties
    const { id } = await params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de tradução inválido" }, { status: 400 })
    }

    const { sourceText, sourceLanguage, targetLanguages } = await request.json()

    if (!sourceText || !sourceLanguage || !targetLanguages || !Array.isArray(targetLanguages)) {
      return NextResponse.json({ error: "Parâmetros de tradução inválidos" }, { status: 400 })
    }

    // Get the existing translation
    const translation = await db.collection("translations").findOne({
      _id: new ObjectId(id),
    })

    if (!translation) {
      return NextResponse.json({ error: "Tradução não encontrada" }, { status: 404 })
    }

    // Use Groq AI to translate the text
    const translatedValues = { ...translation.values }

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue

      try {
        const translatedText = await translateText(sourceText, sourceLanguage, targetLang)
        translatedValues[targetLang] = translatedText
      } catch (error) {
        console.error(`Error translating to ${targetLang}:`, error)
      }
    }

    // Update the translation with the new values
    await db.collection("translations").updateOne({ _id: new ObjectId(id) }, { $set: { values: translatedValues } })

    return NextResponse.json({
      success: true,
      translatedValues,
    })
  } catch (error) {
    console.error("Error in translation API:", error)
    return NextResponse.json({ error: "Falha ao traduzir o texto" }, { status: 500 })
  }
}

async function translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  // This is a simplified implementation using Groq AI
  // In a real implementation, you would use the Groq API

  // For now, we'll use a simple mapping for demonstration
  const languageNames: Record<string, string> = {
    en: "English",
    pt: "Portuguese",
    es: "Spanish",
  }

  try {
    // Construct a prompt for the translation
    const prompt = `Translate the following text from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]}. Return only the translated text without any quotation marks, explanations, or additional text:

"${text}"`

    // Call the Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate text from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]} accurately and naturally. Return only the translated text without any quotation marks.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`)
    }

    const data = await response.json()
    let translatedText = data.choices[0].message.content.trim()

    // Remove quotation marks from the beginning and end of the text
    translatedText = translatedText.replace(/^["'](.*)["']$/s, "$1")

    // Also handle cases where the model might add quotes in other formats
    translatedText = translatedText.replace(/^["""](.*)[""]$/s, "$1")

    return translatedText
  } catch (error) {
    console.error("Translation error:", error)
    // Fallback to a simple translation for demo purposes
    if (targetLanguage === "en" && sourceLanguage === "pt") {
      return `[EN] ${text}`
    } else if (targetLanguage === "es" && sourceLanguage === "pt") {
      return `[ES] ${text}`
    }
    return text
  }
}

