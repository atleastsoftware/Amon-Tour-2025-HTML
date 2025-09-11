import { motion } from "framer-motion";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { Map, Zap, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Photo Gallery Carousel Component
function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = [
    {
      src: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600&h=400&fit=crop",
      alt: "Thai beach with crystal clear water and speedboat"
    },
    {
      src: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&h=400&fit=crop",
      alt: "Phi Phi Islands sunset"
    },
    {
      src: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=600&h=400&fit=crop",
      alt: "Krabi limestone cliffs"
    },
    {
      src: "https://images.unsplash.com/photo-1540202249604-58e38348b89a?w=600&h=400&fit=crop",
      alt: "Thai longtail boat on turquoise water"
    },
    {
      src: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=600&h=400&fit=crop",
      alt: "Maya Bay crystal clear lagoon"
    },
    {
      src: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&h=400&fit=crop",
      alt: "Thailand tropical paradise beach"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, images.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative max-w-7xl mx-auto">
      <div className="relative overflow-hidden">
        <div 
          className="flex gap-6 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / 3 + 2)}%)` }}
        >
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] relative overflow-hidden rounded-lg shadow-md group cursor-pointer"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative h-64">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-r-lg shadow-lg transition-all duration-200 hover:pl-4 z-10"
            aria-label="Previous images"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        {currentIndex < images.length - 3 && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-l-lg shadow-lg transition-all duration-200 hover:pr-4 z-10"
            aria-label="Next images"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
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
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">The Catamaran Experience</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-4xl mx-auto mb-2">
              Navigate towards exclusivity aboard one of the rare catamaran cruises departing from Krabi. Explore the Andaman Sea as few travelers have the chance to do: in complete freedom, away from tourist circuits, with an itinerary designed entirely for you.
            </p>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Your Cruise, Our Expertise:
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
      </div>
    </section>
  );
}