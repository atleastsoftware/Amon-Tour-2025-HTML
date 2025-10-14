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
  const dividerColor = config.dividerColor ?? "#084F6E";
  const backgroundColor = config.backgroundColor ?? "#ffffff";
  const images = config.images ?? [];

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
                <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: subtitleColor }}>
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* Gallery */}
        {images.length > 0 ? (
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
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>Aucune image ajoutée à la galerie</p>
          </div>
        )}
      </div>
    </section>
  );
}
