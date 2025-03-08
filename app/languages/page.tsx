import { Suspense } from "react"
import LanguageManager from "@/components/language-manager"
import UserInfo from "@/components/user-info"
import { Skeleton } from "@/components/ui/skeleton"

export default function LanguagesPage() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciador de Idiomas</h1>
        <UserInfo />
      </div>
      <p className="mb-6 text-muted-foreground">
        Adicione, edite ou remova idiomas suportados pelo sistema de traduções.
      </p>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <LanguageManager />
      </Suspense>
    </main>
  )
}

