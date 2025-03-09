import * as crypto from "crypto"

// Função para gerar um salt aleatório
export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString("hex")
}

// Função para criar um hash da senha com o salt
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
}

// Função para verificar se a senha está correta
export function verifyPassword(inputPassword: string, hashedPassword: string, salt: string): boolean {
  const inputHash = hashPassword(inputPassword, salt)
  return inputHash === hashedPassword
}

