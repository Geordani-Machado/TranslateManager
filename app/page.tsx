import { Suspense } from "react"
import Link from "next/link"
import { I18nExample } from "@/components/i18n-example"
import { TranslationManager } from "@/components/translation-manager"
import { TranslationKeysManager } from "@/components/translation-keys-manager"
import UserInfo from "@/components/user-info"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Translation Manager</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/import">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Link>
          </Button>
          <UserInfo />
        </div>
      </div>

      <Tabs defaultValue="translations" className="mb-8">
        <TabsList>
          <TabsTrigger value="translations">Traduções</TabsTrigger>
          <TabsTrigger value="example">Exemplo</TabsTrigger>
        </TabsList>
        <TabsContent value="translations">
          <TranslationManager
            title="Gerenciador de Traduções"
            description="Gerencie as traduções do seu aplicativo em diferentes idiomas"
          >
            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
              <TranslationKeysManager />
            </Suspense>
          </TranslationManager>
        </TabsContent>
        <TabsContent value="example">
          <TranslationManager
            title="Exemplo de i18n"
            description="Veja como as traduções são aplicadas em um componente"
          >
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <I18nExample />
            </Suspense>
          </TranslationManager>
        </TabsContent>
      </Tabs>
    </main>
  )
}

