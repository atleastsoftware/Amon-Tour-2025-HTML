import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import DynamicBlocksRenderer from "@/components/DynamicBlocksRenderer";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageConfiguration {
  id: number;
  pageName: string;
  pageSlug: string;
  pageType: string;
  isActive: boolean;
}

interface PageBlock {
  id: number;
  pageConfigurationId: number;
  blockType: string;
  blockOrder: number;
  identifier: string | null;
  title: string | null;
  subtitle: string | null;
  content: any;
  settings: any;
  isActive: boolean;
}

interface DynamicPageProps {
  slug?: string;
}

export default function DynamicPage({ slug: propSlug }: DynamicPageProps = {}) {
  const params = useParams();
  const slug = propSlug || params.slug || '';

  // Récupérer la configuration de la page
  const { data: pageConfig, isLoading: isLoadingConfig, error: configError } = useQuery<PageConfiguration>({
    queryKey: [`/api/admin/page-configurations/slug/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/admin/page-configurations/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Page not found');
        }
        throw new Error('Failed to fetch page configuration');
      }
      return response.json();
    },
    enabled: !!slug,
    retry: false
  });

  // Récupérer les blocs de la page
  const { data: blocks = [], isLoading: isLoadingBlocks } = useQuery<PageBlock[]>({
    queryKey: [`/api/public/page-blocks/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/public/page-blocks/${slug}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!pageConfig && pageConfig.isActive,
  });

  if (isLoadingConfig || isLoadingBlocks) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </>
    );
  }

  // Si la page n'existe pas ou n'est pas active
  if (configError || !pageConfig || !pageConfig.isActive) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600">The page you are looking for does not exist or is not available.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const activeBlocks = blocks.filter(block => block.isActive);

  return (
    <>
      <Helmet>
        <title>{pageConfig.pageName} - Amon Tour</title>
        <meta name="description" content={`${pageConfig.pageName} - Amon Tour, votre agence de voyage à Krabi`} />
      </Helmet>

      <Header />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        {/* Hero Section spécial pour la page cruise */}
        {slug === 'cruise' && (
          <div 
            className="relative h-[60vh] bg-cover bg-center"
            style={{ 
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/attached_assets/da5f838c-120c-4ede-8cbf-8d6e086d8061_1757693908450.jpeg)"
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
              <div className="max-w-4xl">
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Croisières en Catamaran
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Découvrez les îles paradisiaques de Krabi à bord de notre catamaran Lagoon 470, pour une expérience de liberté totale
                </motion.p>
              </div>
            </div>
          </div>
        )}
        
        {activeBlocks.length > 0 ? (
          <DynamicBlocksRenderer blocks={activeBlocks} />
        ) : (
          <div className="container mx-auto px-4 py-24">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{pageConfig.pageName}</h1>
              <p className="text-gray-600">Cette page est en cours de construction.</p>
            </div>
          </div>
        )}
      </motion.div>

      <Footer />
      <WhatsAppButton />
    </>
  );
}