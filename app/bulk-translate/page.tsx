import { Suspense } from "react"
import BulkTranslation from "@/components/bulk-translation"
import UserInfo from "@/components/user-info"
import { Skeleton } from "@/components/ui/skeleton"

export default function BulkTranslatePage() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tradução em Massa</h1>
        <UserInfo />
      </div>
      <p className="mb-6 text-muted-foreground">
        Traduza automaticamente todas as chaves de um idioma para outro usando processamento em fila.
      </p>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <BulkTranslation />
      </Suspense>
    </main>
  )
}

