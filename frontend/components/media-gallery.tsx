"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Trash2, Play, Link2 } from "lucide-react"
import { api, type Media } from "@/lib/api"
import DeleteMediaDialog from "@/components/delete-media-dialog"
import { toast } from "sonner"

interface MediaGalleryProps {
  items: Media[]
  onDelete: (id: string) => void
  onGenerateLink: (id: string) => void
  onPlayVideo: (id: string) => void
}

export default function MediaGallery({ items, onDelete, onGenerateLink, onPlayVideo }: MediaGalleryProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDownload = (item: Media) => {
    window.open(api.getMediaFileUrl(item.id), "_blank")
  }

  const handleDeleteClick = (item: Media) => {
    setMediaToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete) return

    setDeleting(true)
    try {
      await api.deleteMedia(mediaToDelete.id)
      toast.success("Media deleted successfully")
      onDelete(mediaToDelete.id)
      setDeleteDialogOpen(false)
      setMediaToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete media")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => {
          const mediaType = getMediaType(item.mimeType)
          const isVideo = mediaType === "video"
          const isImage = mediaType === "image"

          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="relative h-40 sm:h-48 bg-muted group cursor-pointer touch-manipulation"
                onClick={() => isVideo && onPlayVideo(item.id)}
              >
                {isImage ? (
                  <img
                    src={api.getMediaFileUrl(item.id)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                ) : isVideo ? (
                  <>
                    <video
                      src={api.getMediaFileUrl(item.id) + "#t=0.1"}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                      disablePictureInPicture
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                      <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <p className="text-muted-foreground text-xs sm:text-sm px-2 text-center">{item.mimeType || "File"}</p>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="font-semibold truncate mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{formatFileSize(item.size)}</p>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => onGenerateLink(item.id)}
                    >
                      <Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 sm:gap-2 bg-transparent text-destructive hover:text-destructive text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <p className="text-muted-foreground text-base sm:text-lg px-4">No media files yet. Upload your first file to get started!</p>
        </div>
      )}

      <DeleteMediaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        media={mediaToDelete}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  )
}
