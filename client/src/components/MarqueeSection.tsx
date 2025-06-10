import { motion } from "framer-motion";
import { useTourNinja } from "@/hooks/useTourNinja";

export default function MarqueeSection() {
  const { tours, isLoading } = useTourNinja();

  if (isLoading || !tours || tours.length === 0) return null;

  // Dupliquer les tours pour un défilement continu
  const duplicatedTours = [...tours, ...tours];

  return (
    <div className="bg-primary text-white py-3 overflow-hidden">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ 
          x: [0, -100 * tours.length + "%"] 
        }}
        transition={{ 
          duration: 30,
          repeat: Infinity,
          ease: "linear" 
        }}
      >
        {duplicatedTours.map((tour, index) => (
          <div key={`${tour.id}-${index}`} className="flex items-center mx-8">
            <span className="font-semibold mr-2">🌴</span>
            <span className="font-medium mr-2">{tour.name}</span>
            <span className="text-secondary mr-2">•</span>
            <span className="text-sm mr-2">À partir de {tour.price} {tour.currency}</span>
            <span className="text-secondary mr-2">•</span>
            <span className="text-sm">{tour.location}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}