"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload } from "lucide-react"
import MediaGallery from "@/components/media-gallery"
import UploadForm from "@/components/upload-form"
import { useRouter } from "next/navigation"
import { api, type Media } from "@/lib/api"
import { toast } from "sonner"

export default function GalleryPage() {
  const router = useRouter()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const response = await api.getAllMedia()
      setMediaItems(response.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = (media: Media) => {
    setMediaItems([media, ...mediaItems])
    setIsUploadOpen(false)
  }

  const handleDelete = (id: string) => {
    // Remove from local state after successful deletion
    setMediaItems(mediaItems.filter((item) => item.id !== id))
  }

  const handleGenerateLink = (id: string) => {
    router.push(`/generator?mediaId=${id}`)
  }

  const handlePlayVideo = (id: string) => {
    router.push(`/player/${id}`)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Media Gallery</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and organize your media files</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2 w-full sm:w-auto">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Media</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>

      {isUploadOpen && (
        <div className="mb-6 md:mb-8">
          <Card className="p-4 sm:p-6">
            <UploadForm onUpload={handleUpload} onCancel={() => setIsUploadOpen(false)} />
          </Card>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 md:py-16">
          <p className="text-muted-foreground">Loading media...</p>
        </div>
      ) : (
        <MediaGallery
          items={mediaItems}
          onDelete={handleDelete}
          onGenerateLink={handleGenerateLink}
          onPlayVideo={handlePlayVideo}
        />
      )}
    </div>
  )
}
