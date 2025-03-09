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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Edit, Search, RefreshCw, UserPlus } from "lucide-react"
import UserInfo from "@/components/user-info"
import type { User } from "@/lib/models"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "editor",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Carregar usuários
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar novo usuário
  const handleAddUser = async () => {
    try {
      if (!newUser.username || !newUser.password || !newUser.name || !newUser.email) {
        toast({
          title: "Erro",
          description: "Todos os campos são obrigatórios",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao adicionar usuário")
      }

      await fetchUsers()
      setNewUser({
        username: "",
        password: "",
        name: "",
        email: "",
        role: "editor",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso",
      })
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao adicionar usuário",
        variant: "destructive",
      })
    }
  }

  // Filtrar usuários
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <UserInfo />
      </div>
      <p className="mb-6 text-muted-foreground">Adicione, edite ou remova usuários do sistema de traduções.</p>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "Nenhum usuário encontrado para a busca" : "Nenhum usuário cadastrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "editor"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "admin" ? "Administrador" : user.role === "editor" ? "Editor" : "Visualizador"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialog para adicionar usuário */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>Adicione um novo usuário ao sistema de traduções.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nome de Usuário</label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="ex: joao.silva"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Digite uma senha segura"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="ex: João Silva"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="ex: joao.silva@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Função</label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as "admin" | "editor" | "viewer" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Administrador: acesso total. Editor: pode editar traduções. Visualizador: apenas visualização.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>Adicionar Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

