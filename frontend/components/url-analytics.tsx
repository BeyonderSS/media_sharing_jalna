"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Card } from "@/components/ui/card"

interface URLAnalyticsProps {
  urls: {
    id: number
    title: string
    clicks: number
  }[]
}

export default function URLAnalytics({ urls }: URLAnalyticsProps) {
  const chartData = urls.slice(0, 5).map((url) => ({
    name: url.title.length > 15 ? url.title.substring(0, 15) + "..." : url.title,
    clicks: url.clicks,
  }))

  // Time series data (mock)
  const timeSeriesData = [
    { date: "Jan 15", clicks: 45 },
    { date: "Jan 16", clicks: 52 },
    { date: "Jan 17", clicks: 38 },
    { date: "Jan 18", clicks: 71 },
    { date: "Jan 19", clicks: 64 },
    { date: "Jan 20", clicks: 85 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Clicks by URL</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="clicks" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Clicks Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: "var(--accent)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
