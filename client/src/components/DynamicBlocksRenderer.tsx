import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Loader2, Users, Compass, Sparkles, ExternalLink, Clock } from "lucide-react";
import Gallery from "@/components/ui/Gallery";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";

// Lazy load form components
const CruiseForm = lazy(() => import("@/components/CruiseForm"));
const CatamaranExperience = lazy(() => import("@/components/CatamaranExperience"));
const SeasonalPricing = lazy(() => import("@/components/SeasonalPricing"));

// Import components for new block types
const Features = lazy(() => import("@/components/home/Features"));
const About = lazy(() => import("@/components/home/About"));
const TourNinjaSection = lazy(() => import("@/components/tour/TourNinjaSection"));
const CustomTourForm = lazy(() => import("@/components/home/CustomTourForm"));
import SearchBarToursBlock from "@/components/blocks/SearchBarToursBlock";
import ContactBlock from "@/components/blocks/ContactBlock";
import BlogSearchBlock from "@/components/blocks/BlogSearchBlock";
import TextGalleryBlock from "@/components/blocks/TextGalleryBlock";
import TextVideoBlock from "@/components/blocks/TextVideoBlock";
import TextListingBlock from "@/components/blocks/TextListingBlock";
import TextPricingBlock from "@/components/blocks/TextPricingBlock";
import DynamicFormBlock from "@/components/blocks/DynamicFormBlock";
import PopularExperiencesBlock from "@/components/blocks/PopularExperiencesBlock";

interface PageBlock {
  id: number;
  blockType: string;
  blockOrder: number;
  identifier: string | null;
  title: string | null;
  subtitle: string | null;
  description?: string;
  content: any;
  imageUrl?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaStyle?: string;
  backgroundColor?: string;
  configuration?: any;
  settings: any;
  isActive: boolean;
}

