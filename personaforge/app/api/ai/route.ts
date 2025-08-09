import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai as openaiProvider, createOpenAI } from "@ai-sdk/openai"

// Select provider and model using env vars; defaults are cost-friendly.
function selectModel() {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase()

  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return { error: { code: "not_configured", message: "GROQ_API_KEY missing" } }
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey,
    })
    const modelName = process.env.GROQ_MODEL || "llama-3.1-70b-versatile"
    return { model: groq(modelName), provider: "groq", modelName }
  }

  // Default: OpenAI
  if (!process.env.OPENAI_API_KEY) {
    return { error: { code: "not_configured", message: "OPENAI_API_KEY missing" } }
  }
  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini"
  return { model: openaiProvider(modelName), provider: "openai", modelName }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[]
    persona?: any
    risk?: { level: "low" | "medium" | "high" }
  }

  const sel = selectModel()
  if ("error" in sel && sel.error) {
    return NextResponse.json(
      { error: sel.error.message, code: sel.error.code, provider: process.env.AI_PROVIDER || "openai" },
      { status: 400 },
    )
  }

  const history = body.messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
  const system = [
    "You are a cautious, empathetic banking assistant.",
    body.risk?.level === "high"
      ? "Always recommend a cooling-off period and checklist before any risky recommendation."
      : body.risk?.level === "medium"
        ? "Provide a short caution before recommendations."
        : "",
    body.persona
      ? `Persona hints: tone=${body.persona.tonePreference}, risk=${body.persona.riskAffinity}, goals=${(
          body.persona.goals ?? []
        ).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const { text } = await generateText({
      model: sel.model,
      system,
      prompt: history,
    })
    return NextResponse.json({ text, provider: sel.provider, model: sel.modelName })
  } catch (err: any) {
    const msg = String(err?.message ?? "AI error")
    const isQuota =
      err?.statusCode === 429 ||
      err?.code === "insufficient_quota" ||
      msg.includes("insufficient_quota") ||
      msg.toLowerCase().includes("quota")

    if (isQuota) {
      return NextResponse.json(
        { error: "Quota exceeded", code: "insufficient_quota", provider: sel.provider, model: sel.modelName },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: "AI failed", code: "ai_failed", provider: sel.provider, model: sel.modelName },
      { status: 500 },
    )
  }
}
