import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, ExternalLink, Search, Filter, X } from "lucide-react";
import { formatTHB } from "@/lib/utils";


interface TourNinjaTour {
  id: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  currency: string;
  duration: number;
  maxParticipants?: number;
  destination?: string;
  slug?: string;
  url?: string;
  bookingUrl?: string;
  detailsUrl?: string;
  primaryImage?: string;
  images?: string[];
  priceTable?: Array<{ price: number; [key: string]: any }>;
  childrenPrice?: number;
  tourTiming?: string;
  tourType?: string;
  features?: {
    hasPickup?: boolean;
    hasLunch?: boolean;
    boatType?: string;
    tourType?: string;
    isCustomStay?: boolean;
  };
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
  

  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [timingFilter, setTimingFilter] = useState<string>("all");
  const [featuresFilter, setFeaturesFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Suppression de l'appel API - plus de données affichées
    setLoading(false);
    setTours([]);
  }, []);

  const handleTourClick = (tour: TourNinjaTour) => {
    window.location.href = `/tour/${tour.id}`;
  };

  const formatDuration = (duration: number) => {
    return duration === 1 ? "1 jour" : `${duration} jours`;
  };

  // Logique d'affichage prix intelligente
  const displayPrice = (tour: TourNinjaTour) => {
    if (tour.priceTable && tour.priceTable.length > 0) {
      const minPrice = Math.min(...tour.priceTable.map(p => p.price));
      return `À partir de ${formatTHB(minPrice)}`;
    }
    if (tour.price > 0) {
      return formatTHB(tour.price);
    }
    return "Prix sur demande";
  };

  // Extraire les options de filtre dynamiquement des données de l'API
  const filterOptions = useMemo(() => {
    // Extraire les destinations depuis les noms des tours
    const destinationKeywords = tours.map(tour => {
      const name = tour.name.toLowerCase();
      if (name.includes('phi phi')) return 'Koh Phi Phi';
      if (name.includes('phang nga')) return 'Phang Nga Bay';
      if (name.includes('koh hong')) return 'Koh Hong';
      if (name.includes('koh mook')) return 'Koh Mook';
      if (name.includes('railay')) return 'Railay';
      if (name.includes('ao nang')) return 'Ao Nang';
      if (name.includes('thalane')) return 'Thalane';
      if (name.includes('ao luk')) return 'Ao Luk';
      if (name.includes('krabi')) return 'Krabi';
      if (name.includes('laem sak')) return 'Laem Sak';
      if (name.includes('koh kradan')) return 'Koh Kradan';
      if (name.includes('koh ngaï')) return 'Koh Ngaï';
      return null;
    }).filter(Boolean);
    
    const destinations = Array.from(new Set(destinationKeywords)) as string[];
    const durations = Array.from(new Set(tours.map(tour => tour.duration).filter(Boolean)));
    const timings = Array.from(new Set(tours.map(tour => tour.tourTiming).filter(Boolean))) as string[];
    const priceRanges = [
      { value: "0-2000", label: "0 - 2,000 THB" },
      { value: "2000-4000", label: "2,000 - 4,000 THB" },
      { value: "4000-6000", label: "4,000 - 6,000 THB" },
      { value: "6000+", label: "6,000+ THB" },
      { value: "free", label: "Prix sur demande" }
    ];
    const features = [
      { value: "pickup", label: "Transport inclus" },
      { value: "lunch", label: "Déjeuner inclus" },
      { value: "private", label: "Tour privé disponible" }
    ];
    
    return { destinations, durations, timings, priceRanges, features };
  }, [tours]);

  // Appliquer tous les filtres
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // Filtre de recherche textuelle
      const matchesSearch = searchTerm === "" || 
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre de prix (en utilisant la logique de prix intelligente)
      const matchesPrice = (() => {
        if (priceRange === "all") return true;
        if (priceRange === "free") return tour.price === 0 && (!tour.priceTable || tour.priceTable.length === 0);
        
        const [min, max] = priceRange.split("-").map(p => p.replace("+", ""));
        const minPrice = parseInt(min);
        const maxPrice = max ? parseInt(max) : Infinity;
        
        // Utiliser le prix minimum si priceTable existe
        const tourPrice = tour.priceTable && tour.priceTable.length > 0 
          ? Math.min(...tour.priceTable.map(p => p.price))
          : tour.price;
        
        return tourPrice >= minPrice && tourPrice < maxPrice;
      })();

      // Filtre de durée
      const matchesDuration = durationFilter === "all" || 
        tour.duration.toString() === durationFilter;

      // Filtre de destination (basé sur l'extraction depuis le nom)
      const getDestinationFromName = (tourName: string) => {
        const name = tourName.toLowerCase();
        if (name.includes('phi phi')) return 'Koh Phi Phi';
        if (name.includes('phang nga')) return 'Phang Nga Bay';
        if (name.includes('koh hong')) return 'Koh Hong';
        if (name.includes('koh mook')) return 'Koh Mook';
        if (name.includes('railay')) return 'Railay';
        if (name.includes('ao nang')) return 'Ao Nang';
        if (name.includes('thalane')) return 'Thalane';
        if (name.includes('ao luk')) return 'Ao Luk';
        if (name.includes('krabi')) return 'Krabi';
        if (name.includes('laem sak')) return 'Laem Sak';
        if (name.includes('koh kradan')) return 'Koh Kradan';
        if (name.includes('koh ngaï')) return 'Koh Ngaï';
        return null;
      };
      
      const matchesDestination = destinationFilter === "all" || 
        getDestinationFromName(tour.name) === destinationFilter;

      // Filtre de timing
      const matchesTiming = timingFilter === "all" || 
        tour.tourTiming === timingFilter;

      // Filtre de caractéristiques
      const matchesFeatures = (() => {
        if (featuresFilter === "all") return true;
        if (!tour.features) return false;
        
        switch (featuresFilter) {
          case "pickup": return tour.features.hasPickup === true;
          case "lunch": return tour.features.hasLunch === true;
          case "private": return tour.priceTable && tour.priceTable.length > 0;
          default: return true;
        }
      })();

      return matchesSearch && matchesPrice && matchesDuration && matchesDestination && matchesTiming && matchesFeatures;
    });
  }, [tours, searchTerm, priceRange, durationFilter, destinationFilter, timingFilter, featuresFilter]);

  // Fonction pour réinitialiser tous les filtres
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange("all");
    setDurationFilter("all");
    setDestinationFilter("all");
    setTimingFilter("all");
    setFeaturesFilter("all");
  };

  // Compter les filtres actifs
  const activeFiltersCount = [searchTerm, priceRange, durationFilter, destinationFilter, timingFilter, featuresFilter]
    .filter(filter => filter !== "" && filter !== "all").length;

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
            
            {/* Barre de recherche et filtres */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Barre de recherche principale */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher un tour (nom, destination, description...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-6"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-12 px-4"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                )}
              </div>

              {/* Panneau de filtres détaillés */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 rounded-lg p-6 border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Filtre par prix */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix
                      </label>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les gammes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les gammes</SelectItem>
                          {filterOptions.priceRanges.map(range => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtre par durée */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée
                      </label>
                      <Select value={durationFilter} onValueChange={setDurationFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les durées" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les durées</SelectItem>
                          {filterOptions.durations.sort((a, b) => a - b).map(duration => (
                            <SelectItem key={duration} value={duration.toString()}>
                              {formatDuration(duration)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtre par destination */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les destinations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les destinations</SelectItem>
                          {filterOptions.destinations.sort().map(destination => (
                            <SelectItem key={destination} value={destination}>
                              {destination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtre par timing */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horaire
                      </label>
                      <Select value={timingFilter} onValueChange={setTimingFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les horaires" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les horaires</SelectItem>
                          {filterOptions.timings.sort().map(timing => (
                            <SelectItem key={timing} value={timing}>
                              {timing}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtre par caractéristiques */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Services
                      </label>
                      <Select value={featuresFilter} onValueChange={setFeaturesFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les services" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les services</SelectItem>
                          {filterOptions.features.map(feature => (
                            <SelectItem key={feature.value} value={feature.value}>
                              {feature.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Résumé des résultats */}
              <div className="mt-4 text-sm text-gray-600">
                {filteredTours.length} tour(s) trouvé(s) sur {tours.length} au total
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    • {activeFiltersCount} filtre(s) actif(s)
                  </span>
                )}
              </div>
            </motion.div>
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
            ) : filteredTours.length > 0 ? (
              <>
                <motion.div 
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-heading font-bold mb-4">
                    {filteredTours.length} Tour{filteredTours.length > 1 ? 's' : ''} Disponible{filteredTours.length > 1 ? 's' : ''}
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
                  {filteredTours.map((tour, index) => (
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
                              {displayPrice(tour)}
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
                            {(() => {
                              const destination = (() => {
                                const name = tour.name.toLowerCase();
                                if (name.includes('phi phi')) return 'Koh Phi Phi';
                                if (name.includes('phang nga')) return 'Phang Nga Bay';
                                if (name.includes('koh hong')) return 'Koh Hong';
                                if (name.includes('koh mook')) return 'Koh Mook';
                                if (name.includes('railay')) return 'Railay';
                                if (name.includes('ao nang')) return 'Ao Nang';
                                if (name.includes('thalane')) return 'Thalane';
                                if (name.includes('ao luk')) return 'Ao Luk';
                                if (name.includes('krabi')) return 'Krabi';
                                if (name.includes('laem sak')) return 'Laem Sak';
                                if (name.includes('koh kradan')) return 'Koh Kradan';
                                if (name.includes('koh ngaï')) return 'Koh Ngaï';
                                return 'Krabi, Thaïlande';
                              })();
                              return destination && (
                                <div className="flex items-center">
                                  <MapPin size={14} className="mr-1" />
                                  {destination}
                                </div>
                              );
                            })()}
                            
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {formatDuration(tour.duration)}
                            </div>
                          </div>

                          {/* Informations enrichies */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {tour.tourTiming && (
                              <Badge variant="outline" className="text-xs">
                                {tour.tourTiming}
                              </Badge>
                            )}
                            {tour.features?.hasPickup && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Transport inclus
                              </Badge>
                            )}
                            {tour.features?.hasLunch && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                Déjeuner inclus
                              </Badge>
                            )}
                            {tour.priceTable && tour.priceTable.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Tour privé
                              </Badge>
                            )}
                            {tour.maxParticipants && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Max {tour.maxParticipants}p
                              </Badge>
                            )}
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
            ) : tours.length > 0 ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun tour ne correspond à vos critères</h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos filtres pour découvrir plus d'options.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            ) : (
              <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <iframe 
                  src="http://localhost:5000/embed/links/2" 
                  width="100%" 
                  height="700px" 
                  style={{ 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', 
                    display: 'block' 
                  }}
                  title="Tour Cards"
                  scrolling="auto"
                />
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />

    </>
  );
}