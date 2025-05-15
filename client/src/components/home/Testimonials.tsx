import { useEffect, useRef } from "react";

export default function Testimonials() {
  const googleReviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pour charger le widget Google reviews
    const script = document.createElement('script');
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Nettoyer lors du démontage du composant
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Avis de nos voyageurs</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
          <p className="max-w-2xl mx-auto">Découvrez les expériences authentiques de nos clients lors de leurs voyages avec Amon Tour en Thaïlande.</p>
        </div>
        
        {/* Google Reviews Widget */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-10">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <i className="fas fa-star text-yellow-400 text-2xl mx-1"></i>
              <i className="fas fa-star text-yellow-400 text-2xl mx-1"></i>
              <i className="fas fa-star text-yellow-400 text-2xl mx-1"></i>
              <i className="fas fa-star text-yellow-400 text-2xl mx-1"></i>
              <i className="fas fa-star text-yellow-400 text-2xl mx-1"></i>
            </div>
            <h3 className="text-primary font-heading font-bold text-2xl">5.0 sur Google</h3>
            <p className="text-gray-600">Basé sur 80 avis</p>
          </div>
          
          {/* Widget Google Reviews */}
          <div className="elfsight-app-reviews-google" ref={googleReviewsRef}>
            {/* Widget se chargera ici */}
            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto py-4">
              {/* Exemple d'avis préchargé en attendant le chargement du widget */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-shrink-0 w-full md:w-1/3">
                <div className="flex mb-2">
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                </div>
                <p className="italic text-gray-600 text-sm mb-2">
                  "Nous avons passé 2 jours formidables avec Eric et Margaux qui nous ont fait découvrir des endroits merveilleux. Une expérience unique et authentique..."
                </p>
                <div className="flex items-center mt-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                    <span>S</span>
                  </div>
                  <span className="text-gray-800 font-medium text-sm">Sophie L.</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-shrink-0 w-full md:w-1/3">
                <div className="flex mb-2">
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                </div>
                <p className="italic text-gray-600 text-sm mb-2">
                  "Les explications en français, le repas thai dans un endroit local, les paysages magnifiques et l'accueil chaleureux d'Éric et Margaux, tout était parfait !"
                </p>
                <div className="flex items-center mt-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                    <span>P</span>
                  </div>
                  <span className="text-gray-800 font-medium text-sm">Pierre M.</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-shrink-0 w-full md:w-1/3">
                <div className="flex mb-2">
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                </div>
                <p className="italic text-gray-600 text-sm mb-2">
                  "Une journée inoubliable, tout était parfait. Nous avons découvert des endroits magnifiques loin des foules de touristes. Merci à Éric et Margaux pour leur gentillesse..."
                </p>
                <div className="flex items-center mt-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                    <span>F</span>
                  </div>
                  <span className="text-gray-800 font-medium text-sm">Famille M.</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <a 
              href="https://www.google.com/search?q=%E0%B8%AD%E0%B8%A1%E0%B8%A3%E0%B8%97%E0%B8%B1%E0%B8%A7%E0%B8%A3%E0%B9%8C+Reviews" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center"
            >
              <span>Voir tous les avis sur Google</span>
              <i className="fas fa-external-link-alt ml-2 text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
