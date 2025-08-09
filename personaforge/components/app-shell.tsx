"use client"

import Link from "next/link"
import type { PropsWithChildren } from "react"
import { Button } from "@/components/ui/button"
import { Banknote, Home, PersonStanding, Sparkles } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type AppShellProps = PropsWithChildren<{
  title?: string
}>

export default function AppShell({ children, title = "PersonaForge" }: AppShellProps) {
  const pathname = usePathname()
  const nav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/personas", label: "Personas", icon: PersonStanding },
    { href: "/chat", label: "Chat", icon: Sparkles },
  ]

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <span className="font-semibold">{title}</span>
            <span className="sr-only">Go to home</span>
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={cn("gap-2", active && "bg-emerald-600 text-white hover:bg-emerald-600")}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <div>{children}</div>

      <footer className="border-t bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          Built with React, Next.js, and shadcn/ui. Connect to Django DRF via NEXT_PUBLIC_API_BASE_URL.
        </div>
      </footer>
    </div>
  )
}
