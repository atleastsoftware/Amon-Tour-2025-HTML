import { Link } from "wouter";

export default function About() {
  return (
    <section id="about" className="py-16 bg-neutral-light thai-pattern">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Amon Tour: Le concept
            </h2>
            <p className="text-gray-700 mb-4">
              Eric, Margaux Gabriel et Raphaël nous sommes une famille française délocalisée à Krabi dans le sud de la Thaïlande depuis près de 10ans. En plus d'organiser vos vacances et de vous accueillir, nous vous accompagnons dans vos excursions. Nous faisons le lien avec nos partenaires locaux pour une garantie de service optimum. Nous vous offrons également nos bons plans vers d'autres destinations en Thaïlande dont Koh Mook et Khao Sok.
            </p>
            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              Tours privés francophones à Krabi
            </h3>
            <p className="text-gray-700 mb-4">
              Tours privés francophones à Krabi est la façon la plus exclusive de découvrir les merveilles de la région de Krabi.
            </p>
            <h3 className="font-heading font-semibold text-xl mt-5 mb-3">
              Margaux et Eric vous invitent en vacances!!
            </h3>
            <p className="text-gray-700 mb-6">
              Vous retrouvez dans nos tours privés francophone à Krabi les excursions très spéciales d'Amon Tour. Tous ces programmes ont été conçu pour découvrir les chefs d'oeuvre naturelles de la region au départ de Krabi, loin du tourisme de masse bien sûr mais également en étant accompagner par des Français vivant sur place. En effet Eric et Margaux vous offrent des tours privés francophones à Krabi et se joindront à vous lors de ces journées inoubliables. Nous vous avons concoctés 3 sorties en mer (dont une personnalisable), 3 excursions terrestres, un tour en kayak au couché du soleil et même un tour surprise pour ceux qui aiment l'aventure! Ces tours à la journée sont le fruit de notre expérience, de notre connaissance de ces sites que nous aimons particulièrement.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/#contact">
                <span className="bg-primary text-white px-6 py-2 rounded font-heading font-semibold hover:bg-primary-dark transition-colors cursor-pointer">
                  Contactez-nous
                </span>
              </Link>
              <Link href="/custom-tour">
                <span className="text-primary font-heading font-semibold hover:text-primary-dark transition-colors cursor-pointer">
                  Créer votre voyage →
                </span>
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1490077476659-095159692ab5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80" 
                alt="Magnifique plage thaïlandaise - Amon Tour" 
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
                  <span className="font-semibold">5.0/5</span>
                </div>
                <p className="text-sm text-gray-600">80 avis sur Google</p>
                <a 
                  href="https://www.google.com/search?q=%E0%B8%AD%E0%B8%A1%E0%B8%A3%E0%B8%97%E0%B8%B1%E0%B8%A7%E0%B8%A3%E0%B9%8C+Reviews" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  Voir tous les avis
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
