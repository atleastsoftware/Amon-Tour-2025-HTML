import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingIframe() {
  const [, setLocation] = useLocation();
  const [bookingLink, setBookingLink] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('tour');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // On récupère les paramètres de l'URL
    const params = new URLSearchParams(window.location.search);
    const link = params.get('link');
    const title = params.get('title');
    const type = params.get('type');

    if (!link) {
      // Si pas de lien, on redirige vers la page des tours
      setLocation('/tours');
      return;
    }

    setBookingLink(link);
    setTitle(title || 'Réservation');
    setType(type || 'tour');
    
    // Simule un petit délai de chargement pour une meilleure transition
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [setLocation]);

  // Gestion des événements de l'iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex flex-col pt-[96px]">
        {bookingLink && (
          <motion.div 
            className="flex-grow w-full bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading && (
              <div className="flex justify-center items-center h-[calc(100vh-140px)]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <iframe 
              src={bookingLink} 
              title={`Réservation pour ${title}`}
              className="w-full h-full border-0"
              style={{ 
                height: 'calc(100vh - 140px)',
                display: isLoading ? 'none' : 'block'
              }}
              onLoad={handleIframeLoad}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}