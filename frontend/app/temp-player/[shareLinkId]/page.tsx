"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api, type Media } from "@/lib/api"
import { toast } from "sonner"
import { Download, Lock, AlertCircle } from "lucide-react"

export default function TempPlayerPage({ params }: { params: Promise<{ shareLinkId: string }> }) {
  const { shareLinkId } = use(params)
  const [media, setMedia] = useState<Media | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [expiredAt, setExpiredAt] = useState<string | null>(null)

  useEffect(() => {
    loadMedia()
  }, [shareLinkId])

  const loadMedia = async () => {
    try {
      setLoading(true)
      setError(null)
      setExpired(false)

      // Access share link via API
      const shareData = await api.accessShareLink(shareLinkId)
      setMedia(shareData.data.media)
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load media"
      
      // Check if it's a password error
      if (errorMessage.includes("password") || errorMessage.includes("Unauthorized")) {
        setShowPasswordDialog(true)
        setLoading(false)
        return
      }

      // Check if it's an expiration error
      if (errorMessage.includes("expired") || errorMessage.includes("410") || (err as any)?.status === 410) {
        setExpired(true)
        const expiredDate = (err as any)?.expiredAt
        if (expiredDate) {
          setExpiredAt(expiredDate)
        }
        setError("This share link has expired")
        setLoading(false)
        return
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    try {
      setLoading(true)
      const shareData = await api.accessShareLink(shareLinkId, password)
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-base sm:text-lg">Loading media...</p>
        </div>
      </div>
    )
  }

  if (expired || (error && error.includes("expired"))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 sm:p-8 md:p-12 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Share Link Expired</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            This share link has expired and is no longer accessible.
            {expiredAt && (
              <span className="block mt-2 text-xs sm:text-sm">
                Expired on: {new Date(expiredAt).toLocaleDateString()}
              </span>
            )}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Please contact the owner to request a new share link.
          </p>
        </Card>
      </div>
    )
  }

  if (error && !showPasswordDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 sm:p-8 md:p-12 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Error</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 break-words">{error}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            The share link may be invalid or no longer available.
          </p>
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
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
                autoPlay
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
      </div>

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
                onClick={() => setShowPasswordDialog(false)}
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

