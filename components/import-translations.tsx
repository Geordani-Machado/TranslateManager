"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react"

interface ImportResult {
  key: string
  action: "inserted" | "updated"
}

export function ImportTranslations() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith(".json")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo JSON.",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      setError(null)
      setResults([])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setResults([])

    try {
      const fileContent = await file.text()
      console.log("Conteúdo do arquivo:", fileContent)

      const jsonData = JSON.parse(fileContent)
      console.log("Dados JSON parseados:", jsonData)

      const response = await fetch("/api/translations/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      })

      console.log("Resposta da API - Status:", response.status)
      const result = await response.json()
      console.log("Resposta da API - Dados:", result)

      if (!response.ok) {
        throw new Error(result.error || "Erro ao importar traduções")
      }

      setResults(result.results || [])
      toast({
        title: "Importação concluída",
        description: `${result.results?.length || 0} traduções processadas com sucesso.`,
      })

      // Limpar o arquivo após sucesso
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      console.error("Erro na importação:", err)
      setError(errorMessage)
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setResults([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Traduções
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo JSON exportado para importar traduções para o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Arquivo JSON</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Importação concluída. {results.filter(r => r.action === "inserted").length} inseridas, {results.filter(r => r.action === "updated").length} atualizadas.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            disabled={!file || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isUploading}>
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}