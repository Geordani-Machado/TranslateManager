"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Edit, Save, X, Search, Download, RefreshCw, Globe } from "lucide-react"
import type { Translation } from "@/lib/models"
import { useLanguages } from "@/hooks/use-languages"
import { BulkTranslateDialog } from "@/components/bulk-translate-dialog"

export function TranslationKeysManager() {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValues, setNewValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})
  const [isBulkTranslateOpen, setIsBulkTranslateOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>("")

  // Usar o hook de idiomas
  const { activeLanguages, defaultLanguage } = useLanguages()

  // Definir o idioma padrão como idioma atual quando estiver disponível
  useEffect(() => {
    if (defaultLanguage && !currentLanguage) {
      setCurrentLanguage(defaultLanguage.code)
    }
  }, [defaultLanguage, currentLanguage])

  // Carregar traduções
  useEffect(() => {
    fetchTranslations()
  }, [])

  const fetchTranslations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/translations")
      if (!response.ok) throw new Error("Failed to fetch translations")
      const data = await response.json()
      setTranslations(data)
    } catch (error) {
      console.error("Error fetching translations:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar traduções",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar nova chave de tradução
  const handleAddTranslation = async () => {
    try {
      if (!newKey) {
        toast({
          title: "Erro",
          description: "A chave de tradução é obrigatória",
          variant: "destructive",
        })
        return
      }

      // Verificar se a chave já existe
      const existingKey = translations.find((t) => t.key === newKey)
      if (existingKey) {
        toast({
          title: "Erro",
          description: "Esta chave de tradução já existe",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: newKey,
          values: newValues,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao adicionar tradução")
      }

      await fetchTranslations()
      setNewKey("")
      setNewValues({})
      setIsAddDialogOpen(false)

      toast({
        title: "Sucesso",
        description: "Tradução adicionada com sucesso",
      })
    } catch (error) {
      console.error("Error adding translation:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao adicionar tradução",
        variant: "destructive",
      })
    }
  }

  // Atualizar tradução
  const handleUpdateTranslation = async (key: string) => {
    try {
      const translation = translations.find((t) => t.key === key)
      if (!translation) return

      const response = await fetch(`/api/translations/${translation._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: editingValues,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao atualizar tradução")
      }

      await fetchTranslations()
      setEditingKey(null)
      setEditingValues({})

      toast({
        title: "Sucesso",
        description: "Tradução atualizada com sucesso",
      })
    } catch (error) {
      console.error("Error updating translation:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao atualizar tradução",
        variant: "destructive",
      })
    }
  }

  // Excluir tradução
  const handleDeleteTranslation = async (id: string) => {
    try {
      const response = await fetch(`/api/translations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao excluir tradução")
      }

      await fetchTranslations()

      toast({
        title: "Sucesso",
        description: "Tradução excluída com sucesso",
      })
    } catch (error) {
      console.error("Error deleting translation:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao excluir tradução",
        variant: "destructive",
      })
    }
  }

  // Iniciar edição
  const startEditing = (translation: Translation) => {
    setEditingKey(translation.key)
    setEditingValues({ ...translation.values })
  }

  // Cancelar edição
  const cancelEditing = () => {
    setEditingKey(null)
    setEditingValues({})
  }

  // Filtrar traduções
  const filteredTranslations = translations.filter((translation) => {
    if (!searchTerm) return true
    return (
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (translation.values[currentLanguage] &&
        translation.values[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  // Exportar traduções
  const handleExportTranslations = () => {
    try {
      const exportData: Record<string, Record<string, string>> = {}

      // Agrupar por idioma
      activeLanguages.forEach((lang) => {
        exportData[lang.code] = {}
      })

      // Preencher valores
      translations.forEach((translation) => {
        activeLanguages.forEach((lang) => {
          if (translation.values[lang.code]) {
            exportData[lang.code][translation.key] = translation.values[lang.code]
          }
        })
      })

      // Criar blob e link para download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "translations.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Traduções exportadas com sucesso",
      })
    } catch (error) {
      console.error("Error exporting translations:", error)
      toast({
        title: "Erro",
        description: "Falha ao exportar traduções",
        variant: "destructive",
      })
    }
  }

  // Preparar para adicionar nova tradução
  const prepareAddTranslation = () => {
    setNewKey("")
    const initialValues: Record<string, string> = {}
    activeLanguages.forEach((lang) => {
      initialValues[lang.code] = ""
    })
    setNewValues(initialValues)
    setIsAddDialogOpen(true)
  }

  // Traduzir automaticamente um valor
  const handleAutoTranslate = async (
    sourceLanguage: string,
    targetLanguage: string,
    text: string,
    isEditing: boolean,
  ) => {
    if (!text) return

    try {
      const response = await fetch(`/api/translations/auto-translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao traduzir automaticamente")
      }

      const data = await response.json()

      if (isEditing) {
        setEditingValues((prev) => ({
          ...prev,
          [targetLanguage]: data.translation,
        }))
      } else {
        setNewValues((prev) => ({
          ...prev,
          [targetLanguage]: data.translation,
        }))
      }

      toast({
        title: "Sucesso",
        description: "Texto traduzido automaticamente",
      })
    } catch (error) {
      console.error("Error auto-translating:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao traduzir automaticamente",
        variant: "destructive",
      })
    }
  }

  // Contar traduções não traduzidas por idioma
  const getMissingTranslationsCount = (langCode: string) => {
    return translations.filter((t) => !t.values[langCode] || t.values[langCode] === "").length
  }

  // Obter o idioma de origem para tradução automática
  const getSourceLanguageForTranslation = (targetLang: string) => {
    // Se o idioma alvo não for o padrão, usar o padrão como origem
    if (defaultLanguage && targetLang !== defaultLanguage.code) {
      return defaultLanguage.code
    }

    // Se o idioma alvo for o padrão, encontrar outro idioma com mais traduções
    const langCounts = activeLanguages
      .filter((l) => l.code !== targetLang)
      .map((l) => ({
        code: l.code,
        count: translations.filter((t) => t.values[l.code] && t.values[l.code] !== "").length,
      }))
      .sort((a, b) => b.count - a.count)

    return langCounts.length > 0 ? langCounts[0].code : ""
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar traduções..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportTranslations}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsBulkTranslateOpen(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tradução em Massa
          </Button>
          <Button onClick={prepareAddTranslation} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Tradução
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Carregando traduções...</p>
        </div>
      ) : (
        <Tabs value={currentLanguage} onValueChange={setCurrentLanguage} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto py-1">
            {activeLanguages.map((lang) => {
              const missingCount = getMissingTranslationsCount(lang.code)
              return (
                <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{lang.name}</span>
                  {lang.isDefault && <span className="text-xs text-muted-foreground">(Padrão)</span>}
                  {missingCount > 0 && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      {missingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {activeLanguages.map((lang) => (
            <TabsContent key={lang.code} value={lang.code} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Traduções em {lang.name}</h3>
                {!lang.isDefault && defaultLanguage && (
                  <Button variant="outline" size="sm" onClick={() => setIsBulkTranslateOpen(true)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Traduzir de {defaultLanguage.name} para {lang.name}
                  </Button>
                )}
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Chave</TableHead>
                      <TableHead>Tradução</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTranslations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                          {searchTerm ? "Nenhuma tradução encontrada para a busca" : "Nenhuma tradução cadastrada"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTranslations.map((translation) => (
                        <TableRow key={translation._id}>
                          <TableCell className="font-medium">
                            {editingKey === translation.key ? (
                              <Input value={translation.key} disabled />
                            ) : (
                              translation.key
                            )}
                          </TableCell>
                          <TableCell>
                            {editingKey === translation.key ? (
                              <div className="flex gap-1">
                                <Input
                                  value={editingValues[lang.code] || ""}
                                  onChange={(e) =>
                                    setEditingValues((prev) => ({
                                      ...prev,
                                      [lang.code]: e.target.value,
                                    }))
                                  }
                                  placeholder={`Tradução em ${lang.name}`}
                                />
                                {!lang.isDefault && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      const sourceLanguage = getSourceLanguageForTranslation(lang.code)
                                      if (sourceLanguage && editingValues[sourceLanguage]) {
                                        handleAutoTranslate(
                                          sourceLanguage,
                                          lang.code,
                                          editingValues[sourceLanguage],
                                          true,
                                        )
                                      } else {
                                        toast({
                                          title: "Erro",
                                          description: "Não foi possível encontrar um texto de origem para tradução",
                                          variant: "destructive",
                                        })
                                      }
                                    }}
                                    title={`Traduzir automaticamente para ${lang.name}`}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              translation.values[lang.code] || (
                                <span className="text-muted-foreground italic">Não traduzido</span>
                              )
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingKey === translation.key ? (
                              <div className="flex justify-end gap-1">
                                <Button
                                  onClick={() => handleUpdateTranslation(translation.key)}
                                  size="icon"
                                  variant="ghost"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button onClick={cancelEditing} size="icon" variant="ghost">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1">
                                <Button onClick={() => startEditing(translation)} size="icon" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteTranslation(translation._id as string)}
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Dialog para adicionar tradução */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tradução</DialogTitle>
            <DialogDescription>Adicione uma nova chave de tradução e seus valores.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Chave de Tradução</label>
              <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="ex: common.welcome" />
              <p className="text-xs text-muted-foreground">
                Use um formato consistente como 'categoria.chave' para organizar suas traduções.
              </p>
            </div>
            {activeLanguages.map((lang) => (
              <div className="grid gap-2" key={lang.code}>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    {lang.name} {lang.isDefault && "(Padrão)"}
                  </label>
                  {!lang.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const sourceLanguage = getSourceLanguageForTranslation(lang.code)
                        if (sourceLanguage && newValues[sourceLanguage]) {
                          handleAutoTranslate(sourceLanguage, lang.code, newValues[sourceLanguage], false)
                        } else {
                          toast({
                            title: "Erro",
                            description: "Não foi possível encontrar um texto de origem para tradução",
                            variant: "destructive",
                          })
                        }
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Auto-traduzir
                    </Button>
                  )}
                </div>
                <Input
                  value={newValues[lang.code] || ""}
                  onChange={(e) => setNewValues({ ...newValues, [lang.code]: e.target.value })}
                  placeholder={`Tradução em ${lang.name}`}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTranslation}>Adicionar Tradução</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para tradução em massa */}
      <BulkTranslateDialog
        open={isBulkTranslateOpen}
        onOpenChange={setIsBulkTranslateOpen}
        onSuccess={fetchTranslations}
      />
    </div>
  )
}

export default TranslationKeysManager

