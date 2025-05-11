"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"

interface ProductImagePreviewProps {
  images: Array<{
    id: string
    url: string
    alt: string
  }>
  thumbnailSize?: "small" | "medium" | "large"
  className?: string
}

export function ProductImagePreview({ images, thumbnailSize = "medium", className = "" }: ProductImagePreviewProps) {
  const [open, setOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center ${className}`}>
        <ZoomIn className="h-8 w-8 text-gray-400" />
      </div>
    )
  }

  const currentImage = images[currentImageIndex]

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // 根據縮圖大小設置尺寸
  const sizeClasses = {
    small: "h-10 w-10",
    medium: "h-16 w-16",
    large: "h-24 w-24",
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={`relative cursor-pointer rounded-md overflow-hidden ${sizeClasses[thumbnailSize]} ${className}`}
        >
          <Image
            src={images[0].url || "/placeholder.svg"}
            alt={images[0].alt}
            fill
            className="object-cover hover:scale-105 transition-transform"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full p-0 bg-transparent border-none">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full bg-white/80 dark:bg-gray-900/80"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="relative h-[70vh] w-full">
            <Image
              src={currentImage.url || "/placeholder.svg"}
              alt={currentImage.alt}
              fill
              className="object-contain"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/80 dark:bg-gray-900/80 ml-2"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/80 dark:bg-gray-900/80 mr-2"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-primary w-4" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
