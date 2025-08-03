import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, ExternalLink, Search, Filter, X, AlertCircle } from "lucide-react";
import { formatTHB } from "@/lib/utils";
import { useTourNinja, type TourNinjaTour } from "@/hooks/useTourNinja";

export default function Tours() {
  const { tours, isLoading, error, success, cached, fallback } = useTourNinja();
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Affichage du status de l'API pour debug
  const apiStatus = useMemo(() => {
    if (isLoading) return "Chargement...";
    if (error) return `Erreur API: ${error}`;
    if (!success) return "API indisponible";
    if (cached) return "Données en cache";
    if (fallback) return "Données de secours";
    if (tours.length === 0) return "⚠️ API Tour Ninja temporairement indisponible";
    return `✅ ${tours.length} tours chargés depuis Tour Ninja`;
  }, [isLoading, error, success, cached, fallback, tours.length]);

  const handleTourClick = (tour: TourNinjaTour) => {
    if (tour.bookingUrl) {
      window.open(tour.bookingUrl, '_blank');
    }
  };

  // Logique d'affichage prix intelligente
  const displayPrice = (tour: TourNinjaTour) => {
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
    const priceRanges = [
      { value: "0-2000", label: "0 - 2,000 THB" },
      { value: "2000-4000", label: "2,000 - 4,000 THB" },
      { value: "4000-6000", label: "4,000 - 6,000 THB" },
      { value: "6000+", label: "6,000+ THB" },
      { value: "free", label: "Prix sur demande" }
    ];
    
    return { destinations, durations, priceRanges };
  }, [tours]);

  // Appliquer tous les filtres
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // Filtre de recherche textuelle
      const matchesSearch = searchTerm === "" || 
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre de prix
      const matchesPrice = (() => {
        if (priceRange === "all") return true;
        if (priceRange === "free") return tour.price === 0;
        
        const [min, max] = priceRange.split("-").map(p => p.replace("+", ""));
        const minPrice = parseInt(min);
        const maxPrice = max ? parseInt(max) : Infinity;
        
        const tourPrice = tour.price;
        
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
        return 'Autre';
      };

      const matchesDestination = destinationFilter === "all" || 
        getDestinationFromName(tour.name) === destinationFilter;

      return matchesSearch && matchesPrice && matchesDuration && matchesDestination;
    });
  }, [tours, searchTerm, priceRange, durationFilter, destinationFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange("all");
    setDurationFilter("all");
    setDestinationFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || priceRange !== "all" || 
    durationFilter !== "all" || destinationFilter !== "all";

  return (
    <>
      <SEO 
        title="Nos Expériences | Amon Tour"
        description="Découvrez notre sélection d'expériences uniques à Krabi et dans le sud de la Thaïlande. Tours en bateau, aventures culturelles et moments inoubliables."
      />
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="container mx-auto px-4 text-center text-white">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Nos Expériences
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Découvrez la beauté exceptionnelle de Krabi et du sud de la Thaïlande
            </motion.p>
            
            {/* Status API */}
            <div className="max-w-md mx-auto">
              <Alert className={`${tours.length > 0 ? 'border-green-400 bg-green-50' : 'border-yellow-400 bg-yellow-50'}`}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-gray-800">
                  {apiStatus}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </section>

        {/* Filtres */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filtres</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Masquer' : 'Afficher'} filtres
              </Button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un tour..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Prix */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prix</SelectItem>
                  {filterOptions.priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Durée */}
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes durées</SelectItem>
                  {filterOptions.durations.map(duration => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration} jour{duration > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Destination */}
              <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes destinations</SelectItem>
                  {filterOptions.destinations.map(destination => (
                    <SelectItem key={destination} value={destination}>
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Reset */}
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="container mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredTours.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {filteredTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-blue-200 to-blue-300">
                      {tour.primaryImage ? (
                        <img 
                          src={tour.primaryImage} 
                          alt={tour.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-blue-400" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-600 text-white">
                          {displayPrice(tour)}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {tour.duration} jour{tour.duration > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                        {tour.name}
                      </h3>
                      
                      {tour.shortDescription && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {tour.shortDescription}
                        </p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        {tour.location}
                      </div>
                      
                      <Button 
                        onClick={() => handleTourClick(tour)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Voir les détails
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {tours.length === 0 ? "Service temporairement indisponible" : "Aucun tour trouvé"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tours.length === 0 
                    ? "L'API Tour Ninja est actuellement en maintenance. Nos tours locaux restent disponibles sur la page d'accueil."
                    : "Essayez de modifier vos critères de recherche pour voir plus de résultats."
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Effacer les filtres
                  </Button>
                )}
              </motion.div>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </>
  );
}