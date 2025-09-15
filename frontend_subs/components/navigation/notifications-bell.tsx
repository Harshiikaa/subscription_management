"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type Notification = {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

type PagedResponse<T> = {
  success: boolean
  message: string
  data: {
    items: T[]
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const router = useRouter()

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items])

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      const res = await fetch(`${API_BASE}/api/notifications?limit=10`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })
      const json: PagedResponse<Notification> = await res.json()
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

  const markOneRead = async (id: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    } catch (e) {
      // noop
    }
  }

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={(e) => {
            // If user intends to open the menu, allow default; if they click the icon, navigate to full page
            if (e.shiftKey || e.metaKey || e.ctrlKey) return
            router.push("/dashboard/notifications")
          }}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px] pointer-events-none select-none" variant="destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={markingAll || unreadCount === 0}>
            {markingAll ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-3 w-3" />
            )}
            Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              items.map((n) => (
                <DropdownMenuItem
                  key={n._id}
                  className={"flex flex-col items-start gap-0.5 py-2 " + (!n.read ? "bg-muted/40" : "")}
                  onClick={() => markOneRead(n._id)}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {!n.read && <Badge variant="secondary">New</Badge>}
                  </div>
                  <div className="w-full font-medium text-sm">{n.title}</div>
                  <div className="w-full text-xs text-muted-foreground">{n.message}</div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


