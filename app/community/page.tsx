"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Building2,
  Car,
  Check,
  ChevronRight,
  Clock,
  CloudRain,
  CloudSun,
  Coffee,
  Construction,
  Globe,
  Heart,
  History,
  Home,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Star,
  Timer,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import {
  type CommunityPost,
  type QuickAlert,
  type DriverBadgeType,
  type Group,
  type GroupType,
  type Friend,
  type FriendRequest,
  getDriverBadgeLabel,
  getGroupTypeLabel,
} from "@/components/korjournal/shared"

// Comment type
interface Comment {
  id: string
  postId: string
  authorName: string
  authorBadge: DriverBadgeType
  content: string
  createdAt: Date
}

type CommunityTab = "feed" | "groups" | "friends"
type FeedFilter = "all" | "friends" | "groups"

// ============ Mock Data ============

const mockPosts: CommunityPost[] = [
  {
    id: "1",
    authorId: "driver1",
    authorName: "Ahmed K.",
    authorBadge: "ROAD_EXPERT",
    content: "Lång dag på E6:an idag. Hittade en fantastisk rastplats vid Varberg - rent, lugnt och bra kaffe! Rekommenderas starkt för alla som kör söderut.",
    type: "TIP",
    likes: 24,
    comments: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isLiked: false,
  },
  {
    id: "2",
    authorId: "driver2",
    authorName: "Maria S.",
    authorBadge: "COMMITTED_DRIVER",
    content: "3 månader utan en enda vilotidsöverträdelse! Appen har verkligen hjälpt mig att hålla koll. Tack alla för tipsen i forumet.",
    type: "DIARY",
    likes: 45,
    comments: 12,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isLiked: true,
  },
  {
    id: "3",
    authorId: "driver3",
    authorName: "Erik L.",
    authorBadge: "COMMUNITY_HELPER",
    content: "Hjälpte en kollega med punktering utanför Jönköping idag. Kom ihåg att alltid ha reservhjul och verktyg! Vi förare måste hålla ihop.",
    type: "STORY",
    likes: 67,
    comments: 15,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isLiked: false,
  },
]

const mockAlerts: QuickAlert[] = [
  {
    id: "a1",
    authorName: "Johan M.",
    message: "Kraftig köbildning",
    location: "E4 Motalaviadukten",
    type: "TRAFFIC",
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    expiresAt: new Date(Date.now() + 45 * 60 * 1000),
  },
  {
    id: "a2",
    authorName: "Lisa A.",
    message: "Utmärkt rastplats med dusch",
    location: "Rv 40 Ulricehamn",
    type: "REST_AREA",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
  },
]

const mockComments: Record<string, Comment[]> = {
  "1": [
    { id: "c1", postId: "1", authorName: "Erik L.", authorBadge: "COMMUNITY_HELPER", content: "Tack för tipset! Ska definitivt stanna där nästa gång.", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { id: "c2", postId: "1", authorName: "Lisa A.", authorBadge: "REST_CHAMPION", content: "Finns det parkering för långtradare där?", createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  ],
  "2": [
    { id: "c3", postId: "2", authorName: "Johan M.", authorBadge: "ROAD_EXPERT", content: "Grattis! Fortsätt så, det är viktigt att ta hand om sig.", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  ],
  "3": [
    { id: "c4", postId: "3", authorName: "Ahmed K.", authorBadge: "ROAD_EXPERT", content: "Bra gjort! Vi förare måste hjälpa varandra.", createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  ],
}

const mockGroups: Group[] = [
  { id: "g1", name: "Schenker Sverige", description: "Officiell grupp för DB Schenker förare i Sverige", type: "COMPANY", memberCount: 342, createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), createdBy: "admin", companyName: "DB Schenker", isJoined: true },
  { id: "g2", name: "Stockholm Förare", description: "Förare som kör i Stockholmsområdet", type: "REGION", memberCount: 156, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), createdBy: "user1", region: "Stockholm", isJoined: false },
  { id: "g3", name: "E4 Veteraner", description: "För alla som älskar E4:an", type: "PUBLIC", memberCount: 89, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), createdBy: "user2", isJoined: true },
  { id: "g4", name: "Göteborg Transport", description: "Transportföretag i Göteborg", type: "COMPANY", memberCount: 78, createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), createdBy: "admin2", companyName: "Göteborg Transport AB", isJoined: false },
  { id: "g5", name: "Nattförare", description: "Grupp för förare som kör natt", type: "PRIVATE", memberCount: 45, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), createdBy: "user3", isJoined: false, isPending: true },
  { id: "g6", name: "Malmö Lastbilsförare", description: "Lastbilsförare i Malmöregionen", type: "REGION", memberCount: 112, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), createdBy: "user4", region: "Malmö", isJoined: false },
]

