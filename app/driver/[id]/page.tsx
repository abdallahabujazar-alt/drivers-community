"use client"

import { use } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Truck, 
  MapPin, 
  Clock, 
  Shield, 
  FileText, 
  CheckCircle2,
  AlertTriangle,
  Activity,
  Calendar,
  TrendingUp,
  ExternalLink
} from "lucide-react"
import { BackHeader, ComplianceBadge, ComplianceStatus, formatTime } from "@/components/korjournal/shared"
import Link from "next/link"

interface DriverProfile {
  id: string
  name: string
  employeeId: string
  vehicle: string
  vehiclePlate: string
  status: "DRIVING" | "WORKING" | "RESTING" | "OFFLINE"
  complianceScore: number
  totalKmThisMonth: number
  tripsThisMonth: number
  pendingActions: number
  lastActive: Date
}

interface AuditEvent {
  id: string
  timestamp: Date
  type: "TRIP_START" | "TRIP_END" | "SYNC" | "REST_START" | "REST_END" | "VALIDATION" | "LOCK" | "FLAG"
  description: string
  hash?: string
}

function StatusIndicator({ status }: { status: DriverProfile["status"] }) {
  const config = {
    DRIVING: { color: "bg-primary", label: "Kor" },
    WORKING: { color: "bg-amber-500", label: "Arbetar" },
    RESTING: { color: "bg-blue-500", label: "Vilar" },
    OFFLINE: { color: "bg-muted-foreground", label: "Offline" },
  }

  const { color, label } = config[status]

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color} ${status === "DRIVING" ? "animate-pulse" : ""}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          {trend && (
            <div className={`text-xs ${trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
              {trend === "up" ? "+5%" : trend === "down" ? "-3%" : "0%"}
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
          {subValue && (
            <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AuditEventRow({ event }: { event: AuditEvent }) {
  const iconConfig = {
    TRIP_START: { icon: Truck, color: "text-primary" },
    TRIP_END: { icon: MapPin, color: "text-destructive" },
    SYNC: { icon: Activity, color: "text-blue-400" },
    REST_START: { icon: Clock, color: "text-amber-400" },
    REST_END: { icon: Clock, color: "text-amber-400" },
    VALIDATION: { icon: CheckCircle2, color: "text-primary" },
    LOCK: { icon: Shield, color: "text-primary" },
    FLAG: { icon: AlertTriangle, color: "text-amber-500" },
  }

  const { icon: Icon, color } = iconConfig[event.type]

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className={`flex-shrink-0 mt-0.5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-foreground">{event.description}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(event.timestamp)}
          </span>
        </div>
        {event.hash && (
          <code className="text-xs text-muted-foreground font-mono mt-1 block truncate">
            {event.hash.substring(0, 16)}...
          </code>
        )}
      </div>
    </div>
  )
}

function ComplianceTimeline({ days }: { days: Array<{ date: Date; status: ComplianceStatus; restHours: number }> }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Compliance (7 dagar)</h3>
        <div className="flex justify-between gap-1">
          {days.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full h-16 rounded-lg flex items-end justify-center pb-1 ${
                  day.status === "OK"
                    ? "bg-primary/20"
                    : day.status === "WARNING"
                      ? "bg-amber-500/20"
                      : "bg-destructive/20"
                }`}
              >
                <div
                  className={`w-3/4 rounded-sm transition-all ${
                    day.status === "OK"
                      ? "bg-primary"
                      : day.status === "WARNING"
                        ? "bg-amber-500"
                        : "bg-destructive"
                  }`}
                  style={{ height: `${Math.min((day.restHours / 11) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {day.date.toLocaleDateString("sv-SE", { weekday: "short" }).charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>OK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Varning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>Violation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock data
function generateMockDriver(id: string): DriverProfile {
  return {
    id,
    name: "Lars Andersson",
    employeeId: "EMP-2024-0042",
    vehicle: "Volvo FH16",
    vehiclePlate: "ABC 123",
    status: "DRIVING",
    complianceScore: 94,
    totalKmThisMonth: 4523,
    tripsThisMonth: 87,
    pendingActions: 2,
    lastActive: new Date(),
  }
}

function generateMockAuditEvents(): AuditEvent[] {
  const now = new Date()
  const events: AuditEvent[] = []

  const types: Array<{ type: AuditEvent["type"]; desc: string }> = [
    { type: "TRIP_START", desc: "Resa startad fran Goteborg, Hisingen" },
    { type: "SYNC", desc: "Data synkroniserad med server" },
    { type: "TRIP_END", desc: "Resa avslutad i Boras, Centrum" },
    { type: "VALIDATION", desc: "Viloperiod validerad (11h 30m)" },
    { type: "LOCK", desc: "Resa 2024-0542 last och verifierad" },
    { type: "REST_START", desc: "Viloperiod startad" },
    { type: "SYNC", desc: "Data synkroniserad med server" },
    { type: "REST_END", desc: "Viloperiod avslutad (8h 15m)" },
    { type: "TRIP_START", desc: "Resa startad fran Boras" },
    { type: "FLAG", desc: "Varning: Kort viloperiod upptackt" },
  ]

  types.forEach((t, i) => {
    const timestamp = new Date(now.getTime() - i * 45 * 60 * 1000) // 45 min apart
    events.push({
      id: `event-${i}`,
      timestamp,
      type: t.type,
      description: t.desc,
      hash: t.type === "LOCK" ? "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069" : undefined,
    })
  })

  return events
}

function generateMockTimeline(): Array<{ date: Date; status: ComplianceStatus; restHours: number }> {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const statuses: ComplianceStatus[] = ["OK", "OK", "WARNING", "OK", "OK", "VIOLATION", "OK"]
    const hours = [11.5, 11, 9.5, 12, 11, 7, 11.5]
    return { date, status: statuses[i], restHours: hours[i] }
  })
}

export default function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const driver = generateMockDriver(resolvedParams.id)
  const auditEvents = generateMockAuditEvents()
  const timelineData = generateMockTimeline()

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackHeader title="Forardetaljer" href="/" />

      <main className="px-4 py-4 max-w-4xl mx-auto space-y-6">
        {/* Driver Profile Header */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{driver.name}</h2>
                    <p className="text-sm text-muted-foreground">{driver.employeeId}</p>
                  </div>
                  <StatusIndicator status={driver.status} />
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span>{driver.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{driver.vehiclePlate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Shield}
            label="Compliance"
            value={`${driver.complianceScore}%`}
            trend="up"
          />
          <StatCard
            icon={TrendingUp}
            label="Kilometer"
            value={driver.totalKmThisMonth.toLocaleString()}
            subValue="denna manad"
          />
          <StatCard
            icon={Calendar}
            label="Resor"
            value={driver.tripsThisMonth}
            subValue="denna manad"
          />
          <StatCard
            icon={AlertTriangle}
            label="Atgarder"
            value={driver.pendingActions}
            subValue="vantar"
          />
        </div>

        {/* Compliance Timeline */}
        <ComplianceTimeline days={timelineData} />

        {/* Compliance Score Detail */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Compliance-poang</h3>
              <ComplianceBadge status={driver.complianceScore >= 90 ? "OK" : driver.complianceScore >= 70 ? "WARNING" : "VIOLATION"} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aktuell score</span>
                <span className="font-semibold text-foreground">{driver.complianceScore}%</span>
              </div>
              <Progress value={driver.complianceScore} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Baserat pa viloperioder, korttider och dokumentation senaste 30 dagarna
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Immutable Audit Log */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Immutable Audit Log</h3>
              </div>
              <Link href="#" className="flex items-center gap-1 text-xs text-primary hover:underline">
                Visa alla
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-secondary rounded-lg p-1">
              <div className="divide-y divide-border">
                {auditEvents.map((event) => (
                  <AuditEventRow key={event.id} event={event} />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Alla handelser ar kryptografiskt signerade och oforanderliga
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
