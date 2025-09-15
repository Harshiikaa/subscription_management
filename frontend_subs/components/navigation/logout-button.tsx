"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (e) {
      // noop
    } finally {
      logout()
      router.push("/")
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" className={className} onClick={handleLogout} disabled={loading}>
      <LogOut className="mr-2 h-4 w-4" /> {loading ? "Logging out..." : "Logout"}
    </Button>
  )
}


