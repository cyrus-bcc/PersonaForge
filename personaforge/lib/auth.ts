"use client"

import type { UserProfile, AuthState } from "@/types/user"
import { apiClient } from "./api-client"
import { getUserProfile, saveUserProfile } from "./backend-integration"

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

    // Get complete user profile from backend persona data
    const userProfile = await getUserProfile(loginData.email || email)

    if (userProfile) {
      return userProfile
    }

    // Fallback: create basic profile from login data
    const basicProfile: UserProfile = {
      id: loginData.user || loginData.email,
      email: loginData.email || email,
      name: loginData.email?.split("@")[0] || "User",
      goals: [],
      anti_goals: [],
      accessibility_needs: [],
      other_banks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      financialGoals: [],
      preferredChannels: ["app-push"],
      financialConcerns: [],
      currentBankingProducts: [],
    }

    return basicProfile
  } catch (error) {
    console.error("Authentication failed:", error)
    return null
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<UserProfile> {
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

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { isAuthenticated: false, user: null } }))
  }
}

export async function saveUser(user: UserProfile) {
  try {
    await saveUserProfile(user)
    console.log("User profile saved to backend")
  } catch (error) {
    console.error("Failed to save user profile:", error)
    throw error
  }
}

// Keep existing functions for backward compatibility
export function getAllUsers(): UserProfile[] {
  return []
}

export function findUserByEmail(email: string): UserProfile | null {
  return null
}
