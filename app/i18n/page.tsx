import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import I18nExample from "@/components/i18n-example"

export default function I18nPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">i18n Implementation Example</h1>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <I18nExample />
      </Suspense>
    </main>
  )
}

