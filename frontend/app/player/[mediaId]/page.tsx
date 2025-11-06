"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { api, type Media } from "@/lib/api"
import { toast } from "sonner"
import { Download, Lock, ArrowLeft } from "lucide-react"

export default function MediaPlayerPage({ params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = use(params)
  const router = useRouter()
  const [media, setMedia] = useState<Media | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if this is a share link ID (MongoDB ObjectId format) or regular media ID
    // For now, we'll try to access it as a share link first
    loadMedia()
  }, [mediaId])

  const loadMedia = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to access as share link (gallery endpoint)
      try {
        const shareData = await api.accessShareLink(mediaId)
        setMedia(shareData.data.media)
        setLoading(false)
        return
      } catch (shareError) {
        // If it's a 401, show password dialog
        if (shareError instanceof Error && shareError.message.includes("password")) {
          setShowPasswordDialog(true)
          setLoading(false)
          return
        }
        // If it's a 404 or other error, try as regular media
      }

      // Try as regular media ID
      try {
        const allMedia = await api.getAllMedia()
        const foundMedia = allMedia.data.find((m) => m.id === mediaId)
        if (foundMedia) {
          setMedia(foundMedia)
          setLoading(false)
          return
        }
      } catch (mediaError) {
        // Media not found
      }

      setError("Media not found")
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media")
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    try {
      setLoading(true)
      const shareData = await api.accessShareLink(mediaId, password)
      setMedia(shareData.data.media)
      setShowPasswordDialog(false)
      setPassword("")
      setLoading(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid password")
      setLoading(false)
    }
  }

  const getMediaType = (mimeType: string): "image" | "video" | "other" => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    return "other"
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12 sm:py-16">
          <p className="text-muted-foreground text-sm sm:text-base">Loading media...</p>
        </div>
      </div>
    )
  }

  if (error && !showPasswordDialog) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <Card className="p-6 sm:p-8 md:p-12 text-center">
          <p className="text-destructive text-base sm:text-lg mb-4 break-words">{error}</p>
          <Button onClick={() => router.push("/")} variant="outline" className="gap-2 w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Button>
        </Card>
      </div>
    )
  }

  if (!media) {
    return null
  }

  const mediaType = getMediaType(media.mimeType)
  const mediaUrl = api.getMediaFileUrl(media.id)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6">
        <Button onClick={() => router.push("/")} variant="outline" className="gap-2 w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-black flex items-center justify-center min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh]">
          {mediaType === "image" ? (
            <img
              src={mediaUrl}
              alt={media.title}
              className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          ) : mediaType === "video" ? (
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-[70vh] sm:max-h-[80vh] w-full"
              onError={() => {
                toast.error("Failed to load video")
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="p-6 sm:p-12 text-center">
              <p className="text-white mb-3 sm:mb-4 text-base sm:text-lg break-words px-4">{media.title}</p>
              <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">{media.mimeType}</p>
              <Button onClick={() => window.open(mediaUrl, "_blank")} className="gap-2">
                <Download className="w-4 h-4" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-4 sm:mt-6 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 break-words">{media.title}</h2>
        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm mt-3 sm:mt-4">
          <div>
            <p className="text-muted-foreground">File Size</p>
            <p className="font-semibold">{formatFileSize(media.size)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-semibold break-all">{media.mimeType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Uploaded</p>
            <p className="font-semibold">{new Date(media.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <Button onClick={() => window.open(mediaUrl, "_blank")} variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </Card>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              Password Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This share link is password protected. Please enter the password to access the media.
            </p>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePasswordSubmit()
                }
              }}
              className="w-full"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordSubmit} 
                disabled={!password.trim() || loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Loading..." : "Access"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
