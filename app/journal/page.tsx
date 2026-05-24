"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Mic,
  MicOff,
  Camera,
  MapPin,
  Clock,
  Shield,
  Lock,
  Play,
  Pause,
  ChevronRight,
  Plus,
  Heart,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Coffee,
  Stretch,
  Navigation,
  Sun,
  Moon,
  Droplets,
  Wind,
  Thermometer,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Volume2,
  X,
  Sparkles,
} from "lucide-react"
import { BackHeader } from "@/components/korjournal/shared"
import Link from "next/link"

// ==========================================
// TYPES & INTERFACES
// ==========================================

type MoodLevel = "great" | "good" | "okay" | "tired" | "stressed"

interface VoiceMemo {
  id: string
  timestamp: Date
  duration: number // seconds
  transcription?: string
  location: string
  tripId?: string
  isLocked: boolean
}

interface ShieldEntry {
  id: string
  timestamp: Date
  title: string
  description: string
  type: "photo" | "note" | "timestamp" | "voice"
  attachments: string[]
  location: string
  isLocked: boolean
  hash?: string
}

interface HealthTip {
  id: string
  icon: React.ElementType
  title: string
  description: string
  action?: string
}

interface MoodEntry {
  timestamp: Date
  mood: MoodLevel
  note?: string
}

// ==========================================
// MOOD CONFIGURATION
// ==========================================

const moodConfig: Record<MoodLevel, { 
  icon: React.ElementType
  label: string
  color: string
  bgColor: string
  emoji: string
}> = {
  great: { 
    icon: Smile, 
    label: "Utmarkt", 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/20",
    emoji: "😊"
  },
  good: { 
    icon: Smile, 
    label: "Bra", 
    color: "text-green-400", 
    bgColor: "bg-green-500/20",
    emoji: "🙂"
  },
  okay: { 
    icon: Meh, 
    label: "Okej", 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/20",
    emoji: "😐"
  },
  tired: { 
    icon: Frown, 
    label: "Trott", 
    color: "text-orange-400", 
    bgColor: "bg-orange-500/20",
    emoji: "😴"
  },
  stressed: { 
    icon: AlertTriangle, 
    label: "Stressad", 
    color: "text-red-400", 
    bgColor: "bg-red-500/20",
    emoji: "😰"
  },
}

// ==========================================
// QUICK VOICE MEMO WIDGET
// ==========================================

