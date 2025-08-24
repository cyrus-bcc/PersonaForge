"use client"

import type { UserProfile, AuthState } from "@/types/user"
import { apiClient } from "./api-client"

const AUTH_KEY = "pf_auth"

export function getAuthState(): AuthState {
  if (typeof window === "undefined") return { isAuthenticated: false, user: null }

  try {
    const token = localStorage.getItem("access_token")
    const raw = localStorage.getItem(AUTH_KEY)

    if (!token || !raw) return { isAuthenticated: false, user: null }

    const auth = JSON.parse(raw) as AuthState
    return auth
  } catch {
    return { isAuthenticated: false, user: null }
  }
}

export function setAuthState(auth: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))

  // Trigger a custom event to notify other components immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: auth }))
  }
}

export async function authenticateUser(email: string, password: string): Promise<UserProfile | null> {
  try {
    const loginData = await apiClient.login(email, password)

    // Get user profile from backend
    const userProfile = await apiClient.getCurrentUser()

    const user: UserProfile = {
      id: userProfile.id.toString(),
      email: userProfile.email,
      name: userProfile.name || userProfile.email.split("@")[0],
      createdAt: userProfile.created_at,
      updatedAt: userProfile.updated_at || userProfile.created_at,
      financialGoals: [],
      preferredChannels: ["app-push", "email"],
      financialConcerns: [],
      currentBankingProducts: [],
    }

    return user
  } catch (error) {
    console.error("Authentication failed:", error)
    return null
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<UserProfile> {
  // For now, we'll use the existing login since the backend doesn't have a register endpoint
  // In a real implementation, you'd create a register endpoint
  throw new Error("Registration not implemented yet. Please use existing credentials.")
}

export async function logout() {
  try {
    await apiClient.logout()
  } catch (error) {
    console.error("Logout error:", error)
  }

  localStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem("pf_session_persona_id")

  // Trigger auth state change event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { isAuthenticated: false, user: null } }))
  }
}

// Keep existing functions for backward compatibility
export function getAllUsers(): UserProfile[] {
  return []
}

export function saveUser(user: UserProfile) {
  // This would typically sync with backend
  console.log("User saved:", user)
}

export function findUserByEmail(email: string): UserProfile | null {
  return null
}
