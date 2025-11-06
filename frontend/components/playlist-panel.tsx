"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface Video {
  id: number
  title: string
  description: string
  duration: string
  thumbnail: string
  uploadedAt: string
}

interface PlaylistPanelProps {
  videos: Video[]
  currentVideoId: number
  onSelectVideo: (id: number) => void
  onDeleteVideo: (id: number) => void
}

export default function PlaylistPanel({ videos, currentVideoId, onSelectVideo, onDeleteVideo }: PlaylistPanelProps) {
  return (
    <Card className="h-[calc(100vh-16rem)] flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Playlist</h3>
        <p className="text-xs text-muted-foreground">{videos.length} videos</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => onSelectVideo(video.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all group ${
              currentVideoId === video.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent/20"
            }`}
          >
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-20 object-cover rounded mb-2"
            />
            <p className="text-xs font-medium line-clamp-2">{video.title}</p>
            <p className="text-xs opacity-75 mt-1">{video.duration}</p>

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteVideo(video.id)
              }}
              className="w-full mt-2 gap-2 bg-transparent text-xs h-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
