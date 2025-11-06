"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { type Media } from "@/lib/api"

interface DeleteMediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  media: Media | null
  onConfirm: () => void
  loading?: boolean
}

export default function DeleteMediaDialog({
  open,
  onOpenChange,
  media,
  onConfirm,
  loading = false,
}: DeleteMediaDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Media</AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            Are you sure you want to delete <strong>{media?.title}</strong>? This action cannot be undone.
            <br />
            <br />
            This will also delete all associated share links.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

