import { motion } from "framer-motion";

export default function SeasonalPricing() {
  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-muted/30 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Seasonal Pricing</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">Perfect for holidays with family, friends or private charter</p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Very High Season */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-gradient-to-r from-secondary to-secondary/80 text-white p-4">
                <h3 className="text-xl font-bold">Very High Season</h3>
                <p className="text-sm opacity-90">Peak period rates</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-foreground mb-2">39,000<span className="text-lg ml-2">THB</span></p>
                <p className="text-sm text-muted-foreground/80 mb-4">per day</p>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground">Period:</p>
                  <p className="text-sm text-muted-foreground">Dec 15, 2025 - Jan 15, 2026</p>
                </div>
              </div>
            </motion.div>

            {/* High Season */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-4">
                <h3 className="text-xl font-bold">High Season</h3>
                <p className="text-sm opacity-90">Premium period rates</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-foreground mb-2">31,000<span className="text-lg ml-2">THB</span></p>
                <p className="text-sm text-muted-foreground/80 mb-4">per day</p>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground">Period:</p>
                  <p className="text-sm text-muted-foreground">Oct 15 - Dec 14, 2025</p>
                  <p className="text-sm text-muted-foreground">Jan 15 - Mar 31, 2026</p>
                </div>
              </div>
            </motion.div>

            {/* Low Season */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-gradient-to-r from-primary/80 to-primary text-white p-4">
                <h3 className="text-xl font-bold">Low Season</h3>
                <p className="text-sm opacity-90">Best value rates</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-foreground mb-2">28,000<span className="text-lg ml-2">THB</span></p>
                <p className="text-sm text-muted-foreground/80 mb-4">per day</p>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground">Period:</p>
                  <p className="text-sm text-muted-foreground">Apr 1 - Oct 14, 2026</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-muted-foreground text-lg">Daily rate for minimum 2 days and one night. Capacity 8 adults max.</p>
          </motion.div>
          
          {/* Pickup Locations Cards */}
          <div className="max-w-5xl mx-auto mt-8 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Tubkeak */}
              <motion.div 
                className="bg-white rounded-lg shadow-md p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <p className="text-lg font-bold text-foreground">8:30</p>
                <p className="text-sm text-muted-foreground mt-1">from Tubkeak</p>
                <p className="text-sm font-bold text-secondary mt-2">+1,300 Baht</p>
              </motion.div>
              
              {/* Thalane */}
              <motion.div 
                className="bg-white rounded-lg shadow-md p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.47 }}
              >
                <p className="text-lg font-bold text-foreground">8:30</p>
                <p className="text-sm text-muted-foreground mt-1">from Thalane</p>
                <p className="text-sm font-bold text-secondary mt-2">+1,800 Baht</p>
              </motion.div>
              
              {/* Ao Nang */}
              <motion.div 
                className="bg-white rounded-lg shadow-md p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.49 }}
              >
                <p className="text-lg font-bold text-foreground">8:45</p>
                <p className="text-sm text-muted-foreground mt-1">from Ao Nang</p>
                <p className="text-sm text-primary font-semibold mt-2">No extra fee</p>
              </motion.div>
              
              {/* Klong Mueang */}
              <motion.div 
                className="bg-white rounded-lg shadow-md p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.51 }}
              >
                <p className="text-lg font-bold text-foreground">8:40</p>
                <p className="text-sm text-muted-foreground mt-1">from Klong Mueang</p>
                <p className="text-sm font-bold text-secondary mt-2">+1,000 Baht</p>
              </motion.div>
              
              {/* Railay */}
              <motion.div 
                className="bg-white rounded-lg shadow-md p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.53 }}
              >
                <p className="text-lg font-bold text-foreground">9:00</p>
                <p className="text-sm text-muted-foreground mt-1">from Railay</p>
                <p className="text-sm text-primary font-semibold mt-2">No extra fee</p>
              </motion.div>
            </div>
          </div>
          
          {/* Included and Not Included Cards */}
          <div className="max-w-5xl mx-auto mt-8 space-y-4">
            {/* Included in Price Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">Included in Price</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Boat rental with captain, assistant and professional English-speaking guide, fuel, semi-rigid dinghy for 5 to 6 people with an 18 HP engine, BBQ, fishing equipment and a paddleboard, fresh fruit, sodas, water. Breakfast (tea, coffee, toast, omelet).
              </p>
            </motion.div>
            
            {/* Not Included in Price Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">Not Included in Price</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Transfers (on request), national park fees (depending on the itinerary), beer, wine, spirits. Lunch and dinner (Thai cuisine): 500 Baht per person per meal. Please let us know your preferences and we will provision the boat accordingly.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}