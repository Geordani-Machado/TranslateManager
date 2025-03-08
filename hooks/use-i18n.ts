"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import type { Language } from "@/lib/models"

interface UseI18nReturn {
  t: (key: string) => string
  currentLocale: string
  changeLocale: (locale: string) => void
  isLoading: boolean
  translations: any
  availableLanguages: Language[]
  defaultLocale: string
}

const useI18n = (initialLocale = "en"): UseI18nReturn => {
  const router = useRouter()
  const { t, i18n, isLoading } = useTranslation()
  const [translations, setTranslations] = useState<any>({})
  const [currentLocale, setCurrentLocale] = useState<string>(initialLocale)
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([])
  const [defaultLocale, setDefaultLocale] = useState<string>("pt")

  useEffect(() => {
    setCurrentLocale(i18n.language)
    setTranslations(i18n.store.data[i18n.language])
  }, [i18n.language, i18n.store.data])

  const changeLocale = (locale: string) => {
    router.push(router.pathname, router.pathname, { locale })
    localStorage.setItem("preferred-locale", locale)
  }

  // Fetch available languages
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch("/api/languages")
        if (!response.ok) throw new Error("Failed to fetch languages")

        const data = await response.json()

        // Filter active languages
        const activeLanguages = data.filter((lang: Language) => lang.isActive)
        setAvailableLanguages(activeLanguages)

        // Set default locale
        const defaultLang = activeLanguages.find((lang: Language) => lang.isDefault)
        if (defaultLang) {
          setDefaultLocale(defaultLang.code)

          // If no initial locale was provided, use the default
          if (initialLocale === "en" && !localStorage.getItem("preferred-locale")) {
            setCurrentLocale(defaultLang.code)
          }
        }
      } catch (error) {
        console.error("Error loading languages:", error)
      }
    }

    fetchLanguages()
  }, [])

  // Update the return object to include available languages
  return {
    t,
    currentLocale,
    changeLocale,
    isLoading,
    translations,
    availableLanguages,
    defaultLocale,
  }
}

export default useI18n

