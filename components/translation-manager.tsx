"use client"

import type React from "react"
import Link from "next/link"
import { Globe } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguages } from "@/hooks/use-languages"

interface TranslationManagerProps {
  title: string
  description: string
  children: React.ReactNode
}

export function TranslationManager({ title, description, children }: TranslationManagerProps) {
  const { activeLanguages } = useLanguages()

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {activeLanguages.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Idiomas ativos: </span>
              <span className="font-medium">{activeLanguages.map((lang) => lang.code.toUpperCase()).join(", ")}</span>
            </div>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/languages">
              <Globe className="mr-2 h-4 w-4" />
              Gerenciar Idiomas
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default TranslationManager

