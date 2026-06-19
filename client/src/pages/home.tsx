import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/contexts/TranslationContext";

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
import { useTourNinjaWithCustomImages } from "@/hooks/useTourNinja";
import { Link } from "wouter";
import { useIframe } from "@/contexts/IframeContext";
import { Badge } from "@/components/ui/badge";


export default function Home() {
  const [, setLocation] = useLocation();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const { openIframe } = useIframe();
  
  // Get translations
  const { translations } = useTranslation();
  const tours = translations.tours;
  const common = translations.common;
  const home = translations.home;
  
  const { data: featuredTours, isLoading: isLoadingTours } = useQuery<Tour[]>({
    queryKey: ['/api/tours/featured'],
  });
  
  const { data: tourCards = [], isLoading: isLoadingTourCards } = useQuery<TourCardItemProps[]>({
    queryKey: ['/api/tour-cards'],
  });
  
  // Get Tour Ninja tours with custom images
  const { tours: tourNinjaTours = [], isLoading: tourNinjaLoading } = useTourNinjaWithCustomImages();
  
  
  // Convert Tour Ninja tours to TourCardItem format
  const tourNinjaCards: TourCardItemProps[] = tourNinjaTours.map((tour: any) => ({
    id: tour.id,
    title: tour.name,
    description: tour.description || tour.shortDescription || "",
    price: tour.price,
    currency: tour.currency,
    customLink: tour.bookingUrl || tour.detailsUrl || `https://www.tourninja.io/details/${tour.id}`,
    type: "tour" as const,
    images: tour.images || [],
    tags: tour.tags || [],
    bookingUrl: tour.bookingUrl,
    detailsUrl: tour.detailsUrl,
    presentationUrl: tour.presentationUrl
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
        title="Amon Tour - Private Tours in Krabi Thailand | Malaysia, Singapore, Australia & Worldwide"
        description="Amon Tour is a Krabi-based travel agency run by French and English-speaking guides. Authentic private tours in Krabi, Phi Phi, Phang Nga Bay and southern Thailand — perfect for travelers from Malaysia, Singapore, Australia and beyond. Custom itineraries, small groups, no mass tourism."
        keywords="krabi tour from malaysia, krabi tour from singapore, thailand holiday package malaysia, thailand tour singapore, krabi private tour, krabi trip from KL, thailand tours australia, krabi island hopping, phang nga bay tour, phi phi island day trip, krabi francophone guide, french speaking guide krabi, private tour krabi thailand, authentic thailand experience, southern thailand tours"
        canonicalUrl="https://amon-tour.com/"
        breadcrumbs={[
          { name: "Home", url: "/" }
        ]}
        faqSchema={[
          {
            question: "What makes Amon Tour different from other Thailand travel agencies?",
            answer: "Amon Tour is based in Krabi and run by French and English-speaking expat guides with deep local knowledge. We specialize in authentic, small-group private experiences away from mass tourism — ideal for travelers from Malaysia, Singapore, Australia, and further afield who want a genuine southern Thailand experience."
          },
          {
            question: "What areas of Thailand does Amon Tour cover?",
            answer: "We are based in Krabi and specialize in southern Thailand: Krabi, Phang Nga Bay, Koh Phi Phi, Railay Beach, Koh Lanta, and surrounding islands. We create bespoke experiences showcasing authentic Thai culture, limestone karsts, turquoise waters, temples, local cuisine, and untouched nature."
          },
          {
            question: "Do Malaysians need a visa to visit Thailand and travel to Krabi?",
            answer: "Malaysian citizens enjoy visa-free entry to Thailand for up to 30 days. Krabi is very accessible from Malaysia — there are direct flights from Kuala Lumpur (KUL) to Krabi (KBV) taking around 1.5 to 2 hours, making it one of the easiest and closest international holiday destinations for Malaysians."
          },
          {
            question: "How long is the flight from Singapore to Krabi?",
            answer: "The flight from Singapore (SIN) to Krabi (KBV) takes approximately 1.5 to 2 hours. Singaporeans can also enter Thailand visa-free for up to 30 days, making Krabi an ideal long-weekend or short-break destination. Amon Tour can arrange private pickups from Krabi Airport."
          },
          {
            question: "Is there halal food available in Krabi for Muslim travelers from Malaysia?",
            answer: "Yes — Krabi has a significant Muslim population and halal food is widely available throughout the region, including at local markets, restaurants near Ao Nang, and Krabi Town. Our team can advise on halal-friendly dining options as part of your tour planning."
          },
          {
            question: "How do travelers from Australia book a Krabi tour with Amon Tour?",
            answer: "Australian travelers can book directly via our website contact form, by email at contact@amon-tour.com, or via WhatsApp. We recommend planning at least 3–4 days in Krabi. Flight time from Sydney or Melbourne to Krabi is approximately 10–11 hours (often with a stop in Kuala Lumpur or Bangkok). We handle everything once you land."
          },
          {
            question: "What is the best time of year to visit Krabi?",
            answer: "The best time to visit Krabi is November to April — the dry season — with clear skies, calm seas, and perfect conditions for island hopping and water activities. For travelers from Australia, this aligns well with the Australian winter (June–August), which is still a pleasant time in Krabi despite some rainfall."
          },
          {
            question: "Does Amon Tour offer French-speaking guides?",
            answer: "Yes — our guides are fluent in both French and English, which is rare in Krabi. This makes Amon Tour particularly popular with French-speaking travelers from Europe, Canada, and Réunion, as well as English-speaking travelers from Malaysia, Singapore, Australia, and the UK."
          },
          {
            question: "How do I book a custom tour with Amon Tour?",
            answer: "The easiest way is via WhatsApp — we respond quickly and can build a personalized itinerary around your interests, group size, budget, and travel dates. You can also use the contact form on our website or email us at contact@amon-tour.com. We create tailor-made tours for individuals, couples, families, and small groups."
          },
          {
            question: "What types of experiences does Amon Tour offer?",
            answer: "We offer private island day trips, kayaking in sea caves, Phang Nga Bay tours, temple visits, local cuisine experiences, sunset trips, snorkeling, Koh Phi Phi tours, Railay Beach excursions, and multi-day customized journeys. All experiences are private or small-group and designed to go beyond the standard tourist trail."
          }
        ]}
        reviewSchema={{
          rating: 4.9,
          reviewCount: 127,
          reviews: [
            {
              author: "Sarah M.",
              rating: 5,
              text: "Incredible authentic experience! Amon Tour showed us the real Thailand.",
              datePublished: "2024-12-15"
            },
            {
              author: "Marc L.",
              rating: 5,
              text: "Professional service and amazing local insights. Highly recommended!",
              datePublished: "2024-11-20"
            }
          ]
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": "Amon Tour",
          "description": "Krabi-based travel agency run by French and English-speaking guides, offering authentic private tours in southern Thailand for travelers from Malaysia, Singapore, Australia, and worldwide.",
          "url": "https://amon-tour.com",
          "logo": "https://amon-tour.com/favicon.png",
          "image": "https://amon-tour.com/amon-tour-team.jpg",
          "telephone": "+66-81-956-2849",
          "email": "contact@amon-tour.com",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+66-81-956-2849",
            "contactType": "customer service",
            "availableLanguage": ["English", "French", "Thai"]
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Krabi",
            "addressCountry": "TH",
            "addressRegion": "Krabi Province"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "8.0863",
            "longitude": "98.9063"
          },
          "areaServed": { "@type": "Country", "name": "Thailand" },
          "serviceType": ["Private Tours", "Cultural Experiences", "Travel Planning", "Island Tours", "Temple Visits", "Kayaking", "Sunset Trips"],
          "priceRange": "$$-$$$",
          "currenciesAccepted": ["THB", "USD", "EUR"],
          "openingHours": "Mo-Su 08:00-20:00",
          "foundingDate": "2020",
          "slogan": "Authentic Krabi experiences, guided by locals who know Thailand",
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
                {home.introTitle}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {home.introDescription}
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* 3. Our Popular Experiences */}
        <section id="tours" className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{tours.featured}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-12">{tours.description}</p>
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
                    className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  >
                    <div 
                      className="relative h-48 bg-gradient-to-br from-primary/40 to-primary/60 cursor-pointer"
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
                          <FiChevronRight className="h-16 w-16 text-primary/70" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-primary font-semibold px-2 py-1">
                          {tour.duration} day{Number(tour.duration) > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 
                        className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          if (tour.presentationUrl) {
                            openIframe(tour.presentationUrl, tour.name);
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
                        {tour.detailsUrl && (
                          <button 
                            onClick={() => {
                              openIframe(tour.detailsUrl, tour.name);
                            }}
                            className="flex-1 border border-primary text-primary hover:bg-primary/10 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                            data-testid={`button-view-details-${tour.id}`}
                          >
                            {common.viewDetails}
                            <FiChevronRight className="h-3 w-3" />
                          </button>
                        )}
                        {tour.bookingUrl && (
                          <button 
                            onClick={() => {
                              openIframe(tour.bookingUrl, tour.name);
                            }}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                            data-testid={`button-book-now-${tour.id}`}
                          >
                            {common.bookNow}
                            <FiChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
          
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Link href="/tours">
                <motion.span 
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors inline-block cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >{tours.title}</motion.span>
              </Link>
            </div>
          </div>
        </section>
        
        {/* 4. Create Your Custom Trip */}
        <section className="pt-20 pb-8 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="mb-8">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                {home.tailorMadeTitle}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {home.tailorMadeDescription}
              </p>
            </div>
          </div>
        </section>
        <CustomTourForm />
        
        {/* 5. Some Ideas For Your Next Trip - Hidden as requested */}
        {/* <TourNinjaSection /> */}
        
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
