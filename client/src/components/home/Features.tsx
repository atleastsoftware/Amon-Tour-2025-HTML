export default function Features() {
  return (
    <section className="py-16 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-user-check text-white text-2xl"></i>
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Tours Privés</h3>
            <p className="text-gray-600">Vivez une expérience unique avec nos guides francophones et nos véhicules privés.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-map-marked-alt text-white text-2xl"></i>
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Circuits Personnalisés</h3>
            <p className="text-gray-600">Créez votre propre itinéraire selon vos envies, votre rythme et vos centres d'intérêt.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-heart text-white text-2xl"></i>
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Expériences Authentiques</h3>
            <p className="text-gray-600">Découvrez la Thaïlande loin des sentiers battus et immergez-vous dans la culture locale.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
