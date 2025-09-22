import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
interface GalleryImage {
  src: string;
  alt: string;
}
interface GalleryProps {
  images: GalleryImage[];
  title?: string;
  subtitle?: string;
  className?: string;
}
export default function Gallery({
  images,
  title,
  subtitle,
  className = ""
}: GalleryProps) {
  const {
    t: t
  } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  // Calculate how many images to show at once based on screen size
  const updateVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return;
    const newCount = window.innerWidth >= 768 ? 3 : 1;
    setVisibleCount(newCount);
    // Clamp current index to new constraints
    const newMaxIndex = Math.max(0, images.length - newCount);
    setCurrentIndex(prev => Math.min(prev, newMaxIndex));
  }, [images.length]);

  // Update visible count on resize
  useEffect(() => {
    updateVisibleCount();
    const handleResize = () => {
      updateVisibleCount();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateVisibleCount]);
  const maxIndex = Math.max(0, images.length - visibleCount);
  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };
  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };
  const openLightbox = (index: number) => {
    // Store the currently focused element
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    setLightboxIndex(index);
    setLightboxOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Focus the lightbox after it's opened
    setTimeout(() => {
      lightboxRef.current?.focus();
    }, 50);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to the element that was focused before opening
    setTimeout(() => {
      lastFocusedElementRef.current?.focus();
    }, 50);
  };
  const nextLightboxImage = () => {
    setLightboxIndex(prev => (prev + 1) % images.length);
  };
  const prevLightboxImage = () => {
    setLightboxIndex(prev => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard navigation in lightbox
  const handleLightboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevLightboxImage();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextLightboxImage();
    }
    if (e.key === 'Tab') {
      // Basic focus trap - keep focus within lightbox
      const focusableElements = lightboxRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusableElements || focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  if (images.length === 0) return null;
  return <>
      <div className={`py-16 bg-white ${className}`}>
        <div className="container mx-auto px-4">
          {(title || subtitle) && <div className="text-center mb-8">
              {title && <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>}
              {subtitle && <p className="text-xl text-gray-600 text-center mb-8">{subtitle}</p>}
            </div>}
          
          <div className="relative max-w-7xl mx-auto">
            <div className="relative overflow-hidden">
              <div className="flex gap-4 md:gap-6 transition-transform duration-500 ease-in-out" style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
            }}>
                {images.map((image, index) => <div key={index} className="flex-shrink-0 relative overflow-hidden rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow" style={{
                width: visibleCount === 1 ? '100%' : `calc(${100 / visibleCount}% - ${visibleCount === 1 ? 0 : 16}px)`
              }} onClick={() => openLightbox(index)} data-testid={`gallery-image-${index}`}>
                    <div className="relative h-64">
                      <img src={image.src} alt={image.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-white text-sm bg-black/70 px-3 py-1 rounded">{t("Cliquerpouragrandir", {
                        defaultValue: "Cliquerpouragrandir"
                      })}</div>
                      </div>
                    </div>
                  </div>)}
              </div>
              
              {/* Navigation Buttons - Only show if there are more images than visible */}
              {images.length > visibleCount && <>
                  {currentIndex > 0 && <button onClick={prevSlide} className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-r-lg md:rounded-r-lg shadow-lg transition-all duration-200 hover:pl-3 md:hover:pl-4 z-10" aria-label={t("Imagesprxe9cxe9dente", {
                defaultValue: "Imagesprxe9cxe9dente"
              })} data-testid="gallery-prev-button">
                      <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
                    </button>}
                  
                  {currentIndex < maxIndex && <button onClick={nextSlide} className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-l-lg shadow-lg transition-all duration-200 hover:pr-3 md:hover:pr-4 z-10" aria-label={t("Imagessuivantes", {
                defaultValue: "Imagessuivantes"
              })} data-testid="gallery-next-button">
                      <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
                    </button>}
                </>}
            </div>
            
            {/* Image indicators */}
            {images.length > visibleCount && <div className="flex justify-center mt-4 space-x-2">
                {Array.from({
              length: maxIndex + 1
            }).map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-primary' : 'bg-gray-300'}`} aria-label={`Aller au groupe d'images ${index + 1}`} />)}
              </div>}
          </div>
        </div>
      </div>

      {/* Lightbox Modal - Fixed positioning to account for header */}
      {lightboxOpen && <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center" onClick={closeLightbox} onKeyDown={handleLightboxKeyDown} tabIndex={-1} data-testid="gallery-lightbox">
          <div ref={lightboxRef} className="relative max-w-6xl w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()} tabIndex={-1}>
            {/* Close button - Positioned to avoid header collision */}
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-white bg-black/70 hover:bg-black/90 p-3 rounded-full transition-colors z-10 shadow-lg" aria-label={t("Fermerlagalerie", {
          defaultValue: "Fermerlagalerie"
        })} data-testid="gallery-close-button">
              <X className="w-6 h-6" />
            </button>
            
            {/* Previous button */}
            <button onClick={prevLightboxImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-3 rounded-full transition-colors shadow-lg" aria-label={t("Imageprxe9cxe9dente", {
          defaultValue: "Imageprxe9cxe9dente"
        })} data-testid="gallery-lightbox-prev">
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Image */}
            <img src={images[lightboxIndex].src} alt={images[lightboxIndex].alt} className="max-w-full max-h-full object-contain" data-testid="gallery-lightbox-image" />
            
            {/* Next button */}
            <button onClick={nextLightboxImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-3 rounded-full transition-colors shadow-lg" aria-label={t("Imagesuivante", {
          defaultValue: "Imagesuivante"
        })} data-testid="gallery-lightbox-next">
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Image counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-black/70 px-4 py-2 rounded-full">
              <span className="text-sm">
                {lightboxIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </div>}
    </>;
}