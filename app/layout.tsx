import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'i18n Translate Manager',
  description: 'i18n translate app manager and use Ai to translate',
  generator: 'Geordani Machado',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
