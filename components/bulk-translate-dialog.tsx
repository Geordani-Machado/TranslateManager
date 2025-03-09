"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { useLanguages } from "@/hooks/use-languages"

interface BulkTranslateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialSourceLanguage?: string
  initialTargetLanguage?: string
}

export function BulkTranslateDialog({
  open,
  onOpenChange,
  onSuccess,
  initialSourceLanguage,
  initialTargetLanguage,
}: BulkTranslateDialogProps) {
  const [sourceLanguage, setSourceLanguage] = useState<string>("")
  const [targetLanguage, setTargetLanguage] = useState<string>("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { activeLanguages, defaultLanguage } = useLanguages()

  // Definir idiomas iniciais quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      if (initialSourceLanguage) {
        setSourceLanguage(initialSourceLanguage)
      } else if (defaultLanguage) {
        setSourceLanguage(defaultLanguage.code)
      }

      if (initialTargetLanguage) {
        setTargetLanguage(initialTargetLanguage)
      }
    }
  }, [open, initialSourceLanguage, initialTargetLanguage, defaultLanguage])

  // Iniciar a tradução em massa
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
      setIsTranslating(true)
      setProgress(0)
      setTotal(0)
      setError(null)

      // Buscar todas as traduções que precisam ser traduzidas
      const response = await fetch(`/api/translations/bulk-translate/prepare`, {
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
        throw new Error(error.error || "Falha ao preparar tradução em massa")
      }

      const { keys, total } = await response.json()
      setTotal(total)

      if (total === 0) {
        toast({
          title: "Aviso",
          description: "Não há traduções para processar",
        })
        setIsTranslating(false)
        return
      }

      // Processar as traduções em lotes
      let processed = 0
      const batchSize = 5 // Número de traduções por lote

      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize)

        const batchResponse = await fetch(`/api/translations/bulk-translate/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keys: batch,
            sourceLanguage,
            targetLanguage,
          }),
        })

        if (!batchResponse.ok) {
          const error = await batchResponse.json()
          throw new Error(error.error || "Falha ao processar lote de traduções")
        }

        processed += batch.length
        setProgress(Math.round((processed / total) * 100))

        // Pequena pausa para não sobrecarregar a API
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast({
        title: "Sucesso",
        description: `${total} traduções processadas com sucesso`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error in bulk translation:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao traduzir em massa",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tradução em Massa com IA</DialogTitle>
          <DialogDescription>
            Traduza automaticamente todas as chaves de um idioma para outro usando IA.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma de Origem</label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={isTranslating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma de origem" />
              </SelectTrigger>
              <SelectContent>
                {activeLanguages.map((lang) => (
                  <SelectItem key={`source-${lang.code}`} value={lang.code}>
                    {lang.name} {lang.isDefault && "(Padrão)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma de Destino</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isTranslating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma de destino" />
              </SelectTrigger>
              <SelectContent>
                {activeLanguages.map((lang) => (
                  <SelectItem key={`target-${lang.code}`} value={lang.code} disabled={lang.code === sourceLanguage}>
                    {lang.name} {lang.isDefault && "(Padrão)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isTranslating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">Processando {total} traduções...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isTranslating}>
            Cancelar
          </Button>
          <Button onClick={startBulkTranslation} disabled={isTranslating || !sourceLanguage || !targetLanguage}>
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traduzindo...
              </>
            ) : (
              "Iniciar Tradução"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

