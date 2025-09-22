import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/DJI_20241115104455_0160_D-min.jpeg";
import { useTranslation } from 'react-i18next';

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
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
};
export default function Hero() {
  const {
    t
  } = useTranslation();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [isMobile, setIsMobile] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(backgroundVideo);
  const [attemptedFallback, setAttemptedFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();

  // Get translations
  // Récupérer les données de configuration du héros (avec gestion d'erreur)
  const {
    data: heroBlocks
  } = useQuery({
    queryKey: ['/api/admin/page-blocks', 'home'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/page-blocks/home');
        if (!response.ok) {
          // Si pas d'authentification, retourner des données par défaut
          if (response.status === 401) {
            return [];
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.log('Hero config fetch failed, using defaults:', error);
        return [];
      }
    }
  });

  // Trouver le bloc hero principal
  const heroConfig = heroBlocks?.find((block: any) => block.blockType === 'video_hero');

  // Fonction pour obtenir la classe CSS selon la couleur configurée
  const getColorClass = (colorValue: string, defaultClass = 'text-white') => {
    switch (colorValue) {
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary';
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-300';
      case 'dark':
        return 'text-gray-900';
      default:
        return defaultClass;
    }
  };

  // Fonction pour appliquer la couleur au mot spécifique dans le titre
  const renderTitleWithColors = () => {
    const mainTitle = heroConfig?.titleMainColor || heroConfig?.title || t('hero.title');
    const colorPart = heroConfig?.titleColorPart || t('hero.subtitle');
    const titlePrimaryColor = heroConfig?.titlePrimaryColor || 'white';
    const titleAccentColor = heroConfig?.titleAccentColor || 'primary';
    const heroCountry = heroConfig?.heroCountry || `– ${t('hero.thailand')}`;

    // Si le titre contient le mot à colorier
    if (mainTitle.includes(colorPart)) {
      const parts = mainTitle.split(colorPart);
      return <>
          <span className={getColorClass(titlePrimaryColor, 'text-white')}>{parts[0]}</span>
          <span className={getColorClass(titleAccentColor, 'text-primary')}>{colorPart}</span>
          <span className={getColorClass(titlePrimaryColor, 'text-white')}>{parts[1] || ` ${heroCountry}`}</span>
        </>;
    }

    // Sinon, afficher le titre avec le texte coloré séparément
    return <>
        <span className={getColorClass(titlePrimaryColor, 'text-white')}>{mainTitle}</span>
        {colorPart && <>
            <br />
            <span className={getColorClass(titleAccentColor, 'text-primary')}>{colorPart} </span>
            <span className={getColorClass(titlePrimaryColor, 'text-white')}>{heroCountry}</span>
          </>}
      </>;
  };
  useEffect(() => {
    // Détection de la qualité de connexion et du device
    const quality = getConnectionQuality();
    const mobile = isMobileDevice();
    setConnectionQuality(quality);
    setIsMobile(mobile);
    console.log('Connection quality:', quality, 'Mobile:', mobile);

    // Charger la vidéo sauf si explicitement désactivée en production
    const shouldLoad = !(IS_PRODUCTION && DISABLE_VIDEO_IN_PRODUCTION);
    if (shouldLoad) {
      setShouldLoadVideo(true);
    } else {
      console.log('Video loading disabled in production');
    }
  }, []);
  return <section id="hero" className="relative pt-20 md:pt-28 pb-12 md:pb-16 min-h-screen flex items-center overflow-hidden">
      {/* Video Background Section with Fallback Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Fallback Image */}
        <img src={heroImage} alt={t("Beautiful Krabi landscape", {
        defaultValue: "Beautiful Krabi landscape"
      })} className="absolute top-0 left-0 w-full h-full object-cover" />
        
        {/* Video Overlay with intelligent loading and comprehensive fallback */}
        {shouldLoadVideo && !videoError && <video ref={videoRef} autoPlay muted loop playsInline preload="auto" // Charge complètement la vidéo pour éviter les interruptions
      className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`} style={{
        minWidth: '100%',
        minHeight: '100%'
      }} onLoadedData={() => {
        console.log('Video loaded successfully');
        setVideoLoaded(true);
      }} onError={e => {
        console.error('Video failed to load:', currentVideoSrc);
        setVideoError(true);
      }} onWaiting={() => {
        console.log('Video buffering...');
      }} onCanPlayThrough={() => {
        console.log('Video can play through without interruption');
        setVideoLoaded(true);
      }}>
            <source src={currentVideoSrc} type="video/mp4" />{t("Your browser does not support the video tag.", {
          defaultValue: "Your browser does not support the video tag."
        })}</video>}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 pt-4 md:pt-10">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left content - Title and description */}
          <div className="w-full">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0,
            x: [0, 5, 0, -5, 0],
            transition: {
              y: {
                duration: 0.6
              },
              x: {
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut"
              }
            }
          }} className={`max-w-xl ml-3 md:ml-6 ${heroConfig?.contentAlignment === 'center' ? 'mx-auto text-center' : heroConfig?.contentAlignment === 'right' ? 'ml-auto text-right' : 'text-left'}`}>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight tracking-tight drop-shadow-lg">
                {renderTitleWithColors()}
              </h1>
              
              <p className={`mb-6 text-lg drop-shadow-md ${getColorClass(heroConfig?.subtitleColor || 'white', 'text-white/90')}`}>
                {heroConfig?.subtitle || t('hero.description')}
              </p>
              
              <div className={`flex flex-col sm:flex-row gap-4 ${heroConfig?.contentAlignment === 'center' ? 'justify-center' : heroConfig?.contentAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                {(heroConfig?.buttons || [{
                text: t('hero.seeOffers'),
                url: '/tours',
                color: '#084F6E',
                style: 'filled'
              }, {
                text: t('hero.customTrip'),
                url: '/custom-tour',
                color: '#084F6E',
                style: 'filled'
              }]).map((button: any, index: number) => <Link key={index} href={button.url}>
                    <motion.span className={`px-8 py-3 mt-4 rounded transition-colors cursor-pointer inline-block shadow-lg w-48 text-center ${button.style === 'outline' ? `border-2 text-white hover:bg-white hover:text-gray-800` : `text-white hover:opacity-90`}`} style={{
                  backgroundColor: button.style === 'filled' ? button.color : 'transparent',
                  borderColor: button.style === 'outline' ? button.color : 'transparent'
                }} whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.98
                }}>
                      {button.text}
                    </motion.span>
                  </Link>)}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>;
}