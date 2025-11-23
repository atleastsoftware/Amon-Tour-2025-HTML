import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/contexts/TranslationContext";

interface TextGalleryBlockProps {
  block: {
    id: number;
    configuration?: {
      title?: string;
      subtitle?: string;
      titleColor?: string;
      subtitleColor?: string;
      dividerColor?: string;
      backgroundColor?: string;
      carouselType?: 'petite' | 'grande';
      images?: string[];
    };
  };
}

export default function TextGalleryBlock({ block }: TextGalleryBlockProps) {
  const config = block.configuration || {};
  const { translations } = useTranslation();
  const section = `text_gallery_${block.id}`;
  const blockTranslations = translations[section] || {};
  
  const title = blockTranslations.title || config.title || "Titre de la galerie";
  const subtitle = blockTranslations.subtitle || config.subtitle || "Description pour votre galerie d'images";
  const titleColor = config.titleColor ?? "#333333";
  const subtitleColor = config.subtitleColor ?? "#666666";
  const dividerColor = config.dividerColor ?? "#3BA8AF";
  const backgroundColor = config.backgroundColor ?? "#ffffff";
  // Filter out empty images
  const images = (config.images ?? []).filter(img => img && img.trim() !== '');
  const carouselType = config.carouselType ?? "grande";

  // For "grande" carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // For "petite" carousel (infinite scroll)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Responsive visibility - show 1 image on mobile, 2 on tablet, 3 on desktop
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Create extended array with clones for infinite effect
  const extendedImages = useMemo(() => {
    if (images.length === 0) return [];
    
    // Clone last images at the beginning
    const startClones = images.slice(-visibleCount);
    // Clone first images at the end  
    const endClones = images.slice(0, visibleCount);
    
    return [...startClones, ...images, ...endClones];
  }, [images, visibleCount]);

  // Index starts at visibleCount (after start clones)
  useEffect(() => {
    setCurrentIndex(visibleCount);
  }, [visibleCount]);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  };

  // Handle infinite transitions
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    
    const totalImages = images.length;
    const maxRealIndex = totalImages + visibleCount - 1;
    
    // If on end clones, jump to real beginning (no transition)
    if (currentIndex > maxRealIndex) {
      setCurrentIndex(visibleCount);
    }
    // If on start clones, jump to real end (no transition)
    else if (currentIndex < visibleCount) {
      setCurrentIndex(totalImages + visibleCount - 1);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {title && (
                <>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3" style={{ color: titleColor }}>
                    {title}
                  </h2>
                  <div className="w-20 h-1 mx-auto mb-8" style={{ backgroundColor: dividerColor }}></div>
                </>
              )}
              {subtitle && (
                <p className="text-xl text-center mb-8 max-w-3xl mx-auto whitespace-pre-line" style={{ color: subtitleColor }}>
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* Gallery */}
        {images.length > 0 ? (
          carouselType === 'petite' ? (
            <>
              <div className="relative max-w-7xl mx-auto">
                <div className="relative overflow-hidden">
                  <div 
                    className={`gallery-container flex gap-0 md:gap-6 ${
                      isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''
                    }`}
                    style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
                    onTransitionEnd={handleTransitionEnd}
                  >
                    {extendedImages.map((image, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 relative overflow-hidden rounded-lg shadow-md cursor-pointer ${
                          visibleCount === 1 ? 'w-full' : 
                          visibleCount === 2 ? 'w-full md:w-[calc(50%-12px)]' :
                          'w-full md:w-[calc(33.333%-16px)]'
                        }`}
                        onClick={() => {
                          // Calculate real index for lightbox (excluding clones)
                          const realIndex = index >= visibleCount && index < extendedImages.length - visibleCount 
                            ? index - visibleCount 
                            : (index - visibleCount + images.length) % images.length;
                          openLightbox(realIndex);
                        }}
                      >
                        <div className="relative h-64">
                          <img 
                            src={image} 
                            alt={`Galerie image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation Buttons - Always visible for infinite loop */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-r-lg shadow-lg transition-all duration-200 hover:pl-4 z-10"
                    aria-label="Images précédentes"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-l-lg shadow-lg transition-all duration-200 hover:pr-4 z-10"
                    aria-label="Images suivantes"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Lightbox */}
              {lightboxOpen && (
                <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center" onClick={closeLightbox}>
                  <div className="relative max-w-6xl w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={closeLightbox}
                      className="absolute top-16 right-4 md:top-4 text-white bg-black/70 hover:bg-black/90 p-3 rounded-full transition-colors z-10 shadow-lg"
                      aria-label="Fermer la galerie"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={prevLightboxImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    
                    <img 
                      src={images[lightboxIndex]} 
                      alt={`Galerie image ${lightboxIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                    
                    <button
                      onClick={nextLightboxImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg shadow-xl">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`Galerie image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Miniature ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>Aucune image ajoutée à la galerie</p>
          </div>
        )}
      </div>
    </section>
  );
}
