import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, ExternalLink, Search, Filter, X, AlertCircle } from "lucide-react";
import { formatTHB } from "@/lib/utils";
import { useTourNinjaWithCustomImages, type TourNinjaTour } from "@/hooks/useTourNinja";
import { useIframe } from "@/contexts/IframeContext";
export default function Tours() {
  const {
    t
  } = useTranslation();
  const {
    tours,
    isLoading,
    error,
    success,
    cached,
    fallback
  } = useTourNinjaWithCustomImages();
  const {
    openIframe
  } = useIframe();

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const handleTourDetails = (tour: TourNinjaTour) => {
    if (tour.detailsUrl) {
      openIframe(tour.detailsUrl, `Details - ${tour.name}`);
    }
  };
  const handleTourPresentation = (tour: TourNinjaTour) => {
    if (tour.presentationUrl) {
      openIframe(tour.presentationUrl, `Presentation - ${tour.name}`);
    }
  };
  const handleTourBooking = (tour: TourNinjaTour) => {
    if (tour.bookingUrl) {
      openIframe(tour.bookingUrl, `Reservation - ${tour.name}`);
    }
  };

  // Logique d'affichage prix intelligente
  const displayPrice = (tour: TourNinjaTour) => {
    if (tour.price > 0) {
      return formatTHB(tour.price);
    }
    return t("Price on request", {
      defaultValue: "Price on request"
    });
  };

  // Extraire les options de filtre dynamiquement des données de l'API
  const filterOptions = useMemo(() => {
    // Extraire les destinations depuis les noms des tours
    const destinationKeywords = tours.map(tour => {
      const name = tour.name.toLowerCase();
      if (name.includes('phi phi')) return t("Kohphiphi", {
        defaultValue: "Kohphiphi"
      });
      if (name.includes('phang nga')) return t("Phang Nga Bay", {
        defaultValue: "Phang Nga Bay"
      });
      if (name.includes('koh hong')) return t("Kohhong", {
        defaultValue: "Kohhong"
      });
      if (name.includes('koh mook')) return t("Kohmook", {
        defaultValue: "Kohmook"
      });
      if (name.includes('railay')) return t("Railay", {
        defaultValue: "Railay"
      });
      if (name.includes('ao nang')) return t("Aonang", {
        defaultValue: "Aonang"
      });
      if (name.includes('thalane')) return t("Thalane", {
        defaultValue: "Thalane"
      });
      if (name.includes('ao luk')) return t("Aoluk", {
        defaultValue: "Aoluk"
      });
      if (name.includes('krabi')) return t("Krabi", {
        defaultValue: "Krabi"
      });
      if (name.includes('laem sak')) return t("Laemsak", {
        defaultValue: "Laemsak"
      });
      if (name.includes('koh kradan')) return t("Kohkradan", {
        defaultValue: "Kohkradan"
      });
      if (name.includes('koh ngaï')) return t("Kohngaxef", {
        defaultValue: "Kohngaxef"
      });
      return null;
    }).filter(Boolean);
    const destinations = Array.from(new Set(destinationKeywords)) as string[];
    const durations = Array.from(new Set(tours.map(tour => tour.duration).filter(Boolean)));
    const priceRanges = [{
      value: "0-2000",
      label: t("02000thb", {
        defaultValue: "02000thb"
      })
    }, {
      value: "2000-4000",
      label: t("20004000thb", {
        defaultValue: "20004000thb"
      })
    }, {
      value: "4000-6000",
      label: t("40006000thb", {
        defaultValue: "40006000thb"
      })
    }, {
      value: "6000+",
      label: t("6000thb", {
        defaultValue: "6000thb"
      })
    }, {
      value: "free",
      label: t("Price on request", {
        defaultValue: "Price on request"
      })
    }];
    return {
      destinations,
      durations,
      priceRanges
    };
  }, [tours]);

  // Appliquer tous les filtres
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // Filtre de recherche textuelle
      const matchesSearch = searchTerm === "" || tour.name.toLowerCase().includes(searchTerm.toLowerCase()) || tour.description?.toLowerCase().includes(searchTerm.toLowerCase());

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
      const matchesDuration = durationFilter === "all" || tour.duration.toString() === durationFilter;

      // Filtre de destination (basé sur l'extraction depuis le nom)
      const getDestinationFromName = (tourName: string) => {
        const name = tourName.toLowerCase();
        if (name.includes('phi phi')) return t("Kohphiphi", {
          defaultValue: "Kohphiphi"
        });
        if (name.includes('phang nga')) return t("Phang Nga Bay", {
          defaultValue: "Phang Nga Bay"
        });
        if (name.includes('koh hong')) return t("Kohhong", {
          defaultValue: "Kohhong"
        });
        if (name.includes('koh mook')) return t("Kohmook", {
          defaultValue: "Kohmook"
        });
        if (name.includes('railay')) return t("Railay", {
          defaultValue: "Railay"
        });
        if (name.includes('ao nang')) return t("Aonang", {
          defaultValue: "Aonang"
        });
        if (name.includes('thalane')) return t("Thalane", {
          defaultValue: "Thalane"
        });
        if (name.includes('ao luk')) return t("Aoluk", {
          defaultValue: "Aoluk"
        });
        if (name.includes('krabi')) return t("Krabi", {
          defaultValue: "Krabi"
        });
        if (name.includes('laem sak')) return t("Laemsak", {
          defaultValue: "Laemsak"
        });
        if (name.includes('koh kradan')) return t("Kohkradan", {
          defaultValue: "Kohkradan"
        });
        if (name.includes('koh ngaï')) return t("Kohngaxef", {
          defaultValue: "Kohngaxef"
        });
        return t("Autre", {
          defaultValue: "Autre"
        });
      };
      const matchesDestination = destinationFilter === "all" || getDestinationFromName(tour.name) === destinationFilter;
      return matchesSearch && matchesPrice && matchesDuration && matchesDestination;
    });
  }, [tours, searchTerm, priceRange, durationFilter, destinationFilter]);
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange("all");
    setDurationFilter("all");
    setDestinationFilter("all");
  };
  const hasActiveFilters = searchTerm !== "" || priceRange !== "all" || durationFilter !== "all" || destinationFilter !== "all";
  return <>
      <SEO title={t("Thailand Tours & Experiences | Authentic Island Tours Krabi | Amon Tour", {
      defaultValue: "Thailand Tours & Experiences | Authentic Island Tours Krabi | Amon Tour"
    })} description="Explore authentic Thailand tours in Krabi and southern Thailand. Private island tours, cultural experiences, temple visits, and local adventures. Book your authentic Thai experience today." keywords="krabi tours, thailand island tours, phuket experiences, phang nga bay tours, private boat tours thailand, authentic thai experiences, koh phi phi tours, cultural tours thailand" canonicalUrl="https://amon-tour.com/tours" breadcrumbs={[{
      name: t('navigation.home'),
      url: "/"
    }, {
      name: t("Tours & Experiences", {
        defaultValue: "Tours & Experiences"
      }),
      url: "/tours"
    }]} faqSchema={[{
      question: "How long are typical tours with Amon Tour?",
      answer: "Our tours range from half-day experiences (4-5 hours) to full-day adventures (8-10 hours) and multi-day custom journeys. Most popular tours are full-day experiences that include transportation, guide, and meals."
    }, {
      question: "What's included in Amon Tour packages?",
      answer: "Most tours include private transportation, English/French-speaking guide, entrance fees, meals (as specified), safety equipment for water activities, and insurance. Specific inclusions vary by tour and are clearly listed in each package."
    }, {
      question: "Can tours be customized for special interests?",
      answer: "Absolutely! We specialize in customizing tours based on your interests - whether it's photography, culture, adventure, relaxation, or family-friendly activities. Contact us to discuss your preferences and we'll create a personalized itinerary."
    }, {
      question: "What should I bring on a tour?",
      answer: "Bring sunscreen, hat, comfortable clothing, swimwear for water activities, towel, and camera. We provide safety equipment and refreshments. Specific recommendations are provided when you book based on your chosen tour."
    }, {
      question: "Are tours suitable for families with children?",
      answer: "Yes! Many of our tours are family-friendly. We can adapt activities and timing to suit families with children. Our guides are experienced with family groups and ensure safe, enjoyable experiences for all ages."
    }]} />
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20">
        {/* Hero */}
        <HeroHeader title={t("Our Experiences", {
        defaultValue: "Our Experiences"
      })} subtitle={t("Discover the exceptional beauty of Krabi and southern Thailand.", {
        defaultValue: "Discover the exceptional beauty of Krabi and southern Thailand."
      })} alt={t("Tours and experiences in Thailand", {
        defaultValue: "Tours and experiences in Thailand"
      })} />

        {/* Filtres */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{t("Filters", {
                defaultValue: "Filters"
              })}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? t("Hide", {
                defaultValue: "Hide"
              }) : t("Show", {
                defaultValue: "Show"
              })} {t("Filters", {
                defaultValue: "Filters"
              })}
              </Button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full ${showFilters ? 'block' : 'hidden md:grid'}`}>
              {/* Recherche - Plus large sur mobile et desktop */}
              <div className="relative md:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder={t("Search for a tour...", {
                defaultValue: "Search for a tour..."
              })} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>

              {/* Prix */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Allprices", {
                  defaultValue: "Allprices"
                })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("Allprices", {
                    defaultValue: "Allprices"
                  })}</SelectItem>
                  {filterOptions.priceRanges.map(range => <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>

              {/* Durée */}
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("All durations", {
                  defaultValue: "All durations"
                })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All durations", {
                    defaultValue: "All durations"
                  })}</SelectItem>
                  {filterOptions.durations.map(duration => <SelectItem key={duration} value={duration.toString()}>
                      {duration} day{Number(duration) > 1 ? 's' : ''}
                    </SelectItem>)}
                </SelectContent>
              </Select>

              {/* Destination */}
              <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("All destinations", {
                  defaultValue: "All destinations"
                })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All destinations", {
                    defaultValue: "All destinations"
                  })}</SelectItem>
                  {filterOptions.destinations.map(destination => <SelectItem key={destination} value={destination}>
                      {destination}
                    </SelectItem>)}
                </SelectContent>
              </Select>

              {/* Reset - Prend toute la largeur sur mobile, une colonne sur desktop */}
              {hasActiveFilters && <Button variant="outline" onClick={clearFilters} className="w-full md:col-span-4 lg:col-span-5">
                  <X className="h-4 w-4 mr-2" />
                  {t("Clear filters", {
                defaultValue: "Clear filters"
              })}
                </Button>}
            </div>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="container mx-auto px-4 pb-16">
          {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" />)}
            </div> : filteredTours.length > 0 ? <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.6
        }}>
              {filteredTours.map((tour, index) => <motion.div key={tour.id} initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: index * 0.1
          }}>
                  <Card className="h-full bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-primary/40 to-primary/60 cursor-pointer" onClick={() => handleTourPresentation(tour)}>
                      {tour.primaryImage ? <img src={tour.primaryImage} alt={tour.name} className="w-full h-full object-cover" onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }} /> : <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-primary/70" />
                        </div>}
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {tour.duration} day{Number(tour.duration) > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={() => handleTourPresentation(tour)}>
                        {tour.name}
                      </h3>
                      
                      {tour.shortDescription && <p className="text-gray-600 mb-4 line-clamp-3">
                          {tour.shortDescription}
                        </p>}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        {tour.location}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={() => handleTourDetails(tour)} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/10">
                          {t("View Details", {
                      defaultValue: "View Details"
                    })}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                        <Button onClick={() => handleTourBooking(tour)} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                          {t("Book", {
                      defaultValue: "Book"
                    })}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>)}
            </motion.div> : <div className="text-center py-8">
              {tours.length === 0 && !hasActiveFilters ? <div className="space-y-4">
                  {/* Pas de tours disponibles - garde l'espace propre */}
                </div> : hasActiveFilters ? <Button onClick={clearFilters} variant="outline">
                  {t("Clear filters", {
              defaultValue: "Clear filters"
            })}
                </Button> : null}
            </div>}
        </section>
      </main>
      
      <Footer />
    </>;
}