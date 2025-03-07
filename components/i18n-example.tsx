"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe } from "lucide-react"

interface TranslationMap {
  [key: string]: string
}

export default function I18nExample() {
  const [translations, setTranslations] = useState<TranslationMap>({})
  const [currentLocale, setCurrentLocale] = useState("pt")
  const availableLocales = ["en", "pt", "es"]
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTranslations(currentLocale)
  }, [currentLocale])

  const fetchTranslations = async (locale: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/translations/export?locale=${locale}`)
      if (!response.ok) throw new Error("Failed to fetch translations")
      const data = await response.json()
      setTranslations(data)
    } catch (error) {
      console.error("Error fetching translations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const translate = (key: string): string => {
    return translations[key] || key
  }

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale)
  }

  if (isLoading) {
    return <div className="p-4">Carregando traduções...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle>{translate("example.title")}</CardTitle>
            <CardDescription>{translate("example.description")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">{translate("example.language")}:</span>
            <Tabs value={currentLocale} onValueChange={handleLocaleChange}>
              <TabsList>
                {availableLocales.map((locale) => (
                  <TabsTrigger key={locale} value={locale} className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {locale.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{translate("example.section.welcome")}</h3>
            <p>{translate("example.welcome.message")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">{translate("example.section.features")}</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{translate("example.features.item1")}</li>
              <li>{translate("example.features.item2")}</li>
              <li>{translate("example.features.item3")}</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button>{translate("example.buttons.start")}</Button>
            <Button variant="outline">{translate("example.buttons.learn")}</Button>
          </div>

          <div className="rounded-md bg-muted p-4 mt-4">
            <h4 className="font-medium mb-2">{translate("example.code.title")}</h4>
            <pre className="text-sm overflow-x-auto p-2 bg-background rounded">
              {`// ${translate("example.code.comment")}
const message = translate("example.welcome.message");
console.log(message);`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

