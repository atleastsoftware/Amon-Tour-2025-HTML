import { motion } from "framer-motion";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { Users, Compass, Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Features() {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language?.startsWith('en');
  
  // Original English texts from production
  const originalTexts = {
    whyChooseTitle: "Why Choose Us",
    whyChooseDescription: "Experience an exclusive private day trip with our English or French-speaking and certified guides.",
    privateTours: "Private Tours",
    privateToursDesc: "Experience an exclusive day trip with our professional guides and private vehicles.",
    privateCar: "Private Car",
    guide: "Guide",
    safety: "Safety",
    customizedItineraries: "Customized Itineraries",
    customizedItinerariesDesc: "Create your own journey based on your desires, your pace, and your interests.",
    customRoute: "Custom Route",
    flexibleTime: "Flexible Time",
    yourPace: "Your Pace",
    authenticExperiences: "Authentic Experiences",
    authenticExperiencesDesc: "Discover destinations off the beaten path",
    localFood: "Local Food",
    localPeople: "Local People",
    culture: "Culture"
  };
  
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
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{isEN ? originalTexts.whyChooseTitle : t('features.whyChooseTitle')}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{isEN ? originalTexts.whyChooseDescription : t('features.whyChooseDescription')}</p>
          </motion.div>
        </div>
        
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <StaggerItem>
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative"
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
                <Users size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">{isEN ? originalTexts.privateTours : t('features.privateTours')}</h3>
              <p className="text-muted-foreground">{isEN ? originalTexts.privateToursDesc : t('features.privateToursDesc')}</p>
              
              <motion.div 
                className="mt-4 grid grid-cols-3 gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-car text-primary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.privateCar : t('features.privateCar')}</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-language text-primary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.guide : t('features.guide')}</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-shield-alt text-primary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.safety : t('features.safety')}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </StaggerItem>
          
          {/* Feature 2 */}
          <StaggerItem>
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Compass size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">{isEN ? originalTexts.customizedItineraries : t('features.customizedItineraries')}</h3>
              <p className="text-muted-foreground">{isEN ? originalTexts.customizedItinerariesDesc : t('features.customizedItinerariesDesc')}</p>
              
              <motion.div 
                className="mt-4 grid grid-cols-3 gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-map-marked-alt text-secondary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.customRoute : t('features.customRoute')}</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-clock text-secondary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.flexibleTime : t('features.flexibleTime')}</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-list-check text-secondary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.yourPace : t('features.yourPace')}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </StaggerItem>
          
          {/* Feature 3 */}
          <StaggerItem>
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative"
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
                <Sparkles size={28} className="text-white" />
              </motion.div>
              <h3 className="font-heading font-bold text-xl mb-2">{isEN ? originalTexts.authenticExperiences : t('features.authenticExperiences')}</h3>
              <p className="text-muted-foreground">{isEN ? originalTexts.authenticExperiencesDesc : t('features.authenticExperiencesDesc')}</p>
              
              <motion.div 
                className="mt-4 grid grid-cols-3 gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-utensils text-primary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.localFood : t('features.localFood')}</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-hands-helping text-primary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.localPeople : t('features.localPeople')}</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-1">
                    <i className="fas fa-landmark text-primary text-sm"></i>
                  </div>
                  <span className="text-xs">{isEN ? originalTexts.culture : t('features.culture')}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
