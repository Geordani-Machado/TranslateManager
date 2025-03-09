import { cookies } from "next/headers"

export function getAuthData() {
  const authCookie = cookies().get("auth_token")

  if (!authCookie?.value) {
    return null
  }

  try {
    // Token formato: username:role:timestamp
    const [username, role, timestamp] = Buffer.from(authCookie.value, "base64").toString().split(":")

    return { username, role, timestamp }
  } catch (error) {
    console.error("Error parsing auth token:", error)
    return null
  }
}

export function isAuthenticated() {
  return !!getAuthData()
}

export function getAuthToken() {
  return cookies().get("auth_token")?.value
}

export function requireAuth(requiredRole?: "admin" | "editor" | "viewer") {
  const authData = getAuthData()

  if (!authData) {
    throw new Error("Não autenticado")
  }

  if (requiredRole && authData.role !== requiredRole && authData.role !== "admin") {
    throw new Error("Permissão negada")
  }
}

