"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, LogIn, UserPlus, Sparkles } from "lucide-react"
import { authenticateUser, setAuthState } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Attempting login with:", email) // Debug log

    try {
      const user = await authenticateUser(email, password)
      if (!user) {
        setError("Invalid email or password")
        return
      }

      console.log("Login successful, user:", user) // Debug log

      // Set auth state first
      setAuthState({ isAuthenticated: true, user })
      setSuccess("Login successful! Redirecting to home...")

      // Simple redirect without reload
      setTimeout(() => {
        router.replace("/")
      }, 800)
    } catch (err: any) {
      console.error("Login error:", err) // Debug log
      setError(err.message || "Login failed. Please check your credentials and ensure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("Registration is not available yet. Please use existing credentials to login.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header with improved styling */}
        <div
          className="text-center mb-6 p-8 rounded-t-2xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)" }}
        >
          <div className="inline-flex items-center gap-3 text-4xl font-bold text-white mb-2">
            <Crown className="h-10 w-10 text-white" />
            PersonaForge
          </div>
          <p className="text-white text-lg font-medium">For the People. Forged for You.</p>
          <p className="mt-2 text-white/90">Sign in to access your personalized banking AI</p>
        </div>

        <Card className="shadow-xl border-0 rounded-t-none rounded-b-2xl">
          <CardHeader className="text-center pb-2 pt-2">
            <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Access your financial persona and personalized banking experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 mb-6 rounded-lg" style={{ backgroundColor: "#E5E7EB" }}>
                <TabsTrigger
                  value="login"
                  className="rounded-md font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-[#B91C1C] data-[state=active]:shadow-sm transition-colors"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-md font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-[#B91C1C] data-[state=active]:shadow-sm transition-colors"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="h-11 border border-gray-300 focus:border-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#B91C1C]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className="h-11 border border-gray-300 focus:border-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#B91C1C]/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-white font-semibold hover:bg-[#7F1D1D] transition-colors"
                    disabled={loading}
                    style={{ backgroundColor: "#B91C1C" }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      disabled={true}
                      className="h-11 border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      disabled={true}
                      className="h-11 border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      disabled={true}
                      className="h-11 border border-gray-300"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-white font-semibold opacity-50"
                    disabled={true}
                    style={{ backgroundColor: "#B91C1C" }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registration Coming Soon
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-6 border-green-200 bg-green-50">
                <Sparkles className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Features Preview with refined styling */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs">
              <div
                className="text-center p-4 rounded-xl border-2 transition-transform hover:scale-[1.02]"
                style={{ borderColor: "#FEF2F2", backgroundColor: "#FEF2F2" }}
              >
                <Crown className="h-8 w-8 mx-auto mb-2 text-red-700" />
                <p className="font-semibold text-sm text-red-700">Real Personas</p>
                <p className="text-gray-600 mt-1">From backend data</p>
              </div>
              <div
                className="text-center p-4 rounded-xl border-2 transition-transform hover:scale-[1.02]"
                style={{ borderColor: "#FEF2F2", backgroundColor: "#FEF2F2" }}
              >
                <Sparkles className="h-8 w-8 mx-auto mb-2" style={{ color: "#7F1D1D" }} />
                <p className="font-semibold text-sm" style={{ color: "#7F1D1D" }}>
                  Smart AI
                </p>
                <p className="text-gray-600 mt-1">Personalized responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}