"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

type Notification = {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      const res = await fetch(`${API_BASE}/api/notifications?type=subscription_reminder&limit=50`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })
      const json = await res.json()
      if (json?.success) setItems(json.data.items)
    } catch (e) {
      // noop
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (e) {
      // noop
    } finally {
      setMarkingAll(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Reminder Notifications</h1>
        <Button size="sm" onClick={markAllRead} disabled={markingAll}>
          {markingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Mark all read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No reminders
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((n) => (
                <li key={n._id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{n.title}</div>
                    {!n.read && <Badge variant="secondary">New</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


