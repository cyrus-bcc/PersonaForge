export type UserProfile = {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string

  // Banking/Financial Profile
  age?: number
  occupation?: string
  incomeRange?: "under-30k" | "30k-60k" | "60k-100k" | "100k-150k" | "over-150k"
  financialGoals: string[]
  riskTolerance?: "very-conservative" | "conservative" | "moderate" | "aggressive" | "very-aggressive"
  bankingExperience?: "beginner" | "intermediate" | "advanced" | "expert"
  preferredChannels: ("email" | "sms" | "whatsapp" | "app-push" | "phone")[]
  communicationStyle?: "formal" | "friendly" | "concise" | "detailed" | "empathetic"

  // Behavioral preferences
  decisionMaking?: "quick" | "research-heavy" | "collaborative" | "cautious"
  financialConcerns: string[]
  currentBankingProducts: string[]
}

export type AuthState = {
  isAuthenticated: boolean
  user: UserProfile | null
}
