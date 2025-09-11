import { motion } from "framer-motion";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { Map, Zap, Globe } from "lucide-react";

export default function CatamaranExperience() {
  return (
    <section className="py-16 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">The Catamaran Experience</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-4xl mx-auto mb-2">
              Navigate towards exclusivity aboard one of the rare catamaran cruises departing from Krabi. Explore the Andaman Sea as few travelers have the chance to do: in complete freedom, away from tourist circuits, with an itinerary designed entirely for you.
            </p>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Your Cruise, Our Expertise:
            </p>
          </motion.div>
        </div>
        
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 - Tailor-made routes */}
          <StaggerItem className="flex">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative h-full w-full"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Map size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">Tailor-made routes</h3>
              <p className="text-gray-600 flex-grow">We compose your itinerary to reveal the best of the region, prioritizing preserved sites and exceptional moments.</p>
            </motion.div>
          </StaggerItem>
          
          {/* Feature 2 - Expert crew */}
          <StaggerItem className="flex">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative h-full w-full"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">Expert crew</h3>
              <p className="text-gray-600 flex-grow">Our captains have perfect mastery of these waters. They optimize each navigation by adapting to weather conditions, tides and winds to maximize your pleasure.</p>
            </motion.div>
          </StaggerItem>
          
          {/* Feature 3 - Total freedom */}
          <StaggerItem className="flex">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative h-full w-full"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">Total freedom</h3>
              <p className="text-gray-600 flex-grow">Deserted beaches, turquoise lagoons, snorkeling in crystal-clear waters... Your cruise evolves according to your preferences.</p>
            </motion.div>
          </StaggerItem>
        </StaggerChildren>
        
        {/* Photo Gallery Section */}
        <motion.div 
          className="mt-20 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400&h=400&fit=crop" 
                alt="Catamaran view 1" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1545300849-ac447b458c0e?w=400&h=400&fit=crop" 
                alt="Catamaran interior" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1621277224630-81a57f52e588?w=400&h=400&fit=crop" 
                alt="Catamaran deck" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop" 
                alt="Catamaran sailing" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1544551763-92c1e8b2b2a3?w=400&h=400&fit=crop" 
                alt="Catamaran sunset" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=400&h=400&fit=crop" 
                alt="Catamaran lounge" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Lagoon Description Section */}
        <motion.div 
          className="mt-8"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3 text-center">This Lagoon 470 catamaran (1999)</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-gray-600 text-lg text-center">
              constantly improved since 2023, combines comfort and character. It has 4 double cabins with private bathrooms: two cabins with queen-size beds (160 cm) and two with double beds (140 cm). Each cabin is equipped with fans, 220V sockets and large storage spaces.
            </p>
            <p className="text-gray-600 text-lg text-center">
              Spacious and well-designed, the Lagoon offers seamless flow between the interior and exterior living spaces: large, bright living room, equipped kitchen, shaded cockpit, sunbathing area at the front, etc. The discreet engine ensures peaceful navigation.
            </p>
            <p className="text-gray-600 text-lg text-center">
              Perfect for holidays with family, friends or private charter, this boat guarantees your comfort, privacy and freedom to explore the most beautiful islands of the Andaman Sea.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}