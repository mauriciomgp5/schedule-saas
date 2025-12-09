import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/utils/cn'

interface GalleryImage {
  id: number
  url: string
  title?: string
  description?: string
  thumbnail?: string
}

interface GalleryProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4
  className?: string
}

export default function Gallery({ images, columns = 3, className }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  const nextImage = () => {
    if (selectedImage === null) return
    setSelectedImage((selectedImage + 1) % images.length)
  }

  const prevImage = () => {
    if (selectedImage === null) return
    setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedImage(null)
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }

  return (
    <>
      <div className={cn('grid gap-4', gridCols[columns], className)}>
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 hover-lift animate-scale-in',
              `animation-delay-${(index % 4) * 200 + 200}`
            )}
          >
            <img
              src={image.thumbnail || image.url}
              alt={image.title || `Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                {image.title && (
                  <h4 className="font-bold mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {image.title}
                  </h4>
                )}
                {image.description && (
                  <p className="text-sm opacity-90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {image.description}
                  </p>
                )}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setSelectedImage(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div
            className="max-w-7xl max-h-[90vh] p-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].title || `Image ${selectedImage + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {(images[selectedImage].title || images[selectedImage].description) && (
              <div className="mt-4 text-center text-white">
                {images[selectedImage].title && (
                  <h3 className="text-2xl font-bold mb-2">{images[selectedImage].title}</h3>
                )}
                {images[selectedImage].description && (
                  <p className="text-gray-300">{images[selectedImage].description}</p>
                )}
              </div>
            )}
            <p className="text-center text-gray-400 mt-4">
              {selectedImage + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
