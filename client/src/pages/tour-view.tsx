import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SEO from '@/components/layout/SEO';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TourView() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/tour-view/:tourId');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [tourTitle, setTourTitle] = useState<string>('Détails du tour');
  
  const tourId = params?.tourId;

  useEffect(() => {
    if (!match || !tourId) {
      setError("Tour ID manquant");
      setIsLoading(false);
      return;
    }

    // Récupérer les paramètres URL et title depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    const title = urlParams.get('title');

    if (!url) {
      setError("URL de l'iframe manquante");
      setIsLoading(false);
      return;
    }

    setIframeUrl(decodeURIComponent(url));
    if (title) {
      setTourTitle(decodeURIComponent(title));
    }
    
    // Simuler un délai de chargement
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [match, tourId]);

  const handleBack = () => {
    setLocation('/tours');
  };

  const handleOpenExternal = () => {
    if (iframeUrl) {
      window.open(iframeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Gestion d'erreur
  if (error) {
    return (
      <>
        <SEO 
          title="Erreur - Tour non trouvé | Amon Tour"
          description="Le tour demandé n'a pas été trouvé."
        />
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux tours
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // État de chargement
  if (isLoading) {
    return (
      <>
        <SEO 
          title={`${tourTitle} | Amon Tour`}
          description="Chargement des détails du tour..."
        />
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Chargement des détails du tour...</p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${tourTitle} | Amon Tour`}
        description="Découvrez tous les détails de ce tour authentique en Thaïlande."
      />
      
      <Header />
      
      <main className="bg-white pt-20">
        {/* Header avec navigation */}
        <section className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button onClick={handleBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux tours
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenExternal}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir dans un nouvel onglet
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Titre du tour */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <motion.h1 
              className="text-2xl md:text-3xl font-heading font-bold text-gray-900"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {tourTitle}
            </motion.h1>
            <p className="text-gray-600 mt-2">
              Présenté par Tour Ninja • Réservation sécurisée
            </p>
          </div>
        </section>

        {/* Iframe intégré */}
        <section className="bg-white">
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {iframeUrl && (
              <iframe
                src={iframeUrl}
                className="w-full border-0"
                style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
                title={tourTitle}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            )}
          </motion.div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}