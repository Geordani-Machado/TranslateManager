import { startWorker } from "../workers/translation-worker"

console.log("Iniciando worker de tradução...")
startWorker()
  .then(() => console.log("Worker de tradução iniciado com sucesso"))
  .catch((error) => {
    console.error("Erro ao iniciar worker de tradução:", error)
    process.exit(1)
  })

