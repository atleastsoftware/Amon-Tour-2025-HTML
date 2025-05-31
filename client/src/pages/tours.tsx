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
import { useTourNinja } from "@/hooks/useTourNinja";

// Image is loaded from URL directly

export default function Tours() {
  const { data: tourCards = [], isLoading: localToursLoading } = useQuery<TourCardItemProps[]>({
    queryKey: ['/api/tour-cards']
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
    customLink: tour.bookingUrl || tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
    type: "tour" as const,
    images: tour.images || [],
    tags: tour.tags || [],
    createdAt: new Date(tour.createdAt || new Date())
  }));
  
  // Combine local tour cards with Tour Ninja tours
  const allTours = [...(tourCards || []), ...tourNinjaCards];
  
  // Filter only tours (not experiences)
  const tourTypeCards = allTours.filter((card: any) => card.type === "tour");
  
  const isLoading = localToursLoading || tourNinjaLoading;
  const [searchTerm, setSearchTerm] = useState("");

  // Filtre les cartes selon le terme de recherche
  const filteredTourCards = tourTypeCards.filter(card => 
    searchTerm === "" || 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <SEO 
        title="Thailand Tours - Discover Amazing Destinations"
        description="Explore our handpicked selection of tours across Thailand. From Bangkok city tours to island adventures, find your perfect Thailand experience."
        keywords="thailand tours, bangkok day trips, island hopping, guided tours, thailand adventures, authentic experiences"
      />
      <Header />
      
      <main>
        {/* Hero Banner */}
        <FadeInWhenVisible>
          <div 
            className="relative h-[50vh] bg-cover bg-center"
            style={{ 
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1000&auto=format&fit=crop)"
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
                  Explore Thailand Tours
                </motion.h1>
                <motion.p 
                  className="text-xl text-white max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Discover the best tours and experiences in Thailand tailored for you
                </motion.p>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>
        
        {/* Tours List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SlideUpWhenVisible>
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-md mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading font-semibold text-xl mb-4">Filter Tours</h2>
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
            ) : filteredTourCards.length > 0 ? (
              <StaggerChildren 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredTourCards.map((card) => (
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
                <p className="text-gray-500">No tours available matching your search. Try different keywords or create some tours in the admin panel!</p>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}