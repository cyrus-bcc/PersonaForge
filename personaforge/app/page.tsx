'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeCheck, BrainCircuit, Sparkles, UserCog2 } from 'lucide-react'
import RiveBadge from '@/components/rive-badge'
import AppShell from '@/components/app-shell'

export default function HomePage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              PersonaForge
            </h1>
            <p className="text-muted-foreground">
              An agentic AI system that builds and evolves a Synthetic Digital Twin Persona
              for each customer—enabling adaptive, emotionally aware banking experiences.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/personas">
                <Button>View Personas</Button>
              </Link>
              <Link href="/personas/new">
                <Button variant="outline">Create Persona</Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <UserCog2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Synthetic Personas</p>
                    <p className="text-sm text-muted-foreground">
                      Each user is represented by a behaviorally trained AI model.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Autonomous Personalization</p>
                    <p className="text-sm text-muted-foreground">
                      Real-time nudges and low-risk decisions across channels.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <BrainCircuit className="h-5 w-5 text-violet-600" />
                  <div>
                    <p className="font-medium">Evolution Loop</p>
                    <p className="text-sm text-muted-foreground">
                      Personas adapt from outcomes, behaviors, and micro-cues.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <BadgeCheck className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="font-medium">Context-Aware</p>
                    <p className="text-sm text-muted-foreground">
                      Communicates via channels and tones users intuitively trust.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border bg-card">
              <div className="p-4 sm:p-6">
                <RiveBadge
                  src="/animations/persona-badge.riv"
                  ariaLabel="Persona animation"
                  className="aspect-[4/3] w-full"
                />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Tip: drop a Rive file at {'/public/animations/persona-badge.riv'} or edit the path in RiveBadge.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
