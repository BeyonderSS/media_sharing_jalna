"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, TrendingUp, Monitor, Smartphone, Calendar, Lock, Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

function formatDate(dateString?: string) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface ShareLink {
  id: string
  mediaId: string
  shortCode: string
  shareUrl: string
  hasPassword: boolean
  password?: string
  expiresAt: string
  createdAt: string
  media?: {
    id: string
    title: string
    mimeType: string
    size: number
  }
}

interface LinkDetailsViewProps {
  link: ShareLink
  onClose: () => void
}

export default function LinkDetailsView({ link, onClose }: LinkDetailsViewProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false) // ✅ Added

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.getShareLinkAnalytics(link.id, link.password)
        setAnalytics(response.data.analytics)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch analytics"
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [link.id, link.password])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center">Loading analytics...</Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={onClose}>Close</Button>
        </Card>
      </div>
    )
  }

  if (!analytics) return null

  const totalViews = analytics["total-clicks"] || 0
  const uniqueVisitors = analytics["total_unique_clicks"] || 0
  const avgViewDuration = analytics["average_redirection_time"] || 0
  const lastClick = analytics["last-click"] || null
  const lastBrowser = analytics["last-click-browser"] || "Unknown"
  const lastOS = analytics["last-click-os"] || "Unknown"

  const browserData = Object.entries(analytics.browser || {}).map(([name, value]) => ({ name, value }))
  const osData = Object.entries(analytics.os_name || {}).map(([name, value]) => ({ name, value }))
  const COLORS = ["#06b6d4", "#0891b2", "#0e7490", "#155e75"]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{link.media?.title ?? "Shared Media"}</h2>
            <p className="text-sm text-muted-foreground">{link.shareUrl}</p>
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <TrendingUp className="w-5 h-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">{totalViews}</p>
          </Card>

          <Card className="p-4">
            <Users className="w-5 h-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Unique Viewers</p>
            <p className="text-2xl font-bold">{uniqueVisitors}</p>
          </Card>

          <Card className="p-4">
            <Clock className="w-5 h-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Avg View Time</p>
            <p className="text-2xl font-bold">{avgViewDuration.toFixed(2)}s</p>
          </Card>

          <Card className="p-4">
            <Calendar className="w-5 h-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm font-bold">{formatDate(link.createdAt)}</p>
          </Card>
        </div>

        {/* Browser Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" /> Browser Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={browserData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                {browserData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* OS Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> OS Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={osData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                {osData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Link Info */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Link Information</h3>

          <p><strong>Created:</strong> {formatDate(link.createdAt)}</p>
          <p><strong>Expires:</strong> {formatDate(link.expiresAt)}</p>
          <p><strong>Last Viewed:</strong> {formatDate(lastClick)}</p>
          <p><strong>Last Browser / OS:</strong> {lastBrowser} / {lastOS}</p>

          {/* ✅ Password Section With Show/Hide */}
          {link.hasPassword && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-amber-600 font-medium">
                <Lock className="w-4 h-4" /> Password:
              </span>
              <span className="font-mono text-sm">
                {showPassword ? link.password : "••••••••"}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </Card>

      </Card>
    </div>
  )
}
