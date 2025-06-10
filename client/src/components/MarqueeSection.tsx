import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MarqueeSection() {
  // Tours avec images depuis l'iframe Tour Ninja (showcase/2)
  const tourNinjaTours = [
    { 
      name: "Phi Phi Islands Speed Boat Tour", 
      price: "2,500", 
      location: "Krabi",
      image: "/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749533936281.jpg",
      duration: "Full Day"
    },
    { 
      name: "James Bond Island Day Trip", 
      price: "3,200", 
      location: "Phang Nga",
      image: "/attached_assets/DJI_20241115104455_0160_D-min.jpeg",
      duration: "8 hours"
    },
    { 
      name: "Phuket City & Temple Tour", 
      price: "1,800", 
      location: "Phuket",
      image: "/attached_assets/IMG_2114.png",
      duration: "Half Day"
    },
    { 
      name: "Emerald Cave Kayaking", 
      price: "2,800", 
      location: "Krabi",
      image: "/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749529793245.jpg",
      duration: "6 hours"
    },
    { 
      name: "Elephant Sanctuary Visit", 
      price: "2,200", 
      location: "Phuket",
      image: "/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749534394180.jpg",
      duration: "5 hours"
    },
    { 
      name: "4 Islands Tour by Longtail", 
      price: "1,900", 
      location: "Krabi",
      image: "/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749533936281.jpg",
      duration: "7 hours"
    }
  ];

  // Dupliquer les tours pour un défilement continu
  const duplicatedTours = [...tourNinjaTours, ...tourNinjaTours];

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-6 overflow-hidden">
      <div className="mb-4 text-center">
        <h3 className="text-white text-xl font-heading font-semibold">Tours Populaires</h3>
      </div>
      <motion.div 
        className="flex"
        animate={{ 
          x: [0, -100 * tourNinjaTours.length + "%"] 
        }}
        transition={{ 
          duration: 60,
          repeat: Infinity,
          ease: "linear" 
        }}
      >
        {duplicatedTours.map((tour, index) => (
          <Link key={`${tour.name}-${index}`} href="/tours">
            <Card className="mx-3 w-80 flex-shrink-0 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="relative h-48">
                <img 
                  src={tour.image} 
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-white">
                    {tour.duration}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-white">
                    <div className="inline-block px-2 py-1 rounded-full bg-secondary text-sm font-medium">
                      À partir de {tour.price} THB
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-heading font-semibold text-lg mb-2 line-clamp-2">{tour.name}</h4>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">📍 {tour.location}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}