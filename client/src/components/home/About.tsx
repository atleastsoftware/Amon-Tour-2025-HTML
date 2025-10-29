import { Link } from "wouter";
import amonTourTeam from "@/assets/amon-tour-team.jpg";
import { useTranslation } from "@/contexts/TranslationContext";

export default function About() {
  const { translations } = useTranslation();
  const home = translations.home;
  
  return (
    <section id="who-we-are" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              {home.whoWeAreTitle}
            </h2>
            <p className="text-muted-foreground mb-4">
              {home.whoWeAreDescription}
            </p>
            <p className="text-muted-foreground mb-6">
              {home.whoWeAreStory}
            </p>
            
            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              {home.deepLocalRootsTitle}
            </h3>
            <p className="text-muted-foreground mb-4">
              {home.deepLocalRootsDescription}
            </p>
            <p className="text-muted-foreground mb-6">
              {home.deepLocalRootsExplanation}
            </p>
            


            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              {home.ourConceptTitle}
            </h3>
            <p className="text-muted-foreground mb-6">
              {home.ourConceptDescription}
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://wa.me/66653496445" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="bg-primary text-white px-6 py-2 rounded font-heading font-semibold hover:bg-primary-dark transition-colors cursor-pointer flex items-center">
                  <i className="fab fa-whatsapp mr-2"></i>
                  {home.contactUs}
                </span>
              </a>
              <Link href="/custom-tour">
                <span className="text-primary font-heading font-semibold hover:text-primary-dark transition-colors cursor-pointer">
                  {home.createYourJourney} →
                </span>
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              {/* Family Photo */}
              <div className="relative">
                <img 
                  src="/family-photo.png" 
                  alt="Amon Tour family - Éric, Margaux, Gabriel, and Raphaël on a Thai beach" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              
              {/* Team Photo */}
              <div className="relative">
                <img 
                  src={amonTourTeam} 
                  alt="Amon Tour team with clients on a beautiful Thai beach" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      <i className="fas fa-star text-secondary"></i>
                      <i className="fas fa-star text-secondary"></i>
                      <i className="fas fa-star text-secondary"></i>
                      <i className="fas fa-star text-secondary"></i>
                      <i className="fas fa-star text-secondary"></i>
                    </div>
                    <span className="font-semibold">5.0/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground/80">{home.basedOnReviews}</p>
                  <a 
                    href="https://maps.app.goo.gl/fe17kgt89d64kAHs7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    {translations.common.viewDetails}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
