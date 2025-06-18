import { Link } from "wouter";
import amonTourTeam from "@/assets/amon-tour-team.jpg";

export default function About() {
  return (
    <section id="about" className="py-16 bg-neutral-light thai-pattern">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Family Photo */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="relative mb-6">
              <img 
                src="/family-founders.png" 
                alt="Éric, Margaux, Gabriel, and Raphaël - the founders family" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600 italic">
                  We are Éric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.
                </p>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="lg:col-span-1 order-3 lg:order-2">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Who We Are
            </h2>
            
            <h3 className="font-heading font-semibold text-xl mb-3">
              Deep Local Roots
            </h3>
            <p className="text-gray-700 mb-4">
              We live here year-round, in the heart of the region we love. This close connection to the destination allows us to offer exclusive experiences in Krabi, designed and guided by our team of professional local guides or trusted partners.
            </p>
            <p className="text-gray-700 mb-6">
              You're not booking a generic tour — you're being welcomed, guided, and cared for by people who live here, who know the tides, the seasons, the crowds to avoid, and the hidden gems worth discovering.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
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
          
          {/* Team Photo */}
          <div className="lg:col-span-1 order-2 lg:order-3">
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
