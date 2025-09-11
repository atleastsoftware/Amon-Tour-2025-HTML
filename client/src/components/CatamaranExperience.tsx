import { motion } from "framer-motion";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { Map, Zap, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Photo Carousel Component
function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = [
    "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1545300849-ac447b458c0e?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1621277224630-81a57f52e588?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1544551763-92c1e8b2b2a3?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop"
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="min-w-full">
              <img 
                src={src} 
                alt={`Catamaran ${index + 1}`} 
                className="w-full h-[300px] md:h-[400px] object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {images.map((src, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
              index === currentIndex 
                ? 'ring-2 ring-primary ring-offset-2' 
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img 
              src={src} 
              alt={`Thumbnail ${index + 1}`} 
              className="w-20 h-16 object-cover"
            />
          </button>
        ))}
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
        
        {/* Photo Gallery Carousel */}
        <motion.div 
          className="mt-16 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PhotoCarousel />
        </motion.div>
        
        {/* Lagoon Description Section */}
        <motion.div 
          className="mt-8"
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
      </div>
    </section>
  );
}