// Tipos para o sistema de tradução
export interface TranslationJob {
  sourceLanguage(sourceLanguage: any): import("react").ReactNode | Iterable<import("react").ReactNode>
  jobId(jobId: any): unknown
  status: string
  _id?: string
  key: string
  values: {
    [locale: string]: string
  }
}

export interface Language {
  code: string // Código do idioma (ex: 'pt', 'en', 'es')
  name: string // Nome do idioma (ex: 'Português', 'English', 'Español')
  isDefault?: boolean // Se é o idioma padrão
  isActive: boolean // Se o idioma está ativo no sistema
}

