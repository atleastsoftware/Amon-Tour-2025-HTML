import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { 
  FadeInWhenVisible, 
  SlideUpWhenVisible
} from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, StarIcon, ExternalLink } from "lucide-react";

interface Stay {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  description: string;
  externalBookingUrl: string;
  features: string[];
  capacity: number;
}

// Exemple de données de séjours
const stays: Stay[] = [
  {
    id: 1,
    title: "Luxurious Villa with Pool in Phuket",
    location: "Phuket, Thailand",
    price: 150,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmlsbGF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
    description: "Beautiful villa with sea view, private pool and all the comfort needed for an unforgettable stay in Thailand.",
    externalBookingUrl: "https://booking.com/hotel/sample",
    features: ["Private pool", "Sea view", "Air conditioning", "Free Wi-Fi", "Housekeeping"],
    capacity: 6
  },
  {
    id: 2,
    title: "Traditional Thai Bungalow",
    location: "Koh Samui, Thailand",
    price: 85,
    image: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGJ1bmdhbG93fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    description: "Experience an authentic stay in this traditional Thai bungalow, surrounded by lush nature and close to the beach.",
    externalBookingUrl: "https://booking.com/hotel/sample2",
    features: ["Beachfront", "Breakfast included", "Tropical garden", "Free Wi-Fi"],
    capacity: 2
  },
  {
    id: 3,
    title: "Modern Apartment in Bangkok",
    location: "Bangkok, Thailand",
    price: 65,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    description: "Contemporary apartment ideally located in the heart of Bangkok, perfect for exploring the city and enjoying its many attractions.",
    externalBookingUrl: "https://booking.com/hotel/sample3",
    features: ["City view", "Shared pool", "Fitness center", "24/7 Security"],
    capacity: 4
  }
];

export default function Stays() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO 
        title="Thailand Accommodations - Unique Stays & Hotels | Amon Tour"
        description="Discover exceptional accommodations in Thailand with Amon Tour. From luxury villas to traditional bungalows and modern apartments. Carefully selected stays for authentic experiences in Bangkok, Phuket, and beyond."
        keywords="thailand hotels, thailand accommodations, thailand villas, bangkok hotels, phuket resorts, thai bungalows, luxury stays thailand, boutique hotels thailand, beachfront villas, authentic accommodations"
        canonicalUrl="https://amon-tour.com/stays"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Thailand Accommodations by Amon Tour",
          "description": "Carefully selected accommodations for authentic and comfortable stays in Thailand",
          "url": "https://amon-tour.com/stays",
          "numberOfItems": stays.length,
          "itemListElement": stays.map((stay, index) => ({
            "@type": "LodgingBusiness",
            "position": index + 1,
            "name": stay.title,
            "description": stay.description,
            "url": stay.externalBookingUrl,
            "image": stay.image,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": stay.location,
              "addressCountry": "TH"
            },
            "priceRange": `$${stay.price}`,
            "amenityFeature": stay.features.map(feature => ({
              "@type": "LocationFeatureSpecification",
              "name": feature
            })),
            "maximumAttendeeCapacity": stay.capacity,
            "provider": {
              "@type": "TravelAgency",
              "name": "Amon Tour",
              "url": "https://amon-tour.com"
            }
          }))
        }}
      />
      <Header />
      <div className="min-h-screen bg-white pt-16">
        {/* Hero Section */}
        <section className="bg-white text-gray-900 pb-16 pt-16 md:pb-24 md:pt-24">
          <div className="container mx-auto px-4">
            <SlideUpWhenVisible>
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-center mb-6">
                Find Your Ideal Accommodation in Thailand
              </h1>
            </SlideUpWhenVisible>
            <FadeInWhenVisible delay={0.2}>
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto mb-10 text-gray-700">
                Carefully selected accommodations for an authentic and comfortable stay in Thailand.
              </p>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Stays Section */}
        <section className="pb-16 pt-16">
          <div className="container mx-auto px-4">
            <SlideUpWhenVisible>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-12">
                Our Recommended Accommodations
              </h2>
            </SlideUpWhenVisible>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stays.map((stay, index) => (
                <motion.div 
                  key={stay.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={stay.image} 
                      alt={stay.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white py-1 px-3 rounded-full font-semibold">
                      {stay.price}€ / night
                    </div>
                  </div>
                
                  <div className="p-6">
                    <h3 className="font-heading font-bold text-xl mb-2 text-gray-900">{stay.title}</h3>
                    
                    <div className="flex items-center mb-3 text-gray-600">
                      <MapPin className="w-4 h-4 mr-1 text-secondary" />
                      <span className="text-sm">{stay.location}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{stay.description}</p>
                    
                    <div className="mb-5">
                      <div className="flex items-center mb-2">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">Capacity: {stay.capacity} people</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {stay.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                        {stay.features.length > 3 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            +{stay.features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <a 
                      href={stay.externalBookingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full flex items-center justify-center gap-2" size="lg">
                        Book Now
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 pb-16 pt-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-10">
                  <h3 className="font-heading font-bold text-2xl md:text-3xl mb-4">Need a Custom Accommodation?</h3>
                  <p className="text-gray-600">
                    We can help you find the perfect accommodation for your stay in Thailand. Contact us for a personalized proposal.
                  </p>
                </div>
                <Link href="/custom-tour">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="whitespace-nowrap">
                      Contact Us
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}