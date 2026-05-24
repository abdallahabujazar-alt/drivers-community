"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Truck,
  Gauge,
  Car,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Phone,
  Mail,
  Save,
  RefreshCw,
} from "lucide-react"
import { BackHeader, generateHash } from "@/components/korjournal/shared"

type VehicleType = "LASTBIL" | "PERSONBIL" | "TAXI"
type DefaultTripType = "TJANST" | "PRIVAT"

interface VehicleData {
  registrationNumber: string
  currentOdometer: string
  vehicleType: VehicleType
}

interface UserSettings {
  defaultTripType: DefaultTripType
  autoLockAfterHours: number
  enableFormansvarde: boolean
}

interface CryptoKeyStatus {
  keyId: string
  createdAt: Date
  status: "ACTIVE" | "PENDING" | "EXPIRED"
  lastUsed: Date
}

const vehicleTypes: Array<{ value: VehicleType; label: string; icon: React.ElementType }> = [
  { value: "LASTBIL", label: "Lastbil", icon: Truck },
  { value: "PERSONBIL", label: "Personbil", icon: Car },
  { value: "TAXI", label: "Taxi", icon: Car },
]

function VehicleTypeSelector({
  selected,
  onSelect,
}: {
  selected: VehicleType
  onSelect: (type: VehicleType) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {vehicleTypes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
            selected === value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          <Icon className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}

function CryptoKeyCard({ keyStatus }: { keyStatus: CryptoKeyStatus }) {
  const statusConfig = {
    ACTIVE: {
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      label: "Aktiv",
    },
    PENDING: {
      icon: RefreshCw,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      label: "Vantar",
    },
    EXPIRED: {
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      label: "Utgangen",
    },
  }

  const config = statusConfig[keyStatus.status]
  const StatusIcon = config.icon

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${config.bgColor}`}>
            <Key className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Signeringsnyckel</h3>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                <StatusIcon className="w-3 h-3" />
                <span>{config.label}</span>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nyckel-ID</span>
                <code className="text-xs font-mono text-foreground bg-secondary px-2 py-0.5 rounded">
                  {keyStatus.keyId.substring(0, 12)}...
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Skapad</span>
                <span className="text-foreground">
                  {keyStatus.createdAt.toLocaleDateString("sv-SE")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Senast anvand</span>
                <span className="text-foreground">
                  {keyStatus.lastUsed.toLocaleDateString("sv-SE")} {keyStatus.lastUsed.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-secondary rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Din signeringsnyckel anvands for att kryptografiskt verifiera alla resor och viloperioder. 
              Nyckeln lagras sakert pa din enhet och delas aldrig med servern.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const [vehicle, setVehicle] = useState<VehicleData>({
    registrationNumber: "ABC 123",
    currentOdometer: "145832",
    vehicleType: "LASTBIL",
  })

  const [settings, setSettings] = useState<UserSettings>({
    defaultTripType: "TJANST",
    autoLockAfterHours: 24,
    enableFormansvarde: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const cryptoKey: CryptoKeyStatus = {
    keyId: generateHash(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: "ACTIVE",
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackHeader title="Installningar" href="/" />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* User Profile Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-foreground">Profil</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-muted-foreground">Fornamn</Label>
                  <Input
                    id="firstName"
                    defaultValue="Lars"
                    className="bg-secondary border-border h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-muted-foreground">Efternamn</Label>
                  <Input
                    id="lastName"
                    defaultValue="Andersson"
                    className="bg-secondary border-border h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">E-post</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue="lars.andersson@foretag.se"
                    className="bg-secondary border-border h-12 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-muted-foreground">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+46 70 123 4567"
                    className="bg-secondary border-border h-12 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-muted-foreground">Foretag</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    defaultValue="Logistik AB"
                    className="bg-secondary border-border h-12 pl-10"
                    disabled
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Profile Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                <Truck className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Fordonsprofil</h2>
                <p className="text-xs text-muted-foreground">Kravs for Skatteverket-compliance</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Registration Number */}
              <div className="space-y-2">
                <Label htmlFor="regNumber" className="text-muted-foreground">
                  Registreringsnummer
                </Label>
                <div className="relative">
                  <Input
                    id="regNumber"
                    value={vehicle.registrationNumber}
                    onChange={(e) =>
                      setVehicle({ ...vehicle, registrationNumber: e.target.value.toUpperCase() })
                    }
                    placeholder="ABC 123"
                    className="bg-secondary border-border h-12 text-lg font-mono tracking-wider uppercase"
                  />
                </div>
              </div>

              {/* Current Odometer */}
              <div className="space-y-2">
                <Label htmlFor="odometer" className="text-muted-foreground">
                  Aktuell matarstallning (km)
                </Label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="odometer"
                    type="number"
                    value={vehicle.currentOdometer}
                    onChange={(e) =>
                      setVehicle({ ...vehicle, currentOdometer: e.target.value })
                    }
                    placeholder="0"
                    className="bg-secondary border-border h-12 pl-10 font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uppdatera regelbundet for korrekt kilometerlogg
                </p>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Fordonstyp</Label>
                <VehicleTypeSelector
                  selected={vehicle.vehicleType}
                  onSelect={(type) => setVehicle({ ...vehicle, vehicleType: type })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Tax Settings */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Skatteinställningar</h2>
                <p className="text-xs text-muted-foreground">Standardvarden for nya resor</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Default Trip Type */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">Standardresetyp</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSettings({ ...settings, defaultTripType: "TJANST" })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      settings.defaultTripType === "TJANST"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <Building className="w-6 h-6 mb-2" />
                    <span className="font-medium">Tjansteresa</span>
                    <span className="text-xs mt-1 opacity-70">Ej skattepliktig</span>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, defaultTripType: "PRIVAT" })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      settings.defaultTripType === "PRIVAT"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <User className="w-6 h-6 mb-2" />
                    <span className="font-medium">Privatresa</span>
                    <span className="text-xs mt-1 opacity-70">Formansvarde</span>
                  </button>
                </div>
              </div>

              {/* Förmånsvärde Toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Formansvardekalkylering</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatisk berakning av formansvarde baserat pa privata resor
                  </p>
                </div>
                <Switch
                  checked={settings.enableFormansvarde}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableFormansvarde: checked })
                  }
                />
              </div>

              {/* Auto-lock Setting */}
              <div className="space-y-2">
                <Label htmlFor="autoLock" className="text-muted-foreground">
                  Auto-lasning efter (timmar)
                </Label>
                <Input
                  id="autoLock"
                  type="number"
                  min="1"
                  max="72"
                  value={settings.autoLockAfterHours}
                  onChange={(e) =>
                    setSettings({ ...settings, autoLockAfterHours: parseInt(e.target.value) || 24 })
                  }
                  className="bg-secondary border-border h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Resor lasas automatiskt efter denna tid for att sakerstalla compliance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cryptographic Key Status */}
        <CryptoKeyCard keyStatus={cryptoKey} />
      </main>

      {/* Save Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : showSaved ? (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isSaving ? "Sparar..." : showSaved ? "Sparat!" : "Spara installningar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
