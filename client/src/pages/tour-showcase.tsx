import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, Users, MapPin, Calendar, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useIframe } from "@/contexts/IframeContext";

interface TourShowcaseData {
  tour: {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    currency: string;
    duration: number;
    maxParticipants: number;
    images: string[];
    primaryImage?: string;
    location: string;
    highlights?: string[];
    includes?: string[];
    excludes?: string[];
    itinerary?: Array<{
      day: number;
      title: string;
      description: string;
    }>;
    rating?: number;
    reviewCount?: number;
    bookingUrl?: string;
    detailsUrl?: string;
    presentationUrl?: string;
  };
  company: {
    name: string;
    logo?: string;
  };
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    image: string;
    url: string;
  };
}

interface TourShowcaseParams {
  token: string;
}

export default function TourShowcase() {
  const [, navigate] = useLocation();
  const pathname = window.location.pathname;
  const token = pathname.split('/').pop() || '';
  const [, setLocation] = useLocation();
  const { openIframe } = useIframe();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: showcaseData, isLoading, error } = useQuery<{
    success: boolean;
    data: TourShowcaseData;
    timestamp: number;
  }>({
    queryKey: [`/api/public/tour-showcase/${token}`],
    retry: false,
  });

  const tour = showcaseData?.data?.tour;
  const metadata = showcaseData?.data?.metadata;
  const company = showcaseData?.data?.company;

  const handleBookNow = () => {
    if (tour?.bookingUrl) {
      // Toujours ouvrir la réservation en iframe sur amon-tour.com
      openIframe(tour.bookingUrl, `Booking - ${tour.name}`);
    }
  };

  const handleViewDetails = () => {
    if (tour?.detailsUrl) {
      openIframe(tour.detailsUrl, `Details - ${tour.name}`);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Price on request";
    return `${price.toLocaleString()} ${currency}`;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tour...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !showcaseData?.success || !tour) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Tour Not Found</h1>
              <p className="text-gray-600 mb-8">The tour you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => setLocation("/tours")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tours
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title={metadata?.title || `${tour.name} | Amon Tour`}
        description={metadata?.description || tour.shortDescription || tour.description}
        ogImage={metadata?.image || tour.primaryImage || tour.images[0]}
        canonicalUrl={metadata?.url || `https://www.amon-tour.com/tour/${token}`}
        keywords={metadata?.keywords?.join(', ') || ''}
      />
      <Header />
      
      <main className="min-h-screen bg-white pt-20">
        {/* Hero Section */}
        <section className="relative">
          <div 
            className="h-96 bg-gradient-to-br from-blue-200 to-blue-300 relative overflow-hidden"
            style={{
              backgroundImage: tour.primaryImage || tour.images[0] 
                ? `url(${tour.primaryImage || tour.images[0]})` 
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
              <div className="text-white">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={() => setLocation("/tours")}
                    className="text-white hover:text-gray-200 mb-4 p-0"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tours
                  </Button>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{tour.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <Badge className="bg-blue-600 text-white">
                      {formatPrice(tour.price, tour.currency)}
                    </Badge>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {tour.duration} day{tour.duration > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Up to {tour.maxParticipants} people
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tour.location}
                    </div>
                    {tour.rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                        {tour.rating} ({tour.reviewCount || 0} reviews)
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Experience</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>{tour.description}</p>
                  </div>
                </motion.div>

                {/* Highlights */}
                {tour.highlights && tour.highlights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Highlights</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {tour.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Itinerary */}
                {tour.itinerary && tour.itinerary.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
                    <div className="space-y-6">
                      {tour.itinerary.map((day, index) => (
                        <div key={index} className="border-l-4 border-blue-600 pl-6 pb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Day {day.day}: {day.title}
                          </h3>
                          <p className="text-gray-700">{day.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Includes & Excludes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tour.includes && tour.includes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What's Included</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {tour.includes.map((item, index) => (
                          <li key={index} className="text-green-700">{item}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {tour.excludes && tour.excludes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What's Not Included</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {tour.excludes.map((item, index) => (
                          <li key={index} className="text-red-700">{item}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="sticky top-24"
                >
                  <Card className="p-6">
                    <CardContent className="p-0 space-y-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {formatPrice(tour.price, tour.currency)}
                        </div>
                        <p className="text-gray-600">per person</p>
                      </div>

                      <div className="space-y-4">
                        <Button 
                          onClick={handleBookNow}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                          size="lg"
                        >
                          Book Now
                          <ExternalLink className="h-5 w-5 ml-2" />
                        </Button>

                        {tour.detailsUrl && (
                          <Button 
                            onClick={handleViewDetails}
                            variant="outline"
                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                            size="lg"
                          >
                            View Details
                            <ExternalLink className="h-5 w-5 ml-2" />
                          </Button>
                        )}
                      </div>

                      <div className="pt-6 border-t space-y-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                          <span>Flexible cancellation</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-5 w-5 mr-3 text-blue-600" />
                          <span>Small group experience</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                          <span>Local expert guide</span>
                        </div>
                      </div>

                      {company && (
                        <div className="pt-6 border-t text-center">
                          <p className="text-sm text-gray-500">Organized by</p>
                          <p className="font-semibold text-gray-900">{company.name}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        {tour.images && tour.images.length > 1 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tour.images.map((image, index) => (
                    <div 
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${tour.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </>
  );
}