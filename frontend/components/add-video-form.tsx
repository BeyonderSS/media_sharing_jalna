"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Film } from "lucide-react"

interface AddVideoFormProps {
  onAdd: (title: string, description: string, duration: string) => void
  onCancel: () => void
}

export default function AddVideoForm({ onAdd, onCancel }: AddVideoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please enter a video title")
      return
    }

    if (!description.trim()) {
      setError("Please enter a description")
      return
    }

    if (!duration.trim()) {
      setError("Please enter video duration")
      return
    }

    onAdd(title, description, duration)
    setTitle("")
    setDescription("")
    setDuration("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Video Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Introduction to Web Development"
          className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what the video is about..."
          rows={3}
          className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Duration</label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 24:35"
          className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || !description.trim() || !duration.trim()} className="gap-2">
          <Film className="w-4 h-4" />
          Add Video
        </Button>
      </div>
    </form>
  )
}
