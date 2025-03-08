"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Globe, Plus, Trash2, Check, X, Edit } from "lucide-react"
import type { Language } from "@/lib/models"

export default function LanguageManager() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLanguage, setNewLanguage] = useState<Partial<Language>>({ code: "", name: "", isActive: true })
  const [isLoading, setIsLoading] = useState(true)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)

  // Carregar idiomas
  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/languages")
      if (!response.ok) throw new Error("Failed to fetch languages")
      const data = await response.json()
      setLanguages(data)
    } catch (error) {
      console.error("Error fetching languages:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar idiomas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar novo idioma
  const handleAddLanguage = async () => {
    try {
      if (!newLanguage.code || !newLanguage.name) {
        toast({
          title: "Erro",
          description: "Código e nome do idioma são obrigatórios",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/languages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLanguage),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao adicionar idioma")
      }

      await fetchLanguages()
      setNewLanguage({ code: "", name: "", isActive: true })
      setIsAddDialogOpen(false)

      toast({
        title: "Sucesso",
        description: "Idioma adicionado com sucesso",
      })
    } catch (error) {
      console.error("Error adding language:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao adicionar idioma",
        variant: "destructive",
      })
    }
  }

  // Atualizar idioma
  const handleUpdateLanguage = async (code: string) => {
    try {
      if (!editingLanguage) return

      const response = await fetch(`/api/languages/${code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingLanguage),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao atualizar idioma")
      }

      await fetchLanguages()
      setEditingCode(null)
      setEditingLanguage(null)

      toast({
        title: "Sucesso",
        description: "Idioma atualizado com sucesso",
      })
    } catch (error) {
      console.error("Error updating language:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao atualizar idioma",
        variant: "destructive",
      })
    }
  }

  // Excluir idioma
  const handleDeleteLanguage = async (code: string) => {
    try {
      const response = await fetch(`/api/languages/${code}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao excluir idioma")
      }

      await fetchLanguages()

      toast({
        title: "Sucesso",
        description: "Idioma excluído com sucesso",
      })
    } catch (error) {
      console.error("Error deleting language:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao excluir idioma",
        variant: "destructive",
      })
    }
  }

  // Iniciar edição
  const startEditing = (language: Language) => {
    setEditingCode(language.code)
    setEditingLanguage({ ...language })
  }

  // Cancelar edição
  const cancelEditing = () => {
    setEditingCode(null)
    setEditingLanguage(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Gerenciador de Idiomas</CardTitle>
            <CardDescription>Adicione, edite ou remova idiomas suportados pelo sistema</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Idioma
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Carregando idiomas...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Padrão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {languages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum idioma encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  languages.map((language) => (
                    <TableRow key={language.code}>
                      <TableCell className="font-medium">
                        {editingCode === language.code ? (
                          <Input
                            value={editingLanguage?.code || ""}
                            onChange={(e) =>
                              setEditingLanguage((prev) => (prev ? { ...prev, code: e.target.value } : null))
                            }
                            disabled // Não permitir alterar o código
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {language.code.toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCode === language.code ? (
                          <Input
                            value={editingLanguage?.name || ""}
                            onChange={(e) =>
                              setEditingLanguage((prev) => (prev ? { ...prev, name: e.target.value } : null))
                            }
                          />
                        ) : (
                          language.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCode === language.code ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editingLanguage?.isActive || false}
                              onCheckedChange={(checked) =>
                                setEditingLanguage((prev) => (prev ? { ...prev, isActive: checked } : null))
                              }
                              id={`active-${language.code}`}
                            />
                            <Label htmlFor={`active-${language.code}`}>
                              {editingLanguage?.isActive ? "Ativo" : "Inativo"}
                            </Label>
                          </div>
                        ) : (
                          <div
                            className={`px-2 py-1 rounded-full text-xs w-fit ${language.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {language.isActive ? "Ativo" : "Inativo"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCode === language.code ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editingLanguage?.isDefault || false}
                              onCheckedChange={(checked) =>
                                setEditingLanguage((prev) => (prev ? { ...prev, isDefault: checked } : null))
                              }
                              id={`default-${language.code}`}
                              disabled={language.isDefault} // Não permitir desmarcar o padrão atual
                            />
                            <Label htmlFor={`default-${language.code}`}>
                              {editingLanguage?.isDefault ? "Sim" : "Não"}
                            </Label>
                          </div>
                        ) : (
                          <div
                            className={`px-2 py-1 rounded-full text-xs w-fit ${language.isDefault ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {language.isDefault ? "Sim" : "Não"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingCode === language.code ? (
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => handleUpdateLanguage(language.code)} size="sm" variant="ghost">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button onClick={cancelEditing} size="sm" variant="ghost">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => startEditing(language)} size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteLanguage(language.code)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={language.isDefault} // Não permitir excluir o idioma padrão
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
        )}
      </CardContent>

      {/* Dialog para adicionar idioma */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Idioma</DialogTitle>
            <DialogDescription>Adicione um novo idioma ao sistema de traduções.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código do Idioma</Label>
              <Input
                id="code"
                value={newLanguage.code}
                onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value.toLowerCase() })}
                placeholder="ex: fr"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Use códigos ISO 639-1 (2 letras) como 'en', 'pt', 'es', 'fr', etc.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Idioma</Label>
              <Input
                id="name"
                value={newLanguage.name}
                onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                placeholder="ex: Français"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newLanguage.isActive || false}
                onCheckedChange={(checked) => setNewLanguage({ ...newLanguage, isActive: checked })}
                id="active"
              />
              <Label htmlFor="active">Ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newLanguage.isDefault || false}
                onCheckedChange={(checked) => setNewLanguage({ ...newLanguage, isDefault: checked })}
                id="default"
              />
              <Label htmlFor="default">Idioma Padrão</Label>
              {newLanguage.isDefault && (
                <p className="text-xs text-amber-500">Atenção: Isso mudará o idioma padrão do sistema.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddLanguage}>Adicionar Idioma</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

