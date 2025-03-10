import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {

  const response = NextResponse.next();

  // Adicionar CORS para todas as requisições que vêm da origem permitida
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

  if (request.headers.get('origin') === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Tratamento de requisições OPTIONS (Pré-vôo do CORS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

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

  return response;
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
