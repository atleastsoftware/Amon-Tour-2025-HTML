import { Link } from "wouter";
import { motion } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { 
  Facebook, 
  Instagram, 
  Mail, 
  MapPin, 
  Phone, 
  Clock
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <SlideUpWhenVisible>
            <div>
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
              >
                <motion.span 
                  className="text-white font-heading font-bold text-2xl"
                  whileHover={{ y: -2 }}
                >
                  Senthang
                </motion.span>
                <motion.span 
                  className="text-secondary font-accent text-2xl ml-1"
                  whileHover={{ y: -2 }}
                  transition={{ delay: 0.05 }}
                >
                  Siam
                </motion.span>
                <motion.span 
                  className="text-white font-heading font-bold text-2xl ml-1"
                  whileHover={{ y: -2 }}
                  transition={{ delay: 0.1 }}
                >
                  Tour
                </motion.span>
              </motion.div>
              <p className="mb-4">Your specialist for custom travel in Thailand. Private tours, English-speaking guides and authentic experiences.</p>
              <div className="flex flex-wrap gap-3">
                <motion.a 
                  href="https://www.facebook.com/SenthangSiamTour" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10" 
                  aria-label="Facebook"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook size={18} />
                </motion.a>
                <motion.a 
                  href="https://www.instagram.com/senthangsiam.tour/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-purple-600 to-pink-500 p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10" 
                  aria-label="Instagram"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram size={18} />
                </motion.a>
                <motion.a 
                  href="https://wa.me/66961599224" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10" 
                  aria-label="WhatsApp"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="fab fa-whatsapp"></i>
                </motion.a>
                <motion.a 
                  href="https://lin.ee/T2E2fEZ" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10" 
                  aria-label="Line"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="fab fa-line"></i>
                </motion.a>
              </div>
            </div>
          </SlideUpWhenVisible>
          
          {/* Contact Info */}
          <SlideUpWhenVisible delay={0.1}>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <motion.li 
                  className="flex items-start"
                  whileHover={{ x: 3 }}
                >
                  <MapPin className="mr-2 mt-1 text-secondary flex-shrink-0" size={18} />
                  <span>218/12 Rama 3 Road Soi 6, Bangkok, Thailand</span>
                </motion.li>
                <motion.li 
                  className="flex items-center"
                  whileHover={{ x: 3 }}
                >
                  <Phone className="mr-2 text-secondary flex-shrink-0" size={18} />
                  <a 
                    href="tel:+66910487015" 
                    className="hover:text-secondary transition-colors"
                  >
                    +66 (0)91 048 7015
                  </a>
                </motion.li>
                <motion.li 
                  className="flex items-center"
                  whileHover={{ x: 3 }}
                >
                  <Mail className="mr-2 text-secondary flex-shrink-0" size={18} />
                  <a 
                    href="mailto:senthangsiamtour@gmail.com" 
                    className="hover:text-secondary transition-colors"
                  >
                    senthangsiamtour@gmail.com
                  </a>
                </motion.li>
                <motion.li 
                  className="flex items-center"
                  whileHover={{ x: 3 }}
                >
                  <Clock className="mr-2 text-secondary flex-shrink-0" size={18} />
                  <span>Mon-Sun: 9:00 AM - 6:00 PM</span>
                </motion.li>
                <motion.li className="mt-2" whileHover={{ x: 3 }}>
                  <span className="bg-secondary/20 text-white px-2 py-1 rounded-full text-xs">
                    TAT License: 14/04455
                  </span>
                </motion.li>
              </ul>
            </div>
          </SlideUpWhenVisible>
          
          {/* Quick Links */}
          <SlideUpWhenVisible delay={0.2}>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
              <StaggerChildren className="space-y-2">
                <StaggerItem>
                  <Link href="/">
                    <motion.span 
                      className="hover:text-secondary transition-colors cursor-pointer flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-chevron-right mr-2 text-xs text-secondary"></i>
                      Home
                    </motion.span>
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href="/tours">
                    <motion.span 
                      className="hover:text-secondary transition-colors cursor-pointer flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-chevron-right mr-2 text-xs text-secondary"></i>
                      Our Tours
                    </motion.span>
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href="/#about">
                    <motion.span 
                      className="hover:text-secondary transition-colors cursor-pointer flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-chevron-right mr-2 text-xs text-secondary"></i>
                      About Us
                    </motion.span>
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href="/custom-tour">
                    <motion.span 
                      className="hover:text-secondary transition-colors cursor-pointer flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-chevron-right mr-2 text-xs text-secondary"></i>
                      Custom Tour
                    </motion.span>
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href="/#contact">
                    <motion.span 
                      className="hover:text-secondary transition-colors cursor-pointer flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-chevron-right mr-2 text-xs text-secondary"></i>
                      Contact
                    </motion.span>
                  </Link>
                </StaggerItem>
              </StaggerChildren>
            </div>
          </SlideUpWhenVisible>
          
          {/* Newsletter */}
          <SlideUpWhenVisible delay={0.3}>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Newsletter</h4>
              <p className="mb-4">Subscribe to receive our special offers and travel tips.</p>
              <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="px-4 py-2 rounded-l-md w-full text-gray-800 focus:outline-none"
                  />
                  <motion.button 
                    type="submit" 
                    className="bg-secondary px-4 py-2 rounded-r-md hover:bg-secondary-dark transition-colors"
                    aria-label="Subscribe"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </motion.button>
                </div>
              </form>
              <p className="text-sm">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </SlideUpWhenVisible>
        </div>
        
        <motion.div 
          className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p>&copy; {new Date().getFullYear()} Senthang Siam Tour. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <motion.a 
              href="#" 
              className="text-sm hover:text-secondary transition-colors"
              whileHover={{ y: -2 }}
            >
              Legal Notice
            </motion.a>
            <motion.a 
              href="#" 
              className="text-sm hover:text-secondary transition-colors"
              whileHover={{ y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="#" 
              className="text-sm hover:text-secondary transition-colors"
              whileHover={{ y: -2 }}
            >
              Terms & Conditions
            </motion.a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}