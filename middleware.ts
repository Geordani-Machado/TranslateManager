import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const locales = ["en", "pt", "es", "fr"]
const defaultLocale = "pt"
let allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || []

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin') || ''

  // Criar a resposta uma única vez
  let response = NextResponse.next()

  // Aplicar CORS apenas para origens permitidas
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Lidar com pré-voo CORS (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: Object.fromEntries(response.headers),
    })
  }

  // Lógica de localização (apenas para rotas não-API)
  if (!pathname.startsWith('/api')) {
    let locale = request.cookies.get("NEXT_LOCALE")?.value
    
    if (!locale || !locales.includes(locale)) {
      locale = defaultLocale
    }

    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return response
}

export const config = {
  matcher: [
    // Inclui todas as rotas exceto arquivos estáticos
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
}
