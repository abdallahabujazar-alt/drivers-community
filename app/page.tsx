"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Truck,
  MapPin,
  Clock,
  Check,
  AlertTriangle,
  Cloud,
  CloudOff,
  Square,
  Coffee,
  Briefcase,
  Home,
  History,
  Timer,
  Settings,
  ChevronRight,
  Lock,
  FileEdit,
  Users,
  PenLine,
  Shield,
} from "lucide-react"
import Link from "next/link"

type WorkMode = "REDO" | "KORNING" | "RAST" | "ARBETE"
type ComplianceStatus = "OK" | "WARNING" | "VIOLATION"

interface TripData {
  startTime: Date
  startLocation: string
  distance: number
}

interface RestData {
  tank1Hours: number
  tank2Hours: number
  lastRestStart: Date | null
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function formatHoursMinutes(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

function getComplianceStatus(rest: RestData): ComplianceStatus {
  const totalRest = rest.tank1Hours + rest.tank2Hours
  if (rest.tank1Hours >= 3 && rest.tank2Hours >= 8) {
    return "OK"
  }
  if (totalRest >= 8) {
    return "WARNING"
  }
  return "VIOLATION"
}

function SyncStatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        isOnline
          ? "bg-primary/20 text-primary"
          : "bg-amber-500/20 text-amber-400"
      }`}
    >
      {isOnline ? (
        <>
          <Cloud className="w-4 h-4" />
          <span>Synkad</span>
        </>
      ) : (
        <>
          <CloudOff className="w-4 h-4" />
          <span>Offline</span>
        </>
      )}
    </div>
  )
}

function RestTank({
  label,
  currentHours,
  targetHours,
  className,
}: {
  label: string
  currentHours: number
  targetHours: number
  className?: string
}) {
  const percentage = Math.min((currentHours / targetHours) * 100, 100)
  const isComplete = currentHours >= targetHours
  const remaining = Math.max(targetHours - currentHours, 0)

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {isComplete && <Check className="w-4 h-4 text-primary" />}
      </div>
      <div className="relative h-28 bg-secondary rounded-lg overflow-hidden border border-border">
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
            isComplete ? "bg-primary" : "bg-primary/60"
          }`}
          style={{ height: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-lg font-bold text-foreground drop-shadow-sm">
            {formatHoursMinutes(currentHours)}
          </span>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground">
        {isComplete ? (
          <span className="text-primary">Uppfyllt</span>
        ) : (
          <span>{formatHoursMinutes(remaining)} kvar</span>
        )}
      </div>
    </div>
  )
}

function HoldToStopButton({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const holdDuration = 2000

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isHolding) {
      const startTime = Date.now()
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const newProgress = (elapsed / holdDuration) * 100

        if (newProgress >= 100) {
          setProgress(100)
          setIsHolding(false)
          onComplete()
        } else {
          setProgress(newProgress)
        }
      }, 16)
    } else {
      setProgress(0)
    }

    return () => clearInterval(interval)
  }, [isHolding, onComplete])

  return (
    <button
      className="relative w-full h-16 bg-destructive rounded-xl overflow-hidden min-h-[64px] active:scale-[0.98] transition-transform"
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
    >
      <div
        className="absolute inset-0 bg-white/20 transition-transform duration-100"
        style={{ transform: `translateX(${progress - 100}%)` }}
      />
      <div className="relative flex items-center justify-center gap-3 h-full text-white font-semibold text-lg">
        <Square className="w-6 h-6 fill-current" />
        <span>{isHolding ? "Fortsätt hålla..." : "Håll för att avsluta"}</span>
      </div>
    </button>
  )
}

