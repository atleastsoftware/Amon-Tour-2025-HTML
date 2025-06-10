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
        {/* Section iframe showcase */}
        <section className="h-screen">
          <iframe 
            src="https://www.tourninja.io/showcase/2" 
            width="100%" 
            height="100%" 
            style={{ 
              border: 'none',
              minHeight: '100vh'
            }}
            title="Tours Showcase"
            scrolling="auto"
            allow="popups popups-to-escape-sandbox"
            sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-forms"
          />
        </section>

      </main>

    </>
  );
}