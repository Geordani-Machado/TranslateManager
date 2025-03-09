import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar se o usuário está autenticado
  const authCookie = request.cookies.get("auth_token")

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/api/auth/login"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Se não estiver autenticado e não for uma rota pública, redirecionar para o login
  if (!authCookie && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

