import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MarqueeSection() {
  // Tours réels de l'iframe Tour Ninja showcase/2
  const iframeTours = [
    { 
      id: "1",
      name: "Phi Phi Islands Speed Boat Tour", 
      price: 2500, 
      currency: "THB",
      location: "Krabi",
      images: ["/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749533936281.jpg"],
      duration: "Full Day",
      shortDescription: "Découvrez les îles paradisiaques de Phi Phi en speedboat"
    },
    { 
      id: "2",
      name: "James Bond Island Day Trip", 
      price: 3200, 
      currency: "THB",
      location: "Phang Nga",
      images: ["/attached_assets/DJI_20241115104455_0160_D-min.jpeg"],
      duration: "8 hours",
      shortDescription: "Visitez l'île emblématique de James Bond à Phang Nga"
    },
    { 
      id: "3",
      name: "Phuket City & Temple Tour", 
      price: 1800, 
      currency: "THB",
      location: "Phuket",
      images: ["/attached_assets/IMG_2114.png"],
      duration: "Half Day",
      shortDescription: "Explorez la culture et les temples de Phuket"
    },
    { 
      id: "4",
      name: "Emerald Cave Kayaking", 
      price: 2800, 
      currency: "THB",
      location: "Krabi",
      images: ["/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749529793245.jpg"],
      duration: "6 hours",
      shortDescription: "Kayak dans la grotte d'émeraude mystique"
    },
    { 
      id: "5",
      name: "Elephant Sanctuary Visit", 
      price: 2200, 
      currency: "THB",
      location: "Phuket",
      images: ["/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749534394180.jpg"],
      duration: "5 hours",
      shortDescription: "Rencontrez les éléphants dans leur sanctuaire naturel"
    },
    { 
      id: "6",
      name: "4 Islands Tour by Longtail", 
      price: 1900, 
      currency: "THB",
      location: "Krabi",
      images: ["/attached_assets/phi-phi-islands-island-summertime-vacation-wallpaper-preview_1749533936281.jpg"],
      duration: "7 hours",
      shortDescription: "Tour traditionnel des 4 îles en bateau longtail"
    }
  ];

  // Dupliquer les tours pour un défilement continu
  const duplicatedTours = [...iframeTours, ...iframeTours];

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 py-6 overflow-hidden">
      <div className="mb-4 text-center">
        <h3 className="text-white text-xl font-heading font-semibold">Some ideas for your next trip</h3>
      </div>
      <motion.div 
        className="flex"
        animate={{ 
          x: [0, -50 + "%"] 
        }}
        transition={{ 
          duration: 60,
          repeat: Infinity,
          ease: "linear" 
        }}
      >
        {duplicatedTours.map((tour, index) => (
          <Link key={`${tour.id}-${index}`} href="/tours">
            <Card className="mx-3 w-80 flex-shrink-0 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="relative h-48">

                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-white">
                    {tour.duration}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-white">
                    <div className="inline-block px-2 py-1 rounded-full bg-secondary text-sm font-medium">
                      À partir de {tour.price} {tour.currency}
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-heading font-semibold text-lg mb-2 line-clamp-2">{tour.name}</h4>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm text-muted-foreground">📍 {tour.location}</span>
                </div>
                <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{tour.shortDescription}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}