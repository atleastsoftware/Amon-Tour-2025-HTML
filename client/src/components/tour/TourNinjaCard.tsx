import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { TourNinjaTour } from "@/hooks/useTourNinja";
import { formatTHB } from "@/lib/utils";

interface TourNinjaCardProps {
  tour: TourNinjaTour;
  index?: number;
}

export default function TourNinjaCard({ tour, index = 0 }: TourNinjaCardProps) {
  const handleCardClick = () => {
    if (tour.link) {
      window.open(tour.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="relative">
          {tour.image && (
            <div className="h-48 overflow-hidden">
              <img
                src={tour.image}
                alt={tour.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
          )}
          
          {tour.price && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-primary font-semibold">
                {tour.currency === 'THB' ? formatTHB(tour.price) : `${tour.price} ${tour.currency || 'THB'}`}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2">
              {tour.name}
            </h3>
            
            {tour.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {tour.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              {tour.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin size={12} className="mr-1" />
                  {tour.location}
                </div>
              )}
              
              {tour.duration && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {tour.duration}
                </div>
              )}
            </div>
          </div>

          {tour.link && (
            <motion.button
              onClick={handleCardClick}
              className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Details
              <ExternalLink size={14} className="ml-2" />
            </motion.button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}