"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, Trash2, Download, Upload, X, Check, Edit, Globe, ChevronDown, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { cleanTranslation } from "@/lib/clean-translation"

// Types
interface Translation {
  _id?: string
  key: string
  values: {
    [locale: string]: string
  }
}

export default function TranslationManager() {
  const router = useRouter()
  const [translations, setTranslations] = useState<Translation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [newTranslation, setNewTranslation] = useState<Translation>({ key: "", values: { pt: "" } })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [importData, setImportData] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [availableLocales, setAvailableLocales] = useState(["en", "pt", "es"])
  const [selectedLocale, setSelectedLocale] = useState("pt")
  const [isTranslating, setIsTranslating] = useState(false)

  // Fetch translations
  useEffect(() => {
    fetchTranslations()
  }, [])

  const fetchTranslations = async () => {
    try {
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
    }
  }

  // Add new translation
  const handleAddTranslation = async () => {
    try {
      if (!newTranslation.key.trim()) {
        toast({
          title: "Erro",
          description: "A chave de tradução não pode estar vazia",
          variant: "destructive",
        })
        return
      }

      if (!newTranslation.values.pt.trim()) {
        toast({
          title: "Erro",
          description: "A tradução em português não pode estar vazia",
          variant: "destructive",
        })
        return
      }

      // Clean the translation before saving
      const cleanedTranslation = {
        ...newTranslation,
        values: {
          pt: cleanTranslation(newTranslation.values.pt),
        },
      }

      // First, add the Portuguese translation
      const response = await fetch("/api/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedTranslation),
      })

      if (!response.ok) throw new Error("Failed to add translation")

      const addedTranslation = await response.json()

      // Then, trigger auto-translation if there's a Portuguese value
      if (addedTranslation._id && newTranslation.values.pt) {
        await handleAutoTranslate(addedTranslation._id, newTranslation.values.pt)
      }

      await fetchTranslations()
      setNewTranslation({ key: "", values: { pt: "" } })
      setIsAddDialogOpen(false)

      toast({
        title: "Sucesso",
        description: "Tradução adicionada com sucesso",
      })
    } catch (error) {
      console.error("Error adding translation:", error)
      toast({
        title: "Erro",
        description: "Falha ao adicionar tradução",
        variant: "destructive",
      })
    }
  }

  // Auto-translate using Groq AI
  const handleAutoTranslate = async (id: string, sourceText: string) => {
    try {
      setIsTranslating(true)

      const response = await fetch(`/api/translations/${id}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
          sourceLanguage: "pt",
          targetLanguages: ["en", "es"],
        }),
      })

      if (!response.ok) throw new Error("Failed to translate")

      await fetchTranslations()

      toast({
        title: "Sucesso",
        description: "Tradução automática concluída",
      })
    } catch (error) {
      console.error("Error auto-translating:", error)
      toast({
        title: "Erro",
        description: "Falha na tradução automática",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  // Update translation
  const handleUpdateTranslation = async (id: string) => {
    try {
      if (!editingTranslation) return

      // Clean the translation values before saving
      const cleanedTranslation = {
        ...editingTranslation,
        values: Object.fromEntries(
          Object.entries(editingTranslation.values).map(([locale, value]) => [locale, cleanTranslation(value)]),
        ),
      }

      const response = await fetch(`/api/translations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedTranslation),
      })

      if (!response.ok) throw new Error("Failed to update translation")

      // If Portuguese translation was updated, offer to auto-translate
      if (selectedLocale === "pt" && editingTranslation.values.pt) {
        await handleAutoTranslate(id, editingTranslation.values.pt)
      }

      await fetchTranslations()
      setEditingId(null)
      setEditingTranslation(null)

      // toast({
      //   title: "Sucesso",
      //   description: "Tradução atualizada com sucesso",
      // })
    } catch (error) {
      console.error("Error updating translation:", error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar tradução",
        variant: "destructive",
      })
    }
  }

  // Delete translation
  const handleDeleteTranslation = async (id: string) => {
    try {
      const response = await fetch(`/api/translations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete translation")

      await fetchTranslations()

      toast({
        title: "Sucesso",
        description: "Tradução excluída com sucesso",
      })
    } catch (error) {
      console.error("Error deleting translation:", error)
      toast({
        title: "Erro",
        description: "Falha ao excluir tradução",
        variant: "destructive",
      })
    }
  }

  // Start editing a translation
  const startEditing = (translation: Translation) => {
    if (!translation._id) return
    setEditingId(translation._id)
    setEditingTranslation({ ...translation })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditingTranslation(null)
  }

  // Handle export translations
  const handleExportTranslations = async () => {
    try {
      // Get translations in the selected locale format
      const response = await fetch(`/api/translations/export?locale=${selectedLocale}`)
      if (!response.ok) throw new Error("Failed to export translations")

      const data = await response.json()
      const dataStr = JSON.stringify(data, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileDefaultName = `translations_${selectedLocale}_${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
    } catch (error) {
      console.error("Error exporting translations:", error)
      toast({
        title: "Erro",
        description: "Falha ao exportar traduções",
        variant: "destructive",
      })
    }
  }

  // Handle import translations
  const handleImportTranslations = async () => {
    try {
      let importedData

      try {
        importedData = JSON.parse(importData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Formato JSON inválido",
          variant: "destructive",
        })
        return
      }

      // Check if it's a flat key-value object (locale-specific format)
      const isLocaleFormat =
        typeof importedData === "object" &&
        !Array.isArray(importedData) &&
        Object.values(importedData).every((v) => typeof v === "string")

      let importPayload

      if (isLocaleFormat) {
        // Convert flat format to translation objects
        importPayload = {
          locale: selectedLocale,
          translations: Object.entries(importedData).map(([key, value]) => ({
            key,
            values: { [selectedLocale]: value },
          })),
        }
      } else if (Array.isArray(importedData)) {
        // Standard format
        importPayload = { translations: importedData }
      } else {
        toast({
          title: "Erro",
          description: "Formato de dados inválido",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/translations/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(importPayload),
      })

      if (!response.ok) throw new Error("Failed to import translations")

      await fetchTranslations()
      setIsImportDialogOpen(false)
      setImportData("")

      toast({
        title: "Sucesso",
        description: "Traduções importadas com sucesso",
      })
    } catch (error) {
      console.error("Error importing translations:", error)
      toast({
        title: "Erro",
        description: "Falha ao importar traduções",
        variant: "destructive",
      })
    }
  }

  // Filter translations based on search term and active tab
  const filteredTranslations = translations.filter((translation) => {
    const matchesSearch =
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(translation.values).some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "missing") {
      return matchesSearch && (!translation.values[selectedLocale] || !translation.values[selectedLocale].trim())
    }

    return matchesSearch
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Gerenciador de Traduções</CardTitle>
            <CardDescription>Gerencie as traduções do seu aplicativo</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Tradução
            </Button>
            <Button onClick={handleExportTranslations} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar traduções..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Globe className="mr-2 h-4 w-4" />
                    {selectedLocale.toUpperCase()}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableLocales.map((locale) => (
                    <DropdownMenuItem key={locale} onClick={() => setSelectedLocale(locale)}>
                      {locale.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="missing">Faltando</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Chave</TableHead>
                  <TableHead className="w-[50%]">Tradução ({selectedLocale.toUpperCase()})</TableHead>
                  <TableHead className="w-[20%] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranslations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Nenhuma tradução encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTranslations.map((translation) => (
                    <TableRow key={translation._id}>
                      <TableCell className="font-medium">
                        {editingId === translation._id ? (
                          <Input
                            value={editingTranslation?.key || ""}
                            onChange={(e) =>
                              setEditingTranslation((prev) => (prev ? { ...prev, key: e.target.value } : null))
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            {translation.key}
                            {(!translation.values[selectedLocale] || !translation.values[selectedLocale].trim()) && (
                              <Badge variant="outline" className="text-amber-500 border-amber-500">
                                Faltando
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === translation._id ? (
                          <Input
                            value={editingTranslation?.values[selectedLocale] || ""}
                            onChange={(e) =>
                              setEditingTranslation((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      values: {
                                        ...prev.values,
                                        [selectedLocale]: e.target.value,
                                      },
                                    }
                                  : null,
                              )
                            }
                          />
                        ) : (
                          translation.values[selectedLocale] || (
                            <span className="text-muted-foreground italic">Não traduzido</span>
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === translation._id ? (
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => handleUpdateTranslation(translation._id!)} size="sm" variant="ghost">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button onClick={cancelEditing} size="sm" variant="ghost">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {selectedLocale === "pt" && (
                              <Button
                                onClick={() =>
                                  translation._id &&
                                  translation.values.pt &&
                                  handleAutoTranslate(translation._id, translation.values.pt)
                                }
                                size="sm"
                                variant="ghost"
                                disabled={!translation.values.pt || isTranslating}
                                title="Traduzir automaticamente para outros idiomas"
                              >
                                <Wand2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button onClick={() => startEditing(translation)} size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteTranslation(translation._id!)}
                              size="sm"
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
        </div>
      </CardContent>

      {/* Add Translation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tradução</DialogTitle>
            <DialogDescription>Adicione uma nova chave de tradução e seu valor em português.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">Chave de Tradução</Label>
              <Input
                id="key"
                value={newTranslation.key}
                onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
                placeholder="ex: common.buttons.submit"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value-pt">Tradução em Português</Label>
              <Input
                id="value-pt"
                value={newTranslation.values.pt || ""}
                onChange={(e) =>
                  setNewTranslation({
                    ...newTranslation,
                    values: { ...newTranslation.values, pt: e.target.value },
                  })
                }
                placeholder="Tradução em Português"
              />
              <p className="text-sm text-muted-foreground">
                As traduções para outros idiomas serão geradas automaticamente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTranslation}>Adicionar Tradução</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Traduções</DialogTitle>
            <DialogDescription>Cole seus dados de tradução em JSON abaixo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <textarea
              className="min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={
                selectedLocale === "pt"
                  ? '{"exemplo.chave": "Exemplo", "outra.chave": "Outro exemplo"}'
                  : '[{"key": "exemplo.chave", "values": {"pt": "Exemplo"}}]'
              }
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {selectedLocale === "pt"
                ? "Você pode importar um objeto JSON simples com pares chave-valor ou um array de objetos de tradução."
                : "Você pode importar um objeto JSON simples com pares chave-valor para o idioma selecionado ou um array de objetos de tradução completos."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportTranslations}>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </Card>
  )
}

