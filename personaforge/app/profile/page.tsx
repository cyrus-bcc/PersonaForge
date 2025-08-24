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
import { Save, Eye, Crown } from "lucide-react"
import { getAuthState, saveUser, setAuthState } from "@/lib/auth"
import type { UserProfile } from "@/types/user"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const BANKS = [
  "BPI",
  "BDO",
  "Metrobank",
  "Security Bank",
  "PNB",
  "UnionBank",
  "Landbank",
  "RCBC",
  "Chinabank",
  "EastWest Bank",
]

const E_WALLETS = ["GCash", "PayMaya", "GrabPay", "ShopeePay", "UnionBank Online", "BPI Online", "Coins.ph"]

const CHANNELS = ["app push", "email", "sms", "whatsapp", "phone call", "in-branch"]

const LANGUAGE_STYLES = ["friendly", "professional", "casual", "formal", "empathetic", "concise", "detailed"]

const RISK_TOLERANCE = ["very conservative", "conservative", "moderate", "aggressive", "very aggressive"]

const CHURN_RISK = ["low", "medium", "high"]

const CONSENT_OPTIONS = ["yes", "no", "limited"]

const COMMON_GOALS = [
  "Build emergency fund",
  "Save for retirement",
  "Buy a house",
  "Pay off debt",
  "Start a business",
  "Save for education",
  "Travel fund",
  "Investment growth",
  "Insurance coverage",
  "Tax optimization",
]

const COMMON_ANTI_GOALS = [
  "Avoid debt",
  "No high-risk investments",
  "Avoid long-term commitments",
  "No credit cards",
  "Avoid complex products",
  "No foreign investments",
  "Avoid high fees",
  "No cryptocurrency",
]

