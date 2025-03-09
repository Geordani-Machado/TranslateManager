"use client"

import { useState, useEffect } from "react"
import type { Language } from "@/lib/models"

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeLanguages, setActiveLanguages] = useState<Language[]>([])
  const [defaultLanguage, setDefaultLanguage] = useState<Language | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLanguages = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/languages")
      if (!response.ok) throw new Error("Failed to fetch languages")

      const data = await response.json()
      setLanguages(data)

      // Filtrar idiomas ativos
      const active = data.filter((lang: Language) => lang.isActive)
      setActiveLanguages(active)

      // Encontrar o idioma padrão
      const defaultLang = data.find((lang: Language) => lang.isDefault) || null
      setDefaultLanguage(defaultLang)
    } catch (err) {
      console.error("Error fetching languages:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch languages")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLanguages()

    // Escutar o evento personalizado para atualizações de idiomas
    const handleLanguagesUpdated = () => {
      fetchLanguages()
    }

    window.addEventListener("languagesUpdated", handleLanguagesUpdated)

    // Configurar um intervalo para verificar atualizações a cada 30 segundos
    const intervalId = setInterval(fetchLanguages, 30000)

    return () => {
      window.removeEventListener("languagesUpdated", handleLanguagesUpdated)
      clearInterval(intervalId)
    }
  }, [])

  return {
    languages,
    activeLanguages,
    defaultLanguage,
    isLoading,
    error,
    refetch: fetchLanguages,
  }
}

export default useLanguages

