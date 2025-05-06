import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TourCard from "@/components/tour/TourCard";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  FadeInWhenVisible, 
  SlideUpWhenVisible,
  StaggerChildren,
  StaggerItem 
} from "@/components/ui/animations";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Image is loaded from URL directly

export default function Tours() {
  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // Define Thailand regions
  const regions = {
    "all": "All Thailand",
    "north": "Northern Thailand",
    "central": "Central Thailand",
    "east": "Eastern Thailand",
    "south": "Southern Thailand",
    "islands": "Thai Islands",
    "bangkok": "Bangkok Area"
  };
  
  // Function to determine which region a tour belongs to
  const getTourRegion = (tour: Tour) => {
    const title = tour.title.toLowerCase();
    const desc = tour.description.toLowerCase();
    
    if (title.includes("chiang") || title.includes("pai") || 
        desc.includes("chiang mai") || desc.includes("golden triangle")) {
      return "north";
    } else if (title.includes("phuket") || title.includes("krabi") || 
               title.includes("island") || title.includes("phi phi")) {
      return "islands";
    } else if (title.includes("bangkok") || desc.includes("bangkok")) {
      return "bangkok";
    } else if (title.includes("pattaya") || title.includes("rayong")) {
      return "east";
    } else if (title.includes("hua hin") || title.includes("ayutthaya")) {
      return "central";
    } else if (title.includes("samui") || title.includes("phangan") || 
               title.includes("south")) {
      return "south";
    }
    
    return "all";
  };
  
  const filteredTours = tours?.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tour.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDuration = durationFilter === "all" || tour.duration === durationFilter;
    
    const tourRegion = getTourRegion(tour);
    const matchesRegion = regionFilter === "all" || tourRegion === regionFilter;
    const matchesTab = activeTab === "all" || tourRegion === activeTab;
    
    return matchesSearch && matchesDuration && matchesRegion && matchesTab;
  });
  
  // Get unique durations for the filter
  const uniqueDurations = tours ? Array.from(new Set(tours.map(tour => tour.duration))) : [];
  
  // Group tours by region for horizontal scrolling sections
  const toursByRegion = tours?.reduce((acc, tour) => {
    const region = getTourRegion(tour);
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(tour);
    return acc;
  }, {} as Record<string, Tour[]>);
  
  return (
    <>
      <Header />
      
      <main>
        {/* Hero */}
        <section className="relative h-[40vh]">
          <motion.div 
            className="absolute inset-0 bg-black/40 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          ></motion.div>
          <div className="absolute inset-0 z-0">
            <motion.img 
              src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1739&q=80" 
              alt="Thai Island Paradise" 
              className="w-full h-full object-cover"
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <StaggerChildren className="flex flex-col items-center">
              <StaggerItem>
                <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
                  Our Tours
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="text-lg md:text-xl max-w-2xl">
                  Discover our selection of tours to explore Thailand at your own pace.
                </p>
              </StaggerItem>
            </StaggerChildren>
          </div>
        </section>
        
        {/* Tours List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SlideUpWhenVisible>
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-md mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading font-semibold text-xl mb-4">Filter Tours</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <Select
                      value={regionFilter}
                      onValueChange={setRegionFilter}
                    >
                      <SelectTrigger id="region">
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(regions).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <Select
                      value={durationFilter}
                      onValueChange={setDurationFilter}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="All durations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All durations</SelectItem>
                        {uniqueDurations.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>
              </motion.div>
            </SlideUpWhenVisible>
            
            {/* Region tabs */}
            <div className="mb-8">
              <motion.div
                className="flex flex-wrap border-b border-gray-200 overflow-x-auto scrollbar-hide pb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {Object.entries(regions).map(([key, label]) => (
                  <motion.button
                    key={key}
                    className={`px-4 py-2 mr-2 mb-2 rounded-t-lg font-medium transition-colors text-sm md:text-base relative
                      ${activeTab === key 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab(key)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {label}
                    {activeTab === key && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeTab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </div>
            
            {isLoading ? (
              <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <StaggerItem key={i}>
                    <motion.div 
                      className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="h-56 bg-gray-300"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : filteredTours && filteredTours.length > 0 ? (
              <StaggerChildren 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredTours.map((tour) => (
                  <StaggerItem key={tour.id}>
                    <TourCard tour={tour} />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-500">No tours match your criteria.</p>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
