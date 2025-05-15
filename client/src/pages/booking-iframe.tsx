import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BookingIframe() {
  const [, setLocation] = useLocation();
  const [bookingLink, setBookingLink] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('tour');

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
  }, [setLocation]);

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex flex-col">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-primary">{title}</h1>
              <p className="text-sm text-gray-600">
                Réservation en ligne - {type === "tour" ? "Tour" : "Expérience"}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={goBack}
              className="border-primary/30 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {bookingLink && (
          <div className="flex-grow w-full bg-white border-t border-b border-gray-200">
            <iframe 
              src={bookingLink} 
              title={`Réservation pour ${title}`}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 300px)' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}