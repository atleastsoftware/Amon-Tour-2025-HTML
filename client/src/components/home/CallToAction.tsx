import { Link } from "wouter";

export default function CallToAction() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
          Prêt à découvrir la Thaïlande authentique ?
        </h2>
        <p className="text-white max-w-2xl mx-auto mb-8">
          Réservez dès maintenant votre voyage sur mesure et laissez-vous guider par nos experts de la destination.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/tours">
            <a className="bg-white text-secondary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-gray-100 transition-colors">
              Voir tous nos circuits
            </a>
          </Link>
          <Link href="/#contact">
            <a className="bg-primary text-white px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors">
              Contactez-nous
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
