import { Suspense } from "react"
import { ImportTranslations } from "@/components/import-translations"
import UserInfo from "@/components/user-info"
import { Skeleton } from "@/components/ui/skeleton"

export default function ImportPage() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Importar Traduções</h1>
        <UserInfo />
      </div>
      <p className="mb-6 text-muted-foreground">
        Importe traduções a partir de um arquivo JSON exportado anteriormente.
      </p>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <ImportTranslations />
      </Suspense>
    </main>
  )
}