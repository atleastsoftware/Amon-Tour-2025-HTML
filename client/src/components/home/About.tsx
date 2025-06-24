import { Link } from "wouter";
import amonTourTeam from "@/assets/amon-tour-team.jpg";

export default function About() {
  return (
    <section id="who-we-are" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Who We Are
            </h2>
            <p className="text-gray-700 mb-4">
              We are Éric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.
            </p>
            <p className="text-gray-700 mb-6">
              From our life here, we created Amon Tour — a small, independent travel agency built on a simple idea: personally welcome our travelers to Krabi and offer them a different way to experience Thailand.
            </p>
            
            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              Deep Local Roots
            </h3>
            <p className="text-gray-700 mb-4">
              We live here year-round, in the heart of the region we love. This close connection to the destination allows us to offer exclusive experiences in Krabi, designed and guided by our team of professional local guides or trusted partners.
            </p>
            <p className="text-gray-700 mb-6">
              You're not booking a generic tour — you're being welcomed, guided, and cared for by people who live here, who know the tides, the seasons, the crowds to avoid, and the hidden gems worth discovering.
            </p>
            


            <h3 className="font-heading font-semibold text-2xl mt-6 mb-3">
              Our Concept
            </h3>
            <p className="text-gray-700 mb-6">
              Combine the warmth and proximity of a local agency in Krabi with the expertise of a tailor-made travel designer for all of Thailand. At Amon Tour, you're supported before, during, and after your trip. You're in contact with real people – a face, a voice, a team – not a call center or an algorithm. We're here, on the ground, to make your trip a seamless, personal, and unforgettable experience.
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
                    href="https://maps.app.goo.gl/fe17kgt89d64kAHs7" 
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
      </div>
    </section>
  );
}
