import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateSalt, hashPassword } from "@/lib/password"
import { requireAuth } from "@/lib/auth"
import type { User } from "@/lib/models"

// Obter todos os usuários (apenas para admins)
export async function GET() {
  try {
    // Verificar autenticação e permissão de admin
    requireAuth("admin")

    const { db } = await connectToDatabase()
    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: { password: 0, salt: 0 }, // Não retornar senha e salt
        },
      )
      .toArray()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// Criar um novo usuário (apenas para admins)
export async function POST(request: Request) {
  try {
    // Verificar autenticação e permissão de admin
    requireAuth("admin")

    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validar dados
    if (!data.username || !data.password || !data.name || !data.email) {
      return NextResponse.json(
        {
          error: "Todos os campos são obrigatórios: username, password, name, email",
        },
        { status: 400 },
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await db.collection("users").findOne({
      $or: [{ username: data.username }, { email: data.email }],
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Usuário ou email já cadastrado",
        },
        { status: 400 },
      )
    }

    // Gerar salt e hash da senha
    const salt = generateSalt()
    const hashedPassword = hashPassword(data.password, salt)

    // Criar novo usuário
    const newUser: User = {
      username: data.username,
      password: hashedPassword,
      name: data.name,
      email: data.email,
      role: data.role || "editor", // Padrão é editor
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      salt, // Armazenar o salt para verificação posterior
    }

    await db.collection("users").insertOne(newUser)

    // Não retornar a senha e o salt
    const { password, salt: _, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

