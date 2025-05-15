import { Link } from "wouter";
import amonTourTeam from "@/assets/amon-tour-team.jpg";

export default function About() {
  return (
    <section id="about" className="py-16 bg-neutral-light thai-pattern">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Amon Tour: The Concept
            </h2>
            <p className="text-gray-700 mb-4">
              Eric, Margaux, Gabriel, and Raphaël - we are a French family relocated to Krabi in southern Thailand for nearly 10 years. In addition to organizing your vacation and welcoming you, we accompany you on your excursions. We work closely with our local partners to guarantee optimal service. We also offer our insider tips for other destinations in Thailand, including Koh Mook and Khao Sok.
            </p>
            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              Private French-Speaking Tours in Krabi
            </h3>
            <p className="text-gray-700 mb-4">
              Private French-speaking tours in Krabi are the most exclusive way to discover the wonders of the Krabi region.
            </p>
            <h3 className="font-heading font-semibold text-xl mt-5 mb-3">
              Margaux and Eric invite you on vacation!
            </h3>
            <p className="text-gray-700 mb-6">
              With our private French-speaking tours in Krabi, you'll experience Amon Tour's very special excursions. All these programs have been designed to discover the natural masterpieces of the region from Krabi, far from mass tourism and accompanied by French locals. Eric and Margaux offer private French-speaking tours in Krabi and will join you during these unforgettable days. We have prepared 3 sea excursions (including one that's customizable), 3 land excursions, a sunset kayak tour, and even a surprise tour for those who love adventure! These day tours are the result of our experience and knowledge of these sites that we particularly love.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://wa.me/66653496445" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="bg-primary text-white px-6 py-2 rounded font-heading font-semibold hover:bg-primary-dark transition-colors cursor-pointer flex items-center">
                  <i className="fab fa-whatsapp mr-2"></i>
                  Contact Us
                </span>
              </a>
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
                src={amonTourTeam} 
                alt="Amon Tour team with clients on a beautiful Thai beach" 
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
                <p className="text-sm text-gray-600">80 reviews on Google</p>
                <a 
                  href="https://www.google.com/search?q=%E0%B8%AD%E0%B8%A1%E0%B8%A3%E0%B8%97%E0%B8%B1%E0%B8%A7%E0%B8%A3%E0%B9%8C+Reviews" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  See all reviews
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
