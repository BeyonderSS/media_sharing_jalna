"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Lock } from "lucide-react"

interface ShareLinkFormProps {
  onGenerate: (expiresAt: string, password: string | null) => Promise<void>
  onCancel: () => void
}

export default function ShareLinkForm({ onGenerate, onCancel }: ShareLinkFormProps) {
  const [expiresAt, setExpiresAt] = useState("7d")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const calculateExpirationDate = (duration: string): string => {
    if (duration === "never") {
      // Set to far future (100 years)
      const date = new Date()
      date.setFullYear(date.getFullYear() + 100)
      return date.toISOString()
    }

    const days = Number.parseInt(duration.replace("d", ""))
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const expirationDate = calculateExpirationDate(expiresAt)
      await onGenerate(expirationDate, password || null)
      setExpiresAt("7d")
      setPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Expires In
        </label>
        <select
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        >
          <option value="1d">1 Day</option>
          <option value="3d">3 Days</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
          <option value="90d">90 Days</option>
          <option value="never">Never Expires</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Password Protection (Optional)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank for no password"
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
      </div>

      {error && <p className="text-xs sm:text-sm text-destructive break-words">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Creating..." : "Generate Share Link"}
        </Button>
      </div>
    </form>
  )
}
