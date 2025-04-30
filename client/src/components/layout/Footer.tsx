import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-white font-heading font-bold text-2xl">Senthang</span>
              <span className="text-secondary font-accent text-2xl ml-1">Siam</span>
              <span className="text-white font-heading font-bold text-2xl ml-1">Tour</span>
            </div>
            <p className="mb-4">Votre spécialiste des voyages sur mesure en Thaïlande. Tours privés, guides francophones et expériences authentiques.</p>
            <div className="flex space-x-3">
              <a href="#" className="text-white hover:text-secondary transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors" aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="hover:text-secondary transition-colors">Accueil</a>
                </Link>
              </li>
              <li>
                <Link href="/tours">
                  <a className="hover:text-secondary transition-colors">Nos Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/#about">
                  <a className="hover:text-secondary transition-colors">À Propos</a>
                </Link>
              </li>
              <li>
                <Link href="/custom-tour">
                  <a className="hover:text-secondary transition-colors">Voyage Sur Mesure</a>
                </Link>
              </li>
              <li>
                <Link href="/#contact">
                  <a className="hover:text-secondary transition-colors">Contact</a>
                </Link>
              </li>
              <li>
                <Link href="/admin/login">
                  <a className="hover:text-secondary transition-colors">Admin</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Destinations */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Destinations</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-secondary transition-colors">Bangkok</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Chiang Mai</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Phuket</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Krabi</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Koh Samui</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Ayutthaya</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Newsletter</h4>
            <p className="mb-4">Inscrivez-vous pour recevoir nos offres spéciales et conseils de voyage.</p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  className="px-4 py-2 rounded-l-md w-full text-gray-800 focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="bg-secondary px-4 py-2 rounded-r-md hover:bg-secondary-dark transition-colors"
                  aria-label="S'inscrire"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
            <p className="text-sm">Nous respectons votre vie privée. Désabonnez-vous à tout moment.</p>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Senthang Siam Tour. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm hover:text-secondary transition-colors">Mentions légales</a>
            <a href="#" className="text-sm hover:text-secondary transition-colors">Politique de confidentialité</a>
            <a href="#" className="text-sm hover:text-secondary transition-colors">Conditions générales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
