"use client"

import { apiClient } from "./api-client"
import type { BackendPersona, BackendFinancialTransaction, BackendConversationMessage } from "@/types/backend"
import type { UserProfile } from "@/types/user"
import type { FinancialSummary } from "@/types/transaction"

// Convert backend persona to frontend user profile format
export function convertBackendPersonaToUserProfile(backendPersona: BackendPersona): UserProfile {
  return {
    id: backendPersona.id,
    email: backendPersona.email,
    name: backendPersona.name,
    age: backendPersona.age,
    gender: backendPersona.gender,
    pronouns: backendPersona.pronouns,
    city: backendPersona.city,
    region: backendPersona.region,
    occupation: backendPersona.occupation,
    monthly_income: backendPersona.monthly_income,
    salary_day_1: backendPersona.salary_day_1,
    salary_day_2: backendPersona.salary_day_2,
    primary_bank: backendPersona.primary_bank,
    other_banks: backendPersona.other_banks,
    has_credit_card: backendPersona.has_credit_card,
    e_wallets: backendPersona.e_wallets,
    preferred_channel: backendPersona.preferred_channel,
    language_style: backendPersona.language_style,
    goals: backendPersona.goals,
    anti_goals: backendPersona.anti_goals,
    risk_tolerance: backendPersona.risk_tolerance,
    savings_goal: backendPersona.savings_goal,
    consent_personalization: backendPersona.consent_personalization,
    accessibility_needs: backendPersona.accessibility_needs,
    churn_risk: backendPersona.churn_risk,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // Legacy fields for backward compatibility
    financialGoals: backendPersona.goals,
    preferredChannels: [backendPersona.preferred_channel],
    financialConcerns: backendPersona.anti_goals,
    currentBankingProducts: [backendPersona.primary_bank, ...backendPersona.other_banks],
  }
}

// Get user's complete profile from backend
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const personas = await apiClient.getPersonas()
    const userPersona = personas.find(
      (p: BackendPersona) => p.email === userId || p.id === userId || p.email.toLowerCase() === userId.toLowerCase(),
    )

    if (userPersona) {
      return convertBackendPersonaToUserProfile(userPersona)
    }

    // If no persona found, create a basic one for the user
    console.log("No persona found for user, creating basic profile")
    return {
      id: `user-${userId}`,
      email: userId,
      name: userId.split("@")[0] || "User",
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
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return null
  }
}

// Get user's financial summary from backend
export async function getUserFinancialSummary(personaId: string): Promise<FinancialSummary | null> {
  try {
    const transactions = await apiClient.getFinancialTransactions(personaId)

    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netWorth: 0,
        monthlyAverage: 0,
        topCategories: [],
        recentTransactions: [],
      }
    }

    // Calculate financial summary from backend transactions
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentTransactions = transactions
      .filter((t: BackendFinancialTransaction) => new Date(t.timestamp) >= thirtyDaysAgo)
      .sort(
        (a: BackendFinancialTransaction, b: BackendFinancialTransaction) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

    const totalIncome = recentTransactions
      .filter((t: BackendFinancialTransaction) => t.transaction_type === "Credit")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

    const totalExpenses = recentTransactions
      .filter((t: BackendFinancialTransaction) => t.transaction_type === "Debit")
      .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

    const netWorth = totalIncome - totalExpenses

    // Calculate top spending categories
    const categoryTotals = new Map<string, number>()
    recentTransactions
      .filter((t: BackendFinancialTransaction) => t.transaction_type === "Debit")
      .forEach((t) => {
        const current = categoryTotals.get(t.category) || 0
        categoryTotals.set(t.category, current + Number.parseFloat(t.amount))
      })

    const topCategories = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({ category: category as any, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      totalIncome,
      totalExpenses,
      netWorth,
      monthlyAverage: totalExpenses,
      topCategories,
      recentTransactions: recentTransactions.slice(0, 10).map(convertBackendTransaction),
    }
  } catch (error) {
    console.error("Failed to fetch financial summary:", error)
    return null
  }
}

