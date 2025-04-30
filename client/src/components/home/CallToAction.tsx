import { Link } from "wouter";

export default function CallToAction() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
          Ready to discover authentic Thailand?
        </h2>
        <p className="text-white max-w-2xl mx-auto mb-8">
          Book your custom trip now and let our destination experts guide you through this amazing country.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/tours">
            <a className="bg-white text-secondary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-gray-100 transition-colors">
              View All Tours
            </a>
          </Link>
          <Link href="/#contact">
            <a className="bg-primary text-white px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors">
              Contact Us
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
