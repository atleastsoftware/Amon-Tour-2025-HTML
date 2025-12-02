import { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/TranslationContext";
import { useIframe } from "@/contexts/IframeContext";
import { formatTHB } from "@/lib/utils";
import { TourNinjaTour } from "@/hooks/useTourNinja";

export default function TourDetail() {
  const [match, params] = useRoute("/tour-detail/:id");
  const [, setLocation] = useLocation();
  const { translations, currentLanguage } = useTranslation();
  const { openIframe } = useIframe();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const tourId = params?.id;

  const t = translations.tourDetail || {};
  const common = translations.common || {};

  const { data: toursResponse, isLoading } = useQuery<{ data: TourNinjaTour[] }>({
    queryKey: ['/api/proxy/tours', currentLanguage],
    queryFn: async () => {
      const res = await fetch(`/api/proxy/tours?language=${currentLanguage}`);
      if (!res.ok) throw new Error('Failed to fetch tours');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const tour = useMemo(() => {
    if (!toursResponse?.data || !tourId) return null;
    return toursResponse.data.find((t: TourNinjaTour) => t.id === tourId);
  }, [toursResponse, tourId]);

  const images = useMemo(() => {
    if (!tour) return [];
    const imgList: string[] = [];
    if (tour.customImage) imgList.push(tour.customImage);
    if (tour.images?.length) imgList.push(...tour.images);
    if (tour.primaryImage && !imgList.includes(tour.primaryImage)) {
      imgList.push(tour.primaryImage);
    }
    return imgList.filter(Boolean);
  }, [tour]);

  const handleBack = () => {
    window.history.back();
  };

  const handleBookNow = () => {
    if (tour?.bookingUrl) {
      openIframe(tour.bookingUrl, `${t.booking || 'Booking'} - ${tour.name}`);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!match || !tourId) {
    return (
      <>
        <SEO 
          title={`${t.notFound || 'Tour not found'} - Amon Tour`}
          description={t.notFoundDescription || 'The requested tour was not found.'}
        />
        <Header />
        <main className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t.notFound || 'Tour not found'}</h1>
            <Button onClick={() => setLocation('/experiences')}>
              {t.backToTours || 'Back to tours'}
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">{common.loading || 'Loading...'}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!tour) {
    return (
      <>
        <SEO 
          title={`${t.notFound || 'Tour not found'} - Amon Tour`}
          description={t.notFoundDescription || 'The requested tour was not found.'}
        />
        <Header />
        <main className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t.notFound || 'Tour not found'}</h1>
            <Button onClick={() => setLocation('/experiences')}>
              {t.backToTours || 'Back to tours'}
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
        title={`${tour.name} - Amon Tour`}
        description={tour.shortDescription || tour.description?.slice(0, 160)}
      />
      
      <Header />
      
      <main className="bg-white pt-20 pb-16">
        {/* Back Navigation */}
        <section className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <Button onClick={handleBack} variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {common.back || 'Back'}
            </Button>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={tour.name}
                      className="w-full h-full object-cover"
                      data-testid="img-tour-main"
                    />
                    
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          data-testid="button-prev-image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          data-testid="button-next-image"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentImageIndex 
                                  ? 'bg-white w-6' 
                                  : 'bg-white/60 hover:bg-white/80'
                              }`}
                              data-testid={`button-image-dot-${idx}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/70 to-primary">
                    <MapPin className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.slice(0, 6).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      data-testid={`button-thumbnail-${idx}`}
                    >
                      <img
                        src={img}
                        alt={`${tour.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Tour Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Category Badge */}
              {tour.category && (
                <Badge className="mb-4 bg-primary/10 text-primary" data-testid="badge-category">
                  {tour.category}
                </Badge>
              )}

              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4" data-testid="text-tour-name">
                {tour.name}
              </h1>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {tour.location && (
                  <div className="flex items-center text-gray-600" data-testid="text-location">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    {tour.location}
                  </div>
                )}
                {tour.duration && (
                  <div className="flex items-center text-gray-600" data-testid="text-duration">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    {tour.duration}
                  </div>
                )}
                {(tour.minGuests || tour.maxGuests) && (
                  <div className="flex items-center text-gray-600" data-testid="text-guests">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    {tour.minGuests && tour.maxGuests 
                      ? `${tour.minGuests} - ${tour.maxGuests} ${t.guests || 'guests'}`
                      : tour.maxGuests 
                        ? `${t.upTo || 'Up to'} ${tour.maxGuests} ${t.guests || 'guests'}`
                        : `${t.minGuests || 'Min'} ${tour.minGuests} ${t.guests || 'guests'}`
                    }
                  </div>
                )}
              </div>

              {/* Price Card */}
              <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t.startingFrom || 'Starting from'}</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-price">
                        {tour.price > 0 
                          ? (tour.currency === 'THB' 
                              ? formatTHB(tour.price) 
                              : `${tour.price} ${tour.currency || 'THB'}`)
                          : t.contactForPrice || 'Contact for price'
                        }
                      </p>
                      <p className="text-sm text-gray-500">{t.perPerson || 'per person'}</p>
                    </div>
                    
                    <Button 
                      size="lg"
                      onClick={handleBookNow}
                      className="bg-secondary hover:bg-secondary/90 text-white px-8"
                      disabled={!tour.bookingUrl}
                      data-testid="button-book-now"
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      {common.bookNow || 'Book Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <div className="prose max-w-none mb-8">
                <h2 className="text-xl font-semibold mb-3" data-testid="text-description-title">
                  {t.description || 'Description'}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line" data-testid="text-description">
                  {tour.description}
                </p>
              </div>

              {/* Tags */}
              {tour.tags && tour.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{t.highlights || 'Highlights'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tour.tags.map((tag, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-sm"
                        data-testid={`badge-tag-${idx}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={handleBookNow}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                  disabled={!tour.bookingUrl}
                  data-testid="button-book-now-bottom"
                >
                  {common.bookNow || 'Book Now'}
                </Button>
                {tour.detailsUrl && (
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => openIframe(tour.detailsUrl!, `${tour.name}`)}
                    className="flex-1"
                    data-testid="button-more-details"
                  >
                    {t.moreDetails || 'More Details on Tour Ninja'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
