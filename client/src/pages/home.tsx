import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/layout/SearchBar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import About from "@/components/home/About";
import Testimonials from "@/components/home/Testimonials";
import CustomTourForm from "@/components/home/CustomTourForm";
import CallToAction from "@/components/home/CallToAction";
import Contact from "@/components/home/Contact";
import TourCard from "@/components/tour/TourCard";
import { Link } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: featuredTours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours/featured'],
  });
  
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
      <Header />
      
      <main>
        <Hero />
        
        <SearchBar />
        
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
                <div className="flex space-x-6 overflow-x-auto pb-6 pl-1 -ml-1 pr-8 scrollbar-hide snap-x">
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
                  <button 
                    className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Scroll right"
                    onClick={() => {
                      const container = document.querySelector('.overflow-x-auto');
                      if (container) {
                        container.scrollBy({ left: 300, behavior: 'smooth' });
                      }
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                
                <div className="absolute top-1/2 -left-4 transform -translate-y-1/2">
                  <button 
                    className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Scroll left"
                    onClick={() => {
                      const container = document.querySelector('.overflow-x-auto');
                      if (container) {
                        container.scrollBy({ left: -300, behavior: 'smooth' });
                      }
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </div>
              </div>
            ) : featuredTours && featuredTours.length > 0 ? (
              <div className="relative overflow-hidden">
                <motion.div 
                  className="flex space-x-6 overflow-x-auto pb-6 pl-1 -ml-1 pr-8 scrollbar-hide snap-x"
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {featuredTours.map((tour) => (
                    <div key={tour.id} className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start">
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
                    onClick={() => {
                      const container = document.querySelector('.overflow-x-auto');
                      if (container) {
                        container.scrollBy({ left: 300, behavior: 'smooth' });
                      }
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </motion.button>
                </div>
                
                <div className="absolute top-1/2 -left-4 transform -translate-y-1/2">
                  <motion.button 
                    className="bg-white p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Scroll left"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const container = document.querySelector('.overflow-x-auto');
                      if (container) {
                        container.scrollBy({ left: -300, behavior: 'smooth' });
                      }
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </motion.button>
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
        
        <Contact />
      </main>
      
      <Footer />
    </>
  );
}
