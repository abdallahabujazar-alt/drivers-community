"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Search,
  Truck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  X,
  ChevronRight,
  Lock,
  PenLine,
  Hash,
  Calendar,
  FileSpreadsheet,
  File,
  Eye,
  Loader2,
} from "lucide-react"
import { BackHeader, ComplianceBadge, StatusBadge, generateHash, formatTime } from "@/components/korjournal/shared"
import Link from "next/link"

interface Driver {
  id: string
  name: string
  vehicle: string
  vehiclePlate: string
  status: "DRIVING" | "WORKING" | "RESTING" | "OFFLINE"
  complianceScore: number
  pendingCorrections: number
}

interface Trip {
  id: string
  driverId: string
  driverName: string
  date: Date
  startLocation: string
  endLocation: string
  distance: number
  purpose: "TJANST" | "PRIVAT"
  status: "LAST" | "UTKAST" | "FLAGGAD" | "KORRIGERAD"
  hash?: string
  amendment?: Amendment
}

interface Amendment {
  id: string
  originalTripId: string
  createdAt: Date
  createdBy: string
  reason: string
  changes: string
  hash: string
}

// Mock data
const mockDrivers: Driver[] = [
  { id: "1", name: "Lars Andersson", vehicle: "Volvo FH16", vehiclePlate: "ABC 123", status: "DRIVING", complianceScore: 94, pendingCorrections: 0 },
  { id: "2", name: "Erik Johansson", vehicle: "Scania R500", vehiclePlate: "DEF 456", status: "RESTING", complianceScore: 87, pendingCorrections: 2 },
  { id: "3", name: "Maria Nilsson", vehicle: "MAN TGX", vehiclePlate: "GHI 789", status: "WORKING", complianceScore: 92, pendingCorrections: 1 },
  { id: "4", name: "Johan Svensson", vehicle: "DAF XF", vehiclePlate: "JKL 012", status: "OFFLINE", complianceScore: 78, pendingCorrections: 3 },
]

const mockTrips: Trip[] = [
  {
    id: "trip-1",
    driverId: "2",
    driverName: "Erik Johansson",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    startLocation: "Stockholm",
    endLocation: "Uppsala",
    distance: 71,
    purpose: "PRIVAT",
    status: "FLAGGAD",
    hash: generateHash(),
  },
  {
    id: "trip-2",
    driverId: "3",
    driverName: "Maria Nilsson",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    startLocation: "Goteborg",
    endLocation: "Boras",
    distance: 68,
    purpose: "TJANST",
    status: "LAST",
    hash: generateHash(),
  },
  {
    id: "trip-3",
    driverId: "4",
    driverName: "Johan Svensson",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    startLocation: "Malmo",
    endLocation: "Lund",
    distance: 22,
    purpose: "PRIVAT",
    status: "KORRIGERAD",
    hash: generateHash(),
    amendment: {
      id: "amend-1",
      originalTripId: "trip-3",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdBy: "Sven Larsson",
      reason: "Fel resetyp vald av forare",
      changes: "Andrat fran Privat till Tjansteresa",
      hash: generateHash(),
    },
  },
]

