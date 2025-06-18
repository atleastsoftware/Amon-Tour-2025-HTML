import { Link } from "wouter";
import { motion } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import NewsletterSubscription from "@/components/newsletter/NewsletterSubscription";
import logoA from "@/assets/logo-a.png";
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
    <footer className="bg-black text-white pt-8 pb-4">
      <div className="container mx-auto px-4">
        {/* Logo Area */}
        <div className="flex justify-center mb-6">
          <motion.div 
            className="mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={logoA} 
              alt="Amon Tour Logo" 
              className="h-12 w-auto"
            />
          </motion.div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Contact Column */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-3 text-center">Contact</h4>
            <div className="space-y-2 text-center">
              <p className="text-sm mb-3">
                <strong>Amon Tour is a brand of:</strong><br />
                Flame BB Co., Ltd.<br />
                242 Moo1 Tombol Ao Nang<br/>
                81180 Krabi, Thailand
              </p>
              
              <p className="mb-3">
                <span className="bg-secondary/20 text-white px-2 py-1 rounded-full text-xs">
                  TAT License: 34/01995
                </span>
              </p>
              
              <motion.div 
                className="space-y-1"
                whileHover={{ y: -2 }}
              >
                <p>
                  <a 
                    href="mailto:info@amon-tour.com" 
                    className="font-heading hover:text-secondary transition-colors"
                  >
                    info@amon-tour.com
                  </a>
                </p>
                <p>
                  <a 
                    href="tel:+66962166559" 
                    className="font-heading hover:text-secondary transition-colors"
                  >
                    Tel: +66 (0)96 216 6559
                  </a>
                </p>
                <p>
                  <a 
                    href="https://wa.me/66653496445" 
                    className="font-heading hover:text-secondary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-whatsapp mr-1"></i> WhatsApp: +66 65 349 6445
                  </a>
                </p>
                <p>
                  <span className="font-heading">
                    <i className="fab fa-line mr-1"></i> Line ID: amontour
                  </span>
                </p>
              </motion.div>
              
              <motion.div 
                className="flex justify-center space-x-4 mt-6"
              >
                <motion.a 
                  href="#" 
                  className="text-white hover:text-secondary transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-white hover:text-secondary transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-white hover:text-secondary transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Pinterest"
                >
                  <i className="fab fa-pinterest-p"></i>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-white hover:text-secondary transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="TikTok"
                >
                  <i className="fab fa-tiktok"></i>
                </motion.a>
              </motion.div>
            </div>
          </div>
          
          {/* Useful Links Column */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-3 text-center">Useful Links</h4>
            <div className="flex flex-col items-center space-y-2">
              <motion.a 
                href="/brochure" 
                className="font-heading hover:text-secondary transition-colors"
                whileHover={{ y: -2 }}
              >
                Our brochure
              </motion.a>
              <motion.a 
                href="/krabi-celebration" 
                className="font-heading hover:text-secondary transition-colors"
                whileHover={{ y: -2 }}
              >
                Krabi Celebration
              </motion.a>
              <motion.a 
                href="https://www.facebook.com/thefungardenkrabi/" 
                className="font-heading hover:text-secondary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
              >
                Fun Garden
              </motion.a>
              <motion.a 
                href="/villas-krabi" 
                className="font-heading hover:text-secondary transition-colors"
                whileHover={{ y: -2 }}
              >
                Villas in Krabi
              </motion.a>
              <motion.a 
                href="/become-partner" 
                className="font-heading hover:text-secondary transition-colors"
                whileHover={{ y: -2 }}
              >
                Become Partner
              </motion.a>
              <motion.a 
                href="/group-corporate" 
                className="font-heading hover:text-secondary transition-colors"
                whileHover={{ y: -2 }}
              >
                Group & Corporate
              </motion.a>
            </div>
          </div>
          
          {/* Newsletter Column */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-3 text-center">Newsletter</h4>
            <p className="font-heading text-center mb-3">
              Subscribe to receive our special offers and travel tips.
            </p>
            <NewsletterSubscription />
            <p className="font-heading text-center text-sm">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <motion.div 
          className="border-t border-white/20 pt-4 flex flex-col md:flex-row justify-between items-center text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="font-heading">&copy; {new Date().getFullYear()} Flame BB Co., Ltd. (Amon Tour). All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <motion.a 
              href="/legal-notice" 
              className="font-heading text-sm hover:text-secondary transition-colors"
              whileHover={{ y: -2 }}
            >
              Legal Notice
            </motion.a>
            <motion.a 
              href="/privacy-policy" 
              className="font-heading text-sm hover:text-secondary transition-colors"
              whileHover={{ y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="/terms-conditions" 
              className="font-heading text-sm hover:text-secondary transition-colors"
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