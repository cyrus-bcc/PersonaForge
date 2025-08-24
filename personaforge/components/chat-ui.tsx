"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldAlert, Cpu, Crown, Database, User } from "lucide-react"
import { analyzeEmotion } from "@/lib/emotion"
import { assessImpulsiveRisk } from "@/lib/guardrails"
import { getAuthState } from "@/lib/auth"
import {
  getUserProfile,
  getUserFinancialSummary,
  getUserConversationHistory,
  saveConversationMessage,
  createUserContext,
} from "@/lib/backend-integration"
import type { UserProfile } from "@/types/user"
import type { FinancialSummary } from "@/types/transaction"
import Markdown from "@/components/markdown"
import { formatAssistantText } from "@/lib/text-format"

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; timestamp: string }
type ModelInfo = { provider: string; model: string; config?: string }

export default function ChatUI({ className = "h-full min-h-0" }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [riskInfo, setRiskInfo] = useState<ReturnType<typeof assessImpulsiveRisk> | null>(null)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [conversationId] = useState(() => `conv-${Date.now()}`)
  const [backendConnected, setBackendConnected] = useState(false)

  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function loadUserData() {
      const auth = getAuthState()
      if (!auth.user) return

      try {
        console.log("Loading complete user data for:", auth.user.email)

        // Load user's complete profile from backend
        const completeProfile = await getUserProfile(auth.user.email)
        if (completeProfile) {
          setUserProfile(completeProfile)
          setBackendConnected(true)
          console.log("Complete profile loaded:", completeProfile)

          // Try to load financial summary
          try {
            const financialData = await getUserFinancialSummary(completeProfile.id)
            if (financialData) {
              setFinancialSummary(financialData)
              console.log("Financial data loaded:", financialData)
            }
          } catch (finError) {
            console.log("No financial data available:", finError)
          }

          // Try to load conversation history
          try {
            const history = await getUserConversationHistory(completeProfile.id, 10)
            setConversationHistory(history)
            console.log("Conversation history loaded:", history.length, "messages")
          } catch (convError) {
            console.log("No conversation history available:", convError)
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
        setBackendConnected(false)

        // Use the basic profile from auth state
        if (auth.user) {
          setUserProfile(auth.user)
        }
      }
    }

    loadUserData()
  }, [])

  // Check model info on mount
  useEffect(() => {
    fetch("/api/ai/ping")
      .then((r) => r.json())
      .then((data) => {
        if (data.configured) {
          setModelInfo({
            provider: data.provider,
            model: data.model,
            config: data.fallback ? `fallback from ${data.fallback}` : undefined,
          })
        }
      })
      .catch(() => setModelInfo({ provider: "offline", model: "FAQ mode" }))
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, riskInfo])

  const latestEmotion = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    return lastUser ? analyzeEmotion(lastUser.content) : null
  }, [messages])

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return

    const timestamp = new Date().toISOString()
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, timestamp }
    setMessages((m) => [...m, userMsg])
    setInput("")

    const emotion = analyzeEmotion(text)
    const risk = assessImpulsiveRisk(text, emotion)
    setRiskInfo(risk.level === "low" ? null : risk)

    // Save user message to backend
    if (userProfile && backendConnected) {
      await saveConversationMessage(conversationId, userProfile.id, "user", text, "general", "web")
    }

    setLoading(true)
    try {
      const result = await getAssistantReply({
        messages: [...messages, userMsg],
        userProfile,
        risk,
        financialSummary,
        conversationHistory,
      })

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: result.text,
        timestamp: new Date().toISOString(),
      }

      setMessages((m) => [...m, assistantMsg])

      // Save assistant message to backend
      if (userProfile && backendConnected) {
        await saveConversationMessage(conversationId, userProfile.id, "assistant", result.text, "response", "web")
      }

      // Update model info from the actual response
      if (result.modelInfo) {
        setModelInfo(result.modelInfo)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="h-full p-0">
        <div className="grid h-full grid-rows-[auto_1fr_auto]">
          <div
            className="border-b p-3 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)" }}
          >
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-white" />
              <p className="text-sm font-medium text-white">PersonaForge AI - Personalized Banking Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              {/* User Profile Badge */}
              {userProfile && (
                <Badge variant="outline" className="gap-1 border-white/20 text-white">
                  <User className="h-3 w-3" />
                  <span className="text-xs">{userProfile.name}</span>
                </Badge>
              )}
              {/* Backend Connection Badge */}
              <Badge variant="outline" className="gap-1 border-white/20 text-white">
                <Database className="h-3 w-3" />
                <span className="text-xs">{backendConnected ? "🟢 Backend" : "🔴 Offline"}</span>
              </Badge>
              {/* Model Info Badge */}
              {modelInfo && (
                <Badge variant="outline" className="gap-1 border-white/20 text-white">
                  <Cpu className="h-3 w-3" />
                  <span className="text-xs">
                    {modelInfo.provider === "groq" && "🚀"}
                    {modelInfo.provider === "openai" && "🤖"}
                    {modelInfo.provider === "offline" && "📚"}
                    {modelInfo.provider}/{modelInfo.model.split("-").slice(-2).join("-")}
                  </span>
                </Badge>
              )}
              {/* Emotion Badges */}
              {latestEmotion && (
                <>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                    {latestEmotion.label}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white">
                    score {latestEmotion.score}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div ref={listRef} className="min-h-0 overflow-y-auto p-4 space-y-3">
            {/* Enhanced Status Alerts */}
            {backendConnected && userProfile ? (
              <Alert variant="default" className="border-green-200 bg-green-50">
                <Database className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Complete Profile Loaded</AlertTitle>
                <AlertDescription className="text-xs text-green-700">
                  {userProfile.name} ({userProfile.age}y, {userProfile.occupation}) • Income: ₱
                  {userProfile.monthly_income?.toLocaleString() || "N/A"} • Bank: {userProfile.primary_bank || "N/A"} •
                  Risk: {userProfile.risk_tolerance || "N/A"} • Financial data: {financialSummary ? "✓" : "✗"} •
                  History: {conversationHistory.length} msgs
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="border-orange-200 bg-orange-50">
                <Database className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Limited Profile</AlertTitle>
                <AlertDescription className="text-xs text-orange-700">
                  Using basic profile only. Complete your profile for personalized banking advice.
                </AlertDescription>
              </Alert>
            )}

            {modelInfo && (
              <Alert variant="default" className="border-primary/20">
                <Crown className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">PersonaForge Banking AI Active</AlertTitle>
                <AlertDescription className="text-xs">
                  Specialized in banking & finance • {modelInfo.provider.toUpperCase()} • {modelInfo.model}
                  {modelInfo.config && ` • ${modelInfo.config}`}
                  {userProfile && ` • Personalized for ${userProfile.name}`}
                </AlertDescription>
              </Alert>
            )}

            {riskInfo && (
              <Alert variant="destructive" role="alert">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Financial Risk Alert</AlertTitle>
                <AlertDescription className="text-xs">{riskInfo.message}</AlertDescription>
              </Alert>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user"
              const content = isUser ? m.content : formatAssistantText(m.content)
              return (
                <div key={m.id} className={isUser ? "text-right" : "text-left"}>
                  <div
                    className="inline-block max-w-[85%] rounded-lg px-3 py-2 leading-relaxed break-words text-sm"
                    style={
                      isUser
                        ? { backgroundColor: "#7F1D1D", color: "white" } // Dark red for user messages
                        : { backgroundColor: "#f8f9fa", color: "#333", border: "1px solid #e9ecef" } // Clear/light for AI responses
                    }
                  >
                    {isUser ? (
                      <span className="whitespace-pre-wrap">{content}</span>
                    ) : (
                      <Markdown className="whitespace-pre-wrap">{content}</Markdown>
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {backendConnected && userProfile
                  ? `Analyzing your personalized data (${userProfile.name}, ${userProfile.occupation}, ₱${userProfile.monthly_income?.toLocaleString() || "N/A"} income)...`
                  : "Generating response..."}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder={
                userProfile?.name
                  ? `Hi ${userProfile.name}! Ask about banking, loans, investments, budgeting, savings, insurance...`
                  : "Ask about banking, loans, investments, budgeting, savings, insurance, or financial planning..."
              }
              aria-label="Your financial question"
              style={{ borderColor: "#B91C1C" }}
              className="focus:border-red-700"
            />
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#B91C1C", color: "white" }}
              className="hover:opacity-90"
            >
              Send
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

async function getAssistantReply(args: {
  messages: { role: "user" | "assistant"; content: string; timestamp: string }[]
  userProfile: UserProfile | null
  risk: ReturnType<typeof assessImpulsiveRisk>
  financialSummary: FinancialSummary | null
  conversationHistory: any[]
}): Promise<{ text: string; modelInfo?: ModelInfo }> {
  try {
    // Create comprehensive user context
    const userContext =
      args.userProfile && args.financialSummary
        ? createUserContext(args.userProfile, args.financialSummary, args.conversationHistory)
        : null

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: args.messages.map((m) => ({ role: m.role, content: m.content })),
        userProfile: args.userProfile,
        userContext: userContext,
        risk: args.risk,
        financialSummary: args.financialSummary,
        conversationHistory: args.conversationHistory,
      }),
    })
    if (res.ok) {
      const data = (await res.json()) as { text: string; provider?: string; model?: string; config?: string }
      return {
        text: data.text,
        modelInfo: data.provider
          ? {
              provider: data.provider,
              model: data.model || "unknown",
              config: data.config,
            }
          : undefined,
      }
    }
  } catch {}

  return {
    text: `I'm PersonaForge AI, specialized in banking and financial services. I can help with:

• Banking services and accounts
• Loans and credit management  
• Investment planning
• Budgeting and savings
• Insurance coverage
• Financial planning

${args.userProfile?.name ? `Hi ${args.userProfile.name}! ` : ""}Please ask me about your financial needs, and I'll provide personalized advice based on your profile.`,
    modelInfo: { provider: "offline", model: "Banking FAQ mode" },
  }
}
