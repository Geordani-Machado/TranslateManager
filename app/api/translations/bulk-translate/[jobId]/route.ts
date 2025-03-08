import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json({ error: "ID do trabalho é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const job = await db.collection("translationJobs").findOne({ jobId })

    if (!job) {
      return NextResponse.json({ error: "Trabalho de tradução não encontrado" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error: any) {
    console.error("Erro ao verificar status da tradução:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json({ error: "ID do trabalho é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const job = await db.collection("translationJobs").findOne({ jobId })

    if (!job) {
      return NextResponse.json({ error: "Trabalho de tradução não encontrado" }, { status: 404 })
    }

    // Só permite cancelar trabalhos pendentes ou em processamento
    if (job.status !== "pending" && job.status !== "processing") {
      return NextResponse.json(
        {
          error: "Não é possível cancelar um trabalho que já foi concluído ou falhou",
        },
        { status: 400 },
      )
    }

    // Atualiza o status para 'failed' com mensagem de cancelamento
    await db.collection("translationJobs").updateOne(
      { jobId },
      {
        $set: {
          status: "failed",
          error: "Trabalho cancelado pelo usuário",
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Trabalho de tradução cancelado com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao cancelar trabalho de tradução:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

