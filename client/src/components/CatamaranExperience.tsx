import { motion } from "framer-motion";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { Map, Zap, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/contexts/TranslationContext";

// Photo Gallery Carousel Component with Lightbox
function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const images = [
    {
      src: "/attached_assets/790fc1de-1a62-4e19-93eb-f2529f131485_1757686414762.jpeg",
      alt: "Lagoon 470 catamaran - Cabine avec lit"
    },
    {
      src: "/attached_assets/626e6d17-dc9b-420e-b3ee-fad71c615c7e_1757686414762.jpeg",
      alt: "Lagoon 470 catamaran - Espace de vie"
    },
    {
      src: "/attached_assets/3046de19-33b6-4374-999b-c01da9abda7d_1757686414762.jpeg",
      alt: "Lagoon 470 catamaran - Vue extérieure"
    },
    {
      src: "/attached_assets/a03261ff-35eb-4352-abf8-9eb698da17ec_1757686436923.jpeg",
      alt: "Lagoon 470 catamaran - Pont avant"
    },
    {
      src: "/attached_assets/9b469d5b-7a43-4f13-81e5-36826d34a4d0_1757686436923.jpeg",
      alt: "Lagoon 470 catamaran - En navigation"
    },
    {
      src: "/attached_assets/6d7d224d-fe2e-4c12-aee4-52d19d976971_1757686436923.jpeg",
      alt: "Lagoon 470 catamaran - Cuisine"
    },
    {
      src: "/attached_assets/8614f431-1592-46d0-af6e-6b5f8bf88f4a_1757686457872.jpeg",
      alt: "Lagoon 470 catamaran - Cockpit"
    },
    {
      src: "/attached_assets/30877b23-72c3-4bda-9edf-b8a2334af26a_1757686457872.jpeg",
      alt: "Lagoon 470 catamaran - Pont principal"
    },
    {
      src: "/attached_assets/7042dca5-8d61-45a3-a177-28202abbebac_1757686457872.jpeg",
      alt: "Lagoon 470 catamaran - Salle de bain"
    },
    {
      src: "/attached_assets/ec633587-a525-45fc-94f9-ba186247b03d_1757686483511.jpeg",
      alt: "Lagoon 470 catamaran - Vue d'ensemble"
    },
    {
      src: "/attached_assets/ad86696b-61b6-436a-a461-6502877efdf7_1757686483512.jpeg",
      alt: "Lagoon 470 catamaran - Détails intérieurs"
    },
    {
      src: "/attached_assets/a5925b83-84e8-4167-9ebc-2e6721a99ac7_1757686483512.jpeg",
      alt: "Lagoon 470 catamaran - Zone de navigation intérieure"
    },
    {
      src: "/attached_assets/32cfb689-7a4b-42a2-a54b-1c1501343059_1757686498698.jpeg",
      alt: "Lagoon 470 catamaran - Cabine intérieure"
    },
    {
      src: "/attached_assets/62bcbbea-64f9-4c84-8dde-f6cf100b06ac_1757686498698.jpeg",
      alt: "Lagoon 470 catamaran - Arrière du catamaran"
    },
    {
      src: "/attached_assets/c2bbb0b5-ec85-4ff5-afe5-1bc2047eb558_1757686498698.jpeg",
      alt: "Lagoon 470 catamaran - Salon principal"
    },
    {
      src: "/attached_assets/0df32598-c5ce-4ab5-b6b8-364340261657_1757686525806.jpeg",
      alt: "Lagoon 470 catamaran - Vue panoramique"
    },
    {
      src: "/attached_assets/e922cf8c-ae03-4be2-b715-bc1185241ac3_1757686525806.jpeg",
      alt: "Lagoon 470 catamaran - Trampolines"
    },
    {
      src: "/attached_assets/50d065bb-7fe3-460c-842f-205106b21217_1757686525806.jpeg",
      alt: "Lagoon 470 catamaran - Zone d'ancrage"
    },
    {
      src: "/attached_assets/5008f297-b9ad-453f-a386-43ce40898224_1757686525806.jpeg",
      alt: "Lagoon 470 catamaran - Profil du catamaran"
    },
    {
      src: "/attached_assets/ff534450-22ca-4e96-8fac-d503f5939fd9_1757686525806.jpeg",
      alt: "Lagoon 470 catamaran - Équipements et détails"
    },
    {
      src: "/attached_assets/3a45de92-799e-451b-8716-00521427a91e_1757692962965.jpeg",
      alt: "Lagoon 470 catamaran - Photo supplémentaire 1"
    },
    {
      src: "/attached_assets/ef2966c4-e873-4654-a14f-ecfaa8d6acd2_1757692962965.jpeg",
      alt: "Lagoon 470 catamaran - Photo supplémentaire 2"
    },
    {
      src: "/attached_assets/ddfdc492-c289-4bf4-b563-df377b94b3cc_1757692962965.jpeg",
      alt: "Lagoon 470 catamaran - Photo supplémentaire 3"
    },
    {
      src: "/attached_assets/29ce9bad-cae7-4528-8ce1-8624a63f09b9_1757692962965.jpeg",
      alt: "Lagoon 470 catamaran - Photo supplémentaire 4"
    },
    {
      src: "/attached_assets/0bd01e0d-320d-49e9-8003-325e3bde7e68_1757692962965.jpeg",
      alt: "Lagoon 470 catamaran - Photo supplémentaire 5"
    },
    {
      src: "/attached_assets/6a2b81ce-e641-4b05-9fd0-fcf206699dc9_1757692962965.jpeg",
      alt: "Lagoon 470 catamaran - Photo supplémentaire 6"
    },
    {
      src: "/attached_assets/da5f838c-120c-4ede-8cbf-8d6e086d8061_1757692962965.jpeg",
      alt: "Lagoon 470 catamaran - Photo supplémentaire 7"
    }
  ];

  // Créer un tableau avec des clones pour l'effet carousel infini
  const extendedImages = useMemo(() => {
    if (images.length === 0) return [];
    
    // Clone les dernières images au début
    const startClones = images.slice(-visibleCount);
    // Clone les premières images à la fin  
    const endClones = images.slice(0, visibleCount);
    
    return [...startClones, ...images, ...endClones];
  }, [images, visibleCount]);

  // L'index commence à visibleCount (après les clones du début)
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

  // Gestion des transitions infinies
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    
    const totalImages = images.length;
    const maxRealIndex = totalImages + visibleCount - 1;
    
    // Si on est sur les clones de fin, revenir au début réel (sans transition)
    if (currentIndex > maxRealIndex) {
      setCurrentIndex(visibleCount);
    }
    // Si on est sur les clones de début, aller à la fin réelle (sans transition)
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

  return (
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
                  // Calcul de l'index réel pour la lightbox (en excluant les clones)
                  const realIndex = index >= visibleCount && index < extendedImages.length - visibleCount 
                    ? index - visibleCount 
                    : (index - visibleCount + images.length) % images.length;
                  openLightbox(realIndex);
                }}
              >
                <div className="relative h-64">
                  <img 
                    src={image.src} 
                    alt={image.alt}
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
            aria-label="Previous images"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-l-lg shadow-lg transition-all duration-200 hover:pr-4 z-10"
            aria-label="Next images"
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
              aria-label="Close gallery"
              data-testid="button-close-gallery"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={prevLightboxImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <img 
              src={images[lightboxIndex].src} 
              alt={images[lightboxIndex].alt}
              className="max-w-full max-h-full object-contain"
              data-testid="img-lightbox"
            />
            
            <button
              onClick={nextLightboxImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function CatamaranExperience() {
  const { translations } = useTranslation();
  const cruise = translations.cruise;
  
  return (
    <section className="py-20 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{cruise.freedomExclusivity}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {cruise.freedomDescription}
            </p>
          </motion.div>
        </div>
        
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 - Tailor-made routes */}
          <StaggerItem className="flex">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative h-full w-full"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Map size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">{cruise.tailorMadeRoutes}</h3>
              <p className="text-gray-600 flex-grow">{cruise.tailorMadeDesc}</p>
            </motion.div>
          </StaggerItem>
          
          {/* Feature 2 - Expert crew */}
          <StaggerItem className="flex">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative h-full w-full"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">{cruise.expertCrew}</h3>
              <p className="text-gray-600 flex-grow">{cruise.expertCrewDesc}</p>
            </motion.div>
          </StaggerItem>
          
          {/* Feature 3 - Total freedom */}
          <StaggerItem className="flex">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative h-full w-full"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">{cruise.totalFreedom}</h3>
              <p className="text-gray-600 flex-grow">{cruise.totalFreedomDesc}</p>
            </motion.div>
          </StaggerItem>
        </StaggerChildren>
        
        {/* Lagoon Description Section */}
        <motion.div 
          className="mt-20"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3 text-center">{cruise.lagoonCatamaran}</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {cruise.lagoonDesc1}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {cruise.lagoonDesc2}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {cruise.lagoonDesc3}
            </p>
          </div>
        </motion.div>
        
        {/* Photo Gallery Section */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <PhotoGallery />
        </motion.div>
        
        {/* YouTube Video Section */}
        <motion.div 
          className="mt-16 mb-16"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{cruise.videoTitle}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {cruise.videoDescription}
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.youtube.com/embed/VCECtIN2AbQ?rel=0&modestbranding=1&showinfo=0"
                title="Découvrez Notre Catamaran"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Route Suggestions Section */}
        <motion.div 
          className="mt-16"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{cruise.routeSuggestions}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {cruise.routeDescription}
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-4">
            {/* 1 day */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">{cruise.oneDay}</span>
                <span className="text-gray-600 text-lg md:ml-4">
                  Only available through this offer: <a href="https://www.tourninja.io/details/Wmx1GcKCGO" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary underline transition-colors">Catamaran Private Day Trip</a>
                </span>
              </div>
            </motion.div>
            
            {/* 2 days */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">{cruise.twoDays}</span>
                <span className="text-gray-600 text-lg md:ml-4">{cruise.twoDaysRoute}</span>
              </div>
            </motion.div>
            
            {/* 3/4 days */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">{cruise.threeFourDays}</span>
                <span className="text-gray-600 text-lg md:ml-4">{cruise.threeFourDaysRoute}</span>
              </div>
            </motion.div>
            
            {/* 5/6 days */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">{cruise.fiveSixDays}</span>
                <span className="text-gray-600 text-lg md:ml-4">{cruise.fiveSixDaysRoute}</span>
              </div>
            </motion.div>
            
            {/* 7+ days */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">{cruise.sevenPlusDays}</span>
                <span className="text-gray-600 text-lg md:ml-4">{cruise.sevenPlusDaysRoute}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}