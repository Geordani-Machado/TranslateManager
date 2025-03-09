"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, User, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function UserInfo() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Tentar obter o papel do usuário do cookie
    try {
      const authCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1]

      if (authCookie) {
        const [, role] = atob(authCookie).split(":")
        setUserRole(role)
      }
    } catch (error) {
      console.error("Error parsing auth cookie:", error)
    }
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Falha ao fazer logout")
      }

      toast({
        title: "Logout",
        description: "Você foi desconectado com sucesso",
      })

      // Redirecionar para a página de login
      router.push("/login")
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Erro",
        description: "Falha ao fazer logout",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>{userRole === "admin" ? "Administrador" : userRole === "editor" ? "Editor" : "Visualizador"}</span>
      </div>

      {userRole === "admin" && (
        <Button asChild variant="outline" size="sm">
          <Link href="/users">
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </Link>
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? "Saindo..." : "Sair"}
      </Button>
    </div>
  )
}

