import { Link } from "wouter";
import { motion } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import NewsletterSubscription from "@/components/newsletter/NewsletterSubscription";
import logoA from "@/assets/logo-a.png";
import { useQuery } from '@tanstack/react-query';
import { 
  Facebook, 
  Instagram, 
  Mail, 
  MapPin, 
  Phone, 
  Clock
} from "lucide-react";

// Helper function to render contact info based on style
function renderContactInfo(item: any) {
  const { style, value } = item;
  
  if (!value) return null;
  
  switch (style) {
    case 'title':
      return (
        <p className="text-sm mb-3">
          <strong>{value}</strong>
        </p>
      );
    
    case 'text':
      return (
        <p className="text-sm mb-3">
          {value}
        </p>
      );
    
    case 'address':
      return (
        <p className="text-sm mb-3">
          {value.split('\n').map((line: string, idx: number) => (
            <span key={idx}>
              {line}
              {idx < value.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    
    case 'license_badge':
      return (
        <p className="mb-3">
          <span className="bg-secondary/20 text-white px-2 py-1 rounded-full text-xs">
            {value}
          </span>
        </p>
      );
    
    case 'email':
      return (
        <motion.div
          className="space-y-1"
          whileHover={{ y: -2 }}
        >
          <p>
            <a 
              href={`mailto:${value}`}
              className="font-heading hover:text-secondary transition-colors"
            >
              {value}
            </a>
          </p>
        </motion.div>
      );
    
    case 'phone_with_title':
      const phoneNumber = value.replace(/^[^:]*:\s*/, '').replace(/\s/g, '').replace(/\(0\)/g, '');
      return (
        <motion.div
          className="space-y-1"
          whileHover={{ y: -2 }}
        >
          <p>
            <a 
              href={`tel:${phoneNumber}`}
              className="font-heading hover:text-secondary transition-colors"
            >
              {value}
            </a>
          </p>
        </motion.div>
      );
    
    case 'whatsapp':
      const whatsappNumber = value.replace(/^[^:]*:\s*/, '').replace(/\s/g, '').replace(/\(0\)/g, '').replace(/^\+/, '');
      return (
        <motion.div
          className="space-y-1"
          whileHover={{ y: -2 }}
        >
          <p>
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              className="font-heading hover:text-secondary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp mr-1"></i> {value}
            </a>
          </p>
        </motion.div>
      );
    
    case 'line':
      const lineId = value.replace(/^[^:]*:\s*/, '');
      return (
        <motion.div
          className="space-y-1"
          whileHover={{ y: -2 }}
        >
          <p>
            <span className="font-heading">
              <i className="fab fa-line mr-1"></i> {value}
            </span>
          </p>
        </motion.div>
      );
    
    default:
      return (
        <p className="text-sm mb-3">
          {value}
        </p>
      );
  }
}

export default function Footer() {
  // Fetch dynamic footer content
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/admin/site-settings'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const contactInfo = siteSettings?.find((s: any) => s.key === 'footer_contact_info')?.value || [];
  const usefulLinks = siteSettings?.find((s: any) => s.key === 'footer_useful_links')?.value || [];
  const socialMedia = siteSettings?.find((s: any) => s.key === 'footer_social_media')?.value || [];
  const newsletterConfig = siteSettings?.find((s: any) => s.key === 'footer_newsletter')?.value || {};
  
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
              {/* Dynamic Contact Information */}
              {contactInfo.map((item: any, index: number) => (
                <div key={index}>
                  {renderContactInfo(item)}
                </div>
              ))}
              
              {/* Social Media Links */}
              <motion.div 
                className="flex justify-center space-x-4 mt-6"
              >
                {socialMedia.map((social: any, index: number) => (
                  <motion.a 
                    key={index}
                    href={social.url}
                    className="text-white hover:text-secondary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.name}
                  >
                    <i className={`fab fa-${social.icon}`}></i>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>
          
          {/* Useful Links Column */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-3 text-center">Useful Links</h4>
            <div className="flex flex-col items-center space-y-2">
              {usefulLinks.map((link: any, index: number) => (
                <motion.a 
                  key={index}
                  href={link.url}
                  className="font-heading hover:text-secondary transition-colors"
                  {...(link.url.startsWith('http') ? {
                    target: "_blank",
                    rel: "noopener noreferrer"
                  } : {})}
                  whileHover={{ y: -2 }}
                >
                  {link.text}
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Newsletter Column */}
          {newsletterConfig.enabled !== false && (
            <div>
              <h4 className="font-heading font-bold text-lg mb-3 text-center">
                {newsletterConfig.title || 'Newsletter'}
              </h4>
              <p className="font-heading text-center mb-3">
                {newsletterConfig.description || 'Subscribe to receive our special offers and travel tips.'}
              </p>
              <NewsletterSubscription />
              <p className="font-heading text-center text-sm">
                {newsletterConfig.privacyText || 'We respect your privacy. Unsubscribe at any time.'}
              </p>
            </div>
          )}
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