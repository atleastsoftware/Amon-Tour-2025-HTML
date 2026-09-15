import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useIframe } from "@/contexts/IframeContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useTourNinjaRelease } from "@/contexts/TourNinjaReleaseContext";

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface PopularExperiencesBlockProps {
  title?: string;
  subtitle?: string;
  configuration?: any;
  isPreview?: boolean;
}

export default function PopularExperiencesBlock({ 
  title, 
  subtitle, 
  configuration = {},
  isPreview = false
}: PopularExperiencesBlockProps) {
  const { openIframe } = useIframe();
  const [sectionMediaFailed, setSectionMediaFailed] = useState(false);
  const { translations, currentLanguage } = useTranslation();
  const remoteRelease = useTourNinjaRelease();
  const tours = translations.tours;
  const common = translations.common;
  const catalogue = remoteRelease.release?.catalogue;
  
  // Use translated button texts from configuration if available, otherwise fall back to common translations
  const viewDetailsLabel = configuration.viewDetailsText || common.viewDetails;
  const bookNowLabel = configuration.bookNowText || common.bookNow;
  
  console.log('🎯 [PopularExperiencesBlock] Rendering with language:', currentLanguage);
  
  // Helper to display duration in the correct language
  const formatDuration = (duration: number) => {
    const dayWord = currentLanguage === 'fr' ? 'jour' : 
                   currentLanguage === 'es' ? 'día' : 'day';
    const daysWord = currentLanguage === 'fr' ? 'jours' : 
                    currentLanguage === 'es' ? 'días' : 'days';
    return `${duration} ${duration > 1 ? daysWord : dayWord}`;
  };
  
  // Use translations as fallback if no title/subtitle provided
  const displayTitle = title || remoteRelease.text(catalogue?.heading) || tours.featured;
  const displaySubtitle = subtitle || remoteRelease.text(catalogue?.description) || tours.description;
  
  const { data: tourNinjaResponse, isLoading: tourNinjaLoading } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ['/api/proxy/tours', currentLanguage], // ✅ Add language to queryKey!
    queryFn: async () => {
      console.log('🌐 [PopularExperiencesBlock] Fetching tours for language:', currentLanguage);
      const url = `/api/proxy/tours?language=${currentLanguage}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tours');
      const data = await res.json();
      console.log('📦 [PopularExperiencesBlock] Received:', {
        count: data.data?.length,
        language: data.language,
        firstTourName: data.data?.[0]?.name
      });
      return data;
    },
    refetchInterval: isPreview ? 2000 : false,
    staleTime: isPreview ? 0 : 60000,
  });

  const config = configuration;
  useEffect(() => setSectionMediaFailed(false), [config.tourNinjaMediaId, config.backgroundImage, remoteRelease.contentDigest]);
  const remoteSectionBackground = config.tourNinjaMediaId && config.backgroundImage && !sectionMediaFailed
    ? config.backgroundImage
    : undefined;

  // Extract tours from API response
  const tourNinjaTours = tourNinjaResponse?.data || [];
  
  // Ensure we always have an array
  let filteredTours: any[] = Array.isArray(tourNinjaTours) ? tourNinjaTours : [];

  // Apply category filter
  const categoryFilter = config.categoryFilter || 'all';

  if (categoryFilter === 'featured') {
    if (filteredTours.length > 0) {
      const avgPrice = filteredTours.reduce((sum: number, tour: any) => sum + (tour.price || 0), 0) / filteredTours.length;
      filteredTours = filteredTours.filter((tour: any) => (tour.price || 0) > avgPrice);
    }
  } else if (categoryFilter === 'day_trips') {
    filteredTours = filteredTours.filter((tour: any) => {
      const duration = parseInt(String(tour.duration)) || 0;
      return duration <= 1;
    });
  } else if (categoryFilter === 'multi_day') {
    filteredTours = filteredTours.filter((tour: any) => {
      const duration = parseInt(String(tour.duration)) || 0;
      return duration > 1;
    });
  } else if (categoryFilter === 'custom') {
    const selectedIds = config.selectedTourIds || [];
    if (selectedIds.length > 0) {
      filteredTours = filteredTours.filter((tour: any) => selectedIds.includes(tour.id));
    }
  }

  // A configured release can curate the existing proxy catalogue, but never
  // replaces it. IDs are matched against both proxy id forms and ordered
  // exactly as configured; absent IDs simply remain absent.
  if (catalogue?.featuredTourIds?.length) {
    const byId = new Map(filteredTours.map((tour: any) => [
      String(tour.externalId ?? tour.id),
      tour,
    ]));
    filteredTours = catalogue.featuredTourIds
      .map((id) => byId.get(String(id)))
      .filter((tour): tour is any => Boolean(tour));
  }

  // Calculate display count
  let displayCount = 6;
  if (config.showAllAds === true) {
    displayCount = Math.max(filteredTours.length, 19);
  } else {
    displayCount = config.displayCountDesktop || 6;
  }

  // Ensure we have a valid array before slicing
  const displayTours = Array.isArray(filteredTours) ? filteredTours.slice(0, displayCount) : [];

  return (
    <section id="tours" className="py-16" style={{
      backgroundColor: config.backgroundColor || '#ffffff',
      ...(remoteSectionBackground ? { backgroundImage: `linear-gradient(rgba(255,255,255,.88), rgba(255,255,255,.88)), url("${remoteSectionBackground}")`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
    }}>
      {remoteSectionBackground && (
        <img src={remoteSectionBackground} alt="" className="hidden" onError={() => setSectionMediaFailed(true)} />
      )}
      <div className="container mx-auto px-4 max-w-4xl text-center mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 
            className="font-heading font-bold text-3xl md:text-4xl mb-3"
            style={{
              color: config.titleColor || '#333333'
            }}
          >
            {displayTitle}
          </h2>
          <div 
            className="w-20 h-1 mx-auto mb-8"
            style={{
              backgroundColor: config.dividerColor || '#3BA8AF'
            }}
          ></div>
          <p 
            className="text-lg leading-relaxed"
            style={{
              color: config.subtitleColor || '#666666'
            }}
          >
            {displaySubtitle}
          </p>
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4">
        <div 
          className={`grid gap-6 mb-8 ${
            config.mobileColumns === 1 ? 'grid-cols-1' :
            config.mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'
          } ${
            config.tabletColumns === 1 ? 'md:grid-cols-1' :
            config.tabletColumns === 2 ? 'md:grid-cols-2' :
            config.tabletColumns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
          } ${
            config.desktopColumns === 1 ? 'lg:grid-cols-1' :
            config.desktopColumns === 2 ? 'lg:grid-cols-2' :
            config.desktopColumns === 3 ? 'lg:grid-cols-3' :
            config.desktopColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}
        >
          {tourNinjaLoading ? (
            Array.from({ length: Math.min(displayCount, 12) }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : displayTours.length > 0 ? (
            displayTours.map((tour: any, index: number) => {
              const bgColor = config.cardsColor || '#2563eb';
              const hasImage = !!tour.primaryImage;
              
              return (
                <motion.div
                  key={`${tour.id || index}-${bgColor}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative h-48">
                    {!hasImage ? (
                      <div 
                        key={bgColor}
                        className="w-full h-full relative overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${hexToRgba(bgColor, 0.3)}, ${hexToRgba(bgColor, 0.6)})`
                        }}
                      >
                      </div>
                    ) : (
                      <img
                        src={tour.primaryImage}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parentDiv = target.parentElement;
                          if (parentDiv) {
                            target.remove();
                            parentDiv.innerHTML = `
                              <div class="w-full h-full relative overflow-hidden" style="background: linear-gradient(135deg, ${hexToRgba(bgColor, 0.3)}, ${hexToRgba(bgColor, 0.6)})">
                              </div>
                            `;
                          }
                        }}
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {formatDuration(Number(tour.duration) || 1)}
                      </span>
                    </div>
                  </div>
                
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                      {tour.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {tour.description || "Découvrez les plus beaux endroits de Krabi avec nos guides expérimentés."}
                    </p>
                    
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 border py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                        style={{
                          borderColor: config.cardsColor || '#2563eb',
                          color: config.cardsColor || '#2563eb',
                          backgroundColor: 'white',
                        }}
                        onClick={() => {
                          if (tour.detailsUrl) {
                            openIframe(tour.detailsUrl, tour.name);
                          } else if (tour.presentationUrl) {
                            openIframe(tour.presentationUrl, tour.name);
                          }
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = (config.cardsColor || '#2563eb') + '10';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        {viewDetailsLabel}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                      <button 
                        className="flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-white flex items-center justify-center gap-1"
                        style={{
                          backgroundColor: config.cardsColor || '#2563eb',
                        }}
                        onClick={() => {
                          if (tour.bookingUrl) {
                            openIframe(tour.bookingUrl, tour.name);
                          }
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'brightness(110%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'brightness(100%)';
                        }}
                      >
                        {bookNowLabel}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : catalogue?.featuredTourIds ? (
            <p className="col-span-full py-8 text-center text-gray-500">
              {remoteRelease.text(catalogue?.emptyMessage) || tours.description}
            </p>
          ) : (
            Array.from({ length: Math.min(displayCount, 12) }).map((_, index) => (
              <motion.div key={`${index}-${config.cardsColor || '#2563eb'}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="relative h-48 overflow-hidden" style={{ background: `linear-gradient(135deg, ${hexToRgba(config.cardsColor || '#2563eb', 0.3)}, ${hexToRgba(config.cardsColor || '#2563eb', 0.6)})` }}>
                  <div className="absolute top-4 right-4 z-20"><span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs">{formatDuration(index % 2 + 1)}</span></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">Tour Experience {index + 1}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">Découvrez les plus beaux endroits de Krabi avec nos guides expérimentés.</p>
                  <div className="flex gap-2">
                    <button className="flex-1 border py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1" style={{ borderColor: config.cardsColor || '#2563eb', color: config.cardsColor || '#2563eb', backgroundColor: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = (config.cardsColor || '#2563eb') + '10'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}>{viewDetailsLabel}<ChevronRight className="h-3 w-3" /></button>
                    <button className="flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-white flex items-center justify-center gap-1" style={{ backgroundColor: config.cardsColor || '#2563eb' }} onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(110%)'; }} onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(100%)'; }}>{bookNowLabel}<ChevronRight className="h-3 w-3" /></button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Action button at the bottom */}
        {config.buttonText && (
          <div className="flex justify-center mt-8">
            {config.buttonUrl ? (
              <a 
                href={config.buttonUrl}
                className="px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all"
                style={{
                  backgroundColor: config.buttonStyle === 'outline' ? 'transparent' : (config.buttonBackgroundColor || '#084F6E'),
                  color: config.buttonStyle === 'outline' ? (config.buttonBackgroundColor || '#084F6E') : (config.buttonTextColor || '#ffffff'),
                  border: config.buttonStyle === 'outline' ? `2px solid ${config.buttonBackgroundColor || '#084F6E'}` : 'none'
                }}
              >
                {config.buttonText}
              </a>
            ) : (
              <button 
                className="px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all"
                style={{
                  backgroundColor: config.buttonStyle === 'outline' ? 'transparent' : (config.buttonBackgroundColor || '#084F6E'),
                  color: config.buttonStyle === 'outline' ? (config.buttonBackgroundColor || '#084F6E') : (config.buttonTextColor || '#ffffff'),
                  border: config.buttonStyle === 'outline' ? `2px solid ${config.buttonBackgroundColor || '#084F6E'}` : 'none'
                }}
              >
                {config.buttonText}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
