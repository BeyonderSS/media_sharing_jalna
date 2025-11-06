"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { api, type Media } from "@/lib/api"
import { toast } from "sonner"

interface UploadFormProps {
  onUpload: (media: Media) => void
  onCancel: () => void
}

export default function UploadForm({ onUpload, onCancel }: UploadFormProps) {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!title.trim()) {
        setTitle(selectedFile.name)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      if (!title.trim()) {
        setTitle(droppedFile.name)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select a file to upload")
      return
    }

    setUploading(true)
    try {
      const response = await api.uploadMedia(file, title || undefined)
      toast.success("Media uploaded successfully!")
      onUpload(response.data)
      setTitle("")
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload media")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Media Title (Optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter media title or leave blank to use filename..."
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div
        className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary transition-colors relative touch-manipulation"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap px-2">
              <p className="text-xs sm:text-sm font-medium break-all">{file.name}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              Drag and drop files here or tap to upload
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!file || uploading}
          className="w-full sm:w-auto"
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </form>
  )
}
