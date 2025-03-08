"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Language } from "@/lib/models"

interface Translation {
  [key: string]: string
}

const I18nExample = () => {
  const { t, i18n } = useTranslation()
  const [currentLocale, setCurrentLocale] = useState(i18n.language)
  const [translations, setTranslations] = useState<Translation>({})

  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([])
  const [availableLocales, setAvailableLocales] = useState<string[]>(["pt", "en", "es"])

  const changeLanguage = (locale: string) => {
    setCurrentLocale(locale)
  }

  const fetchTranslations = async (locale: string) => {
    try {
      const response = await fetch(`/api/translations?locale=${locale}`)
      if (!response.ok) {
        throw new Error("Failed to fetch translations")
      }
      const data = await response.json()
      setTranslations(data)
      i18n.changeLanguage(locale)
    } catch (error) {
      console.error("Error fetching translations:", error)
    }
  }

  // Carregar idiomas disponíveis
  const fetchAvailableLanguages = async () => {
    try {
      const response = await fetch("/api/languages")
      if (!response.ok) throw new Error("Failed to fetch languages")
      const data = await response.json()

      // Filtrar apenas idiomas ativos
      const activeLanguages = data.filter((lang: Language) => lang.isActive)
      setAvailableLanguages(activeLanguages)

      // Extrair códigos de idioma
      const locales = activeLanguages.map((lang: Language) => lang.code)
      setAvailableLocales(locales)

      // Definir o idioma padrão como selecionado
      const defaultLang = activeLanguages.find((lang: Language) => lang.isDefault)
      if (defaultLang && !currentLocale) {
        setCurrentLocale(defaultLang.code)
      }
    } catch (error) {
      console.error("Error fetching languages:", error)
    }
  }

  useEffect(() => {
    fetchAvailableLanguages()
  }, [])

  useEffect(() => {
    if (currentLocale) {
      fetchTranslations(currentLocale)
    }
  }, [currentLocale])

  return (
    <Card>
      <CardHeader>
        <CardTitle>I18n Example</CardTitle>
        <CardDescription>{t("cardDescription", { ns: "example" })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <p>
            {t("greeting", { ns: "example" })}, {t("name", { ns: "example" })}!
          </p>
          <p>{translations.welcome}</p>
          <Button onClick={() => alert(t("alertMessage", { ns: "example" }))}>
            {t("showAlert", { ns: "example" })}
          </Button>
        </div>
        <Tabs defaultValue={currentLocale} className="w-[400px]" onValueChange={changeLanguage}>
          <TabsList>
            {availableLanguages.map((lang) => (
              <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {lang.code.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          {availableLocales.map((locale) => (
            <TabsContent key={locale} value={locale}>
              {t("content", { ns: "example", locale })} ({locale})
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default I18nExample

