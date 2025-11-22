import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/contexts/TranslationContext";

export default function TermsConditions() {
  const { translations, currentLanguage } = useTranslation();
  const pageData = translations.text_section_369 || {};
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{pageData.title || 'Terms & Conditions'} | Amon Tour</title>
        <meta 
          name="description" 
          content="Terms and conditions for booking and using services offered by Amon Tour." 
        />
        <html lang={currentLanguage} />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">
            {pageData.title || 'Terms & Conditions'}
          </h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: pageData.description || '' }}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
