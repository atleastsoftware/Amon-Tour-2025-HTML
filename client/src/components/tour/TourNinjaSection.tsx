import { motion } from "framer-motion";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useTourNinjaWithCustomImages } from "@/hooks/useTourNinja";
import TourNinjaCard from "./TourNinjaCard";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

export default function TourNinjaSection() {
  const { t } = useTranslation();
  const { tours, isLoading, error, refetch, cached, fallback, success } = useTourNinjaWithCustomImages();

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="text-[hsl(var(--destructive))] mr-2" size={24} />
              <h2 className="font-heading font-bold text-2xl">External Tours</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Unable to load external tour data. Please check your connection.
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{t('someIdeas.title')}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('someIdeas.description')}</p>
          </motion.div>
        </div>

        {isLoading ? (
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
        ) : tours.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {tours.map((tour, index) => (
              <TourNinjaCard 
                key={tour.id || index} 
                tour={tour} 
                index={index} 
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No partner tours available at the moment.</p>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="mt-4 flex items-center mx-auto"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}