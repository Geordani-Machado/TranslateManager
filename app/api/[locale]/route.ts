import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  try {
    // Await the params object before accessing its properties
    const { locale } = await params

    if (!locale) {
      return NextResponse.json({ error: "Locale parameter is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const translations = await db.collection("translations").find({}).toArray()

    // Convert to a simple key-value object for the requested locale
    const localeTranslations: Record<string, string> = {}

    translations.forEach((translation) => {
      if (translation.values[locale]) {
        localeTranslations[translation.key] = translation.values[locale]
      }
    })

    return NextResponse.json(localeTranslations)
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 })
  }
}

