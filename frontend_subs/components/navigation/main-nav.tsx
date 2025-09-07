"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { UserNav } from "./user-nav"
import { isAdmin } from "@/lib/auth"

export function MainNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      show: isAuthenticated,
    },
    {
      title: "Products",
      href: "/products",
      show: isAuthenticated,
    },
    {
      title: "Subscriptions",
      href: "/dashboard/subscriptions",
      show: isAuthenticated,
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      show: isAuthenticated,
    },
    {
      title: "Admin",
      href: "/admin",
      show: isAuthenticated && isAdmin(user),
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">SaaS Platform</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  {item.title}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
