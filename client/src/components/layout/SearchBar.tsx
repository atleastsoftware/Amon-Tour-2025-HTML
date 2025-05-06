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
  const [isSticky, setIsSticky] = useState(false);
  const [searchParams, setSearchParams] = useState({
    destination: "",
    dates: "",
    travelers: ""
  });

  // Déterminer quand la barre de recherche doit devenir fixe
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setIsSticky(heroBottom <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Rediriger vers la page des tours avec les paramètres de recherche
    navigate('/tours');
  };

  // Mise à jour des paramètres de recherche
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      {/* Barre de recherche normale */}
      <div className="relative -mt-10 z-20 mb-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className={`bg-white rounded-lg shadow-xl p-4 md:p-6 transition-all duration-300`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="destination"
                    name="destination"
                    type="text"
                    placeholder="Where do you want to go?"
                    className="pl-10"
                    value={searchParams.destination}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label htmlFor="dates" className="block text-sm font-medium text-gray-700 mb-1">
                  Dates
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="dates"
                    name="dates"
                    type="text"
                    placeholder="When do you plan to travel?"
                    className="pl-10"
                    value={searchParams.dates}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-1">
                  Travelers
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="travelers"
                    name="travelers"
                    type="text"
                    placeholder="How many travelers?"
                    className="pl-10"
                    value={searchParams.travelers}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary-dark h-10 px-8">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      
      {/* Barre de recherche fixe */}
      <AnimatePresence>
        {isSticky && (
          <motion.div 
            className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md py-3"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4">
              <form onSubmit={handleSubmit} className="flex flex-row items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      name="destination"
                      type="text"
                      placeholder="Where do you want to go?"
                      className="pl-10 h-9 py-1"
                      value={searchParams.destination}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      name="dates"
                      type="text"
                      placeholder="When do you plan to travel?"
                      className="pl-10 h-9 py-1"
                      value={searchParams.dates}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      name="travelers"
                      type="text"
                      placeholder="How many travelers?"
                      className="pl-10 h-9 py-1"
                      value={searchParams.travelers}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button type="submit" className="bg-primary hover:bg-primary-dark h-9 px-6">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </motion.div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}