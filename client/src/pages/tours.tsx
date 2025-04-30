import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TourCard from "@/components/tour/TourCard";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Tours() {
  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  
  const filteredTours = tours?.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tour.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDuration = durationFilter === "" || tour.duration === durationFilter;
    
    return matchesSearch && matchesDuration;
  });
  
  // Get unique durations for the filter
  const uniqueDurations = tours ? Array.from(new Set(tours.map(tour => tour.duration))) : [];
  
  return (
    <>
      <Header />
      
      <main>
        {/* Hero */}
        <section className="relative h-[40vh]">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1580758733867-9638a08cb85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Tours in Thailand" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
              Our Tours
            </h1>
            <p className="text-lg md:text-xl max-w-2xl">
              Discover our selection of tours to explore Thailand at your own pace.
            </p>
          </div>
        </section>
        
        {/* Tours List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="font-heading font-semibold text-xl mb-4">Filter Tours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                </div>
                <div>
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
                      <SelectItem value="">All durations</SelectItem>
                      {uniqueDurations.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse">
                    <div className="h-56 bg-gray-300"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTours && filteredTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tours match your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
