import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import CustomTourForm from "@/components/home/CustomTourFormNew";
import { MapPin, Building2, HeadphonesIcon } from "lucide-react";

export default function CustomTourFormPage() {
  return (
    <>
      <SEO 
        title="Custom Tour Request Form - Amon Tour"
        description="Fill out our detailed form to request a personalized Thailand tour. Our local experts will create a customized itinerary just for you."
        keywords="custom thailand tour form, personalized travel request, tailor-made itinerary, private guide thailand"
      />
      <Header />
      
      <main>
        {/* Hero */}
        <section className="relative h-[40vh]">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src="/uploads/tours/tour-1745996624172-231261635.jpeg" 
              alt="Customized tour in Thailand" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
              Alternative Booking Form
            </h1>
            <p className="text-lg md:text-xl max-w-2xl">
              Use our detailed form to request your personalized Thai adventure.
            </p>
          </div>
        </section>
        
        {/* Info Section */}
        <section className="py-12 bg-blue-50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">
                Alternative Booking Method
              </h2>
              <p className="text-gray-600 mb-6">
                If you prefer a traditional form or if our Tour Ninja booking widget isn't loading properly, 
                you can use this detailed form to request your custom tour. We'll get back to you within 24-48 hours.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200 inline-block">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Try our{' '}
                  <a href="/custom-tour" className="text-blue-600 hover:text-blue-700 underline">
                    advanced booking widget
                  </a>{' '}
                  for a more interactive experience!
                </p>
              </div>
            </div>
          </div>
        </section>
        
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