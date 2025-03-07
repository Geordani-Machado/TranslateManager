import { Suspense } from "react"
import TranslationManager from "@/components/translation-manager"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Traduções</h1>
      <p className="mb-6 text-muted-foreground">
        Adicione traduções em português e use IA para traduzir automaticamente para outros idiomas.
      </p>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <TranslationManager />
      </Suspense>
    </main>
  )
}

