import { motion } from "framer-motion";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { Map, Zap, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

// Photo Gallery Carousel Component with Lightbox
function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  
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

  // Guard against currentIndex exceeding maxIndex when visibleCount changes
  useEffect(() => {
    const maxIndex = Math.max(0, images.length - visibleCount);
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [visibleCount, images.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, images.length - visibleCount);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, images.length - visibleCount);
      return prev <= 0 ? maxIndex : prev - 1;
    });
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
            className="flex gap-0 md:gap-6 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className={`flex-shrink-0 relative overflow-hidden rounded-lg shadow-md cursor-pointer ${
                  visibleCount === 1 ? 'w-full' : 
                  visibleCount === 2 ? 'w-full md:w-[calc(50%-12px)]' :
                  'w-full md:w-[calc(33.333%-16px)]'
                }`}
                onClick={() => openLightbox(index)}
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
  return (
    <section className="py-16 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Freedom and Exclusivity</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg max-w-4xl mx-auto">
              Navigate towards exclusivity aboard one of the rare catamaran cruises departing from Krabi. Explore the Andaman Sea as few travelers have the chance to do: in complete freedom, away from tourist circuits, with an itinerary designed entirely for you.
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
              <h3 className="font-heading font-bold text-xl mb-2">Tailor-made routes</h3>
              <p className="text-gray-600 flex-grow">We compose your itinerary to reveal the best of the region, prioritizing preserved sites and exceptional moments.</p>
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
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">Expert crew</h3>
              <p className="text-gray-600 flex-grow">Our captains have perfect mastery of these waters. They optimize each navigation by adapting to weather conditions, tides and winds to maximize your pleasure.</p>
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
              <h3 className="font-heading font-bold text-xl mb-2">Total freedom</h3>
              <p className="text-gray-600 flex-grow">Deserted beaches, turquoise lagoons, snorkeling in crystal-clear waters... Your cruise evolves according to your preferences.</p>
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
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3 text-center">This Lagoon 470 catamaran (1999)</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-gray-600 text-lg text-center">
              constantly improved since 2023, combines comfort and character. It has 4 double cabins with private bathrooms: two cabins with queen-size beds (160 cm) and two with double beds (140 cm). Each cabin is equipped with fans, 220V sockets and large storage spaces.
            </p>
            <p className="text-gray-600 text-lg text-center">
              Spacious and well-designed, the Lagoon offers seamless flow between the interior and exterior living spaces: large, bright living room, equipped kitchen, shaded cockpit, sunbathing area at the front, etc. The discreet engine ensures peaceful navigation.
            </p>
            <p className="text-gray-600 text-lg text-center">
              Perfect for holidays with family, friends or private charter, this boat guarantees your comfort, privacy and freedom to explore the most beautiful islands of the Andaman Sea.
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
        
        {/* Route Suggestions Section */}
        <motion.div 
          className="mt-16"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Route suggestions</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg max-w-4xl mx-auto">
              Each itinerary adapts to the season and natural conditions to guarantee you an optimal experience.
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
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">1 day</span>
                <span className="text-gray-600 text-lg md:ml-4">Local islands of Ao Nang or Koh Hong archipelago</span>
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
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">2 days</span>
                <span className="text-gray-600 text-lg md:ml-4">Head towards Koh Hong or the legendary Koh Phi Phi</span>
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
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">3/4 days</span>
                <span className="text-gray-600 text-lg md:ml-4">Combined Phang Nga Bay and Koh Phi Phi</span>
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
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">5/6 days</span>
                <span className="text-gray-600 text-lg md:ml-4">Getaway to the preserved waters of Koh Rok and Koh Mook</span>
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
                <span className="font-bold text-xl text-primary md:w-32 mb-2 md:mb-0">7+ days</span>
                <span className="text-gray-600 text-lg md:ml-4">Odyssey to the paradise islands of Koh Lipe or Similan</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}