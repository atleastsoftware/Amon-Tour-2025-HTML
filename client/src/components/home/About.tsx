import { Link } from "wouter";

export default function About() {
  return (
    <section id="about" className="py-16 bg-neutral-light thai-pattern">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Senthang Siam Tour, Your Thailand Expert
            </h2>
            <p className="text-gray-700 mb-4">
              Founded by passionate enthusiasts of Thai culture, our agency specializes in custom tours and authentic experiences in the heart of the Kingdom of Siam.
            </p>
            <p className="text-gray-700 mb-4">Our French-Thai team guarantees you:</p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>In-depth knowledge of the country and its hidden treasures</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>Experienced and passionate English-speaking guides</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>Comfortable air-conditioned vehicles</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span>Complete flexibility to adapt your journey to your desires</span>
              </li>
            </ul>
            <div className="flex items-center space-x-4">
              <Link href="/#contact">
                <span className="bg-primary text-white px-6 py-2 rounded font-heading font-semibold hover:bg-primary-dark transition-colors cursor-pointer">
                  Contact Us
                </span>
              </Link>
              <Link href="/custom-tour">
                <span className="text-primary font-heading font-semibold hover:text-primary-dark transition-colors cursor-pointer">
                  Create Your Journey →
                </span>
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1564843028055-f99851393160?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                alt="Local Thai guide" 
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
                <p className="text-sm text-gray-600">Over 500 customer reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
