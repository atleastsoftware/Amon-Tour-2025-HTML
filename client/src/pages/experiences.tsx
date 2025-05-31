import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import TourCardItem, { TourCardItemProps } from "@/components/tour/TourCardItem";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  FadeInWhenVisible, 
  SlideUpWhenVisible,
  StaggerChildren,
  StaggerItem 
} from "@/components/ui/animations";

// Image is loaded from URL directly

export default function Experiences() {
  const { data: tourCards = [], isLoading } = useQuery<TourCardItemProps[]>({
    queryKey: ['/api/tour-cards'],
  });
  
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
        <FadeInWhenVisible>
          <div 
            className="relative h-[50vh] bg-cover bg-center"
            style={{ 
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1604159129533-9d35777a0b07?q=80&w=1000&auto=format&fit=crop)"
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
              <div className="max-w-3xl">
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Discover Thailand Experiences
                </motion.h1>
                <motion.p 
                  className="text-xl text-white max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Immerse yourself in authentic Thai culture with our unique experiences
                </motion.p>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>
        
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
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