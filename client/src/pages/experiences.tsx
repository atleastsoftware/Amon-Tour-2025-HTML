import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import { TranslationService } from "@/services/translationService";
import TourCardItem, { TourCardItemProps } from "@/components/tour/TourCardItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  FadeInWhenVisible, 
  SlideUpWhenVisible,
  StaggerChildren,
  StaggerItem 
} from "@/components/ui/animations";

// Image is loaded from URL directly

export default function Experiences() {
  const translationService = new TranslationService();
  const pageHeaders = translationService.getPageHeaders();
  
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
          title={pageHeaders.experiences.title}
          subtitle={pageHeaders.experiences.subtitle}
          alt="Thailand experiences and cultural journeys"
        />
        
        {/* Featured Tours Section - Tour Ninja Integration */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <FadeInWhenVisible>
              <div className="mb-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                  Recommended Guided Tours
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Discover our organized tours with English-speaking guides for an authentic Thailand experience
                </p>
              </div>
            </FadeInWhenVisible>
            
            <StaggerChildren className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Bangkok Essentiel */}
              <StaggerItem>
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 bg-gradient-to-r from-primary to-secondary">
                      <img 
                        src="https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                        alt="Bangkok temples et palais - Tour guidé" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Culture & History
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Bangkok Essential</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      3-day cultural tour: Grand Palace, sacred temples, floating markets and gastronomy with expert English-speaking guide.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-semibold">3 days</span>
                      <span className="text-secondary font-bold text-lg">From $450</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => window.open('https://tourninja.com/tours/bangkok-essential', '_blank')}
                      >
View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.location.href = '/contact?tour=Bangkok Essentiel'}
                      >
Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Triangle d'Or */}
              <StaggerItem>
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 bg-gradient-to-r from-primary to-secondary">
                      <img 
                        src="https://images.unsplash.com/photo-1551016988-eb38968b55d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                        alt="Triangle d'Or Nord Thaïlande - Chiang Mai et tribus" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                          North & Adventure
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Golden Triangle</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      5-day journey: Chiang Mai, mountain tribes, White Temple, Golden Triangle and Mekong cruise.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-semibold">5 days</span>
                      <span className="text-secondary font-bold text-lg">From $750</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => window.open('https://tourninja.com/tours/golden-triangle', '_blank')}
                      >
View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.location.href = '/contact?tour=Triangle d\'Or'}
                      >
Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Îles du Sud */}
              <StaggerItem>
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 bg-gradient-to-r from-secondary to-primary">
                      <img 
                        src="https://images.unsplash.com/photo-1552465011-1c479c548c28?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                        alt="Îles du Sud Thaïlande - Krabi Phi Phi Railay" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Beaches & Islands
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Southern Islands</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      7-day tour: Phuket, Phi Phi islands, Phang Nga Bay, Krabi and Railay Beach. Paradise beaches and water activities.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-semibold">7 days</span>
                      <span className="text-secondary font-bold text-lg">From $990</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => window.open('https://tourninja.com/tours/southern-islands', '_blank')}
                      >
View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.location.href = '/contact?tour=Îles du Sud'}
                      >
Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerChildren>
            
            {/* Call to Action */}
            <FadeInWhenVisible>
              <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Need a Customized Tour?</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Our local experts create tailor-made itineraries according to your desires and budget. 
                  {pageHeaders.experiences.organizeDreamTrip}
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
                      placeholder={pageHeaders.experiences.searchPlaceholder}
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