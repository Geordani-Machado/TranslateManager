"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"

export default function UserInfo() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // Get username from cookie
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null
      return null
    }

    const user = getCookieValue("auth_user")
    setUsername(user)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Falha ao fazer logout")
      }

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!username) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center text-sm text-muted-foreground">
        <User className="h-3 w-3 mr-1" />
        {username}
      </div>
      <Button onClick={handleLogout} variant="ghost" size="sm">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

