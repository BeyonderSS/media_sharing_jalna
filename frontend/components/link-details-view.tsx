"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, TrendingUp, Monitor, Smartphone, ArrowRight, Calendar } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ShareLink {
  id: number
  mediaId: number
  mediaTitle: string
  shareUrl: string
  title: string
  createdAt: string
  expiresAt: string
  isPasswordProtected: boolean
  totalClicks: number
  uniqueClicks: number
  lastClick: string
  lastClickBrowser: string
  lastClickOS: string
  averageDailyClicks: number
  averageWeeklyClicks: number
  averageMonthlyClicks: number
  averageRedirectionTime: number
  maxClicks: number
}

interface LinkDetailsViewProps {
  link: ShareLink
  onClose: () => void
}

export default function LinkDetailsView({ link, onClose }: LinkDetailsViewProps) {
  const browserData = [
    { name: "Chrome", value: Math.floor(link.totalClicks * 0.45) },
    { name: "Firefox", value: Math.floor(link.totalClicks * 0.25) },
    { name: "Safari", value: Math.floor(link.totalClicks * 0.2) },
    { name: "Edge", value: Math.floor(link.totalClicks * 0.1) },
  ]

  const osData = [
    { name: "Windows", value: Math.floor(link.totalClicks * 0.4) },
    { name: "macOS", value: Math.floor(link.totalClicks * 0.3) },
    { name: "iOS", value: Math.floor(link.totalClicks * 0.2) },
    { name: "Android", value: Math.floor(link.totalClicks * 0.1) },
  ]

  const dailyData = [
    { date: "Mon", clicks: Math.floor(link.averageDailyClicks * 0.8) },
    { date: "Tue", clicks: Math.floor(link.averageDailyClicks * 1.1) },
    { date: "Wed", clicks: Math.floor(link.averageDailyClicks * 0.9) },
    { date: "Thu", clicks: Math.floor(link.averageDailyClicks * 1.3) },
    { date: "Fri", clicks: Math.floor(link.averageDailyClicks * 1.2) },
    { date: "Sat", clicks: Math.floor(link.averageDailyClicks * 0.6) },
    { date: "Sun", clicks: Math.floor(link.averageDailyClicks * 0.5) },
  ]

  const COLORS = ["#06b6d4", "#0891b2", "#0e7490", "#155e75"]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-1">{link.title}</h2>
              <p className="text-sm text-muted-foreground">{link.shareUrl}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Total Clicks</p>
              </div>
              <p className="text-2xl font-bold">{link.totalClicks}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Unique Clicks</p>
              </div>
              <p className="text-2xl font-bold">{link.uniqueClicks}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Avg Time</p>
              </div>
              <p className="text-2xl font-bold">{link.averageRedirectionTime}s</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Created</p>
              </div>
              <p className="text-sm font-bold">{link.createdAt}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Clicks */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Clicks Over 7 Days
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Browser Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Browser Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#06b6d4"
                    dataKey="value"
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* OS Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                OS Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={osData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#0891b2"
                    dataKey="value"
                  >
                    {osData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Average Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Average Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-lg font-bold">{link.averageDailyClicks} clicks</p>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Weekly Average</p>
                  <p className="text-lg font-bold">{link.averageWeeklyClicks} clicks</p>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Monthly Average</p>
                  <p className="text-lg font-bold">{link.averageMonthlyClicks} clicks</p>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-lg font-bold">
                    {link.totalClicks > 0 ? ((link.uniqueClicks / link.totalClicks) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Link Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Link Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                <p className="font-medium">{link.createdAt}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Expires</p>
                <p className="font-medium">{link.expiresAt}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Last Click</p>
                <p className="font-medium">{link.lastClick}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Last Browser / OS</p>
                <p className="font-medium">
                  {link.lastClickBrowser} / {link.lastClickOS}
                </p>
              </div>
              {link.maxClicks > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Max Clicks Limit</p>
                  <p className="font-medium">
                    {link.totalClicks} / {link.maxClicks}
                  </p>
                </div>
              )}
              {link.isPasswordProtected && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Security</p>
                  <p className="font-medium text-amber-600">Password Protected</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}
