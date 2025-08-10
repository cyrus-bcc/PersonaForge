"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldAlert, Sparkles } from "lucide-react"
import { analyzeEmotion } from "@/lib/emotion"
import { assessImpulsiveRisk } from "@/lib/guardrails"
import {
  createPersonaFromFirstMessage,
  getLocalPersonaById,
  getOrCreateSessionPersonaId,
  saveLocalPersona,
} from "@/lib/client-personas"
import { loadFaq, findFaqAnswer } from "@/lib/faq"
import type { Persona } from "@/types/persona"
import Markdown from "@/components/markdown"
import { formatAssistantText } from "@/lib/text-format"

type ChatMessage = { id: string; role: "user" | "assistant"; content: string }

export default function ChatUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([])
  const [persona, setPersona] = useState<Persona | null>(null)
  const [riskInfo, setRiskInfo] = useState<ReturnType<typeof assessImpulsiveRisk> | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadFaq("/data/faq.csv")
      .then(setFaq)
      .catch(() => setFaq([]))
  }, [])

  useEffect(() => {
    const id = getOrCreateSessionPersonaId()
    const p = getLocalPersonaById(id)
    if (p) setPersona(p)
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

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text }
    setMessages((m) => [...m, userMsg])
    setInput("")

    const current = persona
    if (!current) {
      const created = createPersonaFromFirstMessage(text)
      setPersona(created)
    }

    const emotion = analyzeEmotion(text)
    const risk = assessImpulsiveRisk(text, emotion)
    setRiskInfo(risk.level === "low" ? null : risk)

    setLoading(true)
    try {
      const assistantText = await getAssistantReply({
        messages: [...messages, userMsg],
        persona: current ?? getLocalPersonaById(getOrCreateSessionPersonaId()),
        faq,
        risk,
      })
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: assistantText }])

      const p = getLocalPersonaById(getOrCreateSessionPersonaId())
      if (p) {
        const updated: Persona = { ...p, tonePreference: emotion.label, updatedAt: new Date().toISOString() }
        saveLocalPersona(updated)
        setPersona(updated)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid h-[70vh] grid-rows-[auto_1fr_auto]">
          <div className="border-b p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium">Persona-aware Chat</p>
            </div>
            {latestEmotion && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{latestEmotion.label}</Badge>
                <Badge variant="outline">score {latestEmotion.score}</Badge>
              </div>
            )}
          </div>

          <div ref={listRef} className="overflow-y-auto p-4 space-y-3">
            {persona ? (
              <Alert variant="default">
                <AlertTitle>Persona Active</AlertTitle>
                <AlertDescription className="text-xs">
                  {persona.name} • tone: {persona.tonePreference} • risk: {persona.riskAffinity} • channels:{" "}
                  {persona.contactChannels.join(", ")}
                </AlertDescription>
              </Alert>
            ) : null}

            {riskInfo && (
              <Alert variant="destructive" role="alert">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Impulse Guard</AlertTitle>
                <AlertDescription className="text-xs">{riskInfo.message}</AlertDescription>
              </Alert>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user"
              const content = isUser ? m.content : formatAssistantText(m.content)
              return (
                <div key={m.id} className={isUser ? "text-right" : "text-left"}>
                  <div
                    className={[
                      "inline-block max-w-[85%] rounded-lg px-3 py-2 leading-relaxed break-words",
                      // Make sizes consistent: both text-sm
                      isUser ? "bg-emerald-600 text-white text-sm" : "bg-muted text-sm",
                    ].join(" ")}
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
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating response...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Type a message about your finances (e.g., I'm so excited to take a loan for a new car!)"
              aria-label="Your message"
            />
            <Button type="submit" disabled={loading}>
              Send
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

async function getAssistantReply(args: {
  messages: { role: "user" | "assistant"; content: string }[]
  persona: Persona | null
  faq: { q: string; a: string }[]
  risk: ReturnType<typeof assessImpulsiveRisk>
}): Promise<string> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: args.messages, persona: args.persona, risk: args.risk }),
    })
    if (res.ok) {
      const data = (await res.json()) as { text: string }
      return data.text
    }
  } catch {}
  const lastUser = [...args.messages].reverse().find((m) => m.role === "user")?.content ?? ""
  const found = findFaqAnswer(lastUser, args.faq)
  return (
    found ??
    `I’m not fully configured with an AI provider yet, but here’s a safe-first approach:
- Clarify your goal, amount, and timeline.
- Compare at least 3 options (APR, fees, prepayment rules).
- Simulate cash flow impact across 3–6 months.`
  )
}
