import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
        
        <Features />
        
        {/* Popular Tours Section */}
        <section id="tours" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Our Popular Tours</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our most popular tours, carefully designed to help you discover the best of Thailand.
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse">
                    <div className="h-56 bg-gray-300"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredTours && featuredTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tours available at the moment.</p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link href="/tours">
                <span className="bg-primary text-white px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors inline-block cursor-pointer">
                  View All Tours
                </span>
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
