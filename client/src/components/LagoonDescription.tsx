import { motion } from "framer-motion";

export default function LagoonDescription() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">This Lagoon 470 catamaran (1999)</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-gray-600 text-lg">
                constantly improved since 2023, combines comfort and character. It has 4 double cabins with private bathrooms: two cabins with queen-size beds (160 cm) and two with double beds (140 cm). Each cabin is equipped with fans, 220V sockets and large storage spaces.
              </p>
              <p className="text-gray-600 text-lg">
                Spacious and well-designed, the Lagoon offers seamless flow between the interior and exterior living spaces: large, bright living room, equipped kitchen, shaded cockpit, sunbathing area at the front, etc. The discreet engine ensures peaceful navigation.
              </p>
              <p className="text-gray-600 text-lg">
                Perfect for holidays with family, friends or private charter, this boat guarantees your comfort, privacy and freedom to explore the most beautiful islands of the Andaman Sea.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}