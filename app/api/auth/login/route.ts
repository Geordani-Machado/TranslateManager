import { NextResponse } from "next/server"
import { verifyCredentials, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 })
    }

    // Verify credentials
    if (!verifyCredentials(username, password)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Create session
    const token = createSession(username)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Falha na autenticação" }, { status: 500 })
  }
}

