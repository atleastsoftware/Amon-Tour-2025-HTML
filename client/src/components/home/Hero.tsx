import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { useState, useEffect, useRef } from "react";
import heroImage from "@/assets/DJI_20241115104455_0160_D-min.jpeg";

// Use optimized video (6MB instead of 40MB) for better loading performance
const backgroundVideo = "/attached_assets/hero-video-optimized.mp4";
const fallbackVideo = "/attached_assets/Catamaran%20cruise%20around%20Ao%20Nang%20local%20islands_1750216800850.mp4";

// Variable d'environnement pour désactiver complètement la vidéo en production si nécessaire
const DISABLE_VIDEO_IN_PRODUCTION = import.meta.env.VITE_DISABLE_HERO_VIDEO === 'true';
const IS_PRODUCTION = import.meta.env.MODE === 'production';

// Fonction pour détecter la qualité de connexion
const getConnectionQuality = () => {
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return 'unknown';
  
  // Si la connexion est lente (2G, slow-2g) ou limitée, ne pas charger la vidéo
  if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
    return 'slow';
  }
  
  // Si on est sur une connexion limitée (économie de données)
  if (connection.saveData) {
    return 'limited';
  }
  
  return 'good';
};

// Fonction pour détecter si on est sur mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

export default function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [isMobile, setIsMobile] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(backgroundVideo);
  const [attemptedFallback, setAttemptedFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Détection de la qualité de connexion et du device
    const quality = getConnectionQuality();
    const mobile = isMobileDevice();
    
    setConnectionQuality(quality);
    setIsMobile(mobile);
    
    console.log('Connection quality:', quality, 'Mobile:', mobile);
    
    // Charger la vidéo plus librement - seulement éviter sur les très mauvaises connexions
    const shouldLoad = !(IS_PRODUCTION && DISABLE_VIDEO_IN_PRODUCTION) && quality !== 'slow' && quality !== 'limited';
    
    if (shouldLoad) {
      // Delay video loading to improve initial page load
      const timer = setTimeout(() => {
        setShouldLoadVideo(true);
        
        // Timeout de sécurité : si la vidéo ne se charge pas en 10 secondes, abandon
        loadTimeoutRef.current = setTimeout(() => {
          console.log('Video loading timeout - falling back to image');
          setVideoError(true);
          setShouldLoadVideo(false);
        }, 10000);
      }, 2000); // Augmenté à 2 secondes pour laisser le temps à la page de se charger

      return () => {
        clearTimeout(timer);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    } else {
      console.log('Video loading skipped due to connection/device constraints');
    }
  }, []);
  return (
    <section id="hero" className="relative pt-20 pb-16 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background Section with Fallback Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Fallback Image */}
        <img
          src={heroImage}
          alt="Beautiful Krabi landscape"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        
        {/* Video Overlay with intelligent loading and comprehensive fallback */}
        {shouldLoadVideo && !videoError && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none" // Charge seulement quand nécessaire
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
              // Nettoyer le timeout de sécurité
              if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
              }
            }}
            onLoadedData={() => {
              console.log('Video loaded successfully');
              setVideoLoaded(true);
              // Nettoyer le timeout de sécurité
              if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
              }
            }}
            onError={(e) => {
              console.error('Video failed to load:', currentVideoSrc, e);
              
              // Si on n'a pas encore essayé la vidéo de fallback et qu'on était sur la vidéo optimisée
              if (!attemptedFallback && currentVideoSrc === backgroundVideo) {
                console.log('Tentative avec la vidéo originale en fallback...');
                setAttemptedFallback(true);
                setCurrentVideoSrc(fallbackVideo);
                setVideoLoaded(false);
                setVideoError(false);
                return;
              }
              
              // Si même la vidéo de fallback échoue, utiliser l'image
              console.error('Toutes les vidéos ont échoué - utilisation de l\'image de fallback');
              setVideoError(true);
              setVideoLoaded(false);
              // Nettoyer le timeout de sécurité
              if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
              }
            }}
            onStalled={() => {
              console.warn('Video stalled - may switch to fallback');
            }}
            onSuspend={() => {
              console.warn('Video suspended - may switch to fallback');
            }}
          >
            <source src={currentVideoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          {/* Content - Title and description */}
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
              className="max-w-4xl mx-auto"
            >
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight tracking-tight text-white drop-shadow-lg text-center">
                Your exclusive experiences <br/>
                <span className="text-primary drop-shadow-lg">in Krabi – </span>THAILAND
              </h1>
              
              <p className="text-white/90 mb-8 text-lg drop-shadow-md text-center max-w-2xl mx-auto">
                Discover amazing places away from mass tourism in Krabi.<br/>
                And also Khao Sok, Koh Mook and many more destinations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/tours">
                  <motion.span 
                    className="bg-primary text-white px-8 py-3 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >See our offers</motion.span>
                </Link>
                <Link href="/custom-tour">
                  <motion.span 
                    className="bg-primary text-white px-8 py-3 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg"
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