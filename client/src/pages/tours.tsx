import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { formatTHB } from "@/lib/utils";

interface TourNinjaTour {
  id: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  currency: string;
  duration: number;
  destination?: string;
  primaryImage?: string;
  images?: string[];
  url?: string;
  detailsUrl?: string;
  slug?: string;
}

interface ApiResponse {
  success: boolean;
  tours: TourNinjaTour[];
  count: number;
}

export default function Tours() {
  const [tours, setTours] = useState<TourNinjaTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy/tours');
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setTours(data.data);
        } else {
          setError("Aucun tour disponible");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des tours:", err);
        setError("Impossible de charger les tours");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const handleTourClick = (tour: TourNinjaTour) => {
    // Prioriser le slug pour les routes internes, sinon utiliser l'URL externe
    if (tour.slug) {
      window.location.href = `/tour/${tour.slug}`;
    } else if (tour.url) {
      window.open(tour.url, '_blank', 'noopener,noreferrer');
    } else if (tour.detailsUrl) {
      window.open(tour.detailsUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://www.tourninja.io/details/${tour.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDuration = (duration: number) => {
    return duration === 1 ? "1 jour" : `${duration} jours`;
  };

  return (
    <>
      <SEO 
        title="Tours Thailand - Excursions Authentiques | Amon Tour"
        description="Découvrez nos tours authentiques en Thaïlande. Excursions privées, visites culturelles et aventures personnalisées loin du tourisme de masse."
        keywords="tours thailand, excursions thailande, tours privés, krabi tours, phuket tours, phi phi tours"
        canonicalUrl="https://amon-tour.com/tours"
      />
      <Header />
      
      <main>
        {/* Hero Banner */}
        <section className="relative h-[50vh] bg-cover bg-center" 
                 style={{ 
                   backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1000&auto=format&fit=crop)"
                 }}>
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="max-w-3xl">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Nos Tours en Thaïlande
              </motion.h1>
              <motion.p 
                className="text-xl text-white max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Découvrez des excursions authentiques et personnalisées
              </motion.p>
            </div>
          </div>
        </section>

        {/* Tours Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4 space-y-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun tour disponible actuellement</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              </motion.div>
            ) : tours.length > 0 ? (
              <>
                <motion.div 
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-heading font-bold mb-4">
                    {tours.length} Tours Disponibles
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Explorez nos excursions soigneusement sélectionnées pour découvrir la vraie Thaïlande
                  </p>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {tours.map((tour, index) => (
                    <motion.div
                      key={tour.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="cursor-pointer"
                      onClick={() => handleTourClick(tour)}
                    >
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative">
                          {tour.primaryImage || tour.images?.[0] ? (
                            <div className="h-48 overflow-hidden">
                              <img
                                src={tour.primaryImage || tour.images?.[0]}
                                alt={tour.name || tour.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement?.classList.add('hidden');
                                  target.parentElement?.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                              <div className="text-blue-600 text-center p-4">
                                <MapPin className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-sm">Aucune image disponible</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="bg-white/90 text-primary font-semibold">
                              {tour.price > 0 
                                ? formatTHB(tour.price)
                                : 'Prix sur demande'
                              }
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2">
                            {tour.name || tour.title}
                          </h3>
                          
                          {tour.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {tour.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            {tour.destination && (
                              <div className="flex items-center">
                                <MapPin size={14} className="mr-1" />
                                {tour.destination}
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {formatDuration(tour.duration)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-primary font-semibold">
                              Voir le tour
                            </span>
                            <ExternalLink size={16} className="text-primary" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun tour disponible actuellement</h3>
                  <p className="text-gray-600">Nos tours seront bientôt disponibles. Revenez nous voir !</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}