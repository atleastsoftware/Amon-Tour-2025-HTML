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
            <p className="mb-4">Your specialist for custom travel in Thailand. Private tours, English-speaking guides and authentic experiences.</p>
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
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="hover:text-secondary transition-colors cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/tours">
                  <span className="hover:text-secondary transition-colors cursor-pointer">Our Tours</span>
                </Link>
              </li>
              <li>
                <Link href="/#about">
                  <span className="hover:text-secondary transition-colors cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/custom-tour">
                  <span className="hover:text-secondary transition-colors cursor-pointer">Custom Tour</span>
                </Link>
              </li>
              <li>
                <Link href="/#contact">
                  <span className="hover:text-secondary transition-colors cursor-pointer">Contact</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login">
                  <span className="hover:text-secondary transition-colors cursor-pointer">Admin</span>
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
            <p className="mb-4">Subscribe to receive our special offers and travel tips.</p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-md w-full text-gray-800 focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="bg-secondary px-4 py-2 rounded-r-md hover:bg-secondary-dark transition-colors"
                  aria-label="Subscribe"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
            <p className="text-sm">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Senthang Siam Tour. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm hover:text-secondary transition-colors">Legal Notice</a>
            <a href="#" className="text-sm hover:text-secondary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm hover:text-secondary transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