function convertBackendTransaction(backendTx: BackendFinancialTransaction) {
  return {
    id: backendTx.transaction_id,
    userId: backendTx.persona_id,
    type: backendTx.transaction_type === "Credit" ? ("income" as const) : ("expense" as const),
    category: backendTx.category as any,
    amount:
      backendTx.transaction_type === "Credit"
        ? Number.parseFloat(backendTx.amount)
        : -Number.parseFloat(backendTx.amount),
    description: `${backendTx.merchant || backendTx.category} - ${backendTx.payment_method}`,
    date: backendTx.timestamp,
    balance: Number.parseFloat(backendTx.balance_after_transaction),
    merchant: backendTx.merchant,
    createdAt: backendTx.timestamp,
  }
}

// Get user's conversation history from backend
export async function getUserConversationHistory(personaId: string, limit = 10): Promise<any[]> {
  try {
    const conversations = await apiClient.getConversations(personaId)

    return conversations
      .sort(
        (a: BackendConversationMessage, b: BackendConversationMessage) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit)
      .map((msg: BackendConversationMessage) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.text,
        timestamp: msg.timestamp,
        intent: msg.intent,
        channel: msg.channel,
        style_tags: msg.style_tags,
        related_transaction_id: msg.related_transaction_id,
      }))
  } catch (error) {
    console.error("Failed to fetch conversation history:", error)
    return []
  }
}

// Save conversation message to backend
export async function saveConversationMessage(
  conversationId: string,
  personaId: string,
  role: "user" | "assistant",
  text: string,
  intent = "general",
  channel = "web",
  relatedTransactionId?: string,
) {
  try {
    const messageSeq = Date.now() // Simple sequence number

    await apiClient.createConversationMessage({
      conversation_id: conversationId,
      message_seq: messageSeq,
      persona_id: personaId,
      role,
      intent,
      channel,
      language: "en",
      text,
      related_transaction_id: relatedTransactionId,
    })
  } catch (error) {
    console.error("Failed to save conversation message:", error)
  }
}

// Create comprehensive user context for AI
export function createUserContext(
  userProfile: UserProfile,
  financialSummary: FinancialSummary | null,
  conversationHistory: any[],
) {
  const context = {
    // Personal Information
    personal: {
      name: userProfile.name,
      age: userProfile.age,
      gender: userProfile.gender,
      pronouns: userProfile.pronouns,
      location: `${userProfile.city}, ${userProfile.region}`,
      occupation: userProfile.occupation,
    },

    // Financial Profile
    financial: {
      monthly_income: userProfile.monthly_income,
      salary_days: [userProfile.salary_day_1, userProfile.salary_day_2].filter(Boolean),
      primary_bank: userProfile.primary_bank,
      other_banks: userProfile.other_banks,
      has_credit_card: userProfile.has_credit_card,
      e_wallets: userProfile.e_wallets,
      savings_goal: userProfile.savings_goal,
      risk_tolerance: userProfile.risk_tolerance,
      churn_risk: userProfile.churn_risk,
    },

    // Goals and Preferences
    preferences: {
      goals: userProfile.goals,
      anti_goals: userProfile.anti_goals,
      preferred_channel: userProfile.preferred_channel,
      language_style: userProfile.language_style,
      accessibility_needs: userProfile.accessibility_needs,
      consent_personalization: userProfile.consent_personalization,
    },

    // Financial Summary
    financial_summary: financialSummary
      ? {
          total_income: financialSummary.totalIncome,
          total_expenses: financialSummary.totalExpenses,
          net_worth: financialSummary.netWorth,
          monthly_average: financialSummary.monthlyAverage,
          top_spending_categories: financialSummary.topCategories,
          recent_transactions: financialSummary.recentTransactions.slice(0, 5),
        }
      : null,

    // Conversation Context
    conversation_context: conversationHistory.slice(0, 5).map((msg) => ({
      role: msg.role,
      content: msg.content.substring(0, 200), // Truncate for context
      intent: msg.intent,
      timestamp: msg.timestamp,
    })),
  }

  return context
}