interface DynamicBlocksRendererProps {
  blocks: PageBlock[];
}

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function DynamicBlocksRenderer({ blocks }: DynamicBlocksRendererProps) {
  const { translations, currentLanguage } = useTranslation();
  const hero = translations.hero;
  const home = translations.home;
  const tours = translations.tours;
  const common = translations.common;
  
  // Helper function to get dynamic translations from JSON files (updated by backend)
  const getDynamicTranslation = (blockType: string, blockId: number, field: string, fallback: string = ''): string => {
    const dynamicTranslations = (translations as any);
    const section = `${blockType}_${blockId}`; // Unique section for each block instance
    const value = dynamicTranslations?.[section]?.[field];
    return value || fallback;
  };
  
  const renderBlock = (block: PageBlock) => {
    // Pour l'instant, on affiche un rendu basique pour chaque type de bloc
    // Dans le futur, chaque type de bloc aura son propre composant
    switch (block.blockType) {
      case 'header_page': {
        const headerPageConfig = block.configuration || {};
        const bgType = headerPageConfig.backgroundType || 'image';
        const frameSize = headerPageConfig.frameSize || 'small';
        const heightClass = frameSize === 'large' ? 'h-[70vh]' : 'h-[35vh] md:h-[52vh]';
        
        let headerBackground;
        if (bgType === 'color') {
          headerBackground = (
            <div 
              className="absolute inset-0 w-full h-full z-0"
              style={{ backgroundColor: headerPageConfig.backgroundColor || '#084F6E' }}
            />
          );
        } else if (bgType === 'gradient') {
          headerBackground = (
            <div 
              className="absolute inset-0 w-full h-full z-0"
              style={{ 
                background: `linear-gradient(135deg, ${headerPageConfig.gradientColor1 || '#084F6E'} 0%, ${headerPageConfig.gradientColor2 || '#3BA8AF'} 100%)` 
              }}
            />
          );
        } else if (bgType === 'video' && headerPageConfig.videoUrl) {
          headerBackground = (
            <div className="absolute inset-0 w-full h-full z-0">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              >
                <source src={headerPageConfig.videoUrl} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
            </div>
          );
        } else if (headerPageConfig.imageUrl || block.imageUrl) {
          headerBackground = (
            <>
              <img 
                src={headerPageConfig.imageUrl || block.imageUrl} 
                alt={headerPageConfig.imageAlt || block.imageAlt || block.title || ''} 
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/50 z-10"></div>
            </>
          );
        } else {
          headerBackground = (
            <>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-secondary z-0" />
              <div className="absolute inset-0 bg-black/50 z-10"></div>
            </>
          );
        }
        
        return (
          <section key={block.id} className={`relative ${heightClass}`}>
            {headerBackground}
            <div className="relative z-20 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
              {headerPageConfig.iconUrl && (
                <div 
                  className="w-16 h-16 mx-auto mb-6"
                  style={{ 
                    filter: headerPageConfig.iconColor ? `brightness(0) saturate(100%) invert(${headerPageConfig.iconColor === '#ffffff' ? '100%' : '0%'})` : undefined 
                  }}
                >
                  <img src={headerPageConfig.iconUrl} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              {(headerPageConfig.title || block.title) && (
                <h1 
                  className="text-4xl md:text-5xl font-heading font-bold mb-4"
                  style={{ color: headerPageConfig.titleColor || '#ffffff', whiteSpace: 'pre-line' }}
                >
                  {headerPageConfig.title || block.title}
                </h1>
              )}
              {(headerPageConfig.subtitle || block.subtitle) && (
                <p 
                  className="text-lg md:text-xl max-w-2xl mx-auto"
                  style={{ color: headerPageConfig.subtitleColor || '#ffffff', whiteSpace: 'pre-line' }}
                >
                  {headerPageConfig.subtitle || block.subtitle}
                </p>
              )}
            </div>
          </section>
        );
      }

      case 'hero':
      case 'hero_banner':
      case 'hero_video': {
        const heroConfig = block.configuration || {};
        const bgType = heroConfig.backgroundType || 'image';
        const contentAlignment = (heroConfig.contentAlignment || 'center') as 'left' | 'center' | 'right';
        const alignmentClasses = {
          left: 'items-center justify-start text-left',
          center: 'items-center justify-center text-center',
          right: 'items-center justify-end text-right'
        }[contentAlignment];
        
        // Use dynamic translations from JSON files (automatically updated by backend)
        const fullTitle = getDynamicTranslation(block.blockType, block.id, 'title', heroConfig.title || block.title || '');
        const accentText = getDynamicTranslation(block.blockType, block.id, 'title_accent', heroConfig.titleAccentText || '');
        const titleColor = heroConfig.titleColor || '#ffffff';
        const accentColor = heroConfig.titleAccentColor || '#3BA8AF';
        const hasAnimation = heroConfig.hasAnimation !== false;
        
        let heroTitle;
        if (fullTitle.includes(accentText)) {
          const parts = fullTitle.split(accentText);
          const TitleTag = hasAnimation ? motion.h1 : 'h1' as any;
          const motionProps = hasAnimation ? {
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.2 }
          } : {};
          heroTitle = (
            <TitleTag 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" 
              style={{ whiteSpace: 'pre-line' }}
              {...motionProps}
            >
              {parts[0] && <span style={{ color: titleColor }}>{parts[0]}</span>}
              <span style={{ color: accentColor }}>{accentText}</span>
              {parts[1] && <span style={{ color: titleColor }}>{parts[1]}</span>}
            </TitleTag>
          );
        } else {
          const TitleTag = hasAnimation ? motion.h1 : 'h1' as any;
          const motionProps = hasAnimation ? {
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.2 }
          } : {};
          heroTitle = (
            <TitleTag 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" 
              style={{ color: titleColor, whiteSpace: 'pre-line' }}
              {...motionProps}
            >
              {fullTitle}
            </TitleTag>
          );
        }
        
        // Render background
        let heroBackground;
        if (bgType === 'color') {
          heroBackground = (
            <div 
              className="absolute inset-0 w-full h-full z-0"
              style={{ backgroundColor: heroConfig.backgroundColor || '#084F6E' }}
            />
          );
        } else if (bgType === 'gradient') {
          const gradientColor1 = heroConfig.gradientColor1 || heroConfig.backgroundColor || '#084F6E';
          const gradientColor2 = heroConfig.gradientColor2 || '#3BA8AF';
          heroBackground = (
            <div 
              className="absolute inset-0 w-full h-full z-0"
              style={{ background: `linear-gradient(135deg, ${gradientColor1}, ${gradientColor2})` }}
            />
          );
        } else if (bgType === 'images') {
          const images = [
            heroConfig.backgroundImage1,
            heroConfig.backgroundImage2,
            heroConfig.backgroundImage3
          ].filter(Boolean);
          
          if (images.length > 0) {
            heroBackground = (
              <motion.div 
                className="absolute inset-0 w-full h-full z-0"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2 }}
              >
                <img
                  src={images[0]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>
            );
          } else {
            heroBackground = <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-primary to-secondary" />;
          }
        } else if (bgType === 'video' && heroConfig.videoUrl) {
          heroBackground = (
            <div className="absolute inset-0 w-full h-full z-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={heroConfig.videoUrl} type="video/mp4" />
              </video>
            </div>
          );
        } else if (block.imageUrl || heroConfig.backgroundImage) {
          heroBackground = (
            <motion.img 
              src={block.imageUrl || heroConfig.backgroundImage} 
              alt={block.imageAlt || ''} 
              className="absolute inset-0 w-full h-full object-cover z-0"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2 }}
            />
          );
        } else {
          heroBackground = <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-primary to-secondary" />;
        }

        return (
          <section key={block.id} className="relative pt-40 md:pt-48 pb-20 min-h-screen flex overflow-hidden">
            {heroBackground}
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className={`relative z-20 w-full px-8 md:px-12 lg:px-16 flex ${alignmentClasses}`}>
              <motion.div 
                className="max-w-5xl"
                animate={hasAnimation ? { 
                  x: [0, 10, 0, -10, 0],
                  transition: {
                    repeat: Infinity,
                    duration: 8,
                    ease: "easeInOut"
                  }
                } : {}}
              >
                {heroTitle}
                {(heroConfig.subtitle || block.subtitle) && (
                  <p 
                    className="text-lg md:text-xl mb-8 max-w-3xl"
                    style={{ 
                      color: heroConfig.subtitleColor || '#ffffff',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {getDynamicTranslation(block.blockType, block.id, 'description', heroConfig.subtitle || block.subtitle || '')}
                  </p>
                )}
                {heroConfig.buttons && heroConfig.buttons.length > 0 && (
                  <div 
                    className={`flex gap-4 mt-8 ${contentAlignment === 'center' ? 'justify-center' : contentAlignment === 'right' ? 'justify-end' : 'justify-start'}`}
                  >
                    {heroConfig.buttons.map((button: any, index: number) => {
                      // Use dynamic translations from JSON (updated automatically by backend)
                      const buttonKey = index === 0 ? 'see_offers' : 'custom_trip';
                      const buttonText = getDynamicTranslation(block.blockType, block.id, buttonKey, button.text || '');
                      if (!buttonText) return null;
                      
                      const buttonStyle = button.style || 'solid';
                      const buttonColor = button.color || '#3BA8AF';
                      const buttonTextColor = button.textColor || '#ffffff';
                      
                      if (buttonStyle === 'outline') {
                        return (
                          <a
                            key={index}
                            href={button.url || '#'}
                            className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                            style={{
                              backgroundColor: 'transparent',
                              color: buttonColor,
                              border: `2px solid ${buttonColor}`
                            }}
                          >
                            {buttonText}
                          </a>
                        );
                      }
                      
                      return (
                        <a
                          key={index}
                          href={button.url || '#'}
                          className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                          style={{
                            backgroundColor: buttonColor,
                            color: buttonTextColor
                          }}
                        >
                          {buttonText}
                        </a>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        );
      }

      case 'text':
        const textConfig = block.configuration || {};
        // USE TRANSLATIONS FIRST
        const textTitle = getDynamicTranslation(block.blockType, block.id, "title", block.title || textConfig.title || '');
        const textContent = getDynamicTranslation(block.blockType, block.id, "description", block.content || textConfig.content || '');
        
        return (
          <section key={block.id} className="py-20" style={{ backgroundColor: textConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {textTitle && (
                  <h2 
                    className="font-heading font-bold text-3xl md:text-4xl mb-3"
                    style={{ color: textConfig.titleColor || '#333333' }}
                  >
                    {textTitle}
                  </h2>
                )}
                {textTitle && (
                  <div 
                    className="w-20 h-1 mx-auto mb-8"
                    style={{ backgroundColor: textConfig.dividerColor || '#3BA8AF' }}
                  ></div>
                )}
                {textContent && (
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: textConfig.contentColor || '#666666' }}
                  >
                    {textContent}
                  </p>
                )}
                {textConfig.buttons && textConfig.buttons.length > 0 && (
                  <div className="flex gap-4 justify-center mt-8">
                    {textConfig.buttons.map((button: any, index: number) => {
                      // Use translations for buttons if not set
                      const buttonText = button.text || common.learnMore;
                      if (!buttonText) return null;
                      
                      if (button.style === 'outline') {
                        return (
                          <a
                            key={index}
                            href={button.url || '#'}
                            className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                            style={{
                              backgroundColor: 'transparent',
                              color: button.color || '#084F6E',
                              border: `2px solid ${button.color || '#084F6E'}`
                            }}
                          >
                            {buttonText}
                          </a>
                        );
                      }
                      
                      return (
                        <a
                          key={index}
                          href={button.url || '#'}
                          className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                          style={{
                            backgroundColor: button.color || '#084F6E',
                            color: button.textColor || '#ffffff'
                          }}
                        >
                          {button.text}
                        </a>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        );

      case 'text_section':
        // USE TRANSLATIONS FIRST
        const sectionTitle = getDynamicTranslation(block.blockType, block.id, "title", block.title || '');
        const sectionSubtitle = getDynamicTranslation(block.blockType, block.id, "subtitle", block.subtitle || '');
        const sectionContent = getDynamicTranslation(block.blockType, block.id, "description", block.content || '');
        
        return (
          <div key={block.id} className={`py-16 bg-${block.backgroundColor || 'white'}`}>
            <div className="container mx-auto px-4">
              {sectionTitle && (
                <h2 className="text-3xl font-bold text-center mb-4">{sectionTitle}</h2>
              )}
              {sectionSubtitle && (
                <p className="text-xl text-gray-600 text-center mb-8">{sectionSubtitle}</p>
              )}
              {sectionContent && (
                <div 
                  className="prose prose-lg mx-auto"
                  dangerouslySetInnerHTML={{ __html: sectionContent }}
                />
              )}
            </div>
          </div>
        );

      case 'text_image':
      case 'about_2col':
        // Special handling for "The Catamaran Experience" section - use React component for animations
        if (block.identifier === 'catamaran_experience' || block.identifier === 'what_we_offer') {
          return (
            <div key={block.id} className="w-full">
              <Suspense fallback={
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <CatamaranExperience />
              </Suspense>
            </div>
          );
        }
        // Special handling for pricing section - use React component
        if (block.identifier === 'pricing') {
          return (
            <div key={block.id} className="w-full">
              <Suspense fallback={
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <SeasonalPricing />
              </Suspense>
            </div>
          );
        }
        // Default text_image rendering - USE TRANSLATIONS FIRST
        const textImgTitle = getDynamicTranslation(block.blockType, block.id, "title", block.title || '');
        const textImgSubtitle = getDynamicTranslation(block.blockType, block.id, "subtitle", block.subtitle || '');
        const textImgContent = getDynamicTranslation(block.blockType, block.id, "description", block.content || '');
        
        return (
          <div key={block.id} className="py-16 bg-white w-full">
            <div className="w-full px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  {textImgTitle && (
                    <h2 className="text-3xl font-bold mb-4">{textImgTitle}</h2>
                  )}
                  {textImgSubtitle && (
                    <p className="text-xl text-gray-600 mb-4">{textImgSubtitle}</p>
                  )}
                  {textImgContent && (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: textImgContent }}
                    />
                  )}
                  {block.ctaText && block.ctaUrl && (
                    <a 
                      href={block.ctaUrl} 
                      className="inline-block mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {block.ctaText}
                    </a>
                  )}
                </div>
                {block.imageUrl && (
                  <div>
                    <img 
                      src={block.imageUrl} 
                      alt={block.imageAlt || block.title || ''} 
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'cta_banner':
      case 'cta_section':
        // USE TRANSLATIONS FIRST
        const ctaTitle = getDynamicTranslation(block.blockType, block.id, "title", block.title || '');
        const ctaSubtitle = getDynamicTranslation(block.blockType, block.id, "subtitle", block.subtitle || '');
        const ctaText = block.ctaText || common.learnMore;
        
        return (
          <div key={block.id} className="py-16 bg-primary">
            <div className="container mx-auto px-4 text-center">
              {ctaTitle && (
                <h2 className="text-3xl font-bold text-white mb-4">{ctaTitle}</h2>
              )}
              {ctaSubtitle && (
                <p className="text-xl text-white/90 mb-8">{ctaSubtitle}</p>
              )}
              {ctaText && block.ctaUrl && (
                <a 
                  href={block.ctaUrl} 
                  className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  {ctaText}
                </a>
              )}
            </div>
          </div>
        );

      case 'contact_info':
      case 'contact_cards':
        return (
          <div key={block.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              {block.title && (
                <h2 className="text-3xl font-bold text-center mb-8">{block.title}</h2>
              )}
              {block.content && (
                <div 
                  className="prose prose-lg mx-auto text-center"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
            </div>
          </div>
        );

      case 'form':
      case 'custom_form':
      case 'dynamic_form':
        const formConfig = block.configuration || {};
        return (
          <DynamicFormBlock
            key={block.id}
            title={block.title || formConfig.title}
            subtitle={block.subtitle || formConfig.subtitle}
            formId={formConfig.formId}
            titleColor={formConfig.titleColor}
            subtitleColor={formConfig.subtitleColor}
            dividerColor={formConfig.dividerColor}
            backgroundColor={formConfig.backgroundColor}
          />
        );

      case 'advantages':
        // Special handling for "Your Cruise, Our Expertise" section
        if (block.identifier === 'our_expertise') {
          return (
            <div key={block.id} className="bg-white w-full">
              <div className="w-full">
                {block.content && (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                )}
              </div>
            </div>
          );
        }
        // Default advantages rendering
        return (
          <div key={block.id} className="py-16 bg-white w-full">
            <div className="w-full px-8 md:px-12 lg:px-16">
              {block.title && (
                <h2 className="text-3xl font-bold text-center mb-4">{block.title}</h2>
              )}
              {block.subtitle && (
                <p className="text-xl text-gray-600 text-center mb-8">{block.subtitle}</p>
              )}
              {block.content && (
                <div 
                  className="prose prose-lg mx-auto max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
            </div>
          </div>
        );

      case 'card_grid':
      case 'cards_grid':
        return (
          <div key={block.id} className="py-16 bg-gray-50 w-full">
            <div className="w-full px-8 md:px-12 lg:px-16">
              {block.title && (
                <h2 className="text-3xl font-bold text-center mb-4">{block.title}</h2>
              )}
              {block.subtitle && (
                <p className="text-xl text-gray-600 text-center mb-8">{block.subtitle}</p>
              )}
              {block.content && (
                <div 
                  className="prose prose-lg mx-auto max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
            </div>
          </div>
        );

      case 'popular_experiences':
      case 'tour_ninja_section':
        const popularExpConfig = block.configuration || {};
        // USE TRANSLATIONS FIRST for popular experiences
        const popularTitle = getDynamicTranslation(block.blockType, block.id, "title", block.title || popularExpConfig.title || '');
        const popularSubtitle = getDynamicTranslation(block.blockType, block.id, "description", block.subtitle || popularExpConfig.subtitle || '');
        
        return (
          <PopularExperiencesBlock
            key={block.id}
            title={popularTitle}
            subtitle={popularSubtitle}
            configuration={popularExpConfig}
          />
        );

      case 'custom_tour_form':
        const customTourFormConfig = block.configuration || {};
        // Use dynamic translations from JSON files (updated automatically by backend)
        const dynamicTranslations = (translations as any);
        const customFormTitle = dynamicTranslations?.custom_tour_form?.title || block.title || customTourFormConfig.title || '';
        const customFormSubtitle = dynamicTranslations?.custom_tour_form?.subtitle || block.subtitle || customTourFormConfig.subtitle || '';
        
        return (
          <DynamicFormBlock
            key={block.id}
            title={customFormTitle}
            subtitle={customFormSubtitle}
            formId={customTourFormConfig.formId}
            titleColor={customTourFormConfig.titleColor}
            subtitleColor={customTourFormConfig.subtitleColor}
            dividerColor={customTourFormConfig.dividerColor}
            backgroundColor={customTourFormConfig.backgroundColor}
          />
        );

      case 'why_choose_us': {
        const featuresConfig = block.configuration || {};
        // USE TRANSLATIONS FIRST for why choose us
        const whyTitle = getDynamicTranslation(block.blockType, block.id, "title", block.title || featuresConfig.title || '');
        const whySubtitle = getDynamicTranslation(block.blockType, block.id, "description", featuresConfig.subtitle || '');
        
        const iconBlocks = featuresConfig.iconBlocks || [
          {
            id: 1,
            mainIcon: 'fas fa-user-friends',
            title: 'Private Tours',
            description: 'Experience an exclusive day trip with our professional guides.',
            iconColor: '#084F6E',
            miniIcons: [
              { icon: 'fas fa-car', text: 'Private Car' },
              { icon: 'fas fa-language', text: 'Guide' },
              { icon: 'fas fa-shield-alt', text: 'Safety' }
            ]
          }
        ];
        const iconStyle = featuresConfig.iconStyle || 'modern-card';
        
        return (
          <section key={block.id} className="py-16" style={{ backgroundColor: featuresConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 max-w-4xl mx-auto">
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {whyTitle && (
                    <h2 
                      className="font-heading font-bold text-3xl md:text-4xl mb-3"
                      style={{ color: featuresConfig.titleColor || '#333333' }}
                    >
                      {whyTitle}
                    </h2>
                  )}
                  {whyTitle && (
                    <div 
                      className="w-20 h-1 mx-auto mb-8"
                      style={{ backgroundColor: featuresConfig.dividerColor || '#3BA8AF' }}
                    ></div>
                  )}
                  {whySubtitle && (
                    <p 
                      className="text-lg leading-relaxed"
                      style={{ color: featuresConfig.subtitleColor || '#666666' }}
                    >
                      {whySubtitle}
                    </p>
                  )}
                </motion.div>
              </div>
              
              <div className={`grid gap-8 ${
                iconBlocks.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                iconBlocks.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-3'
              }`}>
                {iconBlocks.map((feature: any, index: number) => {
                  if (iconStyle === 'minimalist') {
                    return (
                      <motion.div 
                        key={`minimalist-${feature.id}`}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ 
                            backgroundColor: hexToRgba(feature.iconColor || '#084F6E', 0.06),
                            color: feature.iconColor || '#084F6E'
                          }}
                        >
                          {feature.mainIcon === 'fas fa-user-friends' && <Users size={28} />}
                          {feature.mainIcon === 'fas fa-compass' && <Compass size={28} />}
                          {feature.mainIcon === 'fas fa-sparkles' && <Sparkles size={28} />}
                          {!['fas fa-user-friends', 'fas fa-compass', 'fas fa-sparkles'].includes(feature.mainIcon) && (
                            <i className={`${feature.mainIcon} text-2xl`}></i>
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-xl mb-3">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                        
                        {feature.miniIcons && feature.miniIcons.length > 0 && (
                          <div className={`mt-4 grid gap-4 ${
                            feature.miniIcons.length === 1 ? 'grid-cols-1 justify-items-center' : 
                            feature.miniIcons.length === 2 ? 'grid-cols-2 justify-items-center max-w-[200px] mx-auto' : 
                            'grid-cols-3'
                          }`}>
                            {feature.miniIcons.slice(0, 3).map((miniIcon: any, miniIndex: number) => (
                              <div key={miniIndex} className="flex flex-col items-center">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                                  style={{ 
                                    backgroundColor: hexToRgba(feature.iconColor || '#084F6E', 0.06),
                                    color: feature.iconColor || '#084F6E' 
                                  }}
                                >
                                  <i className={`${miniIcon.icon || 'fas fa-question'} text-sm`}></i>
                                </div>
                                <span className="text-xs text-center">{miniIcon.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  }
                  
                  return (
                    <motion.div 
                      key={`modern-card-${feature.id}`}
                      className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ 
                        y: -10, 
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      }}
                    >
                      <motion.div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg"
                        style={{ backgroundColor: feature.iconColor || '#084F6E' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {feature.mainIcon === 'fas fa-user-friends' && <Users size={28} className="text-white" />}
                        {feature.mainIcon === 'fas fa-compass' && <Compass size={28} className="text-white" />}
                        {feature.mainIcon === 'fas fa-sparkles' && <Sparkles size={28} className="text-white" />}
                        {!['fas fa-user-friends', 'fas fa-compass', 'fas fa-sparkles'].includes(feature.mainIcon) && (
                          <i className={`${feature.mainIcon} text-white text-2xl`}></i>
                        )}
                      </motion.div>
                      <h3 className="font-heading font-bold text-xl mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      
                      {feature.miniIcons && feature.miniIcons.length > 0 && (
                        <motion.div 
                          className={`mt-4 grid gap-4 ${
                            (feature.miniIcons?.length || 0) === 1 ? 'grid-cols-1 justify-items-center' : 
                            (feature.miniIcons?.length || 0) === 2 ? 'grid-cols-2 justify-items-center max-w-[200px] mx-auto' : 
                            'grid-cols-3'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                        >
                          {feature.miniIcons.slice(0, 3).map((miniIcon: any, miniIndex: number) => (
                            <motion.div 
                              key={miniIndex}
                              className="flex flex-col items-center"
                              whileHover={{ y: -5 }}
                            >
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                                style={{ 
                                  backgroundColor: hexToRgba(feature.iconColor || '#084F6E', 0.1) 
                                }}
                              >
                                <i className={`${miniIcon.icon || 'fas fa-question'} text-sm`} style={{ color: feature.iconColor || '#084F6E' }}></i>
                              </div>
                              <span className="text-xs text-center">{miniIcon.text}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case 'who_we_are': {
        const whoWeAreConfig = block.configuration || {};
        // USE TRANSLATIONS FIRST for who we are
        const whoTitle = getDynamicTranslation(block.blockType, block.id, "title", block.title || whoWeAreConfig.title || '');
        
        const whoSections = whoWeAreConfig.sections || [];
        const whoImages = whoWeAreConfig.images || [];
        const whoButtons = whoWeAreConfig.buttons || [];
        const imagesPosition = whoWeAreConfig.layoutStyle || 'right';
        
        return (
          <section key={block.id} className="py-16" style={{ backgroundColor: whoWeAreConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* Bloc de contenu textuel */}
                <div className={imagesPosition === 'right' ? 'order-2 lg:order-1' : 'order-2 lg:order-2'}>
                  {/* Titre principal avec tiret */}
                  {whoTitle && (
                    <div className="mb-6">
                      <h2 
                        className="font-heading font-bold text-3xl md:text-4xl mb-3"
                        style={{ color: whoWeAreConfig.titleColor || '#084F6E' }}
                      >
                        {whoTitle}
                      </h2>
                      <div 
                        className="w-20 h-1"
                        style={{ backgroundColor: whoWeAreConfig.dividerColor || '#3BA8AF' }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Introduction - USE TRANSLATIONS */}
                  <div className="mb-6">
                    <p 
                      className="text-muted-foreground mb-4"
                      style={{ color: whoWeAreConfig.textColor || '#666666' }}
                    >
                      {home.whoWeAreDescription}
                    </p>
                    <p 
                      className="text-muted-foreground mb-4"
                      style={{ color: whoWeAreConfig.textColor || '#666666' }}
                    >
                      {home.whoWeAreStory}
                    </p>
                  </div>

                  {/* Sous-sections - USE TRANSLATIONS */}
                  <div className="mt-6">
                    <h3 
                      className="font-heading font-semibold text-2xl mb-3"
                      style={{ color: whoWeAreConfig.subtitleColor || '#084F6E' }}
                    >
                      {home.deepLocalRootsTitle}
                    </h3>
                    <p 
                      className="text-muted-foreground mb-4"
                      style={{ color: whoWeAreConfig.textColor || '#666666' }}
                    >
                      {home.deepLocalRootsDescription}
                    </p>
                    <p 
                      className="text-muted-foreground mb-4"
                      style={{ color: whoWeAreConfig.textColor || '#666666' }}
                    >
                      {home.deepLocalRootsExplanation}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 
                      className="font-heading font-semibold text-2xl mb-3"
                      style={{ color: whoWeAreConfig.subtitleColor || '#084F6E' }}
                    >
                      {home.ourConceptTitle}
                    </h3>
                    <p 
                      className="text-muted-foreground mb-4"
                      style={{ color: whoWeAreConfig.textColor || '#666666' }}
                    >
                      {home.ourConceptDescription}
                    </p>
                  </div>

                  {/* Boutons - USE TRANSLATIONS */}
                  <div className="flex items-center space-x-4 mt-6">
                    <a
                      href="/contact"
                      className="px-6 py-2 rounded font-heading font-semibold transition-colors inline-flex items-center hover:opacity-90"
                      style={{
                        backgroundColor: whoWeAreConfig.button1Color || '#084F6E',
                        color: '#ffffff'
                      }}
                    >
                      {home.contactUs}
                    </a>
                    <a
                      href="/custom-tour"
                      className="px-6 py-2 rounded font-heading font-semibold transition-colors inline-flex items-center hover:opacity-80"
                      style={{
                        backgroundColor: 'transparent',
                        color: whoWeAreConfig.button2Color || '#084F6E',
                        border: `2px solid ${whoWeAreConfig.button2Color || '#084F6E'}`
                      }}
                    >
                      {home.createYourJourney}
                    </a>
                  </div>
                </div>

                {/* Bloc d'images empilées */}
                <div className={imagesPosition === 'right' ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}>
                  <div className="flex flex-col gap-6 h-full">
                    {whoImages.map((image: any, index: number) => (
                      <div key={index} className="relative" style={{ flex: `1 1 ${100 / whoImages.length}%`, minHeight: 0 }}>
                        {image.url ? (
                          <img 
                            src={image.url} 
                            alt={image.alt || `Image ${index + 1}`}
                            className="w-full h-full rounded-lg shadow-lg object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full rounded-lg shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${hexToRgba('#084F6E', 0.6)}, ${hexToRgba('#084F6E', 0.9)})`
                            }}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      case 'search_bar_tours':
        return (
          <div key={block.id} className="w-full">
            <SearchBarToursBlock configuration={block.configuration || {}} />
          </div>
        );

      case 'contact':
        return (
          <div key={block.id} className="w-full">
            <ContactBlock block={block} />
          </div>
        );

      case 'blog_search':
        return (
          <div key={block.id} className="w-full">
            <BlogSearchBlock block={block} />
          </div>
        );

      case 'text_gallery':
        return (
          <div key={block.id} className="w-full">
            <TextGalleryBlock block={block} />
          </div>
        );

      case 'text_video':
        return (
          <div key={block.id} className="w-full">
            <TextVideoBlock block={block} />
          </div>
        );

      case 'text_listing':
        return (
          <div key={block.id} className="w-full">
            <TextListingBlock block={block} />
          </div>
        );

      case 'text_pricing':
        return (
          <div key={block.id} className="w-full">
            <TextPricingBlock block={block} />
          </div>
        );

      default:
        // Bloc générique pour les types non implémentés
        return (
          <div key={block.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600">
                  Bloc de type "{block.blockType}" - {block.title || 'Sans titre'}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {blocks?.map((block, index) => (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          {renderBlock(block)}
        </motion.div>
      ))}
    </>
  );
}