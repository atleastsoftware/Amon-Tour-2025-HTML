import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load form components
const CruiseForm = lazy(() => import("@/components/CruiseForm"));

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
      case 'hero':
      case 'hero_banner':
      case 'hero_video':
        return (
          <div key={block.id} className="relative min-h-[60vh] bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center w-full">
            {block.imageUrl && (
              <img 
                src={block.imageUrl} 
                alt={block.imageAlt || block.title || ''} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="relative z-10 w-full px-8 md:px-12 lg:px-16 text-center">
              {block.title && (
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{block.title}</h1>
              )}
              {block.subtitle && (
                <p className="text-xl text-white/90 mb-4">{block.subtitle}</p>
              )}
              {block.description && (
                <p className="text-lg text-white/80 mb-8 max-w-3xl mx-auto">{block.description}</p>
              )}
              {block.ctaText && block.ctaUrl && (
                <a 
                  href={block.ctaUrl} 
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
                >
                  {block.ctaText}
                </a>
              )}
            </div>
          </div>
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
                      className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
          <div key={block.id} className="py-16 bg-blue-600">
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
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
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
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

      case 'gallery':
        return (
          <div key={block.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              {block.title && (
                <h2 className="text-3xl font-bold text-center mb-8">{block.title}</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Les images de la galerie seraient dans la configuration */}
                <div className="bg-gray-200 h-64 rounded-lg"></div>
                <div className="bg-gray-200 h-64 rounded-lg"></div>
                <div className="bg-gray-200 h-64 rounded-lg"></div>
              </div>
            </div>
          </div>
        );

      case 'advantages':
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
      {blocks.map((block, index) => (
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