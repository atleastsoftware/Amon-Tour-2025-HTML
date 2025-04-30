import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative h-[70vh]">
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1679&q=80" 
          alt="Temples de Thaïlande" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-4 max-w-3xl">
          Découvrez la Thaïlande Authentique avec Senthang Siam Tour
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8">
          Voyages personnalisés, tours privés, et expériences authentiques au cœur du Royaume de Siam.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/tours">
            <a className="bg-primary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors">
              Découvrir nos tours
            </a>
          </Link>
          <Link href="/custom-tour">
            <a className="bg-secondary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-secondary-dark transition-colors">
              Voyage sur mesure
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
