import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { useState, useEffect } from "react";
import heroImage from "@/assets/DJI_20241115104455_0160_D-min.jpeg";
import backgroundVideo from "@/assets/catamaran-cruise-background.mp4";

export default function Hero() {
  return (
    <section id="hero" className="relative pt-32 pb-20 min-h-screen flex items-center overflow-hidden">
      {/* Video Background Section - Limited to Hero section */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ 
            minWidth: '100%', 
            minHeight: '100%'
          }}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left content - Title and description */}
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: [0, 5, 0, -5, 0],
                transition: {
                  y: { duration: 0.6 },
                  x: {
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut"
                  }
                }
              }}
              className="max-w-xl"
            >
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight tracking-tight text-white drop-shadow-lg">
                Your exclusive experiences <br/>
                <span className="text-primary drop-shadow-lg">in Krabi – </span>THAILAND
              </h1>
              
              <p className="text-white/90 mb-8 text-lg drop-shadow-md">
                Discover amazing places away from mass tourism in Krabi.<br/>
                And also Khao Sok, Koh Mook and many more destinations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/tours">
                  <motion.span 
                    className="bg-primary text-white px-8 py-3 mt-4 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    See our offer
                  </motion.span>
                </Link>
                <Link href="/custom-tour">
                  <motion.span 
                    className="bg-primary text-white px-8 py-3 mt-4 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >Custom your trip</motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Right content - Floating content overlay */}
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -8, 0],
                transition: {
                  scale: { duration: 0.6, delay: 0.2 },
                  opacity: { duration: 0.6, delay: 0.2 },
                  y: {
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut"
                  }
                }
              }}
              className="rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm p-6 border border-white/20"
            >
              <div className="text-center text-white">
                <h3 className="text-2xl font-heading font-semibold mb-4 drop-shadow-md">
                  Authentic Thailand Awaits
                </h3>
                <p className="text-white/90 mb-6 drop-shadow-sm">
                  Experience the real Krabi with our expertly crafted tours, 
                  taking you beyond the tourist trails to discover hidden gems.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-white/80">
                  <div className="text-center">
                    <div className="font-semibold text-lg text-primary">50+</div>
                    <div>Tours Available</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg text-primary">1000+</div>
                    <div>Happy Travelers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg text-primary">5★</div>
                    <div>Average Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}