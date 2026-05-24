"use client"

import { useState, use } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin, 
  Clock, 
  Gauge, 
  Lock, 
  Shield, 
  Copy, 
  Check,
  Briefcase,
  User,
  PenLine,
  Plus,
  Camera,
  AlertTriangle,
} from "lucide-react"
import { BackHeader, StatusBadge, formatTime, generateHash } from "@/components/korjournal/shared"

interface TripDetail {
  id: string
  status: "LAST" | "UTKAST" | "FLAGGAD"
  date: Date
  startTime: Date
  endTime: Date
  startLocation: string
  endLocation: string
  startOdometer: number
  endOdometer: number
  distance: number
  purpose: "TJANST" | "PRIVAT" | null
  notes: string
  hash: string
  privateNotes: PrivateNote[]
}

interface PrivateNote {
  id: string
  timestamp: Date
  content: string
  type: "text" | "photo" | "incident"
}

function MapPlaceholder() {
  return (
    <div className="relative w-full h-48 bg-secondary rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <span className="text-sm">Kartvy</span>
        </div>
      </div>
      {/* Route line visualization */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M 20 70 Q 40 30 60 50 T 80 30"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="4 2"
          opacity="0.6"
        />
        <circle cx="20" cy="70" r="4" fill="hsl(var(--primary))" />
        <circle cx="80" cy="30" r="4" fill="hsl(var(--destructive))" />
      </svg>
    </div>
  )
}

function AuditSeal({ hash, isLocked }: { hash: string; isLocked: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isLocked) return null

  return (
    <Card className="bg-card border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Verifierad och Last</h3>
            <p className="text-xs text-muted-foreground">Skatteverket-klar</p>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">SHA-256 Hash</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Kopierad
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Kopiera
                </>
              )}
            </Button>
          </div>
          <code className="text-xs font-mono text-foreground break-all leading-relaxed">
            {hash}
          </code>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Denna resa ar kryptografiskt forseglad och kan inte andras</span>
        </div>
      </CardContent>
    </Card>
  )
}

