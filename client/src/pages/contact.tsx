import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <>
      <SEO 
        title="Contact Us - Amon Tour Krabi"
        description="Get in touch with Amon Tour for your perfect Krabi experience. Visit our office in Ao Nang or contact us via phone, email, WhatsApp, or Line."
        keywords="contact amon tour, krabi office, ao nang location, thailand tour operator contact"
      />
      <Header />
      
      <main className="main-content">
        {/* Hero Section */}
        <HeroHeader 
          title="Contact Us"
          subtitle="We're here to help you plan the perfect experience in Krabi."
          alt="Contact Amon Tour in Krabi"
        />

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading font-bold text-2xl md:text-3xl mb-6 text-center">
                  Get In Touch
                </h2>
                <p className="text-gray-600 mb-8">
                  Ready to explore Krabi? Contact us through any of the methods below. 
                  Our friendly team is here to answer your questions and help you plan 
                  an unforgettable experience.
                </p>

                <div className="space-y-6">
                  {/* Email */}
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">Email</p>
                      <a 
                        href="mailto:info@amon-tour.com"
                        className="text-gray-700 hover:text-primary transition-colors"
                      >
                        info@amon-tour.com
                      </a>
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">Phone</p>
                      <a 
                        href="tel:+66962166559"
                        className="text-gray-700 hover:text-primary transition-colors"
                      >
                        +66 (0)96 216 6559
                      </a>
                    </div>
                  </motion.div>

                  {/* WhatsApp */}
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">WhatsApp</p>
                      <a 
                        href="https://wa.me/66653496445"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-primary transition-colors"
                      >
                        +66 65 349 6445
                      </a>
                    </div>
                  </motion.div>

                  {/* Line */}
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">Line ID</p>
                      <span className="text-gray-700">amontour</span>
                    </div>
                  </motion.div>
                </div>

                {/* Business Info */}
                <motion.div 
                  className="mt-8 p-6 bg-neutral-50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="font-heading font-bold text-lg mb-3">About Our Company</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Amon Tour is a brand of:</strong><br />
                      Flame BB Co., Ltd.
                    </p>
                    <p>
                      <span className="bg-secondary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        TAT License: 34/01995
                      </span>
                    </p>
                    <p className="mt-4">
                      We are a licensed tour operator based in Ao Nang, Krabi, 
                      specializing in authentic local experiences and personalized travel services.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-heading font-bold text-2xl md:text-3xl mb-4">
                Ready to Start Your Adventure?
              </h3>
              <p className="text-gray-600 mb-6">
                Whether you're looking for a private tour, custom itinerary, or have questions about Krabi, 
                our local experts are ready to help you create unforgettable memories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://wa.me/66653496445" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-heading font-semibold transition-colors"
                >
                  Chat on WhatsApp
                </a>
                <a 
                  href="mailto:info@amon-tour.com"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-heading font-semibold transition-colors"
                >
                  Send us an Email
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}