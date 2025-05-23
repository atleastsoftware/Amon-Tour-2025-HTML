import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/layout/SearchBar";
import SEO from "@/components/layout/SEO";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import About from "@/components/home/About";
import Interests from "@/components/home/Interests";
import CustomTourCta from "@/components/home/CustomTourCta";
import Testimonials from "@/components/home/Testimonials";
import CustomTourForm from "@/components/home/CustomTourForm";
import CallToAction from "@/components/home/CallToAction";
import TourCard from "@/components/tour/TourCard";
import TourCardItem, { TourCardItemProps } from "@/components/tour/TourCardItem";
import { Link } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  
  const { data: featuredTours, isLoading: isLoadingTours } = useQuery<Tour[]>({
    queryKey: ['/api/tours/featured'],
  });
  
  const { data: tourCards = [], isLoading: isLoadingTourCards } = useQuery<TourCardItemProps[]>({
    queryKey: ['/api/tour-cards'],
  });
  
  // SOLUTION IMMÉDIATE: Ne pas filtrer les cartes pour montrer toutes les cartes sur la page d'accueil
  const tourTypeCards = tourCards;
  
  // Pour l'affichage, on considère qu'on est en chargement si l'une des deux requêtes est en cours
  const isLoading = isLoadingTours || isLoadingTourCards;
  
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
        title="Amon Tour - Discover Authentic Thailand"
        description="Experience Thailand like never before with our expertly curated tours, journeys and stays. Discover temples, beaches, and immersive cultural experiences."
        keywords="thailand tours, bangkok tours, phuket travel, authentic thai experience, thailand vacation, thai culture"
      />
      <Header />
      
      <main>
        <Hero />
        
        <SearchBar />
        
        {/* Section description */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                This is a family-run travel agency that combines the organization of exclusive activities 
                with the creation of tailor-made trips throughout the country.
                Our goal is to offer an immersive experience, far from mass tourism, with personalized service 
                for every traveler — as if we were welcoming our own family or friends.
              </p>
            </motion.div>
          </div>
        </section>
        
        <Features />
        
        {/* Popular Tours Section */}
        <section id="tours" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Our Popular Tours</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Explore our most popular tours, carefully designed to help you discover the best of Thailand.
                </p>
              </motion.div>
            </div>
            
            {isLoading ? (
              <div className="relative overflow-hidden">
                <div 
                  ref={carouselRef} 
                  className="flex space-x-6 overflow-x-auto pb-6 pl-1 -ml-1 pr-8 scrollbar-hide snap-x"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
                    >
                      <div className="h-56 bg-gray-300"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <motion.button 
                    className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Scroll right"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCarouselScroll('right')}
                  >
                    <FiChevronRight size={20} />
                  </motion.button>
                </div>
                
                <div className="absolute top-1/2 -left-4 transform -translate-y-1/2">
                  <motion.button 
                    className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Scroll left"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCarouselScroll('left')}
                  >
                    <FiChevronLeft size={20} />
                  </motion.button>
                </div>
                
                {/* Indicateur de progression */}
                <div className="absolute -bottom-2 left-0 right-0">
                  <div className="relative h-1 mx-auto max-w-sm bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: maxScroll > 0 ? `${(scrollPosition / maxScroll) * 100}%` : '0%' 
                      }}
                      transition={{ type: 'spring', damping: 15 }}
                    />
                  </div>
                </div>
              </div>
            ) : (tourTypeCards && tourTypeCards.length > 0) || (featuredTours && featuredTours.length > 0) ? (
              <div className="relative overflow-hidden">
                <motion.div 
                  ref={carouselRef}
                  className="flex space-x-6 overflow-x-auto pb-6 pl-1 -ml-1 pr-8 scrollbar-hide snap-x"
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Afficher d'abord les TourCards */}
                  {tourTypeCards.map((card) => (
                    <div key={`card-${card.id}`} className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start">
                      <TourCardItem {...card} />
                    </div>
                  ))}
                  
                  {/* Afficher ensuite les Tours classiques */}
                  {featuredTours?.map((tour) => (
                    <div key={`tour-${tour.id}`} className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start">
                      <TourCard tour={tour} />
                    </div>
                  ))}
                </motion.div>
                
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <motion.button 
                    className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Scroll right"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCarouselScroll('right')}
                  >
                    <FiChevronRight size={20} />
                  </motion.button>
                </div>
                
                <div className="absolute top-1/2 -left-4 transform -translate-y-1/2">
                  <motion.button 
                    className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Scroll left"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCarouselScroll('left')}
                  >
                    <FiChevronLeft size={20} />
                  </motion.button>
                </div>
                
                {/* Indicateur de progression */}
                <div className="absolute -bottom-2 left-0 right-0">
                  <div className="relative h-1 mx-auto max-w-sm bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: maxScroll > 0 ? `${(scrollPosition / maxScroll) * 100}%` : '0%' 
                      }}
                      transition={{ type: 'spring', damping: 15 }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tours available at the moment.</p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link href="/tours">
                <motion.span 
                  className="bg-primary text-white px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors inline-block cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Tours
                </motion.span>
              </Link>
            </div>
          </div>
        </section>
        
        <About />
        
        <Testimonials />
        
        <CustomTourForm />
        
        <CallToAction />
      </main>
      
      <Footer />
    </>
  );
}
