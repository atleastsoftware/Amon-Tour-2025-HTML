import { useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
export default function Testimonials() {
  const {
    t
  } = useTranslation();
  const googleReviewsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // To load the Google reviews widget
    const script = document.createElement('script');
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      // Clean up when component unmounts
      document.body.removeChild(script);
    };
  }, []);
  return <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{t('testimonials.title')}</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
          <p className="max-w-2xl mx-auto">{t('testimonials.description')}</p>
        </div>
        
        {/* Google Reviews Widget */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-10">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <i className="fas fa-star text-[hsl(var(--star))] text-2xl mx-1"></i>
              <i className="fas fa-star text-[hsl(var(--star))] text-2xl mx-1"></i>
              <i className="fas fa-star text-[hsl(var(--star))] text-2xl mx-1"></i>
              <i className="fas fa-star text-[hsl(var(--star))] text-2xl mx-1"></i>
              <i className="fas fa-star text-[hsl(var(--star))] text-2xl mx-1"></i>
            </div>
            <h3 className="text-primary font-heading font-bold text-2xl">{t("50ongoogle", {
              defaultValue: "50ongoogle"
            })}</h3>
            <p className="text-muted-foreground">{t('home.basedOnReviews')}</p>
          </div>
          
          {/* Google Reviews Widget */}
          <div className="elfsight-app-reviews-google" ref={googleReviewsRef}>
            {/* Widget will load here */}
            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto py-4">
              {/* Example of preloaded reviews while waiting for widget to load */}
              <div className="bg-muted/30 p-4 rounded-lg shadow-sm flex-shrink-0 w-full md:w-1/3">
                <div className="flex mb-2">
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                </div>
                <p className="italic text-muted-foreground text-sm mb-2">{t('"We spent 2 wonderful days with Eric and Margaux who showed us amazing places. A unique and authentic experience..."', {
                  defaultValue: '"We spent 2 wonderful days with Eric and Margaux who showed us amazing places. A unique and authentic experience..."'
                })}</p>
                <div className="flex items-center mt-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                    <span>S</span>
                  </div>
                  <span className="text-foreground font-medium text-sm">{t("Sophiel", {
                    defaultValue: "Sophiel"
                  })}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg shadow-sm flex-shrink-0 w-full md:w-1/3">
                <div className="flex mb-2">
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                </div>
                <p className="italic text-muted-foreground text-sm mb-2">{t('"The French explanations, the Thai meal in a local spot, the magnificent landscapes and the warm welcome from Eric and Margaux, everything was perfect!"', {
                  defaultValue: '"The French explanations, the Thai meal in a local spot, the magnificent landscapes and the warm welcome from Eric and Margaux, everything was perfect!"'
                })}</p>
                <div className="flex items-center mt-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                    <span>P</span>
                  </div>
                  <span className="text-foreground font-medium text-sm">{t("Pierrem", {
                    defaultValue: "Pierrem"
                  })}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg shadow-sm flex-shrink-0 w-full md:w-1/3">
                <div className="flex mb-2">
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                  <i className="fas fa-star text-[hsl(var(--star))]"></i>
                </div>
                <p className="italic text-muted-foreground text-sm mb-2">{t('"An unforgettable day, everything was perfect. We discovered beautiful places away from the tourist crowds. Thanks to Eric and Margaux for their kindness..."', {
                  defaultValue: '"An unforgettable day, everything was perfect. We discovered beautiful places away from the tourist crowds. Thanks to Eric and Margaux for their kindness..."'
                })}</p>
                <div className="flex items-center mt-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                    <span>F</span>
                  </div>
                  <span className="text-foreground font-medium text-sm">{t("Martin Family", {
                    defaultValue: "Martin Family"
                  })}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <a href="https://maps.app.goo.gl/fe17kgt89d64kAHs7" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center">
              <span>{t('footer.viewAllReviews')}</span>
              <i className="fas fa-external-link-alt ml-2 text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </section>;
}