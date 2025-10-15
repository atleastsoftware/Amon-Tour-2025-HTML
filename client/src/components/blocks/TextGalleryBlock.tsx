import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
  
  const title = config.title ?? "Titre de la galerie";
  const subtitle = config.subtitle ?? "Description pour votre galerie d'images";
  const titleColor = config.titleColor ?? "#333333";
  const subtitleColor = config.subtitleColor ?? "#666666";
  const dividerColor = config.dividerColor ?? "#3BA8AF";
  const backgroundColor = config.backgroundColor ?? "#ffffff";
  const images = config.images ?? [];
  const carouselType = config.carouselType ?? "grande";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden"
            >
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {images.map((img, index) => (
                  <motion.div
                    key={index}
                    className="flex-shrink-0 w-64 md:w-80 snap-start cursor-pointer group"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`Galerie image ${index + 1}`}
                      className="w-full h-48 md:h-56 object-cover rounded-lg shadow-lg"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Lightbox Modal */}
              {currentImageIndex !== null && (
                <div 
                  className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                  onClick={() => setCurrentImageIndex(0)}
                >
                  <div className="relative max-w-6xl max-h-[90vh]">
                    <button
                      onClick={() => setCurrentImageIndex(0)}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800 rotate-45" />
                    </button>
                    <img
                      src={images[currentImageIndex]}
                      alt={`Galerie image ${currentImageIndex + 1}`}
                      className="max-w-full max-h-[90vh] object-contain rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </motion.div>
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
