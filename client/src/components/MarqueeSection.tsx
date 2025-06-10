import { motion } from "framer-motion";
import { Link } from "wouter";

export default function MarqueeSection() {
  // Tours directement depuis l'iframe Tour Ninja (showcase/2)
  const tourNinjaTours = [
    { name: "Phi Phi Islands Speed Boat Tour", price: "2,500", location: "Krabi" },
    { name: "James Bond Island Day Trip", price: "3,200", location: "Phang Nga" },
    { name: "Phuket City & Temple Tour", price: "1,800", location: "Phuket" },
    { name: "Emerald Cave Kayaking", price: "2,800", location: "Krabi" },
    { name: "Elephant Sanctuary Visit", price: "2,200", location: "Phuket" },
    { name: "4 Islands Tour by Longtail", price: "1,900", location: "Krabi" },
    { name: "Big Buddha & Wat Chalong", price: "1,500", location: "Phuket" },
    { name: "Hong Island Lagoon Tour", price: "2,600", location: "Krabi" }
  ];

  // Dupliquer les tours pour un défilement continu
  const duplicatedTours = [...tourNinjaTours, ...tourNinjaTours];

  return (
    <div className="bg-primary text-white py-3 overflow-hidden">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ 
          x: [0, -50 + "%"] 
        }}
        transition={{ 
          duration: 45,
          repeat: Infinity,
          ease: "linear" 
        }}
      >
        {duplicatedTours.map((tour, index) => (
          <Link key={`${tour.name}-${index}`} href="/tours">
            <div className="flex items-center mx-6 cursor-pointer hover:text-secondary transition-colors">
              <span className="font-semibold mr-2">🌴</span>
              <span className="font-medium mr-2">{tour.name}</span>
              <span className="text-secondary mr-2">•</span>
              <span className="text-sm mr-2">À partir de {tour.price} THB</span>
              <span className="text-secondary mr-2">•</span>
              <span className="text-sm">{tour.location}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}