"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldAlert, Cpu, Crown, Database } from "lucide-react"
import { analyzeEmotion } from "@/lib/emotion"
import { assessImpulsiveRisk } from "@/lib/guardrails"
import { getAuthState } from "@/lib/auth"
import {
  getUserPersona,
  getUserFinancialSummary,
  getUserConversationHistory,
  saveConversationMessage,
} from "@/lib/backend-integration"
import type { Persona } from "@/types/persona"
import type { FinancialSummary } from "@/types/transaction"
import Markdown from "@/components/markdown"
import { formatAssistantText } from "@/lib/text-format"

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; timestamp: string }
type ModelInfo = { provider: string; model: string; config?: string }

export default function ChatUI({ className = "h-full min-h-0" }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [persona, setPersona] = useState<Persona | null>(null)
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
        // Load user's persona from backend
        const userPersona = await getUserPersona(auth.user.email)
        if (userPersona) {
          setPersona(userPersona)
          setBackendConnected(true)

          // Load financial summary
          const financialData = await getUserFinancialSummary(userPersona.id)
          if (financialData) {
            setFinancialSummary(financialData)
          }

          // Load conversation history
          const history = await getUserConversationHistory(userPersona.id, 5)
          setConversationHistory(history)
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
        setBackendConnected(false)
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
    if (persona && backendConnected) {
      await saveConversationMessage(conversationId, persona.id, "user", text, "general", "web")
    }

    setLoading(true)
    try {
      const result = await getAssistantReply({
        messages: [...messages, userMsg],
        persona,
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
      if (persona && backendConnected) {
        await saveConversationMessage(conversationId, persona.id, "assistant", result.text, "response", "web")
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
              <p className="text-sm font-medium text-white">PersonaForge AI - Banking & Finance Assistant</p>
            </div>
            <div className="flex items-center gap-2">
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
            {backendConnected && persona ? (
              <Alert variant="default" className="border-green-200 bg-green-50">
                <Database className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Backend Connected</AlertTitle>
                <AlertDescription className="text-xs text-green-700">
                  Persona: {persona.name} • Financial data: {financialSummary ? "✓" : "✗"} • Conversation history:{" "}
                  {conversationHistory.length} messages
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="border-orange-200 bg-orange-50">
                <Database className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Offline Mode</AlertTitle>
                <AlertDescription className="text-xs text-orange-700">
                  Using local data only. Login to access your personalized banking data.
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
                  {financialSummary && ` • Your financial data integrated`}
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
                {backendConnected ? "Analyzing your personalized financial data..." : "Generating response..."}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Ask about banking, loans, investments, budgeting, savings, insurance, or financial planning..."
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
  persona: Persona | null
  risk: ReturnType<typeof assessImpulsiveRisk>
  financialSummary: FinancialSummary | null
  conversationHistory: any[]
}): Promise<{ text: string; modelInfo?: ModelInfo }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: args.messages.map((m) => ({ role: m.role, content: m.content })),
        persona: args.persona,
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

Please ask me about your financial needs, and I'll provide personalized advice based on your profile.`,
    modelInfo: { provider: "offline", model: "Banking FAQ mode" },
  }
}
