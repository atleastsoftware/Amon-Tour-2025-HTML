import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import SEO from "@/components/layout/SEO";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import About from "@/components/home/About";
import CustomTourCta from "@/components/home/CustomTourCta";
import Testimonials from "@/components/home/Testimonials";
import TourNinjaSection from "@/components/tour/TourNinjaSection";
import CustomTourForm from "@/components/home/CustomTourForm";
import CallToAction from "@/components/home/CallToAction";
import TourCard from "@/components/tour/TourCard";
import TourCardItem, { TourCardItemProps } from "@/components/tour/TourCardItem";
import { useTourNinja } from "@/hooks/useTourNinja";
import { Link } from "wouter";
import { useIframe } from "@/contexts/IframeContext";


export default function Home() {
  const [, setLocation] = useLocation();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const { openIframe } = useIframe();
  
  const { data: featuredTours, isLoading: isLoadingTours } = useQuery<Tour[]>({
    queryKey: ['/api/tours/featured'],
  });
  
  const { data: tourCards = [], isLoading: isLoadingTourCards } = useQuery<TourCardItemProps[]>({
    queryKey: ['/api/tour-cards'],
  });
  
  // Get Tour Ninja tours
  const { tours: tourNinjaTours = [], isLoading: tourNinjaLoading } = useTourNinja();
  
  
  // Convert Tour Ninja tours to TourCardItem format
  const tourNinjaCards: TourCardItemProps[] = tourNinjaTours.map((tour: any) => ({
    id: tour.id,
    title: tour.name,
    description: tour.description || tour.shortDescription || "",
    price: tour.price,
    currency: tour.currency,
    customLink: tour.url || tour.detailsUrl || `https://www.tourninja.io/details/${tour.id}`,
    type: "tour" as const,
    images: tour.images || [],
    tags: tour.tags || [],
  }));
  
  // Combine local tour cards with Tour Ninja tours
  const allTourCards = [...tourCards, ...tourNinjaCards];
  const tourTypeCards = allTourCards;
  
  // Pour l'affichage, on considère qu'on est en chargement si l'une des requêtes est en cours
  const isLoading = isLoadingTours || isLoadingTourCards || tourNinjaLoading;
  
  // Function to handle carousel scrolling
  const handleCarouselScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'right' ? 300 : -300;
      carouselRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  useEffect(() => {
    const updateScrollInfo = () => {
      if (carouselRef.current) {
        const container = carouselRef.current;
        setScrollPosition(container.scrollLeft);
        setMaxScroll(container.scrollWidth - container.clientWidth);
      }
    };

    const container = carouselRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollInfo);
      // Initial update
      updateScrollInfo();
      
      // Update on resize as well
      window.addEventListener('resize', updateScrollInfo);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateScrollInfo);
      }
      window.removeEventListener('resize', updateScrollInfo);
    };
  }, [featuredTours]);
  
  // Handle smooth scrolling for hash links
  useEffect(() => {
    const handleHashLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      e.preventDefault();
      
      const targetId = href;
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    };
    
    document.addEventListener('click', handleHashLinkClick);
    
    return () => {
      document.removeEventListener('click', handleHashLinkClick);
    };
  }, []);
  
  return (
    <>
      <SEO 
        title="Amon Tour - Authentic Thailand Travel Experiences | Private Tours & Cultural Journeys"
        description="Discover authentic Thailand with Amon Tour. Expert-guided private tours, cultural experiences, and personalized journeys across Bangkok, Phuket, and beyond. Family-run travel agency offering immersive experiences away from mass tourism."
        keywords="thailand private tours, bangkok cultural experiences, phuket authentic travel, thailand family travel agency, personalized thailand journeys, thai temple tours, island hopping thailand, authentic thai culture, thailand vacation planning"
        canonicalUrl="https://amon-tour.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": "Amon Tour",
          "description": "Family-run travel agency specializing in authentic Thailand experiences, private tours, and cultural journeys across Bangkok, Phuket, and beyond.",
          "url": "https://amon-tour.com",
          "logo": "https://amon-tour.com/Logo Long Blue.png",
          "image": "https://amon-tour.com/Logo Long Blue.png",
          "telephone": "+66-XXX-XXX-XXX",
          "email": "contact@amon-tour.com",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "TH",
            "addressRegion": "Thailand"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "13.7367",
            "longitude": "100.5232"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Thailand"
          },
          "serviceType": ["Private Tours", "Cultural Experiences", "Travel Planning", "Temple Tours", "Island Tours"],
          "priceRange": "$$-$$$",
          "openingHours": "Mo-Su 08:00-20:00",
          "foundingDate": "2020",
          "slogan": "Authentic Thailand experiences, far from mass tourism",
          "sameAs": [
            "https://www.facebook.com/amontour",
            "https://www.instagram.com/amontour"
          ]
        }}
      />
      <Header />
      <main>
        {/* 1. Hero section */}
        <Hero />
        
        {/* 2. Intro paragraph */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                When expats welcome you in their host country
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed">
                This is a family-run travel agency that combines the organization of exclusive activities 
                with the creation of tailor-made trips throughout the country.
                Our goal is to offer an immersive experience, far from mass tourism, with personalized service 
                for every traveler — as if we were welcoming our own family or friends.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* 3. Our Popular Experiences */}
        <section id="tours" className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Our Popular Experiences</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">Step off the beaten path into carefully curated experiences beyond the tourist trail.</p>
            </motion.div>
          </div>
          
          {/* Tour Ninja Tours Display */}
          <div className="container mx-auto px-4">
            {tourNinjaLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : tourNinjaTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {tourNinjaTours.slice(0, 6).map((tour: any, index: number) => (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  >
                    <div 
                      className="relative h-48 bg-gradient-to-br from-blue-200 to-blue-300 cursor-pointer"
                      onClick={() => {
                        if (tour.presentationUrl) {
                          openIframe(tour.presentationUrl, `Présentation - ${tour.name}`);
                        }
                      }}
                    >
                      {tour.primaryImage ? (
                        <img 
                          src={tour.primaryImage} 
                          alt={tour.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiChevronRight className="h-16 w-16 text-blue-400" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {tour.price > 0 ? `${tour.price.toLocaleString()} THB` : 'Prix sur demande'}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {tour.duration} jour{Number(tour.duration) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 
                        className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          if (tour.presentationUrl) {
                            openIframe(tour.presentationUrl, `Présentation - ${tour.name}`);
                          }
                        }}
                      >
                        {tour.name}
                      </h3>
                      
                      {tour.shortDescription && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {tour.shortDescription}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (tour.detailsUrl) {
                              openIframe(tour.detailsUrl, `Détails - ${tour.name}`);
                            }
                          }}
                          className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          Détails
                          <FiChevronRight className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => {
                            if (tour.bookingUrl) {
                              openIframe(tour.bookingUrl, `Réservation - ${tour.name}`);
                            }
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          Réserver
                          <FiChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
          
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-4">
              {/* Test d'iframe */}
              <button
                onClick={() => openIframe('https://www.google.com', 'Test Iframe')}
                className="bg-red-500 text-white px-4 py-2 rounded mr-4"
              >
                🧪 Test Iframe
              </button>
              
              <Link href="/tours">
                <motion.span 
                  className="bg-primary text-white px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors inline-block cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >View All Our Tours</motion.span>
              </Link>
            </div>
          </div>
        </section>
        
        {/* 4. Create Your Custom Trip */}
        <CustomTourForm />
        
        {/* 5. Some Ideas For Your Next Trip */}
        <TourNinjaSection />
        
        {/* 6. Why Choose Us */}
        <Features />
        
        {/* 7. Who We Are */}
        <About />
        
        {/* 8. Our Travelers' Reviews */}
        <Testimonials />
        
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
