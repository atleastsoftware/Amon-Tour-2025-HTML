import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";

export default function TourDetails() {
  const [, params] = useRoute("/tour/:id");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tourId = params?.id;

  useEffect(() => {
    if (!tourId) {
      setError("ID du tour non trouvé");
      setIsLoading(false);
      return;
    }

    // Simuler un temps de chargement pour l'iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [tourId]);

  const handleBack = () => {
    window.history.back();
  };

  const handleOpenExternal = () => {
    if (tourId) {
      window.open(`https://www.tourninja.io/details/${tourId}`, '_blank', 'noopener,noreferrer');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tour non trouvé</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to tours
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Détails du Tour | Amon Tour"
        description="Découvrez tous les détails de ce tour authentique en Thaïlande."
      />
      
      <Header />
      
      <main className="bg-white pt-16">
        {/* Header avec navigation */}
        <section className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button onClick={handleBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to tours
              </Button>
              
              <Button onClick={handleOpenExternal} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
          </div>
        </section>

        {/* Contenu principal avec iframe */}
        <div className="relative" style={{ height: 'calc(100vh - 180px)' }}>
          {isLoading && (
            <motion.div 
              className="absolute inset-0 bg-white z-10 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-gray-600">Chargement des détails du tour...</p>
              </div>
            </motion.div>
          )}
          
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.3, delay: isLoading ? 0 : 0.2 }}
          >
            <iframe
              src={`https://www.tourninja.io/details/${tourId}`}
              className="w-full h-full border-0"
              title="Détails du tour"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError("Impossible de charger les détails du tour");
                setIsLoading(false);
              }}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              style={{ minHeight: '600px' }}
            />
          </motion.div>
        </div>
      </main>
    </>
  );
}