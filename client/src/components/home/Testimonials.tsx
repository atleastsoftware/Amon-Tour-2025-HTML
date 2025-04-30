export default function Testimonials() {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Ce que disent nos voyageurs</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
          <p className="max-w-2xl mx-auto">Découvrez les expériences vécues par nos clients lors de leurs voyages avec Senthang Siam Tour.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-lg p-6 text-neutral-dark shadow-md">
            <div className="flex mb-4">
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
            </div>
            <p className="italic text-gray-600 mb-4">"Un voyage exceptionnel grâce à Senthang Siam Tour. Notre guide était passionné et nous a fait découvrir la vraie Thaïlande, loin des circuits touristiques habituels."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=464&q=80" 
                  alt="Sophie et Pierre" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading font-semibold">Sophie et Pierre</h4>
                <p className="text-sm text-gray-500">Tour du Triangle d'Or, Mai 2023</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white rounded-lg p-6 text-neutral-dark shadow-md">
            <div className="flex mb-4">
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
            </div>
            <p className="italic text-gray-600 mb-4">"Notre circuit sur mesure a dépassé toutes nos attentes. L'équipe a été très à l'écoute de nos souhaits et a créé un itinéraire parfait pour notre famille avec enfants."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80" 
                  alt="Famille Dupont" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading font-semibold">Famille Dupont</h4>
                <p className="text-sm text-gray-500">Tour personnalisé, Février 2023</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-white rounded-lg p-6 text-neutral-dark shadow-md">
            <div className="flex mb-4">
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
            </div>
            <p className="italic text-gray-600 mb-4">"C'était notre premier voyage en Asie et nous étions un peu inquiets. Mais tout était parfaitement organisé et notre guide nous a mis à l'aise dès le premier jour."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80" 
                  alt="Marc et Julie" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading font-semibold">Marc et Julie</h4>
                <p className="text-sm text-gray-500">Bangkok et les îles, Décembre 2022</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
