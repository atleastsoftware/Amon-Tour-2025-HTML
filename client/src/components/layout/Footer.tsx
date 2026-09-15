import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import NewsletterSubscription from "@/components/newsletter/NewsletterSubscription";
import logoA from "@/assets/logo-a.png";
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/contexts/TranslationContext';
import { useGlobalElementTranslations } from '@/hooks/useGlobalElementTranslations';
import { useTourNinjaRelease } from "@/contexts/TourNinjaReleaseContext";
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
          <span className="text-white px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#2d8a94' }}>
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
  const [remoteLogoFailed, setRemoteLogoFailed] = useState(false);
  const { translations } = useTranslation();
  const footer = translations.footer;
  const { translateValue, translateArray } = useGlobalElementTranslations();
  const remoteRelease = useTourNinjaRelease();
  
  // Fetch dynamic footer content
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/public/footer-settings'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Parse JSON data from database safely
  const contactInfoRaw = Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.key === 'contact_info')?.value : null;
  const usefulLinksRaw = Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.key === 'useful_links')?.value : null;
  const socialMediaRaw = Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.key === 'social_media')?.value : null;
  const newsletterConfigRaw = Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.key === 'newsletter_config')?.value : null;
  const copyrightConfigRaw = Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.key === 'copyright_config')?.value : null;
  
  // Parse and translate contact info
  const contactInfoParsed = contactInfoRaw ? (typeof contactInfoRaw === 'string' ? JSON.parse(contactInfoRaw) : contactInfoRaw) : [];
  const contactInfo = translateArray('footer_contact_info', contactInfoParsed, ['value']);
  
  // Parse and translate useful links
  const usefulLinksParsed = usefulLinksRaw ? (typeof usefulLinksRaw === 'string' ? JSON.parse(usefulLinksRaw) : usefulLinksRaw) : [];
  const usefulLinks = translateArray('footer_useful_links', usefulLinksParsed, ['text']);
  
  // Parse social media (no translation needed for URLs)
  const socialMedia = socialMediaRaw ? (typeof socialMediaRaw === 'string' ? JSON.parse(socialMediaRaw) : socialMediaRaw) : [];
  
  // Parse and translate newsletter config
  const newsletterConfigParsed = newsletterConfigRaw ? (typeof newsletterConfigRaw === 'string' ? JSON.parse(newsletterConfigRaw) : newsletterConfigRaw) : {};
  const newsletterConfig = {
    ...newsletterConfigParsed,
    title: translateValue('footer_newsletter_config', 'title', newsletterConfigParsed.title || ''),
    description: translateValue('footer_newsletter_config', 'description', newsletterConfigParsed.description || ''),
    privacyText: translateValue('footer_newsletter_config', 'privacy_text', newsletterConfigParsed.privacyText || '')
  };
  
  // Parse and translate copyright config
  const copyrightConfigParsed = copyrightConfigRaw ? (typeof copyrightConfigRaw === 'string' ? JSON.parse(copyrightConfigRaw) : copyrightConfigRaw) : { text: '© 2025 Flame BB Co., Ltd. (Amon Tour). All rights reserved.', enabled: true };
  const copyrightConfig = {
    ...copyrightConfigParsed,
    text: translateValue('footer_copyright_config', 'text', copyrightConfigParsed.text || '')
  };
  
  // Footer logo settings
  const logoSettingsRaw = Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.key === 'logo_settings')?.value : null;
  const logoSettings = logoSettingsRaw ? (typeof logoSettingsRaw === 'string' ? JSON.parse(logoSettingsRaw) : logoSettingsRaw) : {};
  const footerLogoSrc = logoSettings.footer_logo?.startsWith('/src/') ? logoA : (logoSettings.footer_logo || logoA);
  const footerLogoHeight = logoSettings.footer_logo_height || "48px";
  const remoteLogo = remoteRelease.mediaUrl(remoteRelease.release?.branding?.logoMediaId);
  const siteName = remoteRelease.text(remoteRelease.release?.branding?.siteName) || "Amon Tour";
  useEffect(() => setRemoteLogoFailed(false), [remoteRelease.contentDigest, remoteLogo]);
  
  return (
    <footer className="pt-8 pb-4" style={{ backgroundColor: 'hsl(var(--footer-background))', color: 'hsl(var(--footer-text))' }}>
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
              src={remoteLogo && !remoteLogoFailed ? remoteLogo : footerLogoSrc}
              alt={`${siteName} logo`}
              className="w-auto"
              style={{ height: footerLogoHeight }}
              onError={() => setRemoteLogoFailed(true)}
            />
          </motion.div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Contact Column */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-3 text-center">{footer.contact}</h4>
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
                    className="transition-colors"
                    style={{ color: 'inherit' }}
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
            <h4 className="font-heading font-bold text-lg mb-3 text-center">{footer.usefulLinks}</h4>
            <div className="flex flex-col items-center space-y-2">
              {usefulLinks.map((link: any, index: number) => (
                <motion.a 
                  key={index}
                  href={link.url}
                  className="font-heading transition-colors"
                  style={{ color: 'inherit', opacity: 0.9 }}
                  {...(link.url.startsWith('http') ? {
                    target: "_blank",
                    rel: "noopener noreferrer"
                  } : {})}
                  whileHover={{ y: -2, opacity: 1 }}
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
                {newsletterConfig.title || footer.newsletter}
              </h4>
              <p className="font-heading text-center mb-3">
                {newsletterConfig.description || footer.subscribeNewsletter}
              </p>
              <NewsletterSubscription />
              <p className="font-heading text-center text-sm">
                {newsletterConfig.privacyText || footer.privacyRespect}
              </p>
            </div>
          )}
        </div>
        
        {/* Copyright */}
        {copyrightConfig.enabled !== false && (
          <motion.div 
            className="border-t pt-4 flex flex-col md:flex-row justify-between items-center text-sm"
            style={{ borderColor: 'hsl(var(--footer-text) / 0.2)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="font-heading">{copyrightConfig.text || `© ${new Date().getFullYear()} Flame BB Co., Ltd. (Amon Tour). All rights reserved.`}</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <motion.a 
                href="/legal-notice" 
                className="font-heading text-sm transition-colors"
                style={{ color: 'inherit', opacity: 0.9 }}
                whileHover={{ y: -2, opacity: 1 }}
              >
                {footer.legalNotice}
              </motion.a>
              <motion.a 
                href="/privacy-policy" 
                className="font-heading text-sm transition-colors"
                style={{ color: 'inherit', opacity: 0.9 }}
                whileHover={{ y: -2, opacity: 1 }}
              >
                {footer.privacyPolicy}
              </motion.a>
              <motion.a 
                href="/terms-conditions" 
                className="font-heading text-sm transition-colors"
                style={{ color: 'inherit', opacity: 0.9 }}
                whileHover={{ y: -2, opacity: 1 }}
              >
                {footer.terms}
              </motion.a>
            </div>
          </motion.div>
        )}
      </div>
    </footer>
  );
}