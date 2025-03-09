// Tipos para o sistema de tradução
export interface Translation {
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

export interface TranslationJob {
  jobId: string
  sourceLanguage: string
  targetLanguage: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: {
    total: number
    completed: number
    failed: number
  }
  createdAt: Date | string
  updatedAt: Date | string
  error?: string
}