function StatusIndicator({ status }: { status: Driver["status"] }) {
  const config = {
    DRIVING: { color: "bg-primary", label: "Kor" },
    WORKING: { color: "bg-amber-500", label: "Arbetar" },
    RESTING: { color: "bg-blue-500", label: "Vilar" },
    OFFLINE: { color: "bg-muted-foreground", label: "Offline" },
  }
  const { color, label } = config[status]
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color} ${status === "DRIVING" ? "animate-pulse" : ""}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function DriverRow({ driver }: { driver: Driver }) {
  return (
    <Link href={`/driver/${driver.id}`}>
      <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border last:border-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
            <Truck className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-foreground">{driver.name}</div>
            <div className="text-xs text-muted-foreground">{driver.vehiclePlate} - {driver.vehicle}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusIndicator status={driver.status} />
          <div className="text-right">
            <div className={`text-sm font-semibold ${driver.complianceScore >= 90 ? "text-primary" : driver.complianceScore >= 70 ? "text-amber-400" : "text-destructive"}`}>
              {driver.complianceScore}%
            </div>
            {driver.pendingCorrections > 0 && (
              <div className="text-xs text-amber-400">{driver.pendingCorrections} korr.</div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}

function CorrectionModal({
  trip,
  onClose,
  onSubmit,
}: {
  trip: Trip
  onClose: () => void
  onSubmit: (reason: string, changes: string) => void
}) {
  const [reason, setReason] = useState("")
  const [changes, setChanges] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim() || !changes.trim()) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    onSubmit(reason, changes)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10">
              <PenLine className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Skapa korrigering</h2>
              <p className="text-xs text-muted-foreground">Audited Amendment Protocol</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Original Trip Info */}
        <div className="p-4 bg-secondary/50 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Originalresa (Last)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Forare:</span>
              <span className="text-foreground ml-2">{trip.driverName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Datum:</span>
              <span className="text-foreground ml-2">{trip.date.toLocaleDateString("sv-SE")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stracka:</span>
              <span className="text-foreground ml-2">{trip.startLocation} - {trip.endLocation}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Typ:</span>
              <span className="text-foreground ml-2">{trip.purpose === "TJANST" ? "Tjanst" : "Privat"}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Hash className="w-3 h-3 text-muted-foreground" />
            <code className="text-xs font-mono text-muted-foreground">{trip.hash?.substring(0, 32)}...</code>
          </div>
        </div>

        {/* Amendment Form */}
        <div className="p-4 space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-200">
                Enligt Skatteverkets regler kan lasta loggar inte andras direkt. 
                Denna korrigering kommer att lankas till originalresan med en ny kryptografisk signatur.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Orsak till korrigering</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Beskriv varfor denna korrigering behovs..."
              className="bg-secondary border-border min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Korrigerad information</label>
            <Textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Ange den korrekta informationen..."
              className="bg-secondary border-border min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
            onClick={handleSubmit}
            disabled={!reason.trim() || !changes.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Skapar...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Skapa korrigering
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ExportModal({ onClose }: { onClose: () => void }) {
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(["all"])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  // Mock export data
  const exportData = {
    totalTrips: 847,
    totalKm: 34521,
    totalTjanst: 31245,
    totalPrivat: 3276,
    verifiedHashes: 842,
    pendingReview: 5,
    drivers: 4,
    dateRange: "2024-01-01 - 2024-01-31",
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 2000))
    setIsGenerating(false)
    setIsGenerated(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Exportera till Skatteverket</h2>
              <p className="text-xs text-muted-foreground">Skapa revisionsredo rapport</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!isGenerated ? (
          <>
            {/* Date Range Selection */}
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Valj datumintervall
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Fran datum</label>
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Till datum</label>
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
            </div>

            {/* Driver Selection */}
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Valj forare
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedDrivers(["all"])}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedDrivers.includes("all")
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Alla forare</span>
                  </div>
                  {selectedDrivers.includes("all") && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </button>
                {mockDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => {
                      if (selectedDrivers.includes("all")) {
                        setSelectedDrivers([driver.id])
                      } else if (selectedDrivers.includes(driver.id)) {
                        setSelectedDrivers(selectedDrivers.filter((id) => id !== driver.id))
                      } else {
                        setSelectedDrivers([...selectedDrivers, driver.id])
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      !selectedDrivers.includes("all") && selectedDrivers.includes(driver.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>{driver.name}</span>
                      <span className="text-xs text-muted-foreground">({driver.vehiclePlate})</span>
                    </div>
                    {!selectedDrivers.includes("all") && selectedDrivers.includes(driver.id) && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="p-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Genererar forhandsvisning...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 mr-2" />
                    Forhandsvisa rapport
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Export Preview */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-center text-lg font-semibold text-foreground mb-1">
                Rapport redo for export
              </h3>
              <p className="text-center text-sm text-muted-foreground">
                {exportData.dateRange}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-secondary rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">{exportData.totalTrips}</div>
                <div className="text-xs text-muted-foreground">Totala resor</div>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">{exportData.totalKm.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Kilometer</div>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{exportData.totalTjanst.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Tjanst km</div>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-400">{exportData.totalPrivat.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Privat km</div>
              </div>
            </div>

            {/* Hash Verification */}
            <div className="mx-4 mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground">Kryptografisk verifiering</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Verifierade hashar</span>
                  <span className="font-semibold text-primary">{exportData.verifiedHashes} / {exportData.totalTrips}</span>
                </div>
                <Progress value={(exportData.verifiedHashes / exportData.totalTrips) * 100} className="h-2" />
                {exportData.pendingReview > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-400">
                      {exportData.pendingReview} resor vantar pa granskning
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="p-4 space-y-3">
              <Button className="w-full h-14 text-lg bg-primary hover:bg-primary/90">
                <File className="w-5 h-5 mr-2" />
                Ladda ner PDF (Signerad)
              </Button>
              <Button variant="outline" className="w-full h-12">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Ladda ner Excel (CSV)
              </Button>
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />
                Alla filer inkluderar kryptografisk verifiering
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TripRow({ trip, onCorrect }: { trip: Trip; onCorrect: (trip: Trip) => void }) {
  return (
    <div className="border-b border-border last:border-0">
      <div className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
            trip.status === "LAST" ? "bg-muted" :
            trip.status === "FLAGGAD" ? "bg-amber-500/10" :
            trip.status === "KORRIGERAD" ? "bg-blue-500/10" :
            "bg-secondary"
          }`}>
            {trip.status === "LAST" && <Lock className="w-5 h-5 text-muted-foreground" />}
            {trip.status === "FLAGGAD" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {trip.status === "KORRIGERAD" && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
            {trip.status === "UTKAST" && <Clock className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div>
            <div className="font-medium text-foreground">{trip.driverName}</div>
            <div className="text-sm text-muted-foreground">
              {trip.startLocation} - {trip.endLocation} ({trip.distance} km)
            </div>
            <div className="text-xs text-muted-foreground">
              {trip.date.toLocaleDateString("sv-SE")} | {trip.purpose === "TJANST" ? "Tjanst" : "Privat"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {trip.status === "KORRIGERAD" ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
              <CheckCircle2 className="w-3 h-3" />
              Korrigerad
            </div>
          ) : trip.status === "FLAGGAD" ? (
            <Button
              size="sm"
              variant="outline"
              className="text-amber-400 border-amber-400/50 hover:bg-amber-400/10"
              onClick={() => onCorrect(trip)}
            >
              <PenLine className="w-4 h-4 mr-1" />
              Korrigera
            </Button>
          ) : (
            <StatusBadge type={trip.status} size="sm" />
          )}
        </div>
      </div>
      {trip.amendment && (
        <div className="mx-4 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <PenLine className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Tillagg ({trip.amendment.createdAt.toLocaleDateString("sv-SE")})</div>
              <div className="text-xs text-muted-foreground mt-1">
                <strong>Orsak:</strong> {trip.amendment.reason}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Andring:</strong> {trip.amendment.changes}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <code className="font-mono">{trip.amendment.hash.substring(0, 24)}...</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FleetDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [trips, setTrips] = useState(mockTrips)

  const fleetStats = {
    totalDrivers: mockDrivers.length,
    activeNow: mockDrivers.filter((d) => d.status === "DRIVING").length,
    avgCompliance: Math.round(mockDrivers.reduce((a, b) => a + b.complianceScore, 0) / mockDrivers.length),
    pendingActions: mockDrivers.reduce((a, b) => a + b.pendingCorrections, 0),
  }

  const handleCorrection = (reason: string, changes: string) => {
    if (!selectedTrip) return
    
    const amendment: Amendment = {
      id: `amend-${Date.now()}`,
      originalTripId: selectedTrip.id,
      createdAt: new Date(),
      createdBy: "Sven Larsson",
      reason,
      changes,
      hash: generateHash(),
    }

    setTrips(trips.map((t) =>
      t.id === selectedTrip.id
        ? { ...t, status: "KORRIGERAD" as const, amendment }
        : t
    ))
    setSelectedTrip(null)
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackHeader title="Flotthantering" href="/" />

      <main className="px-4 py-4 max-w-6xl mx-auto space-y-6">
        {/* Fleet Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{fleetStats.totalDrivers}</div>
              <div className="text-xs text-muted-foreground">Forare totalt</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{fleetStats.activeNow}</div>
              <div className="text-xs text-muted-foreground">Kor just nu</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{fleetStats.avgCompliance}%</div>
              <div className="text-xs text-muted-foreground">Snitt compliance</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-400">{fleetStats.pendingActions}</div>
              <div className="text-xs text-muted-foreground">Vantar atgard</div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <Button
          onClick={() => setShowExportModal(true)}
          className="w-full h-14 bg-primary hover:bg-primary/90"
        >
          <Download className="w-5 h-5 mr-2" />
          Exportera till Skatteverket
        </Button>

        {/* Drivers List */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Forare</h3>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Sok forare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary border-border pl-9 h-9"
                />
              </div>
            </div>
            <div>
              {mockDrivers
                .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((driver) => (
                  <DriverRow key={driver.id} driver={driver} />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Trips Requiring Attention */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-foreground">Resor som kraver atgard</h3>
              </div>
            </div>
            <div>
              {trips.map((trip) => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  onCorrect={(t) => setSelectedTrip(t)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Correction Modal */}
      {selectedTrip && (
        <CorrectionModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onSubmit={handleCorrection}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  )
}