const ACCESSIBILITY_NEEDS = [
  "Large text",
  "Voice assistance",
  "Screen reader",
  "High contrast",
  "Simple interface",
  "Multiple languages",
  "Offline access",
  "Video calls",
  "In-person support",
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
      e.preventDefault();
      setLoading(true);

      const formData = new FormData(e.currentTarget);

      // Use a type guard to handle the null case for 'profile'
      let updatedProfile: UserProfile;

      if (!profile) {
      // If 'profile' is null, create a new UserProfile object from scratch
        const newProfileId = `user-${Date.now()}`;
        updatedProfile = {
          id: newProfileId,
          name: (formData.get("name") as string) || "",
          age: Number.parseInt(formData.get("age") as string) || undefined,
          gender: (formData.get("gender") as string) || undefined,
          pronouns: (formData.get("pronouns") as string) || undefined,
          city: (formData.get("city") as string) || undefined,
          region: (formData.get("region") as string) || undefined,
          occupation: (formData.get("occupation") as string) || undefined,
          monthly_income: Number.parseInt(formData.get("monthly_income") as string) || undefined,
          salary_day_1: Number.parseInt(formData.get("salary_day_1") as string) || undefined,
          salary_day_2: Number.parseInt(formData.get("salary_day_2") as string) || undefined,
          primary_bank: (formData.get("primary_bank") as string) || undefined,
          has_credit_card: formData.get("has_credit_card") === "true",
          e_wallets: (formData.get("e_wallets") as string) || undefined,
          preferred_channel: (formData.get("preferred_channel") as string) || undefined,
          language_style: (formData.get("language_style") as string) || undefined,
          risk_tolerance: (formData.get("risk_tolerance") as string) || undefined,
          savings_goal: Number.parseInt(formData.get("savings_goal") as string) || undefined,
          consent_personalization: (formData.get("consent_personalization") as string) || undefined,
          churn_risk: (formData.get("churn_risk") as string) || undefined,
          updatedAt: new Date().toISOString(),
          // Provide default empty arrays
          goals: [],
          anti_goals: [],
          accessibility_needs: [],
          other_banks: [],
          financialGoals: [],
          preferredChannels: ["app push"],
          financialConcerns: [],
          currentBankingProducts: [],
          // Add the missing properties
          email: (formData.get("email") as string) || "",
          createdAt: new Date().toISOString(),
        };
      } else {
        // If 'profile' exists, update it with new values from the form
        const profileId = profile.id ? profile.id : `user-${Date.now()}`;
        updatedProfile = {
          ...profile,
          id: profileId,
          name: (formData.get("name") as string) || "",
          age: Number.parseInt(formData.get("age") as string) || undefined,
          gender: (formData.get("gender") as string) || undefined,
          pronouns: (formData.get("pronouns") as string) || undefined,
          city: (formData.get("city") as string) || undefined,
          region: (formData.get("region") as string) || undefined,
          occupation: (formData.get("occupation") as string) || undefined,
          monthly_income: Number.parseInt(formData.get("monthly_income") as string) || undefined,
          salary_day_1: Number.parseInt(formData.get("salary_day_1") as string) || undefined,
          salary_day_2: Number.parseInt(formData.get("salary_day_2") as string) || undefined,
          primary_bank: (formData.get("primary_bank") as string) || undefined,
          has_credit_card: formData.get("has_credit_card") === "true",
          e_wallets: (formData.get("e_wallets") as string) || undefined,
          preferred_channel: (formData.get("preferred_channel") as string) || undefined,
          language_style: (formData.get("language_style") as string) || undefined,
          risk_tolerance: (formData.get("risk_tolerance") as string) || undefined,
          savings_goal: Number.parseInt(formData.get("savings_goal") as string) || undefined,
          consent_personalization: (formData.get("consent_personalization") as string) || undefined,
          churn_risk: (formData.get("churn_risk") as string) || undefined,
          updatedAt: new Date().toISOString(),
          goals: profile.goals || [],
          anti_goals: profile.anti_goals || [],
          accessibility_needs: profile.accessibility_needs || [],
          other_banks: profile.other_banks || [],
          financialGoals: profile.goals || [],
          preferredChannels: profile.preferred_channel ? [profile.preferred_channel] : ["app push"],
          financialConcerns: profile.anti_goals || [],
          currentBankingProducts: profile.primary_bank ? [profile.primary_bank, ...(profile.other_banks || [])] : [],
        };
      }

      // The rest of your code remains unchanged, as `updatedProfile` is now always a valid UserProfile object
      try {
        await saveUser(updatedProfile);
        setAuthState({ isAuthenticated: true, user: updatedProfile });
        setProfile(updatedProfile);
        setSuccess("Profile saved successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        console.error("Failed to save profile:", err);
      } finally {
        setLoading(false);
      }
    }

  function handleArrayChange(field: keyof UserProfile, value: string, checked: boolean) {
    if (!profile) return

    const currentArray = (profile[field] as string[]) || []
    const newArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value)

    setProfile((prev) => (prev ? { ...prev, [field]: newArray } : null))
  }

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Complete Profile</h1>
            </div>
          </div>

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
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
                    Complete Profile Overview
                  </CardTitle>
                  <CardDescription>Your comprehensive banking persona</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3 text-primary">Personal Information</h3>
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
                          <span className="font-medium">Gender:</span> {profile.gender || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Pronouns:</span> {profile.pronouns || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {profile.city && profile.region ? `${profile.city}, ${profile.region}` : "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Occupation:</span> {profile.occupation || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-primary">Financial Profile</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Monthly Income:</span>{" "}
                          {profile.monthly_income ? `₱${profile.monthly_income.toLocaleString()}` : "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Salary Days:</span>{" "}
                          {[profile.salary_day_1, profile.salary_day_2].filter(Boolean).join(", ") || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Primary Bank:</span> {profile.primary_bank || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Other Banks:</span> {profile.other_banks?.join(", ") || "None"}
                        </p>
                        <p>
                          <span className="font-medium">Credit Card:</span> {profile.has_credit_card ? "Yes" : "No"}
                        </p>
                        <p>
                          <span className="font-medium">E-Wallets:</span> {profile.e_wallets || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Risk Tolerance:</span>{" "}
                          {profile.risk_tolerance || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Savings Goal:</span>{" "}
                          {profile.savings_goal ? `₱${profile.savings_goal.toLocaleString()}` : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2 text-primary">Communication Preferences</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p>
                          <span className="font-medium">Preferred Channel:</span>{" "}
                          {profile.preferred_channel || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Language Style:</span>{" "}
                          {profile.language_style || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Personalization:</span>{" "}
                          {profile.consent_personalization || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Churn Risk:</span> {profile.churn_risk || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 text-primary">Financial Goals</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.goals && profile.goals.length > 0 ? (
                          profile.goals.map((goal) => (
                            <span key={goal} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                              {goal}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No goals specified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 text-primary">Things to Avoid</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.anti_goals && profile.anti_goals.length > 0 ? (
                          profile.anti_goals.map((antiGoal) => (
                            <span key={antiGoal} className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">
                              {antiGoal}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No anti-goals specified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 text-primary">Accessibility Needs</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.accessibility_needs && profile.accessibility_needs.length > 0 ? (
                          profile.accessibility_needs.map((need) => (
                            <span key={need} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                              {need}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No accessibility needs specified</span>
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
                    <CardTitle className="text-primary">Personal Information</CardTitle>
                    <CardDescription>Basic information about yourself</CardDescription>
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
                        <Label htmlFor="gender">Gender</Label>
                        <Input
                          id="gender"
                          name="gender"
                          placeholder="Male, Female, Non-binary, etc."
                          defaultValue={profile.gender}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Input
                          id="pronouns"
                          name="pronouns"
                          placeholder="he/him, she/her, they/them"
                          defaultValue={profile.pronouns}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" placeholder="Manila, Cebu, Davao" defaultValue={profile.city} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          name="region"
                          placeholder="NCR, Central Visayas, etc."
                          defaultValue={profile.region}
                        />
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
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">Financial Information</CardTitle>
                    <CardDescription>Your financial profile and banking details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthly_income">Monthly Income (₱)</Label>
                        <Input
                          id="monthly_income"
                          name="monthly_income"
                          type="number"
                          min="0"
                          defaultValue={profile.monthly_income}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="savings_goal">Savings Goal (₱)</Label>
                        <Input
                          id="savings_goal"
                          name="savings_goal"
                          type="number"
                          min="0"
                          defaultValue={profile.savings_goal}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary_day_1">First Salary Day</Label>
                        <Input
                          id="salary_day_1"
                          name="salary_day_1"
                          type="number"
                          min="1"
                          max="31"
                          defaultValue={profile.salary_day_1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary_day_2">Second Salary Day</Label>
                        <Input
                          id="salary_day_2"
                          name="salary_day_2"
                          type="number"
                          min="1"
                          max="31"
                          defaultValue={profile.salary_day_2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primary_bank">Primary Bank</Label>
                        <Select name="primary_bank" defaultValue={profile.primary_bank}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {BANKS.map((bank) => (
                              <SelectItem key={bank} value={bank}>
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="e_wallets">E-Wallets</Label>
                        <Select name="e_wallets" defaultValue={profile.e_wallets}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select e-wallet" />
                          </SelectTrigger>
                          <SelectContent>
                            {E_WALLETS.map((wallet) => (
                              <SelectItem key={wallet} value={wallet}>
                                {wallet}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                        <Select name="risk_tolerance" defaultValue={profile.risk_tolerance}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk tolerance" />
                          </SelectTrigger>
                          <SelectContent>
                            {RISK_TOLERANCE.map((risk) => (
                              <SelectItem key={risk} value={risk}>
                                {risk}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Has Credit Card</Label>
                        <Select name="has_credit_card" defaultValue={profile.has_credit_card?.toString()}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Other Banks</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select all banks you use</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {BANKS.filter((bank) => bank !== profile.primary_bank).map((bank) => (
                          <div key={bank} className="flex items-center space-x-2">
                            <Checkbox
                              id={`bank-${bank}`}
                              checked={profile.other_banks?.includes(bank) || false}
                              onCheckedChange={(checked) => handleArrayChange("other_banks", bank, checked as boolean)}
                            />
                            <Label htmlFor={`bank-${bank}`} className="text-sm">
                              {bank}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">Communication Preferences</CardTitle>
                    <CardDescription>How you prefer to interact with banking services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferred_channel">Preferred Channel</Label>
                        <Select name="preferred_channel" defaultValue={profile.preferred_channel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred channel" />
                          </SelectTrigger>
                          <SelectContent>
                            {CHANNELS.map((channel) => (
                              <SelectItem key={channel} value={channel}>
                                {channel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language_style">Language Style</Label>
                        <Select name="language_style" defaultValue={profile.language_style}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language style" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_STYLES.map((style) => (
                              <SelectItem key={style} value={style}>
                                {style}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consent_personalization">Consent to Personalization</Label>
                        <Select name="consent_personalization" defaultValue={profile.consent_personalization}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select consent level" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONSENT_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="churn_risk">Churn Risk</Label>
                        <Select name="churn_risk" defaultValue={profile.churn_risk}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select churn risk" />
                          </SelectTrigger>
                          <SelectContent>
                            {CHURN_RISK.map((risk) => (
                              <SelectItem key={risk} value={risk}>
                                {risk}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">Goals & Preferences</CardTitle>
                    <CardDescription>Your financial goals and things you want to avoid</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Financial Goals</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {COMMON_GOALS.map((goal) => (
                          <div key={goal} className="flex items-center space-x-2">
                            <Checkbox
                              id={`goal-${goal}`}
                              checked={profile.goals?.includes(goal) || false}
                              onCheckedChange={(checked) => handleArrayChange("goals", goal, checked as boolean)}
                            />
                            <Label htmlFor={`goal-${goal}`} className="text-sm">
                              {goal}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Things to Avoid</Label>
                      <p className="text-sm text-muted-foreground mb-3">What you want to avoid</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {COMMON_ANTI_GOALS.map((antiGoal) => (
                          <div key={antiGoal} className="flex items-center space-x-2">
                            <Checkbox
                              id={`anti-goal-${antiGoal}`}
                              checked={profile.anti_goals?.includes(antiGoal) || false}
                              onCheckedChange={(checked) =>
                                handleArrayChange("anti_goals", antiGoal, checked as boolean)
                              }
                            />
                            <Label htmlFor={`anti-goal-${antiGoal}`} className="text-sm">
                              {antiGoal}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Accessibility Needs</Label>
                      <p className="text-sm text-muted-foreground mb-3">Any accessibility requirements</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ACCESSIBILITY_NEEDS.map((need) => (
                          <div key={need} className="flex items-center space-x-2">
                            <Checkbox
                              id={`accessibility-${need}`}
                              checked={profile.accessibility_needs?.includes(need) || false}
                              onCheckedChange={(checked) =>
                                handleArrayChange("accessibility_needs", need, checked as boolean)
                              }
                            />
                            <Label htmlFor={`accessibility-${need}`} className="text-sm">
                              {need}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pb-8">
                  <Button type="submit" disabled={loading} className="gap-2" style={{ backgroundColor: "#B91C1C" }}>
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
