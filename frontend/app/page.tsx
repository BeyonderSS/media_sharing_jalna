"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page on new search
    }, 500) // 500ms debounce delay

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    loadMedia()
  }, [debouncedSearchTerm, currentPage])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const response = await api.getAllMedia(currentPage, 10, debouncedSearchTerm)
      setMediaItems(response.data)
      setTotalPages(response.pages || 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = (media: Media) => {
    // To keep it simple, we can reload the media to see the new upload.
    // Or, if the API returns the new media on the current page, we could add it.
    // For now, let's just reload.
    setIsUploadOpen(false)
    loadMedia()
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

      <div className="mb-6 md:mb-8 bg-gray-600/10 p-2 rounded-md flex justify-center">
        <Input
          placeholder="Search media by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-full sm:max-w-sm"
        />
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
        <>
          <MediaGallery
            items={mediaItems}
            onDelete={handleDelete}
            onGenerateLink={handleGenerateLink}
            onPlayVideo={handlePlayVideo}
          />
          {totalPages > 1 && (
            <div className="mt-6 md:mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