function PurposeSelector({
  value,
  onChange,
  disabled,
}: {
  value: "TJANST" | "PRIVAT" | null
  onChange: (value: "TJANST" | "PRIVAT") => void
  disabled: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => !disabled && onChange("TJANST")}
        disabled={disabled}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[80px] ${
          value === "TJANST"
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-muted-foreground"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {disabled && (
          <Lock className="absolute top-2 right-2 w-4 h-4 text-muted-foreground" />
        )}
        <Briefcase className={`w-6 h-6 mb-2 ${value === "TJANST" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-sm font-medium ${value === "TJANST" ? "text-primary" : "text-foreground"}`}>
          Tjansteresa
        </span>
      </button>

      <button
        onClick={() => !disabled && onChange("PRIVAT")}
        disabled={disabled}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[80px] ${
          value === "PRIVAT"
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-muted-foreground"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {disabled && (
          <Lock className="absolute top-2 right-2 w-4 h-4 text-muted-foreground" />
        )}
        <User className={`w-6 h-6 mb-2 ${value === "PRIVAT" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-sm font-medium ${value === "PRIVAT" ? "text-primary" : "text-foreground"}`}>
          Privat
        </span>
      </button>
    </div>
  )
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  // Mock trip data - in production this would come from API/storage
  const [trip, setTrip] = useState<TripDetail>({
    id: resolvedParams.id,
    status: resolvedParams.id === "1" ? "LAST" : "UTKAST",
    date: new Date(),
    startTime: new Date(Date.now() - 3600000 * 2),
    endTime: new Date(Date.now() - 3600000),
    startLocation: "Goteborg, Hisingen",
    endLocation: "Boras, Centrum",
    startOdometer: 145823,
    endOdometer: 145891,
    distance: 68,
    purpose: resolvedParams.id === "1" ? "TJANST" : null,
    notes: resolvedParams.id === "1" ? "Leverans till kund ABC" : "",
    hash: generateHash(),
    privateNotes: resolvedParams.id === "1" ? [
      {
        id: "pn1",
        timestamp: new Date(Date.now() - 3600000 * 1.5),
        content: "Kraftig trafik vid Boras infart, blev 20 min forsenad",
        type: "text",
      },
      {
        id: "pn2",
        timestamp: new Date(Date.now() - 3600000 * 1.2),
        content: "Kund var nojd med leveransen, signerade utan anmarkningar",
        type: "text",
      },
    ] : [],
  })

  const [newPrivateNote, setNewPrivateNote] = useState("")

  const isLocked = trip.status === "LAST"

  const handlePurposeChange = (value: "TJANST" | "PRIVAT") => {
    if (!isLocked) {
      setTrip((prev) => ({ ...prev, purpose: value }))
    }
  }

  const handleNotesChange = (value: string) => {
    if (!isLocked) {
      setTrip((prev) => ({ ...prev, notes: value }))
    }
  }

  const handleLockTrip = () => {
    if (trip.purpose) {
      setTrip((prev) => ({ ...prev, status: "LAST", hash: generateHash() }))
    }
  }

  const handleAddPrivateNote = () => {
    if (newPrivateNote.trim()) {
      const note: PrivateNote = {
        id: `pn-${Date.now()}`,
        timestamp: new Date(),
        content: newPrivateNote.trim(),
        type: "text",
      }
      setTrip((prev) => ({ ...prev, privateNotes: [...prev.privateNotes, note] }))
      setNewPrivateNote("")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackHeader title="Resdetaljer" href="/" />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {trip.startLocation.split(",")[0]} - {trip.endLocation.split(",")[0]}
            </h2>
            <p className="text-sm text-muted-foreground">
              {trip.date.toLocaleDateString("sv-SE", { 
                weekday: "long", 
                day: "numeric", 
                month: "long" 
              })}
            </p>
          </div>
          <StatusBadge type={trip.status} />
        </div>

        {/* Map Card */}
        <Card className="bg-card border-border overflow-hidden">
          <MapPlaceholder />
        </Card>

        {/* Trip Details */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Reseinformation</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Start */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                  <div>
                    <div className="text-xs text-muted-foreground">Start</div>
                    <div className="text-sm font-medium text-foreground">{trip.startLocation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{formatTime(trip.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{trip.startOdometer.toLocaleString()} km</span>
                </div>
              </div>

              {/* End */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive mt-1" />
                  <div>
                    <div className="text-xs text-muted-foreground">Slut</div>
                    <div className="text-sm font-medium text-foreground">{trip.endLocation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{formatTime(trip.endTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{trip.endOdometer.toLocaleString()} km</span>
                </div>
              </div>
            </div>

            {/* Distance Summary */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-muted-foreground">Total distans</span>
              <span className="text-xl font-bold text-foreground">{trip.distance} km</span>
            </div>
          </CardContent>
        </Card>

        {/* Audit Seal (only for locked trips) */}
        <AuditSeal hash={trip.hash} isLocked={isLocked} />

        {/* Purpose Selection */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Reseanledning</h3>
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <PurposeSelector
              value={trip.purpose}
              onChange={handlePurposeChange}
              disabled={isLocked}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Anteckningar (offentliga)</h3>
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            {isLocked ? (
              <div className="bg-secondary rounded-lg p-3 text-sm text-foreground">
                {trip.notes || <span className="text-muted-foreground italic">Inga anteckningar</span>}
              </div>
            ) : (
              <Textarea
                value={trip.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Lagg till anteckningar..."
                className="min-h-[80px] bg-secondary border-border"
              />
            )}
          </CardContent>
        </Card>

        {/* Private Notes Section - NEW */}
        <Card className="bg-card border-l-4 border-l-primary border-border">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Mina privata anteckningar</h3>
                <p className="text-xs text-muted-foreground">Krypterade - endast du kan se dessa</p>
              </div>
            </div>

            {/* Info text */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Dokumentera viktiga handelser for din egen trygghet. Dessa anteckningar kan anvandas 
                som bevis vid tvister, forsakringsarenden eller arbetsrattsliga fragor.
              </p>
            </div>

            {/* Existing private notes */}
            {trip.privateNotes.length > 0 && (
              <div className="space-y-2">
                {trip.privateNotes.map((note) => (
                  <div key={note.id} className="bg-secondary rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground flex-1">{note.content}</p>
                      {note.type === "incident" && (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {note.timestamp.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new private note */}
            <div className="space-y-2">
              <Textarea
                value={newPrivateNote}
                onChange={(e) => setNewPrivateNote(e.target.value)}
                placeholder="Skriv en privat anteckning om denna resa..."
                className="min-h-[80px] bg-secondary border-border"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Bild
                </Button>
                <Button 
                  onClick={handleAddPrivateNote}
                  disabled={!newPrivateNote.trim()}
                  size="sm"
                  className="flex-1 bg-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lagg till
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lock Button (only for drafts) */}
        {!isLocked && (
          <Button
            onClick={handleLockTrip}
            disabled={!trip.purpose}
            className="w-full h-14 text-lg font-semibold min-h-[56px]"
          >
            <Lock className="w-5 h-5 mr-2" />
            Las och verifiera resa
          </Button>
        )}
      </main>
    </div>
  )
}
