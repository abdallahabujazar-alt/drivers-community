"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  PenLine,
  Camera,
  MapPin,
  Clock,
  AlertTriangle,
  CloudRain,
  Construction,
  Car,
  Shield,
  Plus,
  ChevronRight,
  Search,
  Filter,
  Lock,
  Mic,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  Trash2,
} from "lucide-react"
import { BackHeader } from "@/components/korjournal/shared"

type NoteCategory = "ALLMANT" | "INCIDENT" | "VADERFORHALLANDE" | "VAGARBETE" | "LEVERANS" | "FORDON"

interface DriverNote {
  id: string
  timestamp: Date
  category: NoteCategory
  title: string
  content: string
  location?: string
  tripId?: string
  attachments: string[]
  isPrivate: boolean
  isLocked: boolean
}

const categoryConfig: Record<NoteCategory, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  ALLMANT: { icon: PenLine, label: "Allmant", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  INCIDENT: { icon: AlertTriangle, label: "Incident", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  VADERFORHALLANDE: { icon: CloudRain, label: "Vader", color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  VAGARBETE: { icon: Construction, label: "Vagarbete", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  LEVERANS: { icon: Car, label: "Leverans", color: "text-primary", bgColor: "bg-primary/20" },
  FORDON: { icon: Shield, label: "Fordon", color: "text-purple-400", bgColor: "bg-purple-500/20" },
}

function NoteCard({ note, onView }: { note: DriverNote; onView: () => void }) {
  const config = categoryConfig[note.category]
  const CategoryIcon = config.icon

  return (
    <button
      onClick={onView}
      className="w-full text-left"
    >
      <Card className={`bg-card border-border hover:border-muted-foreground transition-colors ${note.isPrivate ? 'border-l-4 border-l-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${config.bgColor} flex-shrink-0`}>
              <CategoryIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate">{note.title}</h3>
                {note.isPrivate && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full flex-shrink-0">
                    <Lock className="w-3 h-3" />
                    Privat
                  </span>
                )}
                {note.isLocked && (
                  <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{note.content}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {note.timestamp.toLocaleDateString("sv-SE")} {note.timestamp.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {note.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {note.location}
                  </span>
                )}
                {note.attachments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {note.attachments.length}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

function CategorySelector({
  selected,
  onSelect,
}: {
  selected: NoteCategory
  onSelect: (category: NoteCategory) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(categoryConfig).map(([key, config]) => {
        const Icon = config.icon
        const isSelected = selected === key
        return (
          <button
            key={key}
            onClick={() => onSelect(key as NoteCategory)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-muted-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isSelected ? "text-primary" : config.color}`} />
            <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
              {config.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function NewNoteModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<DriverNote, "id" | "timestamp" | "isLocked">) => void
}) {
  const [category, setCategory] = useState<NoteCategory>("ALLMANT")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [location, setLocation] = useState("")
  const [isPrivate, setIsPrivate] = useState(true)
  const [attachments, setAttachments] = useState<string[]>([])

  if (!isOpen) return null

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave({
        category,
        title: title.trim(),
        content: content.trim(),
        location: location.trim() || undefined,
        attachments,
        isPrivate,
      })
      // Reset form
      setCategory("ALLMANT")
      setTitle("")
      setContent("")
      setLocation("")
      setIsPrivate(true)
      setAttachments([])
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Avbryt
          </Button>
          <h1 className="font-semibold text-foreground">Ny anteckning</h1>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="bg-primary text-primary-foreground"
          >
            Spara
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Kategori</label>
            <CategorySelector selected={category} onSelect={setCategory} />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Rubrik</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kort beskrivning..."
              className="bg-secondary border-border h-12"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Anteckning</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Beskriv vad som hande, varfor det ar viktigt att dokumentera..."
              className="min-h-[150px] bg-secondary border-border"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Plats (valfritt)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ange plats eller anvand GPS..."
                className="bg-secondary border-border h-12 pl-10"
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Bilagor</label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Camera className="w-5 h-5" />
                <span className="text-xs">Ta bild</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <ImageIcon className="w-5 h-5" />
                <span className="text-xs">Galleri</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Mic className="w-5 h-5" />
                <span className="text-xs">Rosta</span>
              </Button>
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Sekretess</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsPrivate(true)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  isPrivate
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <Lock className={`w-6 h-6 mb-2 ${isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${isPrivate ? "text-primary" : "text-foreground"}`}>
                  Privat
                </span>
                <span className="text-xs text-muted-foreground mt-1">Endast du kan se</span>
              </button>
              <button
                onClick={() => setIsPrivate(false)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  !isPrivate
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <FileText className={`w-6 h-6 mb-2 ${!isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${!isPrivate ? "text-primary" : "text-foreground"}`}>
                  Delad
                </span>
                <span className="text-xs text-muted-foreground mt-1">Synlig i rapporter</span>
              </button>
            </div>
          </div>

          {/* Help Text */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Dina anteckningar skyddar dig</h4>
                  <p className="text-sm text-muted-foreground">
                    Privata anteckningar kan anvandas som bevis vid tvister, forsakringsarenden eller 
                    arbetsrattsliga fragor. De ar krypterade och endast du har tillgang till dem.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | "ALL">("ALL")
  
  const [notes, setNotes] = useState<DriverNote[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: "INCIDENT",
      title: "Bil svangde ut framfor mig",
      content: "Vid korsningen Avenyn/Kungsportsplatsen svangde en vit Volvo XC90 (reg. ABC 123) ut framfor mig utan att blinka. Fick bromsa kraftigt. Ingen skada uppstod men dokumenterar for sakerhets skull.",
      location: "Goteborg, Avenyn",
      tripId: "trip-123",
      attachments: ["photo1.jpg"],
      isPrivate: true,
      isLocked: true,
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      category: "VADERFORHALLANDE",
      title: "Halka pa vag 40",
      content: "Kraftig ishalka mellan Boras och Ulricehamn. Saktade ner till 60 km/h for sakerhet. Ankomst blev 45 min forsenad pa grund av vadret.",
      location: "Vag 40, Boras",
      attachments: [],
      isPrivate: false,
      isLocked: true,
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      category: "LEVERANS",
      title: "Kund inte pa plats",
      content: "Leverans till ABC Foretag - ingen var pa plats vid leveranstid 14:00. Ringde kontaktperson 3 ganger utan svar. Lamnade paket hos granne (nr 42) efter overenskommelse via SMS.",
      location: "Malmo, Sodergatan 15",
      tripId: "trip-120",
      attachments: ["sms_screenshot.jpg"],
      isPrivate: false,
      isLocked: true,
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: "FORDON",
      title: "Konstigt ljud fran motor",
      content: "Hordes ett tickande ljud fran motorn vid kallstart. Forsvann efter ca 5 minuter. Bor kollas vid nasta service.",
      location: "Goteborg, Hisingen",
      attachments: ["motor_ljud.mp3"],
      isPrivate: true,
      isLocked: false,
    },
  ])

  const handleSaveNote = (noteData: Omit<DriverNote, "id" | "timestamp" | "isLocked">) => {
    const newNote: DriverNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date(),
      isLocked: false,
      ...noteData,
    }
    setNotes([newNote, ...notes])
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "ALL" || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const privateCount = notes.filter(n => n.isPrivate).length
  const totalCount = notes.length

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackHeader title="Mina anteckningar" href="/" />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Stats Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">
                <PenLine className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">Din dokumentation</h2>
                <p className="text-sm text-muted-foreground">
                  {totalCount} anteckningar, {privateCount} privata
                </p>
              </div>
              <Button
                onClick={() => setIsNewNoteOpen(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 h-12 px-4"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ny
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Skydda dina rattigheter</h3>
                <p className="text-sm text-muted-foreground">
                  Dokumentera viktiga handelser under dina resor. Privata anteckningar ar krypterade 
                  och kan anvandas som bevis vid tvister, forsakringsarenden eller arbetsrattsliga fragor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sok i anteckningar..."
              className="bg-secondary border-border h-12 pl-10"
            />
          </div>
          <Button variant="outline" className="h-12 px-4">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Alla
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as NoteCategory)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <PenLine className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-foreground mb-2">Inga anteckningar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Borja dokumentera viktiga handelser for att skydda dig sjalv.
                </p>
                <Button onClick={() => setIsNewNoteOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Skapa din forsta anteckning
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onView={() => {
                  // Would navigate to note detail
                }}
              />
            ))
          )}
        </div>
      </main>

      {/* New Note Modal */}
      <NewNoteModal
        isOpen={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  )
}
