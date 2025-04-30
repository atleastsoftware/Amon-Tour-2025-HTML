export default function Testimonials() {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">What Our Travelers Say</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
          <p className="max-w-2xl mx-auto">Discover the experiences of our customers during their journeys with Senthang Siam Tour.</p>
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
            <p className="italic text-gray-600 mb-4">"An exceptional journey thanks to Senthang Siam Tour. Our guide was passionate and showed us the real Thailand, far from the usual tourist routes."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=464&q=80" 
                  alt="Sophie and Peter" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading font-semibold">Sophie and Peter</h4>
                <p className="text-sm text-gray-500">Golden Triangle Tour, May 2023</p>
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
            <p className="italic text-gray-600 mb-4">"Our custom tour exceeded all our expectations. The team was very attentive to our wishes and created a perfect itinerary for our family with children."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80" 
                  alt="Smith Family" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading font-semibold">Smith Family</h4>
                <p className="text-sm text-gray-500">Custom Tour, February 2023</p>
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
            <p className="italic text-gray-600 mb-4">"It was our first trip to Asia and we were a bit worried. But everything was perfectly organized and our guide made us feel comfortable from day one."</p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80" 
                  alt="Mark and Julie" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading font-semibold">Mark and Julie</h4>
                <p className="text-sm text-gray-500">Bangkok and Islands, December 2022</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
