import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { useState, useEffect } from "react";

// Définition des images du carrousel
const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80",
    alt: "Destination landmark 1"
  },
  {
    src: "https://images.unsplash.com/photo-1490077476659-095159692ab5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80", 
    alt: "Beautiful beach landscape"
  },
  {
    src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1679&q=80", 
    alt: "Heritage site"
  },
  {
    src: "https://images.unsplash.com/photo-1506665531195-3566af98b107?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80", 
    alt: "Local culture"
  }
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Fonction pour passer à l'image suivante
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % carouselImages.length);
  };
  
  // Changer d'image automatiquement toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      nextImage();
    }, 5000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  return (
    <section id="hero" className="relative h-[70vh]">
      <motion.div 
        className="absolute inset-0 bg-black/40 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      ></motion.div>
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImage}
            src={carouselImages[currentImage].src}
            alt={carouselImages[currentImage].alt}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        
        {/* Indicateurs de carrousel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentImage ? 'bg-white' : 'bg-white/50'
              } transition-all duration-300`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
        <StaggerChildren className="flex flex-col items-center">
          <StaggerItem>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-4 max-w-3xl">
              Discover Amazing Destinations with Our Tours
            </h1>
          </StaggerItem>
          
          <StaggerItem>
            <p className="text-lg md:text-xl max-w-2xl mb-8">
              Personalized journeys, private tours, and authentic experiences in the heart of your dream destination.
            </p>
          </StaggerItem>
          
          <StaggerItem>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/tours">
                <motion.span 
                  className="bg-primary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Our Tours
                </motion.span>
              </Link>
              <Link href="/custom-tour">
                <motion.span 
                  className="bg-secondary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-secondary-dark transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Custom Tour
                </motion.span>
              </Link>
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
