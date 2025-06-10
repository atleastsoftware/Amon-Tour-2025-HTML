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
import TourNinjaSection from "@/components/tour/TourNinjaSection";
import CustomTourForm from "@/components/home/CustomTourForm";
import CallToAction from "@/components/home/CallToAction";
import TourCard from "@/components/tour/TourCard";
import TourCardItem, { TourCardItemProps } from "@/components/tour/TourCardItem";
import { useTourNinja } from "@/hooks/useTourNinja";
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
        
        {/* Tour Ninja Banner Section */}
        <section id="tours" className="py-8">
          <div className="container mx-auto px-4">
            <iframe 
              src="https://www.tourninja.io/iframe/banner/2" 
              width="100%" 
              height="400px" 
              style={{ 
                border: 'none', 
                borderRadius: '8px' 
              }}
              title="Tours Banner"
              scrolling="no"
            />
            
            <div className="text-center mt-8">
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
        
        <CustomTourCta />
        
        <Interests />
        
        <About />
        
        <TourNinjaSection />
        
        <Testimonials />
        
        <CustomTourForm />
        
        <CallToAction />
      </main>
      
      <Footer />
    </>
  );
}
