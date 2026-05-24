"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Moon, Sun, Check, AlertTriangle, XCircle } from "lucide-react"
import { 
  BackHeader, 
  ComplianceBadge, 
  ComplianceStatus, 
  formatHoursMinutes, 
  formatDate 
} from "@/components/korjournal/shared"

interface RestSegment {
  id: string
  type: "PART1" | "PART2" | "CONTINUOUS"
  startTime: Date
  endTime: Date
  duration: number // hours
  isValid: boolean
}

interface DayRestData {
  date: Date
  segments: RestSegment[]
  totalRest: number
  part1Total: number
  part2Total: number
  status: ComplianceStatus
}

function RestSegmentCard({ segment }: { segment: RestSegment }) {
  const startTime = segment.startTime.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
  const endTime = segment.endTime.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
  const isNight = segment.startTime.getHours() >= 21 || segment.startTime.getHours() < 6

  return (
    <div className="flex items-start gap-3">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${
          segment.isValid ? "bg-primary" : "bg-amber-500"
        }`} />
        <div className="w-0.5 h-full bg-border flex-1 min-h-[40px]" />
      </div>

      {/* Content */}
      <Card className={`flex-1 mb-3 ${
        segment.isValid ? "bg-card border-border" : "bg-amber-500/10 border-amber-500/30"
      }`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isNight ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-sm font-medium text-foreground">
                {segment.type === "PART1" ? "Del 1" : segment.type === "PART2" ? "Del 2" : "Sammanhangande"}
              </span>
            </div>
            {segment.isValid ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {startTime} - {endTime}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatHoursMinutes(segment.duration)}
            </span>
          </div>

          {!segment.isValid && (
            <p className="text-xs text-amber-400 mt-2">
              Uppfyller inte minimikravet ({segment.type === "PART1" ? "3h" : "8h"})
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DayCard({ day }: { day: DayRestData }) {
  const part1Percentage = Math.min((day.part1Total / 3) * 100, 100)
  const part2Percentage = Math.min((day.part2Total / 8) * 100, 100)

  return (
    <div className="space-y-3">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground capitalize">
            {formatDate(day.date)}
          </h3>
          <p className="text-sm text-muted-foreground">
            Total vila: {formatHoursMinutes(day.totalRest)}
          </p>
        </div>
        <ComplianceBadge status={day.status} />
      </div>

      {/* Progress Summary */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Part 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Del 1 (min 3h)</span>
                {day.part1Total >= 3 && <Check className="w-4 h-4 text-primary" />}
              </div>
              <Progress value={part1Percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {formatHoursMinutes(day.part1Total)} / 3h
              </div>
            </div>

            {/* Part 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Del 2 (min 8h)</span>
                {day.part2Total >= 8 && <Check className="w-4 h-4 text-primary" />}
              </div>
              <Progress value={part2Percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {formatHoursMinutes(day.part2Total)} / 8h
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline of segments */}
      <div className="pl-2">
        {day.segments.map((segment) => (
          <RestSegmentCard key={segment.id} segment={segment} />
        ))}
      </div>
    </div>
  )
}

function WeeklySummary({ days }: { days: DayRestData[] }) {
  const compliantDays = days.filter((d) => d.status === "OK").length
  const warningDays = days.filter((d) => d.status === "WARNING").length
  const violationDays = days.filter((d) => d.status === "VIOLATION").length

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Veckosammanfattning</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 mx-auto mb-2">
              <Check className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{compliantDays}</div>
            <div className="text-xs text-muted-foreground">Compliant</div>
          </div>
          <div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 mx-auto mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{warningDays}</div>
            <div className="text-xs text-muted-foreground">Varningar</div>
          </div>
          <div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/20 mx-auto mb-2">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-foreground">{violationDays}</div>
            <div className="text-xs text-muted-foreground">Violations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Generate mock data for last 7 days
function generateMockData(): DayRestData[] {
  const days: DayRestData[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const scenarios: Array<{
      segments: Omit<RestSegment, "id">[]
      status: ComplianceStatus
    }> = [
      // Day 0-1: Compliant
      {
        segments: [
          { type: "PART1", startTime: new Date(date.setHours(12, 0)), endTime: new Date(date.setHours(15, 30)), duration: 3.5, isValid: true },
          { type: "PART2", startTime: new Date(date.setHours(22, 0)), endTime: new Date(date.setHours(6, 30)), duration: 8.5, isValid: true },
        ],
        status: "OK",
      },
      // Day 2: Warning
      {
        segments: [
          { type: "PART1", startTime: new Date(date.setHours(13, 0)), endTime: new Date(date.setHours(15, 30)), duration: 2.5, isValid: false },
          { type: "PART2", startTime: new Date(date.setHours(23, 0)), endTime: new Date(date.setHours(7, 0)), duration: 8, isValid: true },
        ],
        status: "WARNING",
      },
      // Day 3-5: Compliant
      {
        segments: [
          { type: "CONTINUOUS", startTime: new Date(date.setHours(21, 0)), endTime: new Date(date.setHours(8, 0)), duration: 11, isValid: true },
        ],
        status: "OK",
      },
      // Day 6: Violation
      {
        segments: [
          { type: "PART1", startTime: new Date(date.setHours(14, 0)), endTime: new Date(date.setHours(16, 0)), duration: 2, isValid: false },
          { type: "PART2", startTime: new Date(date.setHours(23, 0)), endTime: new Date(date.setHours(5, 0)), duration: 6, isValid: false },
        ],
        status: "VIOLATION",
      },
    ]

    const scenarioIndex = i % scenarios.length
    const scenario = scenarios[scenarioIndex]

    days.push({
      date: new Date(date),
      segments: scenario.segments.map((s, idx) => ({ ...s, id: `${i}-${idx}` })),
      totalRest: scenario.segments.reduce((sum, s) => sum + s.duration, 0),
      part1Total: scenario.segments.filter((s) => s.type === "PART1").reduce((sum, s) => sum + s.duration, 0) || 
                  (scenario.segments[0]?.type === "CONTINUOUS" ? 3 : 0),
      part2Total: scenario.segments.filter((s) => s.type === "PART2").reduce((sum, s) => sum + s.duration, 0) ||
                  (scenario.segments[0]?.type === "CONTINUOUS" ? 8 : 0),
      status: scenario.status,
    })
  }

  return days
}

export default function RestHistoryPage() {
  const days = generateMockData()

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackHeader title="Vilohistorik" href="/" />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Weekly Summary */}
        <WeeklySummary days={days} />

        {/* Daily Breakdown */}
        <div className="space-y-8">
          {days.map((day, index) => (
            <DayCard key={index} day={day} />
          ))}
        </div>
      </main>
    </div>
  )
}
