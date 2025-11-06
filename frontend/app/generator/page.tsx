"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Plus, TrendingUp, Link2, Lock, Eye, RefreshCw } from "lucide-react"
import { useSearchParams } from "next/navigation"
import ShareLinkForm from "@/components/share-link-form"
import ShareLinkAnalytics from "@/components/share-link-analytics"
import LinkDetailsView from "@/components/link-details-view"
import { api, type Media, type ShareLinkWithMedia } from "@/lib/api"
import { toast } from "sonner"

export default function URLGeneratorPage() {
  const searchParams = useSearchParams()
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [shareLinks, setShareLinks] = useState<ShareLinkWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingShareLinks, setLoadingShareLinks] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedLinkForDetails, setSelectedLinkForDetails] = useState<ShareLinkWithMedia | null>(null)

  useEffect(() => {
    loadMedia()
  }, [])

  useEffect(() => {
    const mediaId = searchParams.get("mediaId")
    if (mediaId) {
      setSelectedMediaId(mediaId)
      const media = mediaList.find((m) => m.id === mediaId)
      if (media) {
        setSelectedMedia(media)
        loadShareLinks(mediaId)
      }
    }
  }, [searchParams, mediaList])

  useEffect(() => {
    if (selectedMediaId) {
      loadShareLinks(selectedMediaId)
    }
  }, [selectedMediaId])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const response = await api.getAllMedia()
      setMediaList(response.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  const loadShareLinks = async (mediaId: string) => {
    try {
      setLoadingShareLinks(true)
      const response = await api.getShareLinksByMedia(mediaId, {
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      setShareLinks(response.data.shareLinks)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load share links")
    } finally {
      setLoadingShareLinks(false)
    }
  }

  const handleSelectMedia = (media: Media) => {
    setSelectedMedia(media)
    setSelectedMediaId(media.id)
    loadShareLinks(media.id)
  }

  const handleGenerateLink = async (expiresAt: string, password: string | null) => {
    if (!selectedMedia) return

    try {
      const response = await api.createShareLink(selectedMedia.id, expiresAt, password || undefined)
      toast.success("Share link created successfully!")
      setShareLinks([response.data as ShareLinkWithMedia, ...shareLinks])
      setIsFormOpen(false)
    } catch (error) {
      throw error // Let the form handle the error
    }
  }

  const handleCopyURL = (shareUrl: string, id: string) => {
    navigator.clipboard.writeText(shareUrl)
    setCopiedId(id)
    toast.success("URL copied to clipboard!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const filteredLinks = shareLinks
  const totalClicks = filteredLinks.reduce((sum, link) => {
    // We'll need to fetch analytics to get real click counts
    return sum
  }, 0)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Share & Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Generate expirable links and track sharing analytics</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2 w-full sm:w-auto" disabled={!selectedMedia}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Generate Share Link</span>
          <span className="sm:hidden">Generate Link</span>
        </Button>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Select Media</h2>
        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-muted-foreground text-sm sm:text-base">Loading media...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mediaList.map((media) => {
              const isImage = media.mimeType.startsWith("image/")
              return (
                <Card
                  key={media.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedMedia?.id === media.id ? "ring-2 ring-primary bg-primary/5" : "hover:border-primary"
                  }`}
                  onClick={() => handleSelectMedia(media)}
                >
                  <div className="h-24 mb-3 rounded overflow-hidden bg-muted">
                    {isImage ? (
                      <img
                        src={api.getMediaFileUrl(media.id)}
                        alt={media.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">{media.mimeType}</p>
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-sm truncate">{media.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {(media.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {!selectedMedia && (
        <Card className="p-8 sm:p-12 text-center">
          <Link2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-base sm:text-lg px-4">Select a media file to generate share links</p>
        </Card>
      )}

      {isFormOpen && selectedMedia && (
        <div className="mb-6 md:mb-8">
          <Card className="p-4 sm:p-6">
            <ShareLinkForm onGenerate={handleGenerateLink} onCancel={() => setIsFormOpen(false)} />
          </Card>
        </div>
      )}

      {selectedMedia && (
        <>
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Share Links</p>
                  <p className="text-2xl sm:text-3xl font-bold">{filteredLinks.length}</p>
                </div>
                <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
              </div>
            </Card>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Active Links</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {filteredLinks.filter((l) => !l.isExpired).length}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-accent/50" />
              </div>
            </Card>
            <Card className="p-4 sm:p-6">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Password Protected</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {filteredLinks.filter((l) => l.hasPassword).length}
                </p>
              </div>
            </Card>
          </div>

          {/* Share Links Table */}
          <Card className="mt-6 md:mt-8">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold break-words">
                  Share Links for {selectedMedia.title}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadShareLinks(selectedMedia.id)}
                  disabled={loadingShareLinks}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingShareLinks ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {loadingShareLinks ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-muted-foreground text-sm sm:text-base">Loading share links...</p>
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Link2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground text-base sm:text-lg px-4">
                    No share links yet. Create your first shareable link!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-xs sm:text-sm">Share Link</p>
                          {link.hasPassword && <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                          {link.isExpired && (
                            <span className="text-xs text-destructive">Expired</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground break-all sm:truncate mb-1">
                          Expires: {formatDate(link.expiresAt)}
                        </p>
                        <p className="text-xs text-muted-foreground break-all sm:truncate mb-1">
                          Short: {link.shortUrl || `${process.env.NEXT_PUBLIC_URL_SHORTNER_ENDPOINT || "https://url-shortner-personal-seven.vercel.app"}/${link.shortCode}`}
                        </p>
                        <p className="text-xs text-muted-foreground break-all sm:truncate" title={link.shareUrl}>
                          Long: {link.shareUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLinkForDetails(link)}
                          className="gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyURL(link.shortUrl|| `${process.env.NEXT_PUBLIC_URL_SHORTNER_ENDPOINT || "https://url-shortner-personal-seven.vercel.app"}/${link.shortCode}`, link.id)}
                          className="gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Copy
                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                              copiedId === link.id ? "text-primary" : ""
                            }`}
                          />
                          <span className="hidden sm:inline">{copiedId === link.id ? "Copied!" : "Copy"}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Detailed View Modal */}
      {selectedLinkForDetails && (
        <LinkDetailsView
          link={selectedLinkForDetails}
          onClose={() => setSelectedLinkForDetails(null)}
        />
      )}
    </div>
  )
}
