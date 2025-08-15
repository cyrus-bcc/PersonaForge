"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAuthState } from "@/lib/auth"
import { Loader2 } from "lucide-react"

type AuthGuardProps = {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Public routes that don't require authentication
  const publicRoutes = ["/login"]

  useEffect(() => {
    const auth = getAuthState()
    setIsAuthenticated(auth.isAuthenticated)
    setIsChecking(false)

    // If not authenticated and not on a public route, redirect to login
    if (!auth.isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push("/login")
      return
    }
  }, [pathname, router])

  // Show loading spinner while checking auth
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // If not authenticated and not on public route, don't render anything
  // (redirect is happening in useEffect)
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
