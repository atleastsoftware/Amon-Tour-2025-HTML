import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import CustomTourForm from "@/components/home/CustomTourForm";
import { MapPin, Building2, HeadphonesIcon } from "lucide-react";
import { translationService } from "@/services/translationService";

export default function CustomTour() {
  const customTour = translationService.getCustomTour();
  
  return (
    <>
      <SEO 
        title={customTour.seoTitle}
        description={customTour.seoDescription}
        keywords={customTour.seoKeywords}
      />
      <Header />
      
      <main>
        {/* Hero */}
        <HeroHeader 
          title={customTour.title}
          subtitle={customTour.subtitle}
          alt="Customized tour in Thailand"
        />
        
        {/* Why Choose Custom Tour */}
        <section className="py-20 bg-neutral-light">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="mb-8">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                {customTour.whyChoose}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {customTour.whyChooseDescription}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">{customTour.flexibleItinerary}</h3>
                <p className="text-gray-600 text-center">
                  {customTour.flexibleItineraryDescription}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Building2 className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">{customTour.tailoredAccommodations}</h3>
                <p className="text-gray-600 text-center">
                  {customTour.tailoredAccommodationsDescription}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <HeadphonesIcon className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">{customTour.personalizedSupport}</h3>
                <p className="text-gray-600 text-center">
                  {customTour.personalizedSupportDescription}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Tailor-made trips */}
        <section className="pt-20 pb-8 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="mb-8">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                Our Tailor-made trips
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Design your own journey through Thailand with our tailor-made stays: from cultural discoveries and family adventures to romantic getaways and island escapes. Every itinerary is crafted to match your wishes, offering authentic experiences, quality services, and a unique immersion far from mass tourism.
              </p>
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
