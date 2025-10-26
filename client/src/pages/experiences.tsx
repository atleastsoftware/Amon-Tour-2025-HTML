import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import TourCardItem, { TourCardItemProps } from "@/components/tour/TourCardItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";
import { 
  FadeInWhenVisible, 
  SlideUpWhenVisible,
  StaggerChildren,
  StaggerItem 
} from "@/components/ui/animations";
import { useTourNinjaWithCustomImages } from "@/hooks/useTourNinja";
import { useIframe } from "@/contexts/IframeContext";

// Image is loaded from URL directly

export default function Experiences() {
  const { openIframe } = useIframe();
  
  const { data: tourCards = [], isLoading } = useQuery<TourCardItemProps[]>({
    queryKey: ['/api/tour-cards'],
  });
  
  // Get Tour Ninja tours with custom images
  const { tours: tourNinjaTours = [], isLoading: tourNinjaLoading } = useTourNinjaWithCustomImages();
  
  // Filtre pour avoir uniquement les tour cards de type "experience"
  const experienceTypeCards = tourCards.filter(card => card.type === "experience");
  
  const [searchTerm, setSearchTerm] = useState("");

  // Filtre les cartes selon le terme de recherche
  const filteredExperienceCards = experienceTypeCards.filter(card => 
    searchTerm === "" || 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <SEO 
        title="Thailand Experiences - Cultural Journeys & Authentic Adventures | Amon Tour"
        description="Immerse yourself in authentic Thailand experiences with Amon Tour. Cultural journeys, local traditions, culinary adventures, and hidden gems away from tourist crowds. Personalized experiences crafted by locals."
        keywords="thailand cultural experiences, authentic thai adventures, cultural immersion thailand, local experiences thailand, thailand culinary tours, traditional thai experiences, cultural journeys thailand, authentic local guides"
        canonicalUrl="https://amon-tour.com/experiences"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Experiences", url: "/experiences" }
        ]}
        faqSchema={[
          {
            question: "What makes a cultural experience authentic with Amon Tour?",
            answer: "Our cultural experiences are designed by locals who live in Thailand and have deep connections with communities. We avoid tourist traps and focus on genuine interactions, traditional practices, and immersive learning opportunities that respect local customs."
          },
          {
            question: "Can cultural experiences be adapted for different interests?",
            answer: "Absolutely! We customize cultural experiences based on your interests - whether you're passionate about cooking, art, spirituality, history, or local crafts. Each experience is tailored to provide meaningful connections with Thai culture."
          },
          {
            question: "Do cultural experiences include food and cooking activities?",
            answer: "Many of our cultural experiences include authentic culinary components - from market visits and cooking classes to traditional meal sharing with local families. Food is an essential part of Thai culture we love to share."
          },
          {
            question: "Are cultural experiences suitable for solo travelers?",
            answer: "Yes! Cultural experiences are perfect for solo travelers looking for authentic connections. Our guides facilitate meaningful interactions and ensure you feel comfortable while experiencing genuine Thai hospitality."
          }
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Thailand Experiences by Amon Tour",
          "description": "Authentic cultural experiences and immersive adventures across Thailand",
          "url": "https://amon-tour.com/experiences",
          "numberOfItems": experienceTypeCards.length,
          "itemListElement": experienceTypeCards.slice(0, 10).map((experience, index) => ({
            "@type": "TouristAttraction",
            "position": index + 1,
            "name": experience.title,
            "description": experience.description,
            "url": `https://amon-tour.com/experiences/${experience.id}`,
            "image": experience.images?.[0] || "https://amon-tour.com/Logo Long Blue.png",
            "offers": {
              "@type": "Offer",
              "price": experience.price,
              "priceCurrency": experience.currency || "THB",
              "availability": "https://schema.org/InStock"
            },
            "provider": {
              "@type": "TravelAgency",
              "name": "Amon Tour",
              "url": "https://amon-tour.com"
            }
          }))
        }}
      />
      <Header />
      
      <main>
        {/* Hero Banner */}
        <HeroHeader 
          title="Discover Thailand Experiences"
          subtitle="Immerse yourself in authentic Thai culture with our unique experiences"
          alt="Thailand experiences and cultural journeys"
        />
        
        {/* Featured Tours Section - Tour Ninja Integration */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <FadeInWhenVisible>
              <div className="mb-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                  Available Tours & Experiences
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Discover our authentic Thailand tours with expert guides
                </p>
              </div>
            </FadeInWhenVisible>
            
            {/* Tour Ninja Tours Display */}
            <div className="container mx-auto px-4">
              {tourNinjaLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
                  ))}
                </div>
              ) : tourNinjaTours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {tourNinjaTours.map((tour: any, index: number) => (
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
                        {tour.images && tour.images.length > 0 ? (
                          <img 
                            src={tour.images[0]} 
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
                          {tour.detailsUrl && (
                            <button 
                              onClick={() => {
                                openIframe(tour.detailsUrl, `Détails - ${tour.name}`);
                              }}
                              className="flex-1 border border-primary text-primary hover:bg-primary/10 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                              data-testid={`button-view-details-${tour.id}`}
                            >
                              View Details
                              <FiChevronRight className="h-3 w-3" />
                            </button>
                          )}
                          {tour.bookingUrl && (
                            <button 
                              onClick={() => {
                                openIframe(tour.bookingUrl, `Booking - ${tour.name}`);
                              }}
                              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                              data-testid={`button-book-now-${tour.id}`}
                            >
                              Book Now
                              <FiChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-16">
                  <p className="text-gray-500">No tours available at the moment.</p>
                </div>
              )}
            </div>
            
            {/* Call to Action */}
            <FadeInWhenVisible>
              <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Need a Customized Tour?</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Our local experts create tailor-made itineraries according to your desires and budget. 
                  Contact us to organize your dream trip to Thailand.
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-gray-100"
                  onClick={() => window.location.href = '/contact?subject=Custom Tour'}
                >
                  Request a Free Quote
                </Button>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>
        
        {/* Experiences List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SlideUpWhenVisible>
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-md mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading font-semibold text-xl mb-4">Filter Experiences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }} className="lg:col-span-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </motion.div>
                  <div className="lg:col-span-3 flex items-end">
                    <div className="text-sm text-gray-500">
                      Use the search above to find specific experiences
                    </div>
                  </div>
                </div>
              </motion.div>
            </SlideUpWhenVisible>
            
            {/* Loading state */}
            {isLoading ? (
              <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <StaggerItem key={i}>
                    <motion.div 
                      className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="h-56 bg-gray-300"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : filteredExperienceCards.length > 0 ? (
              <StaggerChildren 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredExperienceCards.map((card) => (
                  <StaggerItem key={card.id}>
                    <TourCardItem {...card} />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-500">No experiences available matching your search. Try different keywords or create some experiences in the admin panel!</p>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}