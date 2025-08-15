"use client"

import type { UserProfile, AuthState } from "@/types/user"

const AUTH_KEY = "pf_auth"
const USERS_KEY = "pf_users"

export function getAuthState(): AuthState {
  if (typeof window === "undefined") return { isAuthenticated: false, user: null }

  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return { isAuthenticated: false, user: null }

    const auth = JSON.parse(raw) as AuthState
    return auth
  } catch {
    return { isAuthenticated: false, user: null }
  }
}

export function setAuthState(auth: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
  // Clear session persona when logging out
  sessionStorage.removeItem("pf_session_persona_id")
}

export function getAllUsers(): UserProfile[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as UserProfile[]
  } catch {
    return []
  }
}

export function saveUser(user: UserProfile) {
  const users = getAllUsers()
  const existing = users.findIndex((u) => u.id === user.id)

  if (existing >= 0) {
    users[existing] = user
  } else {
    users.push(user)
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email: string): UserProfile | null {
  return getAllUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function authenticateUser(email: string, password: string): UserProfile | null {
  // Simple password check - in real app this would be hashed
  const user = findUserByEmail(email)
  if (!user) return null

  // For demo purposes, any password works if user exists
  // In real app: compare hashed passwords
  return user
}

export function registerUser(email: string, password: string, name: string): UserProfile {
  const existing = findUserByEmail(email)
  if (existing) throw new Error("User already exists")

  const user: UserProfile = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    financialGoals: [],
    preferredChannels: ["app-push", "email"],
    financialConcerns: [],
    currentBankingProducts: [],
  }

  saveUser(user)
  return user
}
