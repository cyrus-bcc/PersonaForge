'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/app-shell'
import { getPersona } from '@/lib/api'
import type { Persona } from '@/types/persona'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageSquareQuote, PhoneCall, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function PersonaDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [persona, setPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPersona(params.id)
        if (mounted) setPersona(data)
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load persona')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {loading && <div className="h-36 animate-pulse rounded-lg border bg-muted/30" />}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {persona && (
          <section className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src="/persona-avatar-placeholder.png"
                      alt={`Avatar of ${persona.name}`}
                    />
                    <AvatarFallback>{persona.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{persona.name}</p>
                    <p className="text-xs text-muted-foreground">{persona.tonePreference} tone</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{persona.status}</Badge>
                  <Badge variant="outline">{persona.riskAffinity}</Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Preferred Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {persona.contactChannels.map((c) => (
                      <Badge key={c} variant="outline">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardContent className="space-y-3 p-4">
                  <p className="text-sm text-muted-foreground">Summary</p>
                  <p className="leading-relaxed">{persona.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 p-4">
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {persona.goals.map((g) => (
                      <Badge key={g} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <MessageSquareQuote className="mr-2 h-4 w-4" />
                  Simulate Conversation
                </Button>
                <Button variant="outline">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Whisper Mode
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Persona
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </AppShell>
  )
}
