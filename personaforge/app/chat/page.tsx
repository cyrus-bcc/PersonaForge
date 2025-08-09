"use client"

import AppShell from "@/components/app-shell"
import ChatUI from "@/components/chat-ui"

export default function ChatPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-xl font-semibold">Chat Prototype</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This chat demo auto-creates a persona from your first message, detects emotion, and applies gentle guardrails
          to reduce impulsive financial decisions. If an AI key is not configured, it falls back to a local FAQ CSV.
        </p>
        <div className="mt-6">
          <ChatUI />
        </div>
      </main>
    </AppShell>
  )
}
