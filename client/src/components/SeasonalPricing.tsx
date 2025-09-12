import { motion } from "framer-motion";

export default function SeasonalPricing() {
  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-12">
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
              <p className="text-gray-600 text-lg">Perfect for holidays with family, friends or private charter</p>
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
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4">
                <h3 className="text-xl font-bold">Very High Season</h3>
                <p className="text-sm opacity-90">Peak period rates</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-gray-900 mb-2">39,000<span className="text-lg ml-2">THB</span></p>
                <p className="text-sm text-gray-500 mb-4">per day</p>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700">Period:</p>
                  <p className="text-sm text-gray-600">Dec 15, 2025 - Jan 15, 2026</p>
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
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4">
                <h3 className="text-xl font-bold">High Season</h3>
                <p className="text-sm opacity-90">Premium period rates</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-gray-900 mb-2">31,000<span className="text-lg ml-2">THB</span></p>
                <p className="text-sm text-gray-500 mb-4">per day</p>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700">Period:</p>
                  <p className="text-sm text-gray-600">Oct 15 - Dec 14, 2025</p>
                  <p className="text-sm text-gray-600">Jan 15 - Mar 31, 2026</p>
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
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
                <h3 className="text-xl font-bold">Low Season</h3>
                <p className="text-sm opacity-90">Best value rates</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-gray-900 mb-2">28,000<span className="text-lg ml-2">THB</span></p>
                <p className="text-sm text-gray-500 mb-4">per day</p>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700">Period:</p>
                  <p className="text-sm text-gray-600">Apr 1 - Oct 14, 2026</p>
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
            <p className="text-gray-600 text-lg">Daily rate for minimum 2 days and one night. Capacity 8 adults max.</p>
          </motion.div>
          
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
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Included in Price</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
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
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Not Included in Price</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Transfers (on request), national park fees (depending on the itinerary), beer, wine, spirits. Lunch and dinner (Thai cuisine): 500 Baht per person per meal. Please let us know your preferences and we will provision the boat accordingly.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}