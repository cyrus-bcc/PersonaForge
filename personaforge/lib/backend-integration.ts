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

    // If no persona found, return null instead of creating a basic one
    console.log("No persona found for user:", userId)
    return null
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
    console.log("🔍 Fetching conversation history for persona:", personaId)
    const conversations = await apiClient.getConversations(personaId)
    console.log("📝 Found conversations:", conversations.length)

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
    console.error("❌ Failed to fetch conversation history:", error)
    return []
  }
}

// Conversation sequence counter to avoid conflicts
let conversationSequenceCounter = 1

// Save conversation message to backend
export async function saveConversationMessage(
  conversationId: string,
  personaId: string,
  role: "user" | "assistant",
  text: string,
  intent = "general",
  channel = "web",
  relatedTransactionId?: string,
): Promise<boolean> {
  try {
    console.log("💾 Saving conversation message:", {
      conversationId,
      personaId,
      role,
      textLength: text.length,
      intent,
      channel,
    })

    // Use a proper sequence number that increments
    const messageSeq = conversationSequenceCounter++

    const messageData = {
      conversation_id: conversationId,
      message_seq: messageSeq,
      persona_id: personaId,
      role,
      intent,
      channel,
      language: "en",
      text: text.substring(0, 5000), // Truncate very long messages
      related_transaction_id: relatedTransactionId || null,
    }

    console.log("📤 Sending message data:", messageData)

    const result = await apiClient.createConversationMessage(messageData)
    console.log("✅ Message saved successfully:", result.id)
    return true
  } catch (error: any) {
    console.error("❌ Failed to save conversation message:", error)
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      conversationId,
      personaId,
      role,
    })

    // Show user-visible error for debugging
    if (typeof window !== "undefined") {
      console.warn("🚨 Conversation not saved to backend:", error.message)
    }

    return false
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

// Save user profile to backend - COMPLETELY REWRITTEN VERSION
export async function saveUserProfile(userProfile: UserProfile): Promise<void> {
  try {
    console.log("💾 Starting to save user profile:", {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
    })

    // Generate a proper persona ID
    const personaId = `persona-${userProfile.email.replace("@", "-").replace(/\./g, "-")}-${Date.now()}`
    console.log("🔧 Generated persona ID:", personaId)

    // Convert user profile to backend persona format
    const personaData = {
      id: personaId,
      email: userProfile.email,
      name: userProfile.name,
      age: userProfile.age || 0,
      gender: userProfile.gender || "",
      pronouns: userProfile.pronouns || "",
      city: userProfile.city || "",
      region: userProfile.region || "",
      occupation: userProfile.occupation || "",
      monthly_income: userProfile.monthly_income || 0,
      salary_day_1: userProfile.salary_day_1 || 0,
      salary_day_2: userProfile.salary_day_2 || 0,
      primary_bank: userProfile.primary_bank || "",
      other_banks: userProfile.other_banks || [],
      has_credit_card: userProfile.has_credit_card || false,
      e_wallets: userProfile.e_wallets || "",
      preferred_channel: userProfile.preferred_channel || "app push",
      language_style: userProfile.language_style || "friendly",
      goals: userProfile.goals || [],
      anti_goals: userProfile.anti_goals || [],
      risk_tolerance: userProfile.risk_tolerance || "moderate",
      savings_goal: userProfile.savings_goal || 0,
      consent_personalization: userProfile.consent_personalization || "yes",
      accessibility_needs: userProfile.accessibility_needs || [],
      churn_risk: userProfile.churn_risk || "low",
    }

    console.log("📤 Persona data to save:", personaData)

    // STEP 1: Check if any persona exists for this email
    console.log("🔍 Checking for existing personas...")
    let existingPersonas: BackendPersona[] = []

    try {
      existingPersonas = await apiClient.getPersonas()
      console.log("📋 Found", existingPersonas.length, "total personas")
    } catch (fetchError: any) {
      console.error("❌ Failed to fetch existing personas:", fetchError)
      // Continue with creation if we can't fetch existing ones
    }

    const existingPersona = existingPersonas.find(
      (p: BackendPersona) => p.email.toLowerCase() === userProfile.email.toLowerCase(),
    )

    if (existingPersona) {
      console.log("🔄 Found existing persona for email:", existingPersona.email, "with ID:", existingPersona.id)

      // STEP 2A: Update existing persona
      try {
        console.log("📝 Updating existing persona...")
        const updatedPersona = await apiClient.updatePersona(existingPersona.id, personaData)
        console.log("✅ Successfully updated existing persona:", updatedPersona.id)
      } catch (updateError: any) {
        console.error("❌ Failed to update existing persona:", updateError)

        // If update fails, try to delete and recreate
        console.log("🔄 Attempting to delete and recreate persona...")
        try {
          await apiClient.deletePersona(existingPersona.id)
          console.log("🗑️ Deleted old persona, creating new one...")

          const newPersona = await apiClient.createPersona(personaData)
          console.log("✅ Successfully created new persona after deletion:", newPersona.id)
        } catch (recreateError: any) {
          console.error("❌ Failed to recreate persona:", recreateError)
          throw new Error(`Failed to update or recreate persona: ${recreateError.message}`)
        }
      }
    } else {
      console.log("🆕 No existing persona found, creating new one...")

      // STEP 2B: Create new persona
      try {
        const newPersona = await apiClient.createPersona(personaData)
        console.log("✅ Successfully created new persona:", newPersona.id)
      } catch (createError: any) {
        console.error("❌ Failed to create new persona:", createError)

        // If creation fails due to ID conflict, try with a different ID
        if (createError.message.includes("already exists") || createError.message.includes("duplicate")) {
          const retryPersonaId = `persona-${userProfile.email.replace("@", "-").replace(/\./g, "-")}-${Date.now()}-retry`
          console.log("🔄 Retrying with new ID:", retryPersonaId)

          const retryPersonaData = { ...personaData, id: retryPersonaId }
          const retryPersona = await apiClient.createPersona(retryPersonaData)
          console.log("✅ Successfully created persona with retry ID:", retryPersona.id)
        } else {
          throw new Error(`Failed to create persona: ${createError.message}`)
        }
      }
    }

    console.log("🎉 Profile save operation completed successfully!")
  } catch (error: any) {
    console.error("❌ Failed to save user profile:", error)
    console.error("Error details:", {
      message: error.message,
      userEmail: userProfile.email,
      userId: userProfile.id,
      stack: error.stack,
    })
    throw error
  }
}

