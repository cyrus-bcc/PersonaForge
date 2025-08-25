"use client"

import Link from "next/link"
import type { PropsWithChildren } from "react"
import { Button } from "@/components/ui/button"
import { Crown, Home, PersonStanding, Sparkles, User, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getAuthState, logout } from "@/lib/auth"
import { useEffect, useState } from "react"
import type { AuthState } from "@/types/user"

type AppShellProps = PropsWithChildren<{ title?: string }>

export default function AppShell({ children, title = "PersonaForge" }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null })

  useEffect(() => {
    // Initial auth check
    setAuth(getAuthState())

    // Listen for auth state changes
    function handleAuthChange(event: CustomEvent) {
      setAuth(event.detail)
    }

    window.addEventListener("authStateChanged", handleAuthChange as EventListener)

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange as EventListener)
    }
  }, [])

  const nav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/chat", label: "Chat", icon: Sparkles },
  ]

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto]">
      {/* Header with a gradient background, consistent with the login page */}
      <header className="border-b-4 border-red-800 shadow-xl bg-gradient-to-r from-[#B91C1C] to-[#7F1D1D]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          {/* Logo and title section */}
          <Link href="/" className="flex items-center gap-2">
            <Crown className="h-7 w-7 text-white" aria-hidden="true" />
            <span className="font-bold text-2xl text-white tracking-tight">{title}</span>
            <span className="sr-only">Go to home</span>
          </Link>

          {/* Navigation and user menu section */}
          <div className="flex items-center gap-4">
            <nav aria-label="Main navigation" className="flex items-center gap-1">
              {nav.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2 text-white hover:bg-white/20 transition-colors",
                        active && "bg-white/30 hover:bg-white/30"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* User menu and auth actions */}
            <div className="flex items-center gap-2">
              {auth.isAuthenticated && auth.user ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" className="gap-2 text-white hover:bg-white/20 transition-colors">
                      <User className="h-4 w-4" />
                      {auth.user.name}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:bg-white/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="gap-2 border-white text-white hover:bg-white hover:text-red-700 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 overflow-y-auto">{children}</main>

    </div>
  )
}
