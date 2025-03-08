import * as amqp from "amqplib";

// Variáveis para armazenar a conexão e o canal
let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

/**
 * Conecta ao servidor RabbitMQ e configura o canal
 */
export async function connectToRabbitMQ() {
  try {
    const url = process.env.RABBITMQ_URL || "amqp://localhost";

    if (!connection) {
      connection = await amqp.connect(url); // Removido o cast
      console.log("Conectado ao RabbitMQ");

      connection.on("error", (err) => {
        console.error("Erro na conexão RabbitMQ:", err);
        connection = null;
        setTimeout(connectToRabbitMQ, 5000);
      });

      connection.on("close", () => {
        console.log("Conexão RabbitMQ fechada");
        connection = null;
        setTimeout(connectToRabbitMQ, 5000);
      });
    }

    if (!channel) {
      channel = await connection.createChannel();
      await channel.assertQueue("translation_queue", {
        durable: true,
        maxPriority: 10,
      });
      await channel.assertQueue("translation_status", { durable: true });

      console.log("Canal e filas RabbitMQ configurados");
    }

    return { connection, channel };
  } catch (error) {
    console.error("Falha ao conectar ao RabbitMQ:", error);
    throw error;
  }
}

/**
 * Publica uma mensagem em uma fila
 */
export async function publishToQueue(queue: string, message: any) {
  try {
    if (!channel) {
      await connectToRabbitMQ();
    }

    if (!channel) {
      throw new Error("Não foi possível estabelecer conexão com o RabbitMQ");
    }

    return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  } catch (error) {
    console.error(`Erro ao publicar mensagem na fila ${queue}:`, error);
    throw error;
  }
}

/**
 * Consome mensagens de uma fila
 */
export async function consumeFromQueue(queue: string, callback: (message: any) => Promise<void>) {
  try {
    if (!channel) {
      await connectToRabbitMQ();
    }

    if (!channel) {
      throw new Error("Não foi possível estabelecer conexão com o RabbitMQ");
    }

    await channel.prefetch(1);
    console.log(`Consumindo mensagens da fila ${queue}...`);

    await channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          channel.ack(msg);
        } catch (error) {
          console.error(`Erro ao processar mensagem da fila ${queue}:`, error);
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error(`Erro ao consumir mensagens da fila ${queue}:`, error);
    throw error;
  }
}

/**
 * Fecha a conexão com o RabbitMQ
 */
export async function closeConnection() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log("Conexão RabbitMQ fechada");
  } catch (error) {
    console.error("Erro ao fechar conexão RabbitMQ:", error);
  }
}
