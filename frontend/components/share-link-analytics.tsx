"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"

interface ShareLink {
  id: number
  title: string
  totalClicks: number
  averageDailyClicks: number
  averageWeeklyClicks: number
  averageMonthlyClicks: number
  lastClick: string
}

interface ShareLinkAnalyticsProps {
  links: ShareLink[]
}

export default function ShareLinkAnalytics({ links }: ShareLinkAnalyticsProps) {
  const chartData = links.map((link) => ({
    name: link.title,
    clicks: link.totalClicks,
    daily: link.averageDailyClicks,
    weekly: link.averageWeeklyClicks,
  }))

  const timeSeriesData = [
    { date: "Mon", clicks: 45, uniqueClicks: 32 },
    { date: "Tue", clicks: 52, uniqueClicks: 38 },
    { date: "Wed", clicks: 48, uniqueClicks: 35 },
    { date: "Thu", clicks: 61, uniqueClicks: 44 },
    { date: "Fri", clicks: 55, uniqueClicks: 40 },
    { date: "Sat", clicks: 67, uniqueClicks: 48 },
    { date: "Sun", clicks: 72, uniqueClicks: 52 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Clicks by Link</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="clicks" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Clicks Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={2} />
            <Line type="monotone" dataKey="uniqueClicks" stroke="#0891b2" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
