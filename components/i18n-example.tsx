"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Importar o hook e a configuração do i18n
import { useLanguages } from "@/hooks/use-languages"
import "../lib/i18n" // Importar a configuração do i18n

interface Translation {
  [key: string]: string
}

export function I18nExample() {
  const { t, i18n } = useTranslation()
  const [currentLocale, setCurrentLocale] = useState<string>(i18n.language || "pt")
  const [translations, setTranslations] = useState<Translation>({})

  // Usar o hook de idiomas
  const { activeLanguages, isLoading: isLoadingLanguages } = useLanguages()
  const [availableLocales, setAvailableLocales] = useState<string[]>(["pt", "en", "es"])

  const changeLanguage = (locale: string) => {
    setCurrentLocale(locale)
    // Mudar o idioma do i18n
    if (i18n.changeLanguage) {
      i18n.changeLanguage(locale)
    }
  }

  const fetchTranslations = async (locale: string) => {
    try {
      const response = await fetch(`/api/translations?locale=${locale}`)
      if (!response.ok) {
        throw new Error("Failed to fetch translations")
      }
      const data = await response.json()
      setTranslations(data)

      // Remover a chamada para i18n.changeLanguage aqui
    } catch (error) {
      console.error("Error fetching translations:", error)
    }
  }

  // Atualizar o useEffect para usar activeLanguages:
  useEffect(() => {
    if (activeLanguages.length > 0) {
      // Extrair códigos de idioma
      const locales = activeLanguages.map((lang) => lang.code)
      setAvailableLocales(locales)

      // Definir o idioma padrão como selecionado
      const defaultLang = activeLanguages.find((lang) => lang.isDefault)

      // Se o idioma atual não estiver mais disponível, mudar para o padrão
      if (!locales.includes(currentLocale) && defaultLang) {
        changeLanguage(defaultLang.code)
      }
    }
  }, [activeLanguages, currentLocale])

  // Atualizar o useEffect para carregar traduções quando o idioma mudar:
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
          <p>{translations.welcome || "Bem-vindo ao sistema de traduções"}</p>
          <Button onClick={() => alert(t("alertMessage", { ns: "example" }))}>
            {t("showAlert", { ns: "example" })}
          </Button>
        </div>
        <Tabs defaultValue={currentLocale} className="w-[400px]" onValueChange={changeLanguage}>
          {/* Atualizar o renderizador de TabsList: */}
          <TabsList>
            {activeLanguages.map((lang) => (
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

