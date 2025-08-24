"use client"

import { apiClient } from "./api-client"
import type { Channel } from "@/types/persona";
import type { BackendPersona, BackendFinancialTransaction, BackendConversationMessage } from "@/types/backend"
import type { Persona } from "@/types/persona"
import type { FinancialSummary } from "@/types/transaction"

// Convert backend persona to frontend persona format
export function convertBackendPersona(backendPersona: BackendPersona): Persona {
  const preferredChannel = backendPersona.preferred_channel as Channel | undefined;
  
  return {
    id: backendPersona.id,
    name: backendPersona.name,
    summary: `${backendPersona.age}-year-old ${backendPersona.occupation} from ${backendPersona.city}, ${backendPersona.region}. ${backendPersona.goals.slice(0, 2).join(" and ")}.`,
    status: "active",
    riskAffinity: mapRiskTolerance(backendPersona.risk_tolerance),
    tonePreference: backendPersona.language_style || "friendly",
    contactChannels: preferredChannel ? [preferredChannel] : ["app push"],
    goals: backendPersona.goals,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapRiskTolerance(riskTolerance: string): Persona["riskAffinity"] {
  switch (riskTolerance.toLowerCase()) {
    case "conservative":
      return "conservative"
    case "moderate":
      return "moderate"
    case "aggressive":
      return "growth"
    default:
      return "balanced"
  }
}

// Get user's persona data from backend
export async function getUserPersona(userId: string): Promise<Persona | null> {
  try {
    const personas = await apiClient.getPersonas()
    const userPersona = personas.find((p: BackendPersona) => p.email === userId || p.id === userId)

    if (userPersona) {
      return convertBackendPersona(userPersona)
    }
    return null
  } catch (error) {
    console.error("Failed to fetch user persona:", error)
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
) {
  try {
    const messageSeq = Date.now() // Simple sequence number

    await apiClient.createConversationMessage({
      conversation_id: conversationId, // Add this line
      message_seq: messageSeq,
      persona_id: personaId,
      role,
      intent,
      channel,
      language: "en",
      text,
    })
  } catch (error) {
    console.error("Failed to save conversation message:", error)
  }
}

