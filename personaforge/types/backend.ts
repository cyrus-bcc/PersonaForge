// Backend data types matching Django models

export type BackendPersona = {
  id: string
  email: string
  name: string
  age: number
  gender: string
  pronouns: string
  city: string
  region: string
  occupation: string
  monthly_income: number
  salary_day_1: number
  salary_day_2: number
  primary_bank: string
  other_banks: string[]
  has_credit_card: boolean
  e_wallets: string
  preferred_channel: string
  language_style: string
  goals: string[]
  anti_goals: string[]
  risk_tolerance: string
  savings_goal: number
  consent_personalization: string
  accessibility_needs: string[]
  churn_risk: string
}

export type BackendFinancialTransaction = {
  id: number
  persona_id: string
  transaction_id: string
  timestamp: string
  transaction_type: "Debit" | "Credit"
  amount: string // Decimal field comes as string
  category: string
  merchant?: string
  payment_method: string
  account_type: "Savings" | "Checking" | "Credit"
  channel: string
  balance_after_transaction: string
  notes?: string
}

export type BackendConversationMessage = {
  id: number
  conversation_id: string
  message_seq: number
  persona_id: string
  role: "user" | "assistant"
  timestamp: string
  intent: string
  channel: string
  language: string
  style_tags?: string
  related_transaction_id?: string
  text: string
}

export type BackendUser = {
  id: number
  email: string
  is_active: boolean
  is_staff: boolean
  created_at: string
}
