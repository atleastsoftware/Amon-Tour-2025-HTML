import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Download, Home, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function VillasKrabi() {
  return (
    <>
      <SEO 
        title="Villas in Krabi - Curated Villa Selection"
        description="Download our curated selection of premium villas in Krabi. Luxury accommodations with stunning views, private pools, and exceptional service for your perfect getaway."
        keywords="krabi villas, luxury accommodation krabi, private villas thailand, villa rentals krabi, premium stays"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src="/uploads/tours/tour-1745996624172-231261635.jpeg" 
              alt="Luxury villas in Krabi" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Home className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
                Villas in Krabi
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
                Discover our curated selection of premium villas for an unforgettable stay in paradise
              </p>
            </motion.div>
          </div>
        </section>

        {/* Villa Collection */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-12">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                  Curated Villa Selection
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  We've handpicked the finest villas in Krabi, each offering luxury, privacy, and breathtaking views for your perfect escape.
                </p>
              </div>

              <div className="bg-neutral-50 p-8 rounded-lg shadow-md text-center mb-8">
                <Download className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-bold text-2xl mb-4">Villa Selection PDF</h3>
                <p className="text-gray-600 mb-6">
                  Download our comprehensive guide featuring luxury villas with detailed descriptions, amenities, pricing, and stunning photography.
                </p>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download Villa Guide
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Beachfront Villas",
                    description: "Direct beach access with panoramic ocean views",
                    features: ["Private beach", "Infinity pools", "Sea view terraces"]
                  },
                  {
                    title: "Hilltop Retreats", 
                    description: "Elevated positions with stunning limestone cliff views",
                    features: ["Mountain views", "Private gardens", "Sunset terraces"]
                  },
                  {
                    title: "Jungle Hideaways",
                    description: "Secluded villas surrounded by tropical nature",
                    features: ["Tropical gardens", "Nature sounds", "Privacy & tranquility"]
                  }
                ].map((category, index) => (
                  <motion.div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <MapPin className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-heading font-bold text-lg mb-2">{category.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    <ul className="space-y-1">
                      {category.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center">
                          <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-heading font-bold text-lg mb-3">What's Included in Our Villa Guide?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>• Detailed villa descriptions</div>
                    <div>• High-quality photography</div>
                    <div>• Amenity listings</div>
                    <div>• Location maps</div>
                    <div>• Pricing information</div>
                    <div>• Booking instructions</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}