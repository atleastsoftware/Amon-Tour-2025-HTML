import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import CustomTourForm from "@/components/home/CustomTourForm";
import { MapPin, Building2, HeadphonesIcon } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function CustomTour() {
  const { t } = useTranslation();
  
  return (
    <>
      <SEO 
        title={t('customTour.seoTitle')}
        description={t('customTour.seoDescription')}
        keywords={t('customTour.seoKeywords')}
      />
      <Header />
      
      <main>
        {/* Hero */}
        <HeroHeader 
          title={t('customTour.title')}
          subtitle={t('customTour.subtitle')}
          alt="Customized tour in Thailand"
        />
        
        {/* Why Choose Custom Tour */}
        <section className="py-20 bg-neutral-light">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="mb-8">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                {t('customTour.whyChoose')}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t('customTour.whyChooseDescription')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">{t('customTour.flexibleItinerary')}</h3>
                <p className="text-gray-600 text-center">
                  {t('customTour.flexibleItineraryDescription')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Building2 className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">{t('customTour.tailoredAccommodations')}</h3>
                <p className="text-gray-600 text-center">
                  {t('customTour.tailoredAccommodationsDescription')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <HeadphonesIcon className="text-white w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">{t('customTour.personalizedSupport')}</h3>
                <p className="text-gray-600 text-center">
                  {t('customTour.personalizedSupportDescription')}
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
                {t('home.tailorMadeTitle')}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t('home.tailorMadeDescription')}
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
