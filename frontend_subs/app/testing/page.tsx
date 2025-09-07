"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MainNav } from "@/components/navigation/main-nav"
import { TestPanel } from "@/components/testing/test-panel"
import { isAdmin } from "@/lib/auth"

export default function TestingPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (!isAdmin(user)) {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || !isAdmin(user)) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Testing & Development Tools</h1>
          <p className="text-muted-foreground text-pretty">
            Comprehensive testing tools and demo data generation for platform development.
          </p>
        </div>

        <TestPanel />
      </div>
    </div>
  )
}
