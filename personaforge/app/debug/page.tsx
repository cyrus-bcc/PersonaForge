"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import AppShell from "@/components/app-shell"

export default function DebugPage() {
  const [results, setResults] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function testEndpoints() {
    setLoading(true)
    setResults("Testing API endpoints...\n")

    try {
      // Test base URL
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"
      setResults((prev) => prev + `Base URL: ${baseUrl}\n`)

      // Test personas endpoint
      setResults((prev) => prev + "Testing GET /persona/...\n")
      const personas = await apiClient.getPersonas()
      setResults((prev) => prev + `✅ Found ${personas.length} personas\n`)

      if (personas.length > 0) {
        setResults((prev) => prev + `First persona: ${personas[0].name} (${personas[0].email})\n`)
      }

      setResults((prev) => prev + "✅ All tests passed!\n")
    } catch (error: any) {
      setResults((prev) => prev + `❌ Error: ${error.message}\n`)

      // Additional debugging
      if (error.message.includes("404")) {
        setResults((prev) => prev + "\n🔍 Checking backend status...\n")

        try {
          const response = await fetch("http://localhost:8000/api/v1/")
          setResults((prev) => prev + `Backend root: ${response.status}\n`)
        } catch (e) {
          setResults((prev) => prev + "❌ Backend not reachable\n")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function testCreatePersona() {
    setLoading(true)
    setResults("Testing persona creation...\n")

    try {
      const testPersona = {
        id: `test-${Date.now()}`,
        email: "test@example.com",
        name: "Test User",
        age: 25,
        gender: "Other",
        pronouns: "they/them",
        city: "Manila",
        region: "NCR",
        occupation: "Tester",
        monthly_income: 50000,
        salary_day_1: 15,
        salary_day_2: 30,
        primary_bank: "BPI",
        other_banks: [],
        has_credit_card: true,
        e_wallets: "GCash",
        preferred_channel: "app push",
        language_style: "friendly",
        goals: ["test goal"],
        anti_goals: ["test anti-goal"],
        risk_tolerance: "moderate",
        savings_goal: 100000,
        consent_personalization: "yes",
        accessibility_needs: [],
        churn_risk: "low",
      }

      const created = await apiClient.createPersona(testPersona)
      setResults((prev) => prev + `✅ Created persona: ${created.name}\n`)

      // Clean up - delete the test persona
      await apiClient.deletePersona(created.id)
      setResults((prev) => prev + "✅ Cleaned up test persona\n")
    } catch (error: any) {
      setResults((prev) => prev + `❌ Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>API Debug Console</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testEndpoints} disabled={loading}>
                Test API Endpoints
              </Button>
              <Button onClick={testCreatePersona} disabled={loading} variant="outline">
                Test Create Persona
              </Button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto whitespace-pre-wrap">
              {results || "Click a button to start testing..."}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Environment:</strong>
              </p>
              <p>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"}</p>
              <p>
                Current Token:{" "}
                {typeof window !== "undefined" ? (localStorage.getItem("access_token") ? "Present" : "Missing") : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
