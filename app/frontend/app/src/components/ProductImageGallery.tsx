"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/app/src/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/Carousel"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog"
import { AspectRatio } from "@/components/ui/AspectRatio"

interface ProductImageGalleryProps {
  images: string[]
  title: string
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Main Image avec Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogTrigger asChild>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted cursor-pointer">
            <Image
              src={images[selectedImage] || "/assets/images/collections/placeholder.svg"}
              alt={`${title} - Image ${selectedImage + 1}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-full p-0">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <AspectRatio ratio={1} className="overflow-hidden">
                    <Image
                      src={image || "/assets/images/collections/placeholder.svg"}
                      alt={`${title} - Image ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-muted transition-all hover:opacity-75",
                selectedImage === index && "ring-2 ring-primary ring-offset-2",
              )}
            >
              <Image
                src={image || "/assets/images/collections/placeholder.svg"}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
