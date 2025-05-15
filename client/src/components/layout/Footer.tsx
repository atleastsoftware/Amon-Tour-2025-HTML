import { Link } from "wouter";
import { motion } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
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
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Logo Area */}
        <div className="flex justify-center mb-10">
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={logoA} 
              alt="Amon Tour Logo" 
              className="h-16 w-auto"
            />
          </motion.div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* Contact Column */}
          <div>
            <h4 className="font-heading font-bold text-xl mb-6 text-center">Contact</h4>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-center justify-center"
                whileHover={{ y: -2 }}
              >
                <a 
                  href="tel:+66612534584" 
                  className="font-heading hover:text-secondary transition-colors"
                >
                  T: +66 61 253 4584
                </a>
              </motion.li>
              <motion.li 
                className="flex items-center justify-center"
                whileHover={{ y: -2 }}
              >
                <a 
                  href="mailto:amontour@gmail.com" 
                  className="font-heading hover:text-secondary transition-colors"
                >
                  E: amontour@gmail.com
                </a>
              </motion.li>
              <motion.li 
                className="flex items-center justify-center mt-6"
              >
                <div className="flex space-x-4">
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
                </div>
              </motion.li>
            </ul>
            
            {/* Hidden Info on Mobile */}
            <div className="md:hidden mt-6">
              <p className="text-center mb-4">
                Amon Tour is a brand of:<br />
                Flame BB Co., Ltd.<br />
                242 Moo1 Tombol Ao Nang<br/>
                81180 Krabi, Thailand
              </p>
              <p className="text-center">
                <span className="bg-secondary/20 text-white px-2 py-1 rounded-full text-xs">
                  License TAT: 34/01995
                </span>
              </p>
            </div>
          </div>
          
          {/* Useful Links Column */}
          <div>
            <h4 className="font-heading font-bold text-xl mb-6 text-center">Useful Links</h4>
            <div className="flex flex-col items-center space-y-4">
              <Link href="/">
                <motion.span 
                  className="font-heading hover:text-secondary transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  Home
                </motion.span>
              </Link>
              <Link href="/tours">
                <motion.span 
                  className="font-heading hover:text-secondary transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  Our Tours
                </motion.span>
              </Link>
              <Link href="/#about">
                <motion.span 
                  className="font-heading hover:text-secondary transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  About Us
                </motion.span>
              </Link>
              <Link href="/custom-tour">
                <motion.span 
                  className="font-heading hover:text-secondary transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  Custom Tour
                </motion.span>
              </Link>
              <motion.a 
                href="https://wa.me/66653496445" 
                className="font-heading hover:text-secondary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
              >
                WhatsApp
              </motion.a>
              <motion.span
                className="font-heading hover:text-secondary transition-colors cursor-pointer"
                whileHover={{ y: -2 }}
              >
                What they say about us
              </motion.span>
            </div>
          </div>
          
          {/* Newsletter Column */}
          <div>
            <h4 className="font-heading font-bold text-xl mb-6 text-center">Newsletter</h4>
            <p className="font-heading text-center mb-6">
              Subscribe to receive our special offers and travel tips.
            </p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex justify-center">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-md w-full max-w-xs text-gray-800 focus:outline-none"
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
            <p className="font-heading text-center text-sm">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <motion.div 
          className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="font-heading">&copy; {new Date().getFullYear()} Flame BB Co., Ltd. (Amon Tour). All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <motion.a 
              href="#" 
              className="font-heading text-sm hover:text-secondary transition-colors"
              whileHover={{ y: -2 }}
            >
              Legal Notice
            </motion.a>
            <motion.a 
              href="#" 
              className="font-heading text-sm hover:text-secondary transition-colors"
              whileHover={{ y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="#" 
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