function TodaySummary({
  trips,
  distance,
  workTime,
}: {
  trips: number
  distance: number
  workTime: number
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <h3 className="text-sm text-muted-foreground mb-3">Idag</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{trips}</div>
            <div className="text-xs text-muted-foreground">Resor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{distance.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">km</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{formatHoursMinutes(workTime)}</div>
            <div className="text-xs text-muted-foreground">Arbetstid</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const tabs = [
    { id: "home", label: "Hem", icon: Home },
    { id: "history", label: "Resor", icon: History },
    { id: "rest", label: "Vila", icon: Timer },
    { id: "settings", label: "Inst.", icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-full min-h-[48px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function DashboardScreen() {
  const [mode, setMode] = useState<WorkMode>("REDO")
  const [isOnline, setIsOnline] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const [elapsed, setElapsed] = useState(0)

  const [trip, setTrip] = useState<TripData>({
    startTime: new Date(),
    startLocation: "Göteborg, Hisingen",
    distance: 47.3,
  })

  const [rest, setRest] = useState<RestData>({
    tank1Hours: 3,
    tank2Hours: 8,
    lastRestStart: null,
  })

  const [todayStats] = useState({
    trips: 3,
    distance: 127.5,
    workTime: 6.5,
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (mode === "KORNING") {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [mode])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleStartTrip = useCallback(() => {
    setMode("KORNING")
    setElapsed(0)
    setTrip({
      startTime: new Date(),
      startLocation: "Aktuell plats",
      distance: 0,
    })
  }, [])

  const handleStopTrip = useCallback(() => {
    setMode("REDO")
    setElapsed(0)
  }, [])

  const complianceStatus = getComplianceStatus(rest)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <SyncStatusBadge isOnline={isOnline} />
          <span className="text-sm font-mono text-muted-foreground">
            {new Date().toLocaleTimeString("sv-SE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Active Trip Card or Ready State */}
        {mode === "KORNING" ? (
          <Card className="bg-card border-2 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-semibold uppercase tracking-wide">
                  Körning aktiv
                </span>
              </div>

              <div className="flex items-center justify-center mb-6">
                <Truck className="w-12 h-12 text-primary" />
              </div>

              <div className="text-center mb-6">
                <div className="font-mono text-5xl font-bold text-foreground mb-2">
                  {formatDuration(elapsed)}
                </div>
                <div className="text-sm text-muted-foreground">Körtid</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-muted-foreground">Från</div>
                    <div className="text-foreground">{trip.startLocation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-muted-foreground">Till</div>
                    <div className="text-foreground">Pågående...</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-muted-foreground">Distans</div>
                    <div className="text-foreground">{trip.distance.toFixed(1)} km</div>
                  </div>
                </div>
              </div>

              <HoldToStopButton onComplete={handleStopTrip} />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-4">
                  <Truck className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Redo att köra</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tryck på knappen för att starta en ny resa
                </p>
              </div>

              <Button
                onClick={handleStartTrip}
                className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground min-h-[64px]"
              >
                <Truck className="w-6 h-6 mr-3" />
                Starta körning
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Rest Status Widget */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Vila-status (24 timmar)</h3>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  complianceStatus === "OK"
                    ? "bg-primary/20 text-primary"
                    : complianceStatus === "WARNING"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-destructive/20 text-destructive"
                }`}
              >
                {complianceStatus === "OK" ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Compliant</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>{complianceStatus === "WARNING" ? "Varning" : "Överträdelse"}</span>
                  </>
                )}
              </div>
            </div>

            {/* Total rest progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total vila</span>
                <span className="text-foreground font-mono">
                  {formatHoursMinutes(rest.tank1Hours + rest.tank2Hours)} / 11h
                </span>
              </div>
              <Progress
                value={Math.min(((rest.tank1Hours + rest.tank2Hours) / 11) * 100, 100)}
                className="h-2"
              />
            </div>

            {/* Two-tank visualization */}
            <div className="grid grid-cols-2 gap-4">
              <RestTank label="Del 1 (min 3h)" currentHours={rest.tank1Hours} targetHours={3} />
              <RestTank label="Del 2 (min 8h)" currentHours={rest.tank2Hours} targetHours={8} />
            </div>

            {complianceStatus === "OK" && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-primary text-sm">
                  <Check className="w-4 h-4" />
                  <span>Du har vilat tillräckligt för att köra lagligt</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Mode Switcher */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Snabbatgarder</h3>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={mode === "RAST" ? "default" : "secondary"}
                onClick={() => setMode("RAST")}
                className="flex-col h-auto py-3 min-h-[48px]"
              >
                <Coffee className="w-5 h-5 mb-1" />
                <span className="text-xs">Rast</span>
              </Button>
              <Button
                variant={mode === "ARBETE" ? "default" : "secondary"}
                onClick={() => setMode("ARBETE")}
                className="flex-col h-auto py-3 min-h-[48px]"
              >
                <Briefcase className="w-5 h-5 mb-1" />
                <span className="text-xs">Arbete</span>
              </Button>
              <Link href="/notes">
                <Button
                  variant="secondary"
                  className="flex-col h-auto py-3 min-h-[48px] w-full"
                >
                  <PenLine className="w-5 h-5 mb-1" />
                  <span className="text-xs">Notera</span>
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setMode("REDO")}
                className="flex-col h-auto py-3 min-h-[48px]"
              >
                <Clock className="w-5 h-5 mb-1" />
                <span className="text-xs">Avsluta</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Driver Protection Card - NEW */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">Din korjournal skyddar dig</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Dokumentera resor och viktiga handelser. Dina privata anteckningar ar krypterade 
                  och kan anvandas som bevis vid tvister.
                </p>
                <Link href="/notes">
                  <Button variant="outline" size="sm" className="h-9">
                    <PenLine className="w-4 h-4 mr-2" />
                    Oppna mina anteckningar
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today Summary */}
        <TodaySummary {...todayStats} />

        {/* Recent Trips */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Senaste resor</h3>
              <Link href="/rest-history" className="text-xs text-primary hover:underline">
                Visa alla
              </Link>
            </div>
            <div className="space-y-2">
              {/* Locked trip */}
              <Link href="/trip/1">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Goteborg - Boras</div>
                      <div className="text-xs text-muted-foreground">Igar 14:30 - 68 km</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
              {/* Draft trip */}
              <Link href="/trip/2">
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20">
                      <FileEdit className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Boras - Jonkoping</div>
                      <div className="text-xs text-muted-foreground">Idag 09:15 - 82 km - Utkast</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links for Demo */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Fler funktioner</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/notes">
                <Button variant="outline" className="w-full h-12 text-sm">
                  <PenLine className="w-4 h-4 mr-2" />
                  Anteckningar
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-12 text-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Installningar
                </Button>
              </Link>
              <Link href="/rest-history">
                <Button variant="outline" className="w-full h-12 text-sm">
                  <Timer className="w-4 h-4 mr-2" />
                  Vilohistorik
                </Button>
              </Link>
              <Link href="/fleet">
                <Button variant="outline" className="w-full h-12 text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Flottvy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
