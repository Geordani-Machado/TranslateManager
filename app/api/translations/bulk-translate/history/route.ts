import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Buscar os últimos 10 trabalhos, ordenados por data de criação (mais recentes primeiro)
    const jobs = await db.collection("translationJobs").find({}).sort({ createdAt: -1 }).limit(10).toArray()

    return NextResponse.json(jobs)
  } catch (error: any) {
    console.error("Erro ao buscar histórico de trabalhos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

