"use client"

import { type ReactNode, useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import { useLanguages } from "@/hooks/use-languages"

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { defaultLanguage } = useLanguages()

  // Atualizar o idioma padrão quando ele mudar
  useEffect(() => {
    if (defaultLanguage && i18n.language !== defaultLanguage.code) {
      i18n.changeLanguage(defaultLanguage.code)
    }
  }, [defaultLanguage])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

export default I18nProvider

