import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { useState, useEffect } from "react";
import heroImage from "@/assets/DJI_20241115104455_0160_D-min.jpeg";

// Use direct path to video file that will be served by Express  
const backgroundVideo = "/attached_assets/Catamaran%20cruise%20around%20Ao%20Nang%20local%20islands_1750216800850.mp4";

export default function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Delay video loading to improve initial page load
    const timer = setTimeout(() => {
      setShouldLoadVideo(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <section id="hero" className="relative pt-32 pb-20 min-h-screen flex items-center overflow-hidden">
      {/* Video Background Section with Fallback Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Fallback Image */}
        <img
          src={heroImage}
          alt="Beautiful Krabi landscape"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        
        {/* Video Overlay with lazy loading and better error handling */}
        {shouldLoadVideo && !videoError && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              minWidth: '100%', 
              minHeight: '100%'
            }}
            onLoadStart={() => {
              console.log('Video loading started:', backgroundVideo);
            }}
            onCanPlay={(e) => {
              console.log('Video can play - showing video');
              setVideoLoaded(true);
            }}
            onLoadedData={() => {
              console.log('Video loaded successfully');
              setVideoLoaded(true);
            }}
            onError={(e) => {
              console.error('Video failed to load - using image fallback');
              setVideoError(true);
              setVideoLoaded(false);
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left content - Title and description */}
          <div className="w-full">
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
                  >See our offers</motion.span>
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
          
          
        </div>
      </div>
    </section>
  );
}