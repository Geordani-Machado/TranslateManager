import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { cleanTranslation } from "@/lib/clean-translation"

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Handle locale-specific import format
    if (data.locale && data.translations) {
      const locale = data.locale
      const translations = data.translations

      if (!Array.isArray(translations)) {
        return NextResponse.json({ error: "Translations must be an array" }, { status: 400 })
      }

      // Process each translation
      const results = []

      for (const translation of translations) {
        if (!translation.key) {
          return NextResponse.json({ error: "All translations must have a key" }, { status: 400 })
        }

        // Check if translation already exists
        const existingTranslation = await db.collection("translations").findOne({
          key: translation.key,
        })

        if (existingTranslation) {
          // Update existing translation with the new locale value
          const updatedValues = { ...existingTranslation.values }
          updatedValues[locale] = cleanTranslation(translation.values[locale])

          await db.collection("translations").updateOne({ key: translation.key }, { $set: { values: updatedValues } })

          results.push({
            key: translation.key,
            action: "updated",
          })
        } else {
          // Insert new translation
          await db.collection("translations").insertOne({
            key: translation.key,
            values: { [locale]: translation.values[locale] },
          })

          results.push({
            key: translation.key,
            action: "inserted",
          })
        }
      }

      return NextResponse.json({
        success: true,
        results,
      })
    }

    // Handle standard import format (array of translation objects)
    if (Array.isArray(data.translations)) {
      const translations = data.translations

      // Validate all translations
      for (const translation of translations) {
        if (!translation.key) {
          return NextResponse.json({ error: "All translations must have a key" }, { status: 400 })
        }
      }

      // Process each translation
      const results = []

      for (const translation of translations) {
        // Check if translation already exists
        const existingTranslation = await db.collection("translations").findOne({
          key: translation.key,
        })

        if (existingTranslation) {
          // Update existing translation
          await db
            .collection("translations")
            .updateOne(
              { key: translation.key },
              { $set: { values: { ...existingTranslation.values, ...translation.values } } },
            )

          results.push({
            key: translation.key,
            action: "updated",
          })
        } else {
          // Insert new translation
          await db.collection("translations").insertOne({
            key: translation.key,
            values: translation.values || {},
          })

          results.push({
            key: translation.key,
            action: "inserted",
          })
        }
      }

      return NextResponse.json({
        success: true,
        results,
      })
    }

    // Handle flat key-value format
    if (typeof data === "object" && !Array.isArray(data)) {
      const locale = "pt" // Default to Portuguese for flat imports
      const results = []

      for (const [key, value] of Object.entries(data)) {
        if (typeof value !== "string") continue

        // Check if translation already exists
        const existingTranslation = await db.collection("translations").findOne({
          key,
        })

        if (existingTranslation) {
          // Update existing translation
          const updatedValues = { ...existingTranslation.values }
          updatedValues[locale] = cleanTranslation(value)

          await db.collection("translations").updateOne({ key }, { $set: { values: updatedValues } })

          results.push({
            key,
            action: "updated",
          })
        } else {
          // Insert new translation
          await db.collection("translations").insertOne({
            key,
            values: { [locale]: cleanTranslation(value) },
          })

          results.push({
            key,
            action: "inserted",
          })
        }
      }

      return NextResponse.json({
        success: true,
        results,
      })
    }

    return NextResponse.json({ error: "Invalid import format" }, { status: 400 })
  } catch (error) {
    console.error("Error importing translations:", error)
    return NextResponse.json({ error: "Failed to import translations" }, { status: 500 })
  }
}