const mockFriends: Friend[] = [
  { id: "f1", name: "Johan M.", badge: "ROAD_EXPERT", status: "ONLINE", mutualFriends: 5 },
  { id: "f2", name: "Lisa A.", badge: "REST_CHAMPION", status: "DRIVING", mutualFriends: 3 },
  { id: "f3", name: "Per G.", badge: "COMMITTED_DRIVER", status: "OFFLINE", lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), mutualFriends: 8 },
  { id: "f4", name: "Anna B.", badge: "COMMUNITY_HELPER", status: "ONLINE", mutualFriends: 2 },
]

const mockFriendRequests: FriendRequest[] = [
  { id: "fr1", fromUserId: "u5", fromUserName: "Erik L.", fromUserBadge: "COMMUNITY_HELPER", toUserId: "current", sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000), status: "PENDING" },
  { id: "fr2", fromUserId: "u6", fromUserName: "Sara K.", fromUserBadge: "NEWCOMER", toUserId: "current", sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000), status: "PENDING" },
]

const mockSuggestedFriends: Friend[] = [
  { id: "sf1", name: "Magnus H.", badge: "ROAD_EXPERT", status: "ONLINE", mutualFriends: 12 },
  { id: "sf2", name: "Karin L.", badge: "COMMITTED_DRIVER", status: "OFFLINE", mutualFriends: 8 },
  { id: "sf3", name: "Oscar T.", badge: "REST_CHAMPION", status: "DRIVING", mutualFriends: 5 },
]

// ============ Helper Functions ============

function getAlertIcon(type: QuickAlert["type"]) {
  switch (type) {
    case "TRAFFIC": return Car
    case "REST_AREA": return Coffee
    case "WEATHER": return CloudSun
    case "ROAD_WORK": return Construction
  }
}

function getAlertColor(type: QuickAlert["type"]) {
  switch (type) {
    case "TRAFFIC": return "bg-destructive/20 text-destructive"
    case "REST_AREA": return "bg-primary/20 text-primary"
    case "WEATHER": return "bg-blue-500/20 text-blue-400"
    case "ROAD_WORK": return "bg-amber-500/20 text-amber-400"
  }
}

function getBadgeIcon(badge: DriverBadgeType) {
  switch (badge) {
    case "ROAD_EXPERT": return Star
    case "COMMITTED_DRIVER": return Shield
    case "COMMUNITY_HELPER": return Heart
    case "REST_CHAMPION": return Trophy
    case "NEWCOMER": return Users
  }
}

function getBadgeColor(badge: DriverBadgeType) {
  switch (badge) {
    case "ROAD_EXPERT": return "bg-amber-500/20 text-amber-400"
    case "COMMITTED_DRIVER": return "bg-primary/20 text-primary"
    case "COMMUNITY_HELPER": return "bg-pink-500/20 text-pink-400"
    case "REST_CHAMPION": return "bg-blue-500/20 text-blue-400"
    case "NEWCOMER": return "bg-secondary text-secondary-foreground"
  }
}

