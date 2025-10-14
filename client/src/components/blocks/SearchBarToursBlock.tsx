import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, ExternalLink, Search } from "lucide-react";
import { useTourNinjaWithCustomImages, type TourNinjaTour } from "@/hooks/useTourNinja";
import { useIframe } from "@/contexts/IframeContext";

// Fonction helper pour convertir hex en rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface SearchBarToursBlockProps {
  configuration: {
    filtersTitle?: string;
    searchPlaceholder?: string;
    filtersTextColor?: string;
    filtersBgColor?: string;
    cardsColor?: string;
    backgroundColor?: string;
    mobileColumns?: number;
    tabletColumns?: number;
    desktopColumns?: number;
  };
}

export default function SearchBarToursBlock({ configuration }: SearchBarToursBlockProps) {
  const { tours, isLoading } = useTourNinjaWithCustomImages();
  const { openIframe } = useIframe();

  // Configuration
  const filtersTitle = configuration.filtersTitle || 'Filters';
  const searchPlaceholder = configuration.searchPlaceholder || 'Search for a tour...';
  const filtersTextColor = configuration.filtersTextColor || '#333333';
  const filtersBgColor = configuration.filtersBgColor || '#ffffff';
  const cardsColor = configuration.cardsColor || '#084F6E';
  const sectionBgColor = configuration.backgroundColor || '#ffffff';
  const mobileColumns = configuration.mobileColumns || 1;
  const tabletColumns = configuration.tabletColumns || 2;
  const desktopColumns = configuration.desktopColumns || 3;

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [imagePlaceholders, setImagePlaceholders] = useState<Record<string, boolean>>({});

  // Réinitialiser les placeholders quand la couleur change
  useEffect(() => {
    setImagePlaceholders({});
  }, [cardsColor]);

  const handleTourDetails = (tour: TourNinjaTour) => {
    if (tour.detailsUrl) {
      openIframe(tour.detailsUrl, `Details - ${tour.name}`);
    }
  };

  const handleTourBooking = (tour: TourNinjaTour) => {
    if (tour.bookingUrl) {
      openIframe(tour.bookingUrl, `Reservation - ${tour.name}`);
    }
  };

  // Extraire les options de filtre dynamiquement des données de l'API
  const filterOptions = useMemo(() => {
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
      { value: "free", label: "Price on request" }
    ];
    
    return { destinations, durations, priceRanges };
  }, [tours]);

  // Appliquer tous les filtres
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const matchesSearch = searchTerm === "" || 
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = (() => {
        if (priceRange === "all") return true;
        if (priceRange === "free") return tour.price === 0;
        
        const [min, max] = priceRange.split("-").map(p => p.replace("+", ""));
        const minPrice = parseInt(min);
        const maxPrice = max ? parseInt(max) : Infinity;
        
        return tour.price >= minPrice && tour.price < maxPrice;
      })();

      const matchesDuration = durationFilter === "all" || 
        tour.duration.toString() === durationFilter;

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

  const gridClass = `grid gap-8 ${
    mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
  } ${
    tabletColumns === 1 ? 'md:grid-cols-1' :
    tabletColumns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
  } ${
    desktopColumns === 1 ? 'lg:grid-cols-1' :
    desktopColumns === 2 ? 'lg:grid-cols-2' :
    desktopColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
  }`;

  return (
    <section className="py-16" style={{ backgroundColor: sectionBgColor }}>
      <div className="container mx-auto px-4">
        {/* Barre de filtres */}
        <div 
          className="rounded-xl shadow-lg p-6 mb-8"
          style={{ backgroundColor: filtersBgColor }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <h2 
              className="text-xl font-semibold"
              style={{ color: filtersTextColor }}
            >
              {filtersTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
            {/* Recherche */}
            <div className="relative md:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ color: filtersTextColor }}
              />
            </div>

            {/* Prix */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="All prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All prices</SelectItem>
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
                <SelectValue placeholder="All durations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All durations</SelectItem>
                {filterOptions.durations.map(duration => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} day{Number(duration) > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Destination */}
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All destinations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All destinations</SelectItem>
                {filterOptions.destinations.map(destination => (
                  <SelectItem key={destination} value={destination}>
                    {destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grille de tours */}
        {isLoading ? (
          <div className={gridClass}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredTours.length > 0 ? (
          <motion.div 
            className={gridClass}
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
                <Card 
                  className="h-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden bg-white"
                >
                  <div 
                    className="relative h-64 cursor-pointer"
                    onClick={() => handleTourDetails(tour)}
                  >
                    {!tour.primaryImage || imagePlaceholders[tour.id] ? (
                      <div 
                        className="w-full h-full relative overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${hexToRgba(cardsColor, 0.3)}, ${hexToRgba(cardsColor, 0.6)})`
                        }}
                      />
                    ) : (
                      <img
                        src={tour.primaryImage}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImagePlaceholders(prev => ({ ...prev, [tour.id]: true }));
                        }}
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        <Clock className="h-3 w-3 mr-1" />
                        {tour.duration} day{Number(tour.duration) > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 
                      className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleTourDetails(tour)}
                    >
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
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleTourDetails(tour)}
                        variant="outline"
                        className="flex-1"
                        style={{
                          borderColor: cardsColor,
                          color: cardsColor
                        }}
                      >
                        View details
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                      <Button 
                        onClick={() => handleTourBooking(tour)}
                        className="flex-1 text-white"
                        style={{
                          backgroundColor: cardsColor
                        }}
                      >
                        Book
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No tours available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
