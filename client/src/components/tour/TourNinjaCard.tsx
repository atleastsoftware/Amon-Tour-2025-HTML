import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink, Settings } from "lucide-react";
import { TourNinjaTour } from "@/hooks/useTourNinja";
import { formatTHB } from "@/lib/utils";
import { useIframe } from "@/contexts/IframeContext";
import { useIsAuthenticated } from "@/lib/auth";
import { Link } from "wouter";

interface TourNinjaCardProps {
  tour: TourNinjaTour;
  index?: number;
}

// Logique robuste pour obtenir les candidats d'images dans l'ordre de priorité
function getImageCandidates(tour: TourNinjaTour): string[] {
  const candidates: (string | undefined)[] = [
    tour.customImage,           // 1. Image personnalisée (priorité max)
    tour.images?.[0],          // 2. Première image Tour Ninja
    tour.primaryImage,         // 3. Image primaire (après override)
    tour.originalImage,        // 4. Image d'origine (avant override)
  ];
  
  // Filtrer les doublons et valeurs vides
  const seen = new Set<string>();
  return candidates.filter((url): url is string => 
    !!url && !seen.has(url) && !!seen.add(url)
  );
}

export default function TourNinjaCard({ tour, index = 0 }: TourNinjaCardProps) {
  const { openIframe } = useIframe();
  const { isAuthenticated } = useIsAuthenticated();
  
  // Calculer les candidats d'images de manière optimisée
  const imageCandidates = useMemo(() => getImageCandidates(tour), [tour]);
  
  // État pour la gestion du fallback automatique
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const triedUrls = useRef(new Set<string>());
  
  // Source d'image actuelle
  const currentImageSrc = imageCandidates[currentImageIndex] || null;
  
  // Gestionnaire de clic sur la carte
  const handleCardClick = () => {
    if (tour.presentationUrl) {
      openIframe(tour.presentationUrl, `Présentation - ${tour.name}`);
    } else if (tour.detailsUrl) {
      openIframe(tour.detailsUrl, `Détails - ${tour.name}`);
    } else if (tour.bookingUrl) {
      openIframe(tour.bookingUrl, `Réservation - ${tour.name}`);
    }
  };

  // Gestionnaire d'erreur d'image avec rotation automatique
  const handleImageError = useCallback(() => {
    const currentUrl = currentImageSrc;
    if (currentUrl) {
      triedUrls.current.add(currentUrl);
      console.warn(`❌ Failed to load image for tour ${tour.name}:`, currentUrl);
    }

    // Essayer le candidat suivant
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < imageCandidates.length) {
      const nextUrl = imageCandidates[nextIndex];
      if (!triedUrls.current.has(nextUrl)) {
        console.log(`🔄 Trying next image for tour ${tour.name}:`, nextUrl);
        setCurrentImageIndex(nextIndex);
        return;
      }
    }

    // Si tous les candidats ont échoué, afficher le placeholder
    console.log(`❌ All image sources failed for tour ${tour.name}, showing placeholder`);
    setShowPlaceholder(true);
  }, [currentImageSrc, currentImageIndex, imageCandidates, tour.name]);

  // Gestionnaire de succès de chargement d'image
  const handleImageLoad = useCallback(() => {
    setShowPlaceholder(false);
    const imageType = tour.customImage && currentImageSrc === tour.customImage 
      ? 'image personnalisée' 
      : 'image TourNinja originale';
    console.log(`✅ Successfully loaded ${imageType} for tour ${tour.name}`);
  }, [currentImageSrc, tour.customImage, tour.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
      onClick={handleCardClick}
    >
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="relative">
          {!showPlaceholder && currentImageSrc ? (
            <div className="h-48 overflow-hidden">
              <img
                src={currentImageSrc}
                alt={tour.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="text-white text-center p-4 relative z-10">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Krabi, Thailand</span>
                <div className="text-xs opacity-80 mt-1">Image de présentation</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-800/30"></div>
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-white/90 text-primary font-semibold">
              {tour.price > 0 
                ? (tour.currency === 'THB' ? formatTHB(tour.price) : `${tour.price} ${tour.currency || 'THB'}`)
                : 'Prix sur demande'
              }
            </Badge>
            {tour.customImage && (
              <Badge variant="default" className="bg-gold text-white text-xs font-medium">
                Image personnalisée
              </Badge>
            )}
          </div>

          {/* Bouton d'admin pour gérer les images - visible uniquement pour les utilisateurs connectés */}
          {isAuthenticated && (
            <div className="absolute top-3 left-3">
              <Link
                href={`/admin-tour-ninja-images?tour=${encodeURIComponent(tour.id)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90 hover:bg-white border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Image
                </Button>
              </Link>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <h3 
              className="font-heading font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (tour.presentationUrl) {
                  openIframe(tour.presentationUrl, `Présentation - ${tour.name}`);
                }
              }}
            >
              {tour.name}
            </h3>
            
            {tour.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {tour.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              {tour.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin size={12} className="mr-1" />
                  {tour.location}
                </div>
              )}
              
              {tour.duration && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {tour.duration}
                </div>
              )}
            </div>
          </div>

          {(tour.bookingUrl || tour.detailsUrl) && (
            <div className="flex gap-2">
              {tour.detailsUrl && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tour.detailsUrl) {
                      openIframe(tour.detailsUrl, `Details - ${tour.name}`);
                    }
                  }}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View details
                  <ExternalLink size={12} className="ml-1" />
                </motion.button>
              )}
              {tour.bookingUrl && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tour.bookingUrl) {
                      openIframe(tour.bookingUrl, `Booking - ${tour.name}`);
                    }
                  }}
                  className="flex-1 bg-secondary text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-secondary-dark transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book
                </motion.button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}