// Debug function to test conversation saving
export async function debugConversationSaving(personaId: string) {
  console.log("🧪 Testing conversation saving...")

  const testConversationId = `debug-conv-${Date.now()}`

  try {
    // Test saving a user message
    const userSaved = await saveConversationMessage(
      testConversationId,
      personaId,
      "user",
      "This is a test user message",
      "test",
      "web",
    )

    // Test saving an assistant message
    const assistantSaved = await saveConversationMessage(
      testConversationId,
      personaId,
      "assistant",
      "This is a test assistant response",
      "test_response",
      "web",
    )

    console.log("Test results:", { userSaved, assistantSaved })

    // Try to fetch the saved messages
    const history = await getUserConversationHistory(personaId, 5)
    console.log("Fetched history:", history)

    return { success: true, userSaved, assistantSaved, historyCount: history.length }
  } catch (error) {
    console.error("Debug test failed:", error)
    return { success: false, error: String(error) }
  }
}

// Debug function to test profile saving
export async function debugProfileSaving(userProfile: UserProfile) {
  console.log("🧪 Testing profile saving...")

  try {
    await saveUserProfile(userProfile)
    console.log("✅ Profile saving test passed!")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Profile saving test failed:", error)
    return { success: false, error: error.message }
  }
}

// Debug function to list all personas
export async function debugListPersonas() {
  console.log("🧪 Listing all personas...")

  try {
    const personas = await apiClient.getPersonas()
    console.log("📋 Found personas:", personas.length)

    personas.forEach((persona: BackendPersona, index: number) => {
      console.log(`${index + 1}. ID: ${persona.id}, Email: ${persona.email}, Name: ${persona.name}`)
    })

    return { success: true, count: personas.length, personas }
  } catch (error: any) {
    console.error("❌ Failed to list personas:", error)
    return { success: false, error: error.message }
  }
}
