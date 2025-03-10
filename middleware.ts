import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar se o usuário está autenticado
  const authCookie = request.cookies.get("auth_token")

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/api/auth/login"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Se não estiver autenticado e não for uma rota pública, redirecionar para o login
  if (!authCookie && !isPublicRoute && !request.nextUrl.pathname.startsWith("/api/translations")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Para rotas de API, adicionar cabeçalhos CORS
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Origem permitida (pode ser mais de uma separada por vírgula, se necessário)
    const allowedOrigin = "https://anotati.com"
    const origin = request.headers.get("origin")

    if (origin && origin === allowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Credentials", "true")
    }

    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Para requisições OPTIONS (preflight), retornar 200 OK
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      })
    }

    return response
  }

  return NextResponse.next()
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
