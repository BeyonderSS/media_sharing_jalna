"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LinkIcon } from "lucide-react"

interface URLFormProps {
  onGenerate: (title: string, url: string) => void
  onCancel: () => void
}

export default function URLForm({ onGenerate, onCancel }: URLFormProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const isValidURL = (urlString: string) => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!isValidURL(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    onGenerate(title, url)
    setTitle("")
    setUrl("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">URL Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., My Blog Post"
          className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Long URL</label>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url-to-shorten"
            className="flex-1 px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || !url.trim()}>
          Generate Short URL
        </Button>
      </div>
    </form>
  )
}
