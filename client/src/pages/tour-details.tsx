import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Clock, Euro } from "lucide-react";

export default function TourDetails() {
  const { id } = useParams();
  const tourId = parseInt(id);
  
  const { data: tour, isLoading, error } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
    enabled: !isNaN(tourId),
  });
  
  if (isNaN(tourId)) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-heading font-bold text-2xl mb-4">Erreur</h1>
          <p className="mb-6">Identifiant de tour invalide.</p>
          <Link href="/tours">
            <a className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
              Retour aux tours
            </a>
          </Link>
        </div>
        <Footer />
      </>
    );
  }
  
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-80 bg-gray-300 rounded mb-6"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error || !tour) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-heading font-bold text-2xl mb-4">Tour introuvable</h1>
          <p className="mb-6">Le tour que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link href="/tours">
            <a className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
              Retour aux tours
            </a>
          </Link>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      
      <main>
        {/* Tour Hero */}
        <section className="relative h-[50vh]">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src={tour.imageUrl} 
              alt={tour.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-end pb-16 text-white">
            <Link href="/tours">
              <a className="flex items-center text-white hover:text-secondary mb-4 transition-colors">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Retour aux tours
              </a>
            </Link>
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-2">
              {tour.title}
            </h1>
            <div className="flex flex-wrap gap-4 items-center mt-2">
              <span className="bg-primary text-white px-3 py-1 rounded-full flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> {tour.duration}
              </span>
              <span className="bg-primary text-white px-3 py-1 rounded-full flex items-center">
                <Euro className="h-4 w-4 mr-1" /> À partir de {tour.price}€
              </span>
            </div>
          </div>
        </section>
        
        {/* Tour Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="font-heading font-semibold text-2xl mb-4">Description du Tour</h2>
                  <p className="text-gray-700 whitespace-pre-line mb-8">{tour.description}</p>
                  
                  <h3 className="font-heading font-semibold text-xl mb-3">Points forts du circuit</h3>
                  <div className="flex flex-col gap-2 mb-8">
                    {tour.description.split('.').slice(0, 4).map((point, index) => (
                      point.trim() && (
                        <div key={index} className="flex items-start">
                          <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                          <span>{point.trim()}.</span>
                        </div>
                      )
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <a 
                      href={tour.tourNinjaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-secondary text-white px-6 py-3 rounded-lg font-heading font-semibold hover:bg-secondary-dark transition-colors inline-block"
                    >
                      Réserver sur TOUR NINJA
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="font-heading font-semibold text-xl mb-4">Informations</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      <span>Durée: {tour.duration}</span>
                    </li>
                    <li className="flex items-center">
                      <Euro className="h-5 w-5 text-primary mr-2" />
                      <span>Prix: À partir de {tour.price}€ par personne</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="h-5 w-5 text-primary mr-2" />
                      <span>Type: Tour privé</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-language text-primary mr-2"></i>
                      <span>Guide: Francophone</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-heading font-semibold text-xl mb-4">Vous avez des questions ?</h3>
                  <p className="text-gray-700 mb-4">Contactez-nous pour plus d'informations sur ce circuit ou pour créer votre voyage sur mesure.</p>
                  <div className="space-y-3">
                    <Link href="/#contact">
                      <a className="w-full bg-primary text-white py-2 px-4 rounded text-center block hover:bg-primary-dark transition-colors">
                        Nous contacter
                      </a>
                    </Link>
                    <Link href="/custom-tour">
                      <a className="w-full bg-secondary text-white py-2 px-4 rounded text-center block hover:bg-secondary-dark transition-colors">
                        Voyage sur mesure
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
