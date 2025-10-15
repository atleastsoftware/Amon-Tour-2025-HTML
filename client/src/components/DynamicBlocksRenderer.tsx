import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Gallery from "@/components/ui/Gallery";

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

export default function DynamicBlocksRenderer({ blocks }: DynamicBlocksRendererProps) {
  const renderBlock = (block: PageBlock) => {
    // Pour l'instant, on affiche un rendu basique pour chaque type de bloc
    // Dans le futur, chaque type de bloc aura son propre composant
    switch (block.blockType) {
      case 'header_page':
        return (
          <div key={block.id} className="relative h-[35vh] md:h-[52vh] bg-gradient-to-br from-primary to-secondary flex items-center justify-center w-full">
            {block.imageUrl && (
              <img 
                src={block.imageUrl} 
                alt={block.imageAlt || block.title || ''} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Overlay pour améliorer le contraste du texte blanc */}
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <div className="relative z-20 w-full px-8 md:px-12 lg:px-16 text-center">
              {block.title && (
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">{block.title}</h1>
              )}
              {block.subtitle && (
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">{block.subtitle}</p>
              )}
            </div>
          </div>
        );

      case 'hero':
      case 'hero_banner':
      case 'hero_video':
        const heroConfig = block.configuration || {};
        
        // Helper function to render title with colored accent
        const renderHeroTitle = () => {
          const fullTitle = heroConfig.title || block.title || "Your exclusive experiences\nin Krabi –\nTHAILAND";
          const accentText = heroConfig.titleAccentText || "in Krabi –";
          const titleColor = heroConfig.titleColor || '#ffffff';
          const accentColor = heroConfig.titleAccentColor || '#3BA8AF';
          
          if (fullTitle.includes(accentText)) {
            const parts = fullTitle.split(accentText);
            return (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ whiteSpace: 'pre-line' }}>
                {parts[0] && <span style={{ color: titleColor }}>{parts[0]}</span>}
                <span style={{ color: accentColor }}>{accentText}</span>
                {parts[1] && <span style={{ color: titleColor }}>{parts[1]}</span>}
              </h1>
            );
          }
          return <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: titleColor, whiteSpace: 'pre-line' }}>{fullTitle}</h1>;
        };
        
        // Background rendering based on type
        const renderHeroBackground = () => {
          const bgType = heroConfig.backgroundType || 'image';
          
          switch (bgType) {
            case 'color':
              return (
                <div 
                  className="absolute inset-0 w-full h-full z-0"
                  style={{ backgroundColor: heroConfig.backgroundColor || '#084F6E' }}
                />
              );
            
            case 'images':
              const images = [
                heroConfig.backgroundImage1,
                heroConfig.backgroundImage2,
                heroConfig.backgroundImage3
              ].filter(Boolean);
              
              if (images.length > 0) {
                return (
                  <div className="absolute inset-0 w-full h-full z-0">
                    <img
                      src={images[0]}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                );
              }
              return <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-primary to-secondary" />;
            
            case 'video':
              if (heroConfig.videoUrl) {
                return (
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
              }
              return <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-primary to-secondary" />;
            
            default:
              if (block.imageUrl || heroConfig.backgroundImage) {
                return (
                  <img 
                    src={block.imageUrl || heroConfig.backgroundImage} 
                    alt={block.imageAlt || ''} 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                );
              }
              return <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-primary to-secondary" />;
          }
        };

        const contentAlignment = (heroConfig.contentAlignment || 'center') as 'left' | 'center' | 'right';
        const alignmentClasses = {
          left: 'items-center justify-start text-left',
          center: 'items-center justify-center text-center',
          right: 'items-center justify-end text-right'
        }[contentAlignment];

        return (
          <section key={block.id} className="relative pt-32 pb-20 min-h-screen flex overflow-hidden">
            {renderHeroBackground()}
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className={`relative z-20 w-full px-8 md:px-12 lg:px-16 flex ${alignmentClasses}`}>
              <div className="max-w-5xl">
                {renderHeroTitle()}
                {(heroConfig.subtitle || block.subtitle) && (
                  <p 
                    className="text-lg md:text-xl mb-8 max-w-3xl"
                    style={{ 
                      color: heroConfig.subtitleColor || '#ffffff',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {heroConfig.subtitle || block.subtitle}
                  </p>
                )}
                {heroConfig.buttons && heroConfig.buttons.length > 0 && (
                  <div className={`flex gap-4 mt-8 ${contentAlignment === 'center' ? 'justify-center' : contentAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {heroConfig.buttons.map((button: any, index: number) => {
                      if (!button.text) return null;
                      
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
                            {button.text}
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
                          {button.text}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'text':
        const textConfig = block.configuration || {};
        return (
          <section key={block.id} className="py-20" style={{ backgroundColor: textConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {textConfig.title && (
                  <h2 
                    className="font-heading font-bold text-3xl md:text-4xl mb-3"
                    style={{ color: textConfig.titleColor || '#333333' }}
                  >
                    {textConfig.title}
                  </h2>
                )}
                {textConfig.title && (
                  <div 
                    className="w-20 h-1 mx-auto mb-8"
                    style={{ backgroundColor: textConfig.dividerColor || '#3BA8AF' }}
                  ></div>
                )}
                {textConfig.content && (
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: textConfig.contentColor || '#666666' }}
                  >
                    {textConfig.content}
                  </p>
                )}
                {textConfig.buttons && textConfig.buttons.length > 0 && (
                  <div className="flex gap-4 justify-center mt-8">
                    {textConfig.buttons.map((button: any, index: number) => {
                      if (!button.text) return null;
                      
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
                            {button.text}
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
        return (
          <div key={block.id} className={`py-16 bg-${block.backgroundColor || 'white'}`}>
            <div className="container mx-auto px-4">
              {block.title && (
                <h2 className="text-3xl font-bold text-center mb-4">{block.title}</h2>
              )}
              {block.subtitle && (
                <p className="text-xl text-gray-600 text-center mb-8">{block.subtitle}</p>
              )}
              {block.content && (
                <div 
                  className="prose prose-lg mx-auto"
                  dangerouslySetInnerHTML={{ __html: block.content }}
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
        // Default text_image rendering
        return (
          <div key={block.id} className="py-16 bg-white w-full">
            <div className="w-full px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  {block.title && (
                    <h2 className="text-3xl font-bold mb-4">{block.title}</h2>
                  )}
                  {block.subtitle && (
                    <p className="text-xl text-gray-600 mb-4">{block.subtitle}</p>
                  )}
                  {block.content && (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: block.content }}
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
        return (
          <div key={block.id} className="py-16 bg-primary">
            <div className="container mx-auto px-4 text-center">
              {block.title && (
                <h2 className="text-3xl font-bold text-white mb-4">{block.title}</h2>
              )}
              {block.subtitle && (
                <p className="text-xl text-white/90 mb-8">{block.subtitle}</p>
              )}
              {block.ctaText && block.ctaUrl && (
                <a 
                  href={block.ctaUrl} 
                  className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  {block.ctaText}
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
        // Handle cruise form
        if (block.configuration?.formType === 'cruise' || block.identifier === 'cruise-form') {
          return (
            <div key={block.id} id={block.identifier || undefined} className="py-16 bg-white w-full">
              <div className="w-full px-8 md:px-12 lg:px-16 max-w-5xl mx-auto">
                <Suspense fallback={
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
                  <CruiseForm />
                </Suspense>
              </div>
            </div>
          );
        }
        // Default form display
        return (
          <div key={block.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              {block.title && (
                <h2 className="text-3xl font-bold text-center mb-8">{block.title}</h2>
              )}
              {block.subtitle && (
                <p className="text-xl text-gray-600 text-center mb-8">{block.subtitle}</p>
              )}
              <div className="max-w-2xl mx-auto bg-gray-100 rounded-lg p-8">
                <p className="text-gray-600 text-center">Formulaire personnalisé</p>
              </div>
            </div>
          </div>
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
        return (
          <div key={block.id} className="w-full">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <TourNinjaSection />
            </Suspense>
          </div>
        );

      case 'custom_tour_form':
        return (
          <div key={block.id} className="w-full">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <CustomTourForm />
            </Suspense>
          </div>
        );

      case 'tour_ninja_section':
        return (
          <div key={block.id} className="w-full">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <TourNinjaSection />
            </Suspense>
          </div>
        );

      case 'why_choose_us':
        return (
          <div key={block.id} className="w-full">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <Features />
            </Suspense>
          </div>
        );

      case 'who_we_are':
        return (
          <div key={block.id} className="w-full">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <About />
            </Suspense>
          </div>
        );

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