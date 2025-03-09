import * as amqp from "amqplib"

// Variáveis para armazenar a conexão e o canal
let connection: amqp.Connection | null = null
let channel: amqp.Channel | null = null

/**
 * Conecta ao servidor RabbitMQ e configura o canal
 */
export async function connectToRabbitMQ() {
  try {
    // Use a URL de conexão do RabbitMQ (local ou serviço em nuvem)
    const url = process.env.RABBITMQ_URL || "amqp://localhost"

    if (!connection) {
      // Estabelecer conexão
      connection = await amqp.connect(url)
      console.log("Conectado ao RabbitMQ")

      // Configurar reconexão em caso de erro
      connection.on("error", (err) => {
        console.error("Erro na conexão RabbitMQ:", err)
        connection = null
        setTimeout(connectToRabbitMQ, 5000)
      })

      connection.on("close", () => {
        console.log("Conexão RabbitMQ fechada")
        connection = null
        setTimeout(connectToRabbitMQ, 5000)
      })
    }

    if (!channel && connection) {
      // Criar canal
      channel = await connection.createChannel()

      // Declarar a fila de tradução
      await channel.assertQueue("translation_queue", {
        durable: true, // A fila sobrevive a reinicializações do servidor
        maxPriority: 10, // Suporte a prioridades
      })

      // Declarar a fila de status
      await channel.assertQueue("translation_status", {
        durable: true,
      })

      console.log("Canal e filas RabbitMQ configurados")
    }

    return { connection, channel }
  } catch (error) {
    console.error("Falha ao conectar ao RabbitMQ:", error)
    throw error
  }
}

/**
 * Publica uma mensagem em uma fila
 */
export async function publishToQueue(queue: string, message: any) {
  try {
    if (!channel) {
      await connectToRabbitMQ()
    }

    if (!channel) {
      throw new Error("Não foi possível estabelecer conexão com o RabbitMQ")
    }

    return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true })
  } catch (error) {
    console.error(`Erro ao publicar mensagem na fila ${queue}:`, error)
    throw error
  }
}

/**
 * Consome mensagens de uma fila
 */
export async function consumeFromQueue(queue: string, callback: (message: any) => Promise<void>) {
  try {
    if (!channel) {
      await connectToRabbitMQ()
    }

    if (!channel) {
      throw new Error("Não foi possível estabelecer conexão com o RabbitMQ")
    }

    await channel.prefetch(1) // Processa uma mensagem por vez

    console.log(`Consumindo mensagens da fila ${queue}...`)

    await channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString())
          await callback(content)
          channel.ack(msg) // Confirma processamento
        } catch (error) {
          console.error(`Erro ao processar mensagem da fila ${queue}:`, error)
          // Rejeita a mensagem e a coloca de volta na fila
          channel.nack(msg, false, true)
        }
      }
    })
  } catch (error) {
    console.error(`Erro ao consumir mensagens da fila ${queue}:`, error)
    throw error
  }
}

/**
 * Fecha a conexão com o RabbitMQ
 */
export async function closeConnection() {
  try {
    if (channel) {
      await channel.close()
      channel = null
    }
    if (connection) {
      await connection.close()
      connection = null
    }
    console.log("Conexão RabbitMQ fechada")
  } catch (error) {
    console.error("Erro ao fechar conexão RabbitMQ:", error)
  }
}

