import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Download, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Brochure() {
  return (
    <>
      <SEO 
        title="Our Brochure - Amon Tour Travel Guide"
        description="Download our comprehensive travel brochure featuring the best of Krabi and Thailand. Available in French and English with detailed tour information and stunning photography."
        keywords="amon tour brochure, krabi travel guide, thailand tours pdf, travel brochure download"
        canonicalUrl="https://amon-tour.com/brochure"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src="/uploads/tours/tour-1745996624172-231261635.jpeg" 
              alt="Amon Tour brochure" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Download className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
                Our Travel Brochure
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
                Discover the magic of Krabi and Thailand with our comprehensive travel guide
              </p>
            </motion.div>
          </div>
        </section>

        {/* Brochure Downloads */}
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
                  Download Our Brochure
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Get inspired with our beautifully designed brochure featuring the best experiences Krabi has to offer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  className="bg-neutral-50 p-8 rounded-lg shadow-md text-center"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-2xl mb-4">English Version</h3>
                  <p className="text-gray-600 mb-6">
                    Complete guide to our tours and experiences in English, perfect for international travelers.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/attached_assets/Brochure Amon Tour 2025-2026 VEP_1750754812526.pdf';
                      link.download = 'Amon Tour Brochure 2025-2026 English.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download English PDF
                  </Button>
                </motion.div>

                <motion.div
                  className="bg-neutral-50 p-8 rounded-lg shadow-md text-center"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Globe className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-2xl mb-4">Version Française</h3>
                  <p className="text-gray-600 mb-6">
                    Guide complet de nos circuits et expériences en français, idéal pour les voyageurs francophones.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/attached_assets/Brochure Amon Tour 2025-2026 VFP_1750754812525.pdf';
                      link.download = 'Amon Tour Brochure 2025-2026 Français.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF Français
                  </Button>
                </motion.div>
              </div>

              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-heading font-bold text-lg mb-3">What's Inside Our Brochure?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>• Featured tour packages</div>
                    <div>• Stunning photography</div>
                    <div>• Detailed itineraries</div>
                    <div>• Pricing information</div>
                    <div>• Contact details</div>
                    <div>• Local insights</div>
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