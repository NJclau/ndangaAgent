"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  MessageSquare,
  Target,
  Settings,
  HardHat,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { auth } from "@/lib/firebase/config"
import { Logo } from "./logo"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import type { UserProfile } from "@/lib/types"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/leads", label: "Leads", icon: MessageSquare },
  { href: "/dashboard/targets", label: "Targets", icon: Target },
]

const bottomMenuItems = [
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default function AppSidebar({ isMobile = false, userProfile }: { isMobile?: boolean, userProfile: UserProfile | null }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const handleLogout = () => {
    auth.signOut()
  }
  
  const navClass = isMobile
    ? "grid gap-2 text-lg font-medium"
    : "hidden border-r bg-background md:block"

  const navContent = (
    <div className={cn("flex h-full max-h-screen flex-col gap-2", isMobile && "p-4")}>
      {!isMobile && (
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Logo />
        </div>
      )}
      <div className="flex-1">
        <nav className={cn("grid items-start gap-1 px-2 text-sm font-medium lg:px-4", isMobile && "gap-2 text-base")}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {!isMobile && userProfile && (
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Credits</CardTitle>
              <CardDescription className="text-xs">{userProfile.plan} plan</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <div className="text-center text-xs text-muted-foreground mb-2">
                {userProfile.credits || 0} / 100 used
              </div>
              <Progress value={userProfile.credits || 0} aria-label={`${userProfile.credits || 0}% credits used`} />
            </CardContent>
          </Card>
          <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4 mt-4">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div className={cn("mt-auto p-4 border-t", !isMobile && "hidden")}>
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>

    </div>
  )

  if (isMobile) {
    return navContent
  }

  return <div className={navClass}>{navContent}</div>
}