function VoiceMemoWidget({
  onSave,
  isRecording,
  setIsRecording,
}: {
  onSave: (memo: Omit<VoiceMemo, "id">) => void
  isRecording: boolean
  setIsRecording: (val: boolean) => void
}) {
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcription, setTranscription] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setTranscription("")
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    // Simulate transcription
    setTranscription("Leverans forsenad 30 min pga trasig grind vid lager...")
  }

  const handleSave = () => {
    onSave({
      timestamp: new Date(),
      duration: recordingTime,
      transcription: transcription || undefined,
      location: "Goteborg, Hisingen",
      isLocked: false,
    })
    setRecordingTime(0)
    setTranscription("")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Snabbanteckning</h2>
              <p className="text-xs text-muted-foreground">
                Tala in eller skriv - sparas med tid och plats
              </p>
            </div>
          </div>
        </div>

        {/* Recording Area */}
        <div className="p-6">
          {!isRecording && !transcription ? (
            <div className="flex flex-col items-center">
              <button
                onClick={handleStartRecording}
                className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95"
              >
                <Mic className="w-10 h-10 text-primary-foreground" />
              </button>
              <p className="mt-4 text-sm text-muted-foreground">
                Tryck for att spela in
              </p>
              
              {/* Quick text option */}
              <div className="mt-4 w-full">
                <Textarea
                  placeholder="...eller skriv en snabb anteckning har"
                  className="bg-secondary/50 border-border min-h-[60px] text-sm"
                />
              </div>
            </div>
          ) : isRecording ? (
            <div className="flex flex-col items-center">
              {/* Recording animation */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                <button
                  onClick={handleStopRecording}
                  className="relative flex items-center justify-center w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25"
                >
                  <div className="w-8 h-8 rounded-sm bg-white" />
                </button>
              </div>
              <p className="mt-4 text-2xl font-mono text-foreground">
                {formatTime(recordingTime)}
              </p>
              <p className="text-sm text-red-400 flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Spelar in...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transcription preview */}
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{transcription}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatTime(recordingTime)}
                      <MapPin className="w-3 h-3 ml-2" />
                      Goteborg, Hisingen
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setTranscription("")
                    setRecordingTime(0)
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Radera
                </Button>
                <Button
                  className="flex-1 bg-primary"
                  onClick={handleSave}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Spara
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick attach row */}
        {!isRecording && !transcription && (
          <div className="px-4 pb-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-10">
              <Camera className="w-4 h-4 mr-2" />
              Bild
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-10">
              <MapPin className="w-4 h-4 mr-2" />
              Plats
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-10">
              <Clock className="w-4 h-4 mr-2" />
              Tidsstampel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==========================================
// DISPUTE & SHIELD CENTER
// ==========================================

function ShieldCenter({ entries }: { entries: ShieldEntry[] }) {
  const lockedCount = entries.filter(e => e.isLocked).length

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Skyddsdokumentation</h2>
                <p className="text-xs text-muted-foreground">
                  {lockedCount} last bevis - redo vid tvist
                </p>
              </div>
            </div>
            <Link href="/notes">
              <Button variant="ghost" size="sm">
                Alla
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/10">
          <p className="text-xs text-amber-400 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Last dokumentation kan inte andras och har kryptografisk verifiering
          </p>
        </div>

        {/* Entries list */}
        <div className="divide-y divide-border">
          {entries.slice(0, 3).map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  entry.type === "photo" ? "bg-blue-500/20" :
                  entry.type === "voice" ? "bg-purple-500/20" :
                  "bg-primary/20"
                }`}>
                  {entry.type === "photo" ? (
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                  ) : entry.type === "voice" ? (
                    <Volume2 className="w-4 h-4 text-purple-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground text-sm truncate">
                      {entry.title}
                    </h3>
                    {entry.isLocked && (
                      <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp.toLocaleDateString("sv-SE")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {entry.location}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Add new button */}
        <div className="p-4 border-t border-border">
          <Link href="/notes">
            <Button variant="outline" className="w-full h-12">
              <Plus className="w-4 h-4 mr-2" />
              Lagg till skyddsdokumentation
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// PROACTIVE DRIVER CARE
// ==========================================

function DriverCarePrompt({
  lastMood,
  onMoodSelect,
  tips,
  drivingHours,
}: {
  lastMood?: MoodEntry
  onMoodSelect: (mood: MoodLevel, note?: string) => void
  tips: HealthTip[]
  drivingHours: number
}) {
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null)
  const [moodNote, setMoodNote] = useState("")

  const handleMoodSubmit = () => {
    if (selectedMood) {
      onMoodSelect(selectedMood, moodNote || undefined)
      setShowMoodPicker(false)
      setSelectedMood(null)
      setMoodNote("")
    }
  }

  const currentTip = tips[0]

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-rose-500/5 to-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Hur mar du, Lars?</h2>
              <p className="text-xs text-muted-foreground">
                Vi bryr oss om din halsa och valmaende
              </p>
            </div>
          </div>
        </div>

        {/* Mood check-in */}
        {!showMoodPicker ? (
          <div className="p-4">
            {/* Last mood display */}
            {lastMood && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-secondary rounded-xl">
                <span className="text-2xl">{moodConfig[lastMood.mood].emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Du kande dig {moodConfig[lastMood.mood].label.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lastMood.timestamp.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })} idag
                  </p>
                </div>
              </div>
            )}
            
            {/* Quick mood buttons */}
            <div className="flex gap-2 justify-center">
              {(Object.keys(moodConfig) as MoodLevel[]).map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    setSelectedMood(mood)
                    setShowMoodPicker(true)
                  }}
                  className="flex flex-col items-center p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <span className="text-2xl mb-1">{moodConfig[mood].emoji}</span>
                  <span className="text-xs text-muted-foreground">{moodConfig[mood].label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Selected mood */}
            <div className="flex items-center justify-center gap-3 py-4">
              <span className="text-5xl">{selectedMood && moodConfig[selectedMood].emoji}</span>
              <div>
                <p className="font-medium text-foreground">
                  {selectedMood && moodConfig[selectedMood].label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Optional note */}
            <Textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Vill du lagga till nagon anteckning? (valfritt)"
              className="bg-secondary border-border min-h-[60px]"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowMoodPicker(false)
                  setSelectedMood(null)
                }}
              >
                Avbryt
              </Button>
              <Button
                className="flex-1 bg-primary"
                onClick={handleMoodSubmit}
              >
                Spara
              </Button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Health tip */}
        {currentTip && (
          <div className="p-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20 flex-shrink-0">
                <currentTip.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Tips for dig</span>
                </div>
                <h3 className="font-medium text-foreground mb-1">{currentTip.title}</h3>
                <p className="text-sm text-muted-foreground">{currentTip.description}</p>
                {currentTip.action && (
                  <Button variant="ghost" size="sm" className="mt-2 h-8 px-0 text-emerald-400 hover:text-emerald-300">
                    {currentTip.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Driving time warning if needed */}
        {drivingHours >= 4 && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Coffee className="w-5 h-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Du har kort i {drivingHours} timmar
                </p>
                <p className="text-xs text-muted-foreground">
                  Dags for en paus? Narmaste rastplats: 12 km
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-8">
                <Navigation className="w-4 h-4 mr-1" />
                Visa
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==========================================
// RECENT MEMOS LIST
// ==========================================

function RecentMemos({ memos }: { memos: VoiceMemo[] }) {
  if (memos.length === 0) return null

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Senaste anteckningar</h3>
        <div className="space-y-2">
          {memos.slice(0, 3).map((memo) => (
            <div
              key={memo.id}
              className="flex items-start gap-3 p-3 bg-secondary rounded-lg"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 flex-shrink-0">
                {memo.transcription ? (
                  <FileText className="w-4 h-4 text-primary" />
                ) : (
                  <Volume2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">
                  {memo.transcription || `Rostmemo (${Math.floor(memo.duration / 60)}:${(memo.duration % 60).toString().padStart(2, "0")})`}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {memo.timestamp.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {memo.location}
                  </span>
                </div>
              </div>
              {memo.isLocked && <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function JournalPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [memos, setMemos] = useState<VoiceMemo[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      duration: 45,
      transcription: "Grinden vid ABC-lagret ar trasig, maste ringa framifran for att nagon ska oppna",
      location: "Goteborg, Torslanda",
      tripId: "trip-123",
      isLocked: true,
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      duration: 23,
      transcription: "Kund nojd med leveransen, signerade utan anmarkningar",
      location: "Boras, Centrum",
      tripId: "trip-122",
      isLocked: false,
    },
  ])

  const [shieldEntries] = useState<ShieldEntry[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      title: "Bil svangde ut framfor mig",
      description: "Dokumenterat med bilder och tidsstampel for eventuell forsakringsfragor",
      type: "photo",
      attachments: ["photo1.jpg", "photo2.jpg"],
      location: "Goteborg, Avenyn",
      isLocked: true,
      hash: "a7f3...9c2b",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      title: "Forsenad leverans - vader",
      description: "Kraftig storm gjorde leverans omojlig, dokumenterat for att undvika klagomal",
      type: "note",
      attachments: [],
      location: "Vag 40",
      isLocked: true,
      hash: "b8e2...1d4a",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      title: "Kund vagrar signera",
      description: "Spelat in samtal dar kund bekraftar mottagande trots vagran att signera",
      type: "voice",
      attachments: ["recording.mp3"],
      location: "Malmo, Sodra",
      isLocked: true,
      hash: "c9f1...3e5b",
    },
  ])

  const [lastMood, setLastMood] = useState<MoodEntry>({
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    mood: "good",
  })

  const healthTips: HealthTip[] = [
    {
      id: "1",
      icon: Stretch,
      title: "Dags att stretcha!",
      description: "Du har suttit i 4 timmar. Prova dessa enkla stretchovningar for nacke och axlar.",
      action: "Visa ovningar",
    },
    {
      id: "2",
      icon: Droplets,
      title: "Drick vatten",
      description: "Att halla sig hydrerad forbattrar koncentrationen och minskar trotthet.",
    },
    {
      id: "3",
      icon: Coffee,
      title: "Rekommenderad rastplats",
      description: "Shell Boras - bra kaffe, rena toaletter, tysta vilrum. 8 km bort.",
      action: "Navigera dit",
    },
  ]

  const handleSaveMemo = (memo: Omit<VoiceMemo, "id">) => {
    const newMemo: VoiceMemo = {
      ...memo,
      id: `memo-${Date.now()}`,
    }
    setMemos([newMemo, ...memos])
  }

  const handleMoodSelect = (mood: MoodLevel, note?: string) => {
    setLastMood({
      timestamp: new Date(),
      mood,
      note,
    })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackHeader title="Forardagbok & Skydd" href="/" />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Welcome message */}
        <Card className="bg-gradient-to-r from-primary/5 via-rose-500/5 to-amber-500/5 border-0">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Den har sidan ar <span className="text-foreground font-medium">enbart for dig</span>. 
              Dokumentera, skydda dig sjalv och ta hand om din halsa pa vagen.
            </p>
          </CardContent>
        </Card>

        {/* 1. Quick Voice/Text Memo Widget */}
        <VoiceMemoWidget
          onSave={handleSaveMemo}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />

        {/* Recent memos */}
        <RecentMemos memos={memos} />

        {/* 2. Dispute & Shield Center */}
        <ShieldCenter entries={shieldEntries} />

        {/* 3. Proactive Driver Care */}
        <DriverCarePrompt
          lastMood={lastMood}
          onMoodSelect={handleMoodSelect}
          tips={healthTips}
          drivingHours={4.5}
        />
      </main>
    </div>
  )
}
