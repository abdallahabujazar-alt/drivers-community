"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Car,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Construction,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Send,
  Settings,
  Star,
  Timer,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import {
  type CommunityPost,
  type QuickAlert,
  type DriverBadgeType,
  getDriverBadgeLabel,
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

// Mock data for demonstration
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
  {
    id: "a3",
    authorName: "Per G.",
    message: "Vägarbete - ett körfält stängt",
    location: "E20 vid Alingsås",
    type: "ROAD_WORK",
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
]

// Mock comments data
const mockComments: Record<string, Comment[]> = {
  "1": [
    {
      id: "c1",
      postId: "1",
      authorName: "Erik L.",
      authorBadge: "COMMUNITY_HELPER",
      content: "Tack för tipset! Ska definitivt stanna där nästa gång.",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: "c2",
      postId: "1",
      authorName: "Lisa A.",
      authorBadge: "REST_CHAMPION",
      content: "Finns det parkering för långtradare där?",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  ],
  "2": [
    {
      id: "c3",
      postId: "2",
      authorName: "Johan M.",
      authorBadge: "ROAD_EXPERT",
      content: "Grattis! Fortsätt så, det är viktigt att ta hand om sig.",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ],
  "3": [
    {
      id: "c4",
      postId: "3",
      authorName: "Ahmed K.",
      authorBadge: "ROAD_EXPERT",
      content: "Bra gjort! Vi förare måste hjälpa varandra.",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: "c5",
      postId: "3",
      authorName: "Maria S.",
      authorBadge: "COMMITTED_DRIVER",
      content: "Du är en sann hjälte! Tack för att du delar.",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ],
}

function getAlertIcon(type: QuickAlert["type"]) {
  switch (type) {
    case "TRAFFIC":
      return Car
    case "REST_AREA":
      return Coffee
    case "WEATHER":
      return CloudSun
    case "ROAD_WORK":
      return Construction
  }
}

function getAlertColor(type: QuickAlert["type"]) {
  switch (type) {
    case "TRAFFIC":
      return "bg-destructive/20 text-destructive"
    case "REST_AREA":
      return "bg-primary/20 text-primary"
    case "WEATHER":
      return "bg-blue-500/20 text-blue-400"
    case "ROAD_WORK":
      return "bg-amber-500/20 text-amber-400"
  }
}

function getBadgeIcon(badge: DriverBadgeType) {
  switch (badge) {
    case "ROAD_EXPERT":
      return Star
    case "COMMITTED_DRIVER":
      return Shield
    case "COMMUNITY_HELPER":
      return Heart
    case "REST_CHAMPION":
      return Trophy
    case "NEWCOMER":
      return Users
  }
}

function getBadgeColor(badge: DriverBadgeType) {
  switch (badge) {
    case "ROAD_EXPERT":
      return "bg-amber-500/20 text-amber-400"
    case "COMMITTED_DRIVER":
      return "bg-primary/20 text-primary"
    case "COMMUNITY_HELPER":
      return "bg-pink-500/20 text-pink-400"
    case "REST_CHAMPION":
      return "bg-blue-500/20 text-blue-400"
    case "NEWCOMER":
      return "bg-secondary text-secondary-foreground"
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

// Driver Badge Component
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

// Quick Alert Bar Component
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {currentAlert.message}
              </span>
            </div>
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
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Community Feed Card Component
function CommunityFeedCard({
  post,
  onLike,
  comments,
  onAddComment,
}: {
  post: CommunityPost
  onLike: (postId: string) => void
  comments: Comment[]
  onAddComment: (postId: string, content: string) => void
}) {
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
        {/* Author Header */}
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
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* Post Content */}
        <p className="text-foreground text-sm leading-relaxed mb-4">
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition-colors min-h-[44px] px-2 ${
              isLiked ? "text-pink-500" : "text-muted-foreground hover:text-pink-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 text-sm transition-colors min-h-[44px] px-2 ${
              showComments ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className={`w-5 h-5 ${showComments ? "fill-current" : ""}`} />
            <span>{comments.length}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border">
            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground text-xs font-semibold flex-shrink-0">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div className="flex-1 bg-secondary rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Comment Input */}
            <div className="flex gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-semibold flex-shrink-0">
                A
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitComment()
                    }
                  }}
                  placeholder="Skriv en kommentar..."
                  className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="h-9 w-9 rounded-full"
                >
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

// Welcome Card for users who haven't logged rest
function WelcomeCard({ hasLoggedRest }: { hasLoggedRest: boolean }) {
  if (hasLoggedRest) return null

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 flex-shrink-0">
            <Coffee className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">
              Välkommen till förarmötesplatsen!
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Registrera din vilotid för att börja interagera med andra förare och få tillgång till alla funktioner.
            </p>
            <Link href="/">
              <Button variant="default" size="sm" className="h-9">
                <Clock className="w-4 h-4 mr-2" />
                Registrera vilotid
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Bottom Navigation
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
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-16 h-full min-h-[48px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts)
  const [comments, setComments] = useState<Record<string, Comment[]>>(mockComments)
  const [hasLoggedRest] = useState(true) // In real app, check from user data
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostType, setNewPostType] = useState<"DIARY" | "STORY" | "TIP">("DIARY")

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    )
  }

  const handleAddComment = (postId: string, content: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      authorName: "Ahmed K.",
      authorBadge: "COMMITTED_DRIVER",
      content,
      createdAt: new Date(),
    }
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }))
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    const newPost: CommunityPost = {
      id: `p${Date.now()}`,
      authorId: "current-user",
      authorName: "Ahmed K.",
      authorBadge: "COMMITTED_DRIVER",
      content: newPostContent.trim(),
      type: newPostType,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      isLiked: false,
    }

    setPosts((prev) => [newPost, ...prev])
    setComments((prev) => ({ ...prev, [newPost.id]: [] }))
    setNewPostContent("")
    setIsComposerOpen(false)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <h1 className="text-lg font-semibold text-foreground">Förarmötesplatsen</h1>
          <DriverBadge badge="COMMITTED_DRIVER" size="sm" />
        </div>
      </header>

      {/* Quick Alert Bar */}
      <QuickAlertBar alerts={mockAlerts} />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Welcome Card */}
        <WelcomeCard hasLoggedRest={hasLoggedRest} />

        {/* Post Composer */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            {!isComposerOpen ? (
              <button 
                onClick={() => setIsComposerOpen(true)}
                className="flex items-center gap-3 w-full text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-semibold">
                  A
                </div>
                <div className="flex-1 py-2.5 px-4 bg-secondary rounded-full text-muted-foreground text-sm">
                  Dela något med andra förare...
                </div>
                <Button size="icon" variant="ghost" className="h-10 w-10">
                  <Send className="w-5 h-5" />
                </Button>
              </button>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-semibold">
                      A
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Ahmed K.</div>
                      <DriverBadge badge="COMMITTED_DRIVER" size="sm" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsComposerOpen(false)
                      setNewPostContent("")
                    }}
                    className="text-muted-foreground hover:text-foreground p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Type Selector */}
                <div className="flex gap-2">
                  {[
                    { type: "DIARY" as const, label: "Dagbok" },
                    { type: "STORY" as const, label: "Berättelse" },
                    { type: "TIP" as const, label: "Tips" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setNewPostType(item.type)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        newPostType === item.type
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Text Area */}
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Vad vill du dela med andra förare?"
                  className="w-full min-h-[120px] bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                  autoFocus
                />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {newPostContent.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsComposerOpen(false)
                        setNewPostContent("")
                      }}
                      className="h-10"
                    >
                      Avbryt
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim()}
                      className="h-10 gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Publicera
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <CommunityFeedCard 
              key={post.id} 
              post={post} 
              onLike={handleLike}
              comments={comments[post.id] || []}
              onAddComment={handleAddComment}
            />
          ))}
        </div>

        {/* Load More */}
        <Button variant="secondary" className="w-full h-12">
          Ladda fler inlägg
        </Button>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab="community" />
    </div>
  )
}
