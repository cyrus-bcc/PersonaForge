"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, BrainCircuit, Sparkles, UserCog2, Crown } from "lucide-react"
import RiveBadge from "@/components/rive-badge"
import AppShell from "@/components/app-shell"
import Image from "next/image" // Import the Image component

export default function HomePage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-20">
        {/* Hero Section */}
        <section className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Crown className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bpi-text-gradient">PersonaForge</h1>            </div>
            <div className="space-y-4">
              <p className="text-xl text-primary font-bold">For the People. Forged for You.</p>
              <p className="text-lg text-muted-foreground">
                An agentic AI system that builds and evolves a Synthetic Digital Twin Persona for each customer—enabling
                adaptive, emotionally aware banking experiences. Unlike conventional systems, PersonaForge integrates personalization, contextual awareness, and adaptive learning to provide financial insights unique to each individual.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/chat">
                <Button style={{ backgroundColor: "#7F1D1D", color: "white" }} className="gap-2 hover:opacity-90">
                  <Sparkles className="h-4 w-4" />
                  Open Chat
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Core Capabilities</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-primary/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <UserCog2 className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Synthetic Personas</h3>
                <p className="text-sm text-muted-foreground">
                  Each user is represented by a behaviorally trained AI model based on financial behaviors and personal goals.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Autonomous Personalization</h3>
                <p className="text-sm text-muted-foreground">
                  Provides real-time nudges, insights, and tailored recommendations across channels.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Evolution Loop</h3>
                <p className="text-sm text-muted-foreground">
                  Personas adapt from outcomes, user behaviors, and micro-cues to maintain continuity and relevance.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <BadgeCheck className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Context-Aware</h3>
                <p className="text-sm text-muted-foreground">
                  Leverages chat history to recall past discussions and provide consistent, human-like responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology/Methodology Section */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Methodology</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Integration (OpenAI)</h3>
                <p className="text-sm text-muted-foreground">
                  The core intelligence is powered by OpenAI, an AI system for real-time query generation and contextual understanding.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <UserCog2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Robust System Architecture</h3>
                <p className="text-sm text-muted-foreground">
                  A full-stack model with a dynamic React.js frontend and a secure, scalable PostgreSQL backend.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Data-Driven Personalization</h3>
                <p className="text-sm text-muted-foreground">
                  Leverages three datasets: Transactions, Personal Information, and Chat History for hyper-personalized responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Creators Section */}
        <section className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-8">Meet the Proponents</h2>
          <div className="flex flex-wrap justify-center gap-16">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 mx-auto ring-4 ring-red-800">
                <Image
                  src="/images/nicoz.png"
                  alt="Cyrus"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold">Nicolai Alcaraz</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 mx-auto ring-4 ring-red-800">
                <Image
                  src="/images/gian.png"
                  alt="Cyrus"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold">Gian Bernales</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 mx-auto ring-4 ring-red-800">
                <Image
                  src="/images/cyrus.png"
                  alt="Cyrus"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold">Cyrus Canape</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 mx-auto ring-4 ring-red-800">
                <Image
                  src="/images/racell.jpg"
                  alt="Cyrus"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold">Racell Sincioco</p>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  )
}