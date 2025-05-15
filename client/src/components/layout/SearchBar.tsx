import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search,
  MapPin,
  Calendar,
  Users
} from "lucide-react";

export default function SearchBar() {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState({
    category: "Any",
    activity: "Any",
    destination: "Any",
    duration: "Any"
  });

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Rediriger vers la page des tours avec les paramètres de recherche
    navigate('/tours');
  };

  // Mise à jour des paramètres de recherche
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="mx-auto px-4 mt-8 -mb-4">
      <div className="container mx-auto">
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-5xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select 
                id="category"
                name="category"
                className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 h-10"
                value={searchParams.category}
                onChange={handleChange}
              >
                <option>Any</option>
                <option>Adventure</option>
                <option>Cultural</option>
                <option>Nature</option>
                <option>Beach</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="activity" className="text-sm font-medium text-gray-700 mb-2">
                Activity
              </label>
              <select 
                id="activity"
                name="activity"
                className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 h-10"
                value={searchParams.activity}
                onChange={handleChange}
              >
                <option>Any</option>
                <option>Hiking</option>
                <option>Swimming</option>
                <option>Sightseeing</option>
                <option>Food Tour</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="destination" className="text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <select 
                id="destination"
                name="destination"
                className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 h-10"
                value={searchParams.destination}
                onChange={handleChange}
              >
                <option>Any</option>
                <option>North Region</option>
                <option>South Region</option>
                <option>East Region</option>
                <option>West Region</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select 
                id="duration"
                name="duration"
                className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 h-10"
                value={searchParams.duration}
                onChange={handleChange}
              >
                <option>Any</option>
                <option>1 Day</option>
                <option>2-3 Days</option>
                <option>4-7 Days</option>
                <option>1+ Week</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                <Button type="submit" className="w-full bg-primary hover:bg-primary-dark h-10 px-4">
                  <Search className="h-4 w-4 mr-2" />
                  Search Now
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}