"use client"

import { Check, AlertTriangle, XCircle, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export type ComplianceStatus = "OK" | "WARNING" | "VIOLATION"

export function ComplianceBadge({ status, size = "default" }: { status: ComplianceStatus; size?: "sm" | "default" }) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm"
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4"

  if (status === "OK") {
    return (
      <div className={`flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium bg-primary/20 text-primary`}>
        <Check className={iconSize} />
        <span>Compliant</span>
      </div>
    )
  }

  if (status === "WARNING") {
    return (
      <div className={`flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium bg-amber-500/20 text-amber-400`}>
        <AlertTriangle className={iconSize} />
        <span>Varning</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium bg-destructive/20 text-destructive`}>
      <XCircle className={iconSize} />
      <span>Violation</span>
    </div>
  )
}

export function StatusBadge({ 
  type, 
  size = "default" 
}: { 
  type: "LAST" | "UTKAST" | "FLAGGAD"
  size?: "sm" | "default" 
}) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4"

  if (type === "LAST") {
    return (
      <div className={`flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium bg-muted text-muted-foreground`}>
        <Lock className={iconSize} />
        <span>Last</span>
      </div>
    )
  }

  if (type === "UTKAST") {
    return (
      <div className={`flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium bg-blue-500/20 text-blue-400`}>
        <span>Utkast</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium bg-amber-500/20 text-amber-400`}>
      <AlertTriangle className={iconSize} />
      <span>Flaggad</span>
    </div>
  )
}

export function BackHeader({ title, href }: { title: string; href: string }) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
        <Link href={href}>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  )
}

export function formatHoursMinutes(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateHash(): string {
  const chars = "0123456789abcdef"
  let hash = ""
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// Community Types
export type DriverBadgeType = 
  | "COMMITTED_DRIVER" 
  | "ROAD_EXPERT" 
  | "COMMUNITY_HELPER" 
  | "REST_CHAMPION"
  | "NEWCOMER"

export interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  authorBadge: DriverBadgeType
  content: string
  type: "DIARY" | "STORY" | "TIP"
  likes: number
  comments: number
  createdAt: Date
  isLiked?: boolean
}

export interface QuickAlert {
  id: string
  authorName: string
  message: string
  location: string
  type: "TRAFFIC" | "REST_AREA" | "WEATHER" | "ROAD_WORK"
  createdAt: Date
  expiresAt: Date
}

export interface DriverProfile {
  id: string
  name: string
  badge: DriverBadgeType
  points: number
  totalRestHours: number
  joinedAt: Date
}

export function getDriverBadgeLabel(badge: DriverBadgeType): string {
  const labels: Record<DriverBadgeType, string> = {
    COMMITTED_DRIVER: "Självkörande",
    ROAD_EXPERT: "Vägexpert",
    COMMUNITY_HELPER: "Hjälpsam",
    REST_CHAMPION: "Vilomästare",
    NEWCOMER: "Nykomling",
  }
  return labels[badge]
}
