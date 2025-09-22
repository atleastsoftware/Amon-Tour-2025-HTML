import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
export default function TourIframe() {
  const {
    t
  } = useTranslation();
  const [match, params] = useRoute("/tour/:id");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tourName, setTourName] = useState<string>(t("tours.tour"));
  const tourId = params?.id;
  useEffect(() => {
    if (tourId) {
      // Récupérer le nom du tour depuis l'API
      const fetchTourName = async () => {
        try {
          const response = await fetch('/api/proxy/tours');
          if (response.ok) {
            const data = await response.json();
            const tour = data.data?.find((t: any) => t.id === tourId);
            if (tour) {
              setTourName(tour.name);
            }
          }
        } catch (err) {
          console.error("Erreur lors du chargement du nom du tour:", err);
        }
      };
      fetchTourName();
    }
  }, [tourId]);
  const handleBack = () => {
    window.location.href = "/tours";
  };
  if (!match || !tourId) {
    return <>
        <SEO title={t("errors.tourNotFound")} description={t("errors.tourNotFoundDesc")} />
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t("errors.tourNotFound")}</h1>
            <Button onClick={handleBack}>{t("buttons.backToTours")}</Button>
          </div>
        </main>
        <Footer />
      </>;
  }
  return <>
      <SEO title={`${tourName} - Amontour`} description="Découvrez tous les détails de ce tour authentique en Thaïlande." />
      
      <Header />
      
      <main className="bg-white pt-0">
        {/* Header avec navigation */}
        <section className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />{t("buttons.backToTours")}</Button>
          </div>
        </section>

        {/* Section iframe plein écran */}
        <section className="iframe-wrapper">
          <div className="relative" style={{
          height: 'calc(100vh - 73px)'
        }}>
            {isLoading && <motion.div className="absolute inset-0 bg-white z-10 flex items-center justify-center" initial={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} transition={{
            duration: 0.3
          }}>
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">{t("errors.loadingTour")}</p>
                </div>
              </motion.div>}
            
            {error && <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("status.error")}</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={handleBack} variant="outline">{t("buttons.backToTours")}</Button>
                </div>
              </div>}

            <motion.div className="w-full h-full" initial={{
            opacity: 0
          }} animate={{
            opacity: isLoading ? 0 : 1
          }} transition={{
            duration: 0.3,
            delay: isLoading ? 0 : 0.2
          }}>
              <iframe src={`https://www.tourninja.io/details/${tourId}`} width="100%" height="100%" style={{
              border: 'none'
            }} title={t("tours.tour")} onLoad={() => setIsLoading(false)} onError={() => {
              setError("Impossible de charger les détails du tour");
              setIsLoading(false);
            }} allow="fullscreen" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" allowFullScreen />
            </motion.div>
          </div>
        </section>
      </main>
    </>;
}