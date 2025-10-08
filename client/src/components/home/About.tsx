import { Link } from "wouter";
import amonTourTeam from "@/assets/amon-tour-team.jpg";
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language?.startsWith('en');
  
  // Original English texts from production
  const originalTexts = {
    whoWeAreTitle: "When expats welcome you in their host country",
    whoWeAreDescription: "Since 2013, our family-run travel agency has been curating exclusive activities around Krabi and designing tailor-made trips all across Thailand. We aim to deliver immersive travel experiences, away from mass tourism, with personalized service for every traveler — welcoming you as part of our family or close friends.",
    whoWeAreStory: "Our exclusive experiences",
    deepLocalRootsTitle: "Our exclusive experiences",
    deepLocalRootsDescription: "Explore our finest experiences in Krabi, all guaranteed off the beaten path: private and semi-private sea tours, unique land excursions (kayaking through mangroves, waterfalls, tropical jungle, centuries-old trees, temples, karst caves, natural pools), and exclusive 2-day / 1-night packages.",
    contactUs: "Contact us",
    createYourJourney: "Create your journey",
    basedOnReviews: "Based on reviews",
    seeAllReviews: "See all reviews"
  };
  
  return (
    <section id="who-we-are" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              {isEN ? originalTexts.whoWeAreTitle : t('about.whoWeAreTitle')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isEN ? originalTexts.whoWeAreDescription : t('about.whoWeAreDescription')}
            </p>
            <p className="text-muted-foreground mb-6">
              {isEN ? originalTexts.whoWeAreStory : t('about.whoWeAreStory')}
            </p>
            
            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              {isEN ? originalTexts.deepLocalRootsTitle : t('about.deepLocalRootsTitle')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isEN ? originalTexts.deepLocalRootsDescription : t('about.deepLocalRootsDescription')}
            </p>
            <p className="text-muted-foreground mb-6">
              {/* Texte spécifique pour FR/ES uniquement */}
              {isEN ? "" : t('about.deepLocalRootsExplanation')}
            </p>
            


            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              {t('about.ourConceptTitle')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('about.ourConceptDescription')}
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://wa.me/66653496445" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="bg-primary text-white px-6 py-2 rounded font-heading font-semibold hover:bg-primary-dark transition-colors cursor-pointer flex items-center">
                  <i className="fab fa-whatsapp mr-2"></i>
                  {isEN ? originalTexts.contactUs : t('about.contactUs')}
                </span>
              </a>
              <Link href="/custom-tour">
                <span className="text-primary font-heading font-semibold hover:text-primary-dark transition-colors cursor-pointer">
                  {isEN ? originalTexts.createYourJourney : t('about.createYourJourney')} →
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
                  <p className="text-sm text-muted-foreground/80">{t('about.basedOnReviews')}</p>
                  <a 
                    href="https://maps.app.goo.gl/fe17kgt89d64kAHs7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
{t('about.seeAllReviews')}
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
