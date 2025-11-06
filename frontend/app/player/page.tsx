"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, List } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import PlaylistPanel from "@/components/playlist-panel"
import AddVideoForm from "@/components/add-video-form"

interface Video {
  id: number
  title: string
  description: string
  duration: string
  thumbnail: string
  url: string
  uploadedAt: string
}

export default function VideoPlayerPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [currentVideoId, setCurrentVideoId] = useState(1)
  const [videos, setVideos] = useState<Video[]>([
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      duration: "24:35",
      thumbnail: "/video-production-setup.png",
      url: "https://example.com/videos/intro-web-dev.mp4",
      uploadedAt: "2024-01-18",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      description: "Deep dive into React hooks and component composition",
      duration: "42:15",
      thumbnail: "/video-production-setup.png",
      url: "https://example.com/videos/react-patterns.mp4",
      uploadedAt: "2024-01-19",
    },
    {
      id: 3,
      title: "Next.js 15 Features",
      description: "Exploring the latest features in Next.js 15",
      duration: "31:50",
      thumbnail: "/video-production-setup.png",
      url: "https://example.com/videos/nextjs-15.mp4",
      uploadedAt: "2024-01-20",
    },
    {
      id: 4,
      title: "Database Design Principles",
      description: "Best practices for designing scalable databases",
      duration: "38:20",
      thumbnail: "/video-production-setup.png",
      url: "https://example.com/videos/db-design.mp4",
      uploadedAt: "2024-01-20",
    },
  ])

  const currentVideo = videos.find((v) => v.id === currentVideoId)

  const handleAddVideo = (title: string, description: string, duration: string) => {
    const newVideo: Video = {
      id: videos.length + 1,
      title,
      description,
      duration,
      thumbnail: "/video-production-setup.png",
      url: "https://example.com/videos/new-video.mp4",
      uploadedAt: new Date().toLocaleDateString(),
    }
    setVideos([newVideo, ...videos])
    setIsFormOpen(false)
    setCurrentVideoId(newVideo.id)
  }

  const handleDeleteVideo = (id: number) => {
    const filtered = videos.filter((v) => v.id !== id)
    setVideos(filtered)
    if (currentVideoId === id && filtered.length > 0) {
      setCurrentVideoId(filtered[0].id)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Video Player</h1>
          <p className="text-muted-foreground">Watch and manage your video library</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPlaylist(!showPlaylist)} className="gap-2 bg-transparent">
            <List className="w-4 h-4" />
            {showPlaylist ? "Hide" : "Show"} Playlist
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Video
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <Card className="p-6">
            <AddVideoForm onAdd={handleAddVideo} onCancel={() => setIsFormOpen(false)} />
          </Card>
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Video Player */}
        <div className={showPlaylist ? "flex-1" : "w-full"}>
          {currentVideo ? (
            <VideoPlayer video={currentVideo} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No videos available</p>
            </Card>
          )}
        </div>

        {/* Playlist Sidebar */}
        {showPlaylist && (
          <div className="w-80">
            <PlaylistPanel
              videos={videos}
              currentVideoId={currentVideoId}
              onSelectVideo={setCurrentVideoId}
              onDeleteVideo={handleDeleteVideo}
            />
          </div>
        )}
      </div>
    </div>
  )
}
