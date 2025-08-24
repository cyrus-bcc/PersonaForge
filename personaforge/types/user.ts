export type UserProfile = {
  id: string
  email: string
  name: string
  age?: number
  gender?: string
  pronouns?: string
  city?: string
  region?: string
  occupation?: string
  monthly_income?: number
  salary_day_1?: number
  salary_day_2?: number
  primary_bank?: string
  other_banks?: string[]
  has_credit_card?: boolean
  e_wallets?: string
  preferred_channel?: string
  language_style?: string
  goals: string[]
  anti_goals?: string[]
  risk_tolerance?: string
  savings_goal?: number
  consent_personalization?: string
  accessibility_needs?: string[]
  churn_risk?: string
  createdAt: string
  updatedAt: string

  // Legacy fields for backward compatibility
  financialGoals: string[]
  preferredChannels: string[]
  financialConcerns: string[]
  currentBankingProducts: string[]
}

export type AuthState = {
  isAuthenticated: boolean
  user: UserProfile | null
}
