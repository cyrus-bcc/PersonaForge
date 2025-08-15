"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Sparkles, Save, Eye } from "lucide-react"
import { getAuthState, saveUser, setAuthState } from "@/lib/auth"
import { createPersonaFromProfile } from "@/lib/profile-persona"
import type { UserProfile } from "@/types/user"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const FINANCIAL_GOALS = [
  "Build emergency fund",
  "Pay off debt",
  "Save for home",
  "Retirement planning",
  "Investment growth",
  "Education funding",
  "Start a business",
  "Travel savings",
  "Insurance coverage",
  "Tax optimization",
]

const FINANCIAL_CONCERNS = [
  "High interest rates",
  "Market volatility",
  "Job security",
  "Inflation impact",
  "Debt management",
  "Retirement readiness",
  "Healthcare costs",
  "Economic uncertainty",
  "Investment knowledge",
  "Financial planning",
]

const BANKING_PRODUCTS = [
  "Checking account",
  "Savings account",
  "Credit card",
  "Personal loan",
  "Mortgage",
  "Investment account",
  "Retirement account",
  "Business account",
  "Insurance policy",
  "Line of credit",
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuthState()
    if (!auth.isAuthenticated || !auth.user) {
      router.push("/login")
      return
    }
    setProfile(auth.user)
  }, [router])

  if (!profile) {
    return <div>Loading...</div>
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      id: profile.id ?? "", // Ensure id is always a string
      name: formData.get("name") as string,
      age: Number.parseInt(formData.get("age") as string) || undefined,
      occupation: (formData.get("occupation") as string) || undefined,
      incomeRange: (formData.get("incomeRange") as UserProfile["incomeRange"]) || undefined,
      riskTolerance: (formData.get("riskTolerance") as UserProfile["riskTolerance"]) || undefined,
      bankingExperience: (formData.get("bankingExperience") as UserProfile["bankingExperience"]) || undefined,
      communicationStyle: (formData.get("communicationStyle") as UserProfile["communicationStyle"]) || undefined,
      decisionMaking: (formData.get("decisionMaking") as UserProfile["decisionMaking"]) || undefined,
      updatedAt: new Date().toISOString(),
    }

    try {
      saveUser(updatedProfile)
      setAuthState({ isAuthenticated: true, user: updatedProfile })
      setProfile(updatedProfile)
      setSuccess("Profile saved successfully!")

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error("Failed to save profile:", err)
    } finally {
      setLoading(false)
    }
  }

  function handleArrayChange(field: keyof UserProfile, value: string, checked: boolean) {
    if (!profile) return;
    const currentArray = (profile[field] as string[]) || []
    const newArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value)

    setProfile((prev) => (prev ? { ...prev, [field]: newArray } : null))
  }

  async function generatePersona() {
    if (!profile) return

    setLoading(true)
    try {
      const persona = createPersonaFromProfile(profile)
      setSuccess(`Generated persona: ${persona.name}! Check your personas page.`)
      setTimeout(() => {
        router.push("/personas")
      }, 2000)
    } catch (err: any) {
      console.error("Failed to generate persona:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      {/* Changed: Added proper scrollable container with padding */}
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              <h1 className="text-xl font-semibold">Profile Settings</h1>
            </div>
            <Button onClick={generatePersona} disabled={loading} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate AI Persona
            </Button>
          </div>

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
              <TabsTrigger value="view">View Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Profile Overview
                  </CardTitle>
                  <CardDescription>Your current profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Basic Information</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Name:</span> {profile.name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {profile.email}
                        </p>
                        <p>
                          <span className="font-medium">Age:</span> {profile.age || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Occupation:</span> {profile.occupation || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Income Range:</span> {profile.incomeRange || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Financial Profile</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Risk Tolerance:</span>{" "}
                          {profile.riskTolerance || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Banking Experience:</span>{" "}
                          {profile.bankingExperience || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Communication Style:</span>{" "}
                          {profile.communicationStyle || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Decision Making:</span>{" "}
                          {profile.decisionMaking || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Financial Goals</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.financialGoals.length > 0 ? (
                          profile.financialGoals.map((goal) => (
                            <span key={goal} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs">
                              {goal}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No goals specified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Financial Concerns</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.financialConcerns.length > 0 ? (
                          profile.financialConcerns.map((concern) => (
                            <span key={concern} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs">
                              {concern}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No concerns specified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Current Banking Products</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.currentBankingProducts.length > 0 ? (
                          profile.currentBankingProducts.map((product) => (
                            <span key={product} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                              {product}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No products specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t text-xs text-muted-foreground">
                    <p>Profile created: {new Date(profile.createdAt).toLocaleDateString()}</p>
                    <p>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
              <form onSubmit={handleSave} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Tell us about yourself to create a better banking experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" defaultValue={profile.name} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" name="age" type="number" min="18" max="100" defaultValue={profile.age} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          name="occupation"
                          placeholder="Software Engineer, Teacher, etc."
                          defaultValue={profile.occupation}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incomeRange">Income Range</Label>
                        <Select name="incomeRange" defaultValue={profile.incomeRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select income range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-30k">Under $30,000</SelectItem>
                            <SelectItem value="30k-60k">$30,000 - $60,000</SelectItem>
                            <SelectItem value="60k-100k">$60,000 - $100,000</SelectItem>
                            <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                            <SelectItem value="over-150k">Over $150,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Profile</CardTitle>
                    <CardDescription>Help us understand your financial preferences and experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                        <Select name="riskTolerance" defaultValue={profile.riskTolerance}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk tolerance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="very-conservative">Very Conservative</SelectItem>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                            <SelectItem value="very-aggressive">Very Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankingExperience">Banking Experience</Label>
                        <Select name="bankingExperience" defaultValue={profile.bankingExperience}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="communicationStyle">Communication Style</Label>
                        <Select name="communicationStyle" defaultValue={profile.communicationStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select communication style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="concise">Concise</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="empathetic">Empathetic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="decisionMaking">Decision Making Style</Label>
                        <Select name="decisionMaking" defaultValue={profile.decisionMaking}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select decision style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quick">Quick Decisions</SelectItem>
                            <SelectItem value="research-heavy">Research Heavy</SelectItem>
                            <SelectItem value="collaborative">Collaborative</SelectItem>
                            <SelectItem value="cautious">Cautious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Financial Goals</Label>
                        <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {FINANCIAL_GOALS.map((goal) => (
                            <div key={goal} className="flex items-center space-x-2">
                              <Checkbox
                                id={`goal-${goal}`}
                                checked={profile.financialGoals.includes(goal)}
                                onCheckedChange={(checked) =>
                                  handleArrayChange("financialGoals", goal, checked as boolean)
                                }
                              />
                              <Label htmlFor={`goal-${goal}`} className="text-sm">
                                {goal}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Financial Concerns</Label>
                        <p className="text-sm text-muted-foreground mb-3">What worries you most?</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {FINANCIAL_CONCERNS.map((concern) => (
                            <div key={concern} className="flex items-center space-x-2">
                              <Checkbox
                                id={`concern-${concern}`}
                                checked={profile.financialConcerns.includes(concern)}
                                onCheckedChange={(checked) =>
                                  handleArrayChange("financialConcerns", concern, checked as boolean)
                                }
                              />
                              <Label htmlFor={`concern-${concern}`} className="text-sm">
                                {concern}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Current Banking Products</Label>
                        <p className="text-sm text-muted-foreground mb-3">What do you currently use?</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {BANKING_PRODUCTS.map((product) => (
                            <div key={product} className="flex items-center space-x-2">
                              <Checkbox
                                id={`product-${product}`}
                                checked={profile.currentBankingProducts.includes(product)}
                                onCheckedChange={(checked) =>
                                  handleArrayChange("currentBankingProducts", product, checked as boolean)
                                }
                              />
                              <Label htmlFor={`product-${product}`} className="text-sm">
                                {product}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fixed: Save button with proper spacing */}
                <div className="flex justify-end pb-8">
                  <Button type="submit" disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  )
}
