"use client"

import { useState, useEffect, useCallback } from "react"

export function useI18n(initialLocale = "en") {
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocale, setCurrentLocale] = useState(initialLocale)

  // Fetch translations when locale changes
  useEffect(() => {
    async function fetchTranslations() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/i18n/${currentLocale}`)
        if (!response.ok) throw new Error("Failed to fetch translations")

        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error("Error loading translations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations()
  }, [currentLocale])

  // Translation function
  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      return translations[key] || defaultValue || key
    },
    [translations],
  )

  // Change language
  const changeLocale = useCallback((locale: string) => {
    setCurrentLocale(locale)
    // Optionally save preference to localStorage or cookie
    localStorage.setItem("preferred-locale", locale)
  }, [])

  return {
    t,
    currentLocale,
    changeLocale,
    isLoading,
    translations,
  }
}

