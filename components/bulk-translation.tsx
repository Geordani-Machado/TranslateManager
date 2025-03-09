"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import type { TranslationJob } from "@/lib/models"
import { Loader2, CheckCircle2, RefreshCw, XCircle } from "lucide-react"

// Importar o hook
import { useLanguages } from "@/hooks/use-languages"

export function BulkTranslation() {
  const [sourceLanguage, setSourceLanguage] = useState<string>("")
  const [targetLanguage, setTargetLanguage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeJob, setActiveJob] = useState<TranslationJob | null>(null)
  const [jobHistory, setJobHistory] = useState<TranslationJob[]>([])

  // Usar o hook de idiomas
  const { activeLanguages, isLoading: isLoadingLanguages } = useLanguages()

  // Carregar histórico de trabalhos
  useEffect(() => {
    fetchJobHistory()

    // Verificar trabalhos ativos a cada 5 segundos
    const interval = setInterval(() => {
      if (activeJob && (activeJob.status === "pending" || activeJob.status === "processing")) {
        fetchJobStatus(activeJob.jobId)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [activeJob])

  // Adicionar um useEffect para definir o idioma de origem quando os idiomas são carregados:
  useEffect(() => {
    if (activeLanguages.length > 0) {
      // Definir idioma padrão como origem
      const defaultLang = activeLanguages.find((lang) => lang.isDefault)
      if (defaultLang && !sourceLanguage) {
        setSourceLanguage(defaultLang.code)
      }
    }
  }, [activeLanguages, sourceLanguage])

  const fetchJobHistory = async () => {
    try {
      const response = await fetch("/api/translations/bulk-translate/history")
      if (!response.ok) throw new Error("Failed to fetch job history")
      const data = await response.json()

      setJobHistory(data)

      // Verificar se há algum trabalho ativo
      const active = data.find((job: TranslationJob) => job.status === "pending" || job.status === "processing")

      if (active) {
        setActiveJob(active)
      }
    } catch (error) {
      console.error("Error fetching job history:", error)
    }
  }

  const fetchJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/translations/bulk-translate/${jobId}`)
      if (!response.ok) throw new Error("Failed to fetch job status")
      const data = await response.json()

      setActiveJob(data)

      // Atualizar o histórico de trabalhos
      setJobHistory((prev) => prev.map((job) => (job.jobId === jobId ? data : job)))

      // Se o trabalho foi concluído ou falhou, atualizar a lista
      if (data.status === "completed" || data.status === "failed") {
        fetchJobHistory()
      }
    } catch (error) {
      console.error(`Error fetching status for job ${jobId}:`, error)
    }
  }

  const startBulkTranslation = async () => {
    if (!sourceLanguage || !targetLanguage) {
      toast({
        title: "Erro",
        description: "Selecione os idiomas de origem e destino",
        variant: "destructive",
      })
      return
    }

    if (sourceLanguage === targetLanguage) {
      toast({
        title: "Erro",
        description: "Os idiomas de origem e destino devem ser diferentes",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/translations/bulk-translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao iniciar tradução em massa")
      }

      const data = await response.json()

      toast({
        title: "Sucesso",
        description: data.message,
      })

      // Buscar o status do trabalho
      fetchJobStatus(data.jobId)
    } catch (error) {
      console.error("Error starting bulk translation:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao iniciar tradução em massa",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/translations/bulk-translate/${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao cancelar trabalho")
      }

      toast({
        title: "Sucesso",
        description: "Trabalho cancelado com sucesso",
      })

      // Atualizar o status do trabalho
      fetchJobStatus(jobId)
    } catch (error) {
      console.error("Error canceling job:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao cancelar trabalho",
        variant: "destructive",
      })
    }
  }

  // Atualizar a função getLanguageName:
  const getLanguageName = (code: string) => {
    const language = activeLanguages.find((lang) => lang.code === code)
    return language ? language.name : code.toUpperCase()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
      case "processing":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "processing":
        return "Processando"
      case "completed":
        return "Concluído"
      case "failed":
        return "Falhou"
      default:
        return status
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tradução em Massa</CardTitle>
        <CardDescription>Traduza automaticamente todas as chaves de um idioma para outro</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de idiomas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma de Origem</label>
            <Select
              value={sourceLanguage}
              onValueChange={setSourceLanguage}
              disabled={isLoadingLanguages || isSubmitting || !!activeJob}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma de origem" />
              </SelectTrigger>
              <SelectContent>
                {activeLanguages.map((language) => (
                  <SelectItem key={`source-${language.code}`} value={language.code}>
                    {language.name} ({language.code.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma de Destino</label>
            <Select
              value={targetLanguage}
              onValueChange={setTargetLanguage}
              disabled={isLoadingLanguages || isSubmitting || !!activeJob}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma de destino" />
              </SelectTrigger>
              <SelectContent>
                {activeLanguages.map((language) => (
                  <SelectItem
                    key={`target-${language.code}`}
                    value={language.code}
                    disabled={language.code === sourceLanguage}
                  >
                    {language.name} ({language.code.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trabalho ativo */}
        {activeJob && (
          <Alert
            className={`
            ${activeJob.status === "completed" ? "bg-green-50 border-green-200" : ""}
            ${activeJob.status === "failed" ? "bg-red-50 border-red-200" : ""}
          `}
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(activeJob.status)}
              <AlertTitle>Tradução {getStatusText(activeJob.status)}</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              <div className="space-y-4">
                <div className="text-sm">
                  <p>
                    De: <strong>{getLanguageName(activeJob.sourceLanguage)}</strong>
                  </p>
                  <p>
                    Para: <strong>{getLanguageName(activeJob.targetLanguage)}</strong>
                  </p>
                  <p>
                    Iniciado em: <strong>{formatDate(activeJob.createdAt)}</strong>
                  </p>
                  {activeJob.error && <p className="text-red-500 mt-1">Erro: {activeJob.error}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>
                      Progresso: {activeJob.progress.completed} de {activeJob.progress.total}
                    </span>
                    <span>{Math.round((activeJob.progress.completed / activeJob.progress.total) * 100)}%</span>
                  </div>
                  <Progress value={(activeJob.progress.completed / activeJob.progress.total) * 100} className="h-2" />
                  {activeJob.progress.failed > 0 && (
                    <p className="text-xs text-red-500">{activeJob.progress.failed} traduções falharam</p>
                  )}
                </div>

                {(activeJob.status === "pending" || activeJob.status === "processing") && (
                  <Button variant="destructive" size="sm" onClick={() => cancelJob(activeJob.jobId)}>
                    Cancelar Tradução
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Histórico de trabalhos */}
        {jobHistory.length > 0 && !activeJob && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Histórico de Traduções</h3>
            <div className="space-y-2">
              {jobHistory.slice(0, 5).map((job) => (
                <div key={job.jobId} className="border rounded-md p-3 text-sm flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium">
                        {getLanguageName(job.sourceLanguage)} → {getLanguageName(job.targetLanguage)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(job.createdAt)} •{job.progress.completed} de {job.progress.total} traduções
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={startBulkTranslation}
          disabled={isLoadingLanguages || isSubmitting || !sourceLanguage || !targetLanguage || !!activeJob}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando...
            </>
          ) : (
            "Iniciar Tradução em Massa"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BulkTranslation