function getGroupTypeIcon(type: GroupType) {
  switch (type) {
    case "COMPANY": return Building2
    case "REGION": return MapPin
    case "PUBLIC": return Globe
    case "PRIVATE": return Lock
    case "CUSTOM": return Users
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return "Just nu"
  if (diffMins < 60) return `${diffMins} min sedan`
  if (diffHours < 24) return `${diffHours}h sedan`
  return `${diffDays}d sedan`
}

function getStatusColor(status: Friend["status"]) {
  switch (status) {
    case "ONLINE": return "bg-green-500"
    case "DRIVING": return "bg-amber-500"
    case "OFFLINE": return "bg-muted-foreground"
  }
}

// ============ Components ============

function DriverBadge({ badge, size = "default" }: { badge: DriverBadgeType; size?: "sm" | "default" }) {
  const Icon = getBadgeIcon(badge)
  const colorClass = getBadgeColor(badge)
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4"
  return (
    <div className={`flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium ${colorClass}`}>
      <Icon className={iconSize} />
      <span>{getDriverBadgeLabel(badge)}</span>
    </div>
  )
}

function QuickAlertBar({ alerts }: { alerts: QuickAlert[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(() => {
    if (alerts.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [alerts.length])
  if (alerts.length === 0) return null
  const currentAlert = alerts[currentIndex]
  const Icon = getAlertIcon(currentAlert.type)
  const colorClass = getAlertColor(currentAlert.type)
  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate block">{currentAlert.message}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{currentAlert.location}</span>
              <span>•</span>
              <span>{formatTimeAgo(currentAlert.createdAt)}</span>
            </div>
          </div>
          {alerts.length > 1 && (
            <div className="flex gap-1">
              {alerts.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabBar({ activeTab, onTabChange }: { activeTab: CommunityTab; onTabChange: (tab: CommunityTab) => void }) {
  const tabs: { id: CommunityTab; label: string; icon: typeof Users }[] = [
    { id: "feed", label: "Flöde", icon: Home },
    { id: "groups", label: "Grupper", icon: Users },
    { id: "friends", label: "Vänner", icon: UserCheck },
  ]
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
              isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function FeedFilterBar({ filter, onFilterChange }: { filter: FeedFilter; onFilterChange: (f: FeedFilter) => void }) {
  const filters: { id: FeedFilter; label: string }[] = [
    { id: "all", label: "Alla" },
    { id: "friends", label: "Vänner" },
    { id: "groups", label: "Grupper" },
  ]
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function CommunityFeedCard({ post, onLike, comments, onAddComment }: { post: CommunityPost; onLike: (id: string) => void; comments: Comment[]; onAddComment: (id: string, content: string) => void }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likes, setLikes] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
    onLike(post.id)
  }

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(post.id, newComment.trim())
      setNewComment("")
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-semibold">
              {post.authorName.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-foreground">{post.authorName}</div>
              <DriverBadge badge={post.authorBadge} size="sm" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
        </div>
        <p className="text-foreground text-sm leading-relaxed mb-4">{post.content}</p>
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className={`flex items-center gap-2 text-sm transition-colors min-h-[44px] px-2 ${isLiked ? "text-pink-500" : "text-muted-foreground hover:text-pink-500"}`}>
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2 text-sm transition-colors min-h-[44px] px-2 ${showComments ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <MessageCircle className={`w-5 h-5 ${showComments ? "fill-current" : ""}`} />
            <span>{comments.length}</span>
          </button>
        </div>
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border">
            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground text-xs font-semibold flex-shrink-0">{comment.authorName.charAt(0)}</div>
                    <div className="flex-1 bg-secondary rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-semibold flex-shrink-0">A</div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment() } }}
                  placeholder="Skriv en kommentar..."
                  className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button size="icon" variant="ghost" onClick={handleSubmitComment} disabled={!newComment.trim()} className="h-9 w-9 rounded-full">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PostComposer({ onCreatePost }: { onCreatePost: (content: string, type: "DIARY" | "STORY" | "TIP") => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState<"DIARY" | "STORY" | "TIP">("DIARY")

  const handleSubmit = () => {
    if (content.trim()) {
      onCreatePost(content.trim(), postType)
      setContent("")
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-3 w-full text-left">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-semibold">A</div>
            <div className="flex-1 py-2.5 px-4 bg-secondary rounded-full text-muted-foreground text-sm">Dela något med andra förare...</div>
            <Button size="icon" variant="ghost" className="h-10 w-10"><Send className="w-5 h-5" /></Button>
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-semibold">A</div>
            <div>
              <div className="font-medium text-foreground">Ahmed K.</div>
              <DriverBadge badge="COMMITTED_DRIVER" size="sm" />
            </div>
          </div>
          <button onClick={() => { setIsOpen(false); setContent("") }} className="text-muted-foreground hover:text-foreground p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          {[{ type: "DIARY" as const, label: "Dagbok" }, { type: "STORY" as const, label: "Berättelse" }, { type: "TIP" as const, label: "Tips" }].map((item) => (
            <button key={item.type} onClick={() => setPostType(item.type)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${postType === item.type ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Vad vill du dela med andra förare?" className="w-full min-h-[120px] bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm" autoFocus />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{content.length}/500</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setIsOpen(false); setContent("") }} className="h-10">Avbryt</Button>
            <Button onClick={handleSubmit} disabled={!content.trim()} className="h-10 gap-2"><Send className="w-4 h-4" />Publicera</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ Groups Tab Components ============

function GroupCard({ group, onJoin, onLeave }: { group: Group; onJoin: (id: string) => void; onLeave: (id: string) => void }) {
  const Icon = getGroupTypeIcon(group.type)
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary text-foreground">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{group.name}</h3>
              {group.type === "PRIVATE" && <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{group.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{group.memberCount}</span>
              <Badge variant="secondary" className="text-xs">{getGroupTypeLabel(group.type)}</Badge>
            </div>
          </div>
          <div>
            {group.isJoined ? (
              <Button variant="secondary" size="sm" onClick={() => onLeave(group.id)} className="h-8">Medlem</Button>
            ) : group.isPending ? (
              <Button variant="outline" size="sm" disabled className="h-8">Väntar</Button>
            ) : (
              <Button size="sm" onClick={() => onJoin(group.id)} className="h-8">Gå med</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateGroupModal({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (name: string, desc: string, type: GroupType) => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<GroupType>("PUBLIC")

  if (!isOpen) return null

  const handleCreate = () => {
    if (name.trim() && description.trim()) {
      onCreate(name.trim(), description.trim(), type)
      setName("")
      setDescription("")
      setType("PUBLIC")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Skapa ny grupp</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Gruppnamn</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Stockholm Förare" className="w-full bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Beskrivning</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beskriv vad gruppen handlar om..." className="w-full min-h-[80px] bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Typ av grupp</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { type: "PUBLIC" as const, label: "Offentlig", desc: "Alla kan gå med" },
                { type: "PRIVATE" as const, label: "Privat", desc: "Kräver godkännande" },
                { type: "COMPANY" as const, label: "Företag", desc: "För företag" },
                { type: "REGION" as const, label: "Region", desc: "Geografisk grupp" },
              ]).map((item) => (
                <button key={item.type} onClick={() => setType(item.type)} className={`p-3 rounded-lg text-left transition-colors ${type === item.type ? "bg-primary/20 border-2 border-primary" : "bg-secondary border-2 border-transparent"}`}>
                  <div className="font-medium text-foreground text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1 h-12">Avbryt</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || !description.trim()} className="flex-1 h-12">Skapa grupp</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GroupsTab() {
  const [groups, setGroups] = useState<Group[]>(mockGroups)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<GroupType | "ALL">("ALL")

  const filteredGroups = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "ALL" || g.type === filterType
    return matchesSearch && matchesType
  })

  const myGroups = filteredGroups.filter((g) => g.isJoined)
  const discoverGroups = filteredGroups.filter((g) => !g.isJoined)

  const handleJoin = (id: string) => {
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, isJoined: g.type === "PRIVATE" ? false : true, isPending: g.type === "PRIVATE", memberCount: g.type === "PRIVATE" ? g.memberCount : g.memberCount + 1 } : g))
  }

  const handleLeave = (id: string) => {
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, isJoined: false, memberCount: g.memberCount - 1 } : g))
  }

  const handleCreate = (name: string, description: string, type: GroupType) => {
    const newGroup: Group = { id: `g${Date.now()}`, name, description, type, memberCount: 1, createdAt: new Date(), createdBy: "current-user", isJoined: true }
    setGroups((prev) => [newGroup, ...prev])
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Sök grupper..." className="w-full bg-secondary rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="icon" className="h-10 w-10"><Plus className="w-5 h-5" /></Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {(["ALL", "PUBLIC", "PRIVATE", "COMPANY", "REGION"] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {t === "ALL" ? "Alla" : getGroupTypeLabel(t)}
          </button>
        ))}
      </div>

      {myGroups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Mina grupper</h3>
          {myGroups.map((group) => (<GroupCard key={group.id} group={group} onJoin={handleJoin} onLeave={handleLeave} />))}
        </div>
      )}

      {discoverGroups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Upptäck grupper</h3>
          {discoverGroups.map((group) => (<GroupCard key={group.id} group={group} onJoin={handleJoin} onLeave={handleLeave} />))}
        </div>
      )}

      <CreateGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
    </div>
  )
}

// ============ Friends Tab Components ============

function FriendCard({ friend, onRemove }: { friend: Friend; onRemove: (id: string) => void }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-foreground font-semibold">{friend.name.charAt(0)}</div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(friend.status)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{friend.name}</div>
            <DriverBadge badge={friend.badge} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10"><MessageCircle className="w-5 h-5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FriendRequestCard({ request, onAccept, onDecline }: { request: FriendRequest; onAccept: (id: string) => void; onDecline: (id: string) => void }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-foreground font-semibold">{request.fromUserName.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{request.fromUserName}</div>
            <DriverBadge badge={request.fromUserBadge} size="sm" />
            <div className="text-xs text-muted-foreground mt-1">{formatTimeAgo(request.sentAt)}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onDecline(request.id)} className="h-10 w-10 text-destructive"><X className="w-5 h-5" /></Button>
            <Button size="icon" onClick={() => onAccept(request.id)} className="h-10 w-10"><Check className="w-5 h-5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SuggestedFriendCard({ friend, onAdd }: { friend: Friend; onAdd: (id: string) => void }) {
  const [isAdded, setIsAdded] = useState(false)
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-foreground font-semibold">{friend.name.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{friend.name}</div>
            <DriverBadge badge={friend.badge} size="sm" />
            {friend.mutualFriends && friend.mutualFriends > 0 && (
              <div className="text-xs text-muted-foreground mt-1">{friend.mutualFriends} gemensamma vänner</div>
            )}
          </div>
          <Button variant={isAdded ? "secondary" : "default"} size="sm" onClick={() => { if (!isAdded) { onAdd(friend.id); setIsAdded(true) } }} disabled={isAdded} className="h-9">
            {isAdded ? <><Check className="w-4 h-4 mr-1" />Skickat</> : <><UserPlus className="w-4 h-4 mr-1" />Lägg till</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function FriendsTab() {
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [requests, setRequests] = useState<FriendRequest[]>(mockFriendRequests)
  const [suggested] = useState<Friend[]>(mockSuggestedFriends)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFriends = friends.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAcceptRequest = (id: string) => {
    const request = requests.find((r) => r.id === id)
    if (request) {
      setFriends((prev) => [...prev, { id: request.fromUserId, name: request.fromUserName, badge: request.fromUserBadge, status: "OFFLINE" }])
      setRequests((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const handleDeclineRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const handleRemoveFriend = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id))
  }

  const handleAddFriend = (id: string) => {
    // In real app, send friend request
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Sök vänner..." className="w-full bg-secondary rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {requests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            Vänförfrågningar
            <Badge variant="destructive" className="text-xs">{requests.length}</Badge>
          </h3>
          {requests.map((request) => (<FriendRequestCard key={request.id} request={request} onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} />))}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Mina vänner ({filteredFriends.length})</h3>
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (<FriendCard key={friend.id} friend={friend} onRemove={handleRemoveFriend} />))
        ) : (
          <Card className="bg-card border-border"><CardContent className="p-6 text-center"><p className="text-muted-foreground text-sm">Inga vänner hittades</p></CardContent></Card>
        )}
      </div>

      {suggested.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Föreslagna vänner</h3>
          {suggested.map((friend) => (<SuggestedFriendCard key={friend.id} friend={friend} onAdd={handleAddFriend} />))}
        </div>
      )}
    </div>
  )
}

// ============ Bottom Navigation ============

function BottomNav({ activeTab }: { activeTab: string }) {
  const tabs = [
    { id: "home", label: "Hem", icon: Home, href: "/" },
    { id: "history", label: "Resor", icon: History, href: "/rest-history" },
    { id: "community", label: "Community", icon: Users, href: "/community" },
    { id: "settings", label: "Inst.", icon: Settings, href: "/settings" },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe z-10">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link key={tab.id} href={tab.href} className={`flex flex-col items-center justify-center w-16 h-full min-h-[48px] transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ============ Main Component ============

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<CommunityTab>("feed")
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all")
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts)
  const [comments, setComments] = useState<Record<string, Comment[]>>(mockComments)

  const handleLike = (postId: string) => {
    setPosts((prev) => prev.map((post) => post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post))
  }

  const handleAddComment = (postId: string, content: string) => {
    const newComment: Comment = { id: `c${Date.now()}`, postId, authorName: "Ahmed K.", authorBadge: "COMMITTED_DRIVER", content, createdAt: new Date() }
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }))
  }

  const handleCreatePost = (content: string, type: "DIARY" | "STORY" | "TIP") => {
    const newPost: CommunityPost = { id: `p${Date.now()}`, authorId: "current-user", authorName: "Ahmed K.", authorBadge: "COMMITTED_DRIVER", content, type, likes: 0, comments: 0, createdAt: new Date(), isLiked: false }
    setPosts((prev) => [newPost, ...prev])
    setComments((prev) => ({ ...prev, [newPost.id]: [] }))
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <h1 className="text-lg font-semibold text-foreground">Förarmötesplatsen</h1>
          <DriverBadge badge="COMMITTED_DRIVER" size="sm" />
        </div>
        <div className="max-w-lg mx-auto">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      {activeTab === "feed" && <QuickAlertBar alerts={mockAlerts} />}

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {activeTab === "feed" && (
          <>
            <FeedFilterBar filter={feedFilter} onFilterChange={setFeedFilter} />
            <PostComposer onCreatePost={handleCreatePost} />
            <div className="space-y-4">
              {posts.map((post) => (<CommunityFeedCard key={post.id} post={post} onLike={handleLike} comments={comments[post.id] || []} onAddComment={handleAddComment} />))}
            </div>
            <Button variant="secondary" className="w-full h-12">Ladda fler inlägg</Button>
          </>
        )}

        {activeTab === "groups" && <GroupsTab />}
        {activeTab === "friends" && <FriendsTab />}
      </main>

      <BottomNav activeTab="community" />
    </div>
  )
}
