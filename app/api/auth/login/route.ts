import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyPassword } from "@/lib/password"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Verificar credenciais com as variáveis de ambiente (superadmin)
    const validUsername = process.env.ADMIN_USERNAME
    const validPassword = process.env.ADMIN_PASSWORD

    if (validUsername && validPassword && username === validUsername && password === validPassword) {
      // Login como superadmin
      const token = Buffer.from(`${username}:admin:${new Date().getTime()}`).toString("base64")

      cookies().set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
      })

      return NextResponse.json({
        success: true,
        user: {
          username,
          name: "Administrador",
          role: "admin",
        },
      })
    }

    // Verificar credenciais no banco de dados
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ username })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Usuário não encontrado ou inativo" }, { status: 401 })
    }

    // Verificar senha
    const isPasswordValid = verifyPassword(password, user.password, user.salt)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    // Criar token com username, role e timestamp
    const token = Buffer.from(`${user.username}:${user.role}:${new Date().getTime()}`).toString("base64")

    // Definir o cookie de autenticação
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    })

    // Retornar informações do usuário (sem senha e salt)
    const { password: _, salt: __, ...userInfo } = user

    return NextResponse.json({
      success: true,
      user: userInfo,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Falha ao processar o login" }, { status: 500 })
  }
}

