import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Remover o cookie de autenticação
    cookies().delete("auth_token")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Falha ao processar o logout" }, { status: 500 })
  }
}

