import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import * as crypto from "crypto"

// Session duration in seconds (24 hours)
const SESSION_DURATION = 60 * 60 * 24

// Generate a session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Verify admin credentials
export function verifyCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    console.error("Admin credentials not configured in environment variables")
    return false
  }

  return username === adminUsername && password === adminPassword
}

// Create a session
export async function createSession(username: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = Date.now() + SESSION_DURATION * 1000;

  // Store session in a cookie
  const responseCookies = cookies();
  (await responseCookies).set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  (await cookies()).set("auth_user", username, {
    httpOnly: false, // Allow JavaScript to read this for UI purposes
    maxAge: SESSION_DURATION,
    path: "/",
  })

  return token
}

// Check if a request is authenticated
export function isAuthenticated(request: NextRequest): boolean {
  const authToken = request.cookies.get("auth_token")?.value
  return !!authToken
}

// Get the current user
export async function getCurrentUser(): Promise<string | null> {
  const authUser = (await cookies()).get("auth_user")?.value
  return authUser || null
}

// Logout (clear session)
export async function clearSession(): Promise<void> {
  (await cookies()).delete("auth_token");
  (await cookies()).delete("auth_user");
  (await cookies()).delete("auth_token");
  (await cookies()).delete("auth_user")
}
