import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomTourForm from "@/components/home/CustomTourForm";

export default function CustomTour() {
  return (
    <>
      <Header />
      
      <main>
        {/* Hero */}
        <section className="relative h-[40vh]">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1598977123118-4e4428362d5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Voyage sur mesure en Thaïlande" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
              Créez Votre Voyage Sur Mesure
            </h1>
            <p className="text-lg md:text-xl max-w-2xl">
              Dites-nous ce que vous souhaitez découvrir, nous créerons votre circuit personnalisé.
            </p>
          </div>
        </section>
        
        {/* Why Choose Custom Tour */}
        <section className="py-16 bg-neutral-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                Pourquoi choisir un voyage sur mesure ?
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Un voyage personnalisé offre une expérience unique adaptée à vos envies, votre rythme et votre budget.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-route text-white text-2xl"></i>
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Itinéraire Flexible</h3>
                <p className="text-gray-600 text-center">
                  Choisissez les destinations qui vous intéressent et définissez votre propre rythme de voyage.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-home text-white text-2xl"></i>
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Hébergements Adaptés</h3>
                <p className="text-gray-600 text-center">
                  Sélectionnez les hébergements qui correspondent à vos préférences et à votre budget.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-user-friends text-white text-2xl"></i>
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Accompagnement Personnalisé</h3>
                <p className="text-gray-600 text-center">
                  Bénéficiez des conseils de nos experts et d'un guide francophone pour une expérience authentique.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Custom Tour Form */}
        <CustomTourForm />
      </main>
      
      <Footer />
    </>
  );
}
