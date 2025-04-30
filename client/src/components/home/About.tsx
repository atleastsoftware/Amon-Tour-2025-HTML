import { Link } from "wouter";

export default function About() {
  return (
    <section id="about" className="py-16 bg-neutral-light thai-pattern">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Senthang Siam Tour, Votre Expert de la Thaïlande
            </h2>
            <p className="text-gray-700 mb-4">
              Fondée par des passionnés de la culture thaïlandaise, notre agence s'est spécialisée dans les voyages sur mesure et les expériences authentiques au cœur du Royaume de Siam.
            </p>
            <p className="text-gray-700 mb-4">Notre équipe franco-thaïlandaise vous garantit :</p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>Une connaissance approfondie du pays et de ses trésors cachés</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>Des guides francophones expérimentés et passionnés</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>Des véhicules confortables et climatisés</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>Une flexibilité totale pour adapter votre voyage à vos envies</span>
              </li>
            </ul>
            <div className="flex items-center space-x-4">
              <Link href="/#contact">
                <a className="bg-primary text-white px-6 py-2 rounded font-heading font-semibold hover:bg-primary-dark transition-colors">
                  Contactez-nous
                </a>
              </Link>
              <Link href="/custom-tour">
                <a className="text-primary font-heading font-semibold hover:text-primary-dark transition-colors">
                  Créer votre voyage →
                </a>
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1564843028055-f99851393160?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                alt="Guide local thaïlandais" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                  </div>
                  <span className="font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600">Plus de 500 avis clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
