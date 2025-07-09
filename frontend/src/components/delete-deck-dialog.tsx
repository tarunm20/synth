"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

interface DeleteDeckDialogProps {
  deckName: string
  cardCount: number
  isDeleting: boolean
  onDelete: () => void
  trigger?: React.ReactNode
}

export function DeleteDeckDialog({
  deckName,
  cardCount,
  isDeleting,
  onDelete,
  trigger
}: DeleteDeckDialogProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    onDelete()
    setOpen(false)
  }

  const defaultTrigger = (
    <Button
      variant="destructive"
      size="icon"
      disabled={isDeleting}
      className="h-9 w-9"
    >
      {isDeleting ? (
        <motion.div
          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.1 
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
            >
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </motion.div>
            <div>
              <AlertDialogTitle className="text-left">Delete Deck</AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-1">
                This action cannot be undone
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400"
        >
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-1">
              "{deckName}" will be permanently deleted
            </p>
            <p className="text-gray-600">
              This includes all {cardCount} flashcard{cardCount !== 1 ? 's' : ''} and study progress.
            </p>
          </div>
        </motion.div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Deck
            </motion.div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}