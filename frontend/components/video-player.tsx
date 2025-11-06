"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, Volume2, VolumeX, Maximize, Share2 } from "lucide-react"

interface Video {
  id: number
  title: string
  description: string
  duration: string
  thumbnail: string
  url: string
  uploadedAt: string
}

interface VideoPlayerProps {
  video: Video
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(false)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number.parseFloat(e.target.value)
    setProgress(newProgress)
    if (videoRef.current) {
      videoRef.current.currentTime = newProgress
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-black">
        <div className="relative w-full bg-black aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full"
            poster={video.thumbnail}
            onTimeUpdate={(e) => {
              if (videoRef.current) {
                setProgress(videoRef.current.currentTime)
              }
            }}
          >
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Play Button Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
              onClick={handlePlayPause}
            >
              <Play className="w-20 h-20 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-card p-4 space-y-3">
          <input
            type="range"
            min="0"
            max={videoRef.current?.duration || 100}
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePlayPause} className="gap-2 bg-transparent">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleMuteToggle} className="gap-2 bg-transparent">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number.parseFloat(e.target.value))}
                  className="w-24 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Video Information */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
        <p className="text-muted-foreground mb-4">{video.description}</p>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-semibold">{video.duration}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Uploaded</p>
            <p className="font-semibold">{video.uploadedAt}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
