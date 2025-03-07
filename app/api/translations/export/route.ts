import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || "en"

    const { db } = await connectToDatabase()
    const translations = await db.collection("translations").find({}).toArray()

    // If we want a specific locale format (flat key-value pairs)
    if (locale) {
      const localeTranslations: Record<string, string> = {}

      translations.forEach((translation) => {
        if (translation.values[locale]) {
          localeTranslations[translation.key] = translation.values[locale]
        }
      })

      return NextResponse.json(localeTranslations)
    }

    // Otherwise return the full translation objects
    return NextResponse.json(translations)
  } catch (error) {
    console.error("Error exporting translations:", error)
    return NextResponse.json({ error: "Failed to export translations" }, { status: 500 })
  }
}

