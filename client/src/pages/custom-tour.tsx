import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import CustomTourForm from "@/components/home/CustomTourForm";
import { MapPin, Building2, HeadphonesIcon } from "lucide-react";

export default function CustomTour() {
  return (
    <>
      <SEO 
        title="Create Your Custom Thailand Experience"
        description="Design your own personalized Thailand tour. Tell us your preferences, and our local experts will craft a customized itinerary just for you."
        keywords="custom thailand tour, personalized travel, tailor-made itinerary, private guide thailand, custom travel experience"
      />
      <Header />
      
      <main>
        {/* Hero */}
        <HeroHeader 
          title="Create Your Custom Tour"
          subtitle="Tell us what you'd like to discover, and we'll create your personalized itinerary."
          alt="Customized tour in Thailand"
        />
        
        {/* Why Choose Custom Tour */}
        <section className="py-16 bg-neutral-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                Why Choose a Custom Tour?
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A personalized journey offers a unique experience tailored to your desires, pace, and budget.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Flexible Itinerary</h3>
                <p className="text-gray-600 text-center">
                  Choose the destinations that interest you and set your own travel pace.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Building2 className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Tailored Accommodations</h3>
                <p className="text-gray-600 text-center">
                  Select accommodations that match your preferences and budget.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <HeadphonesIcon className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Personalized Support</h3>
                <p className="text-gray-600 text-center">
                  Benefit from expert advice and an English-speaking guide for an authentic experience.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Custom Tour Form */}
        <CustomTourForm />
      </main>
      
      <Footer />
    </>
  );
}
