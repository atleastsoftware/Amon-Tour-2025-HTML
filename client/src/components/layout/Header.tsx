import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoAmon from "@/assets/logo-amon.png";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type NavLinkProps = {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

const NavLink = ({ href, isActive, children, onClick }: NavLinkProps) => {
  return (
    <Link href={href}>
      <motion.span
        onClick={onClick}
        className={`font-heading font-semibold transition-colors cursor-pointer relative ${
          isActive 
            ? "text-primary" 
            : "text-neutral-700 hover:text-primary"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
        {isActive && (
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
            layoutId="activeNav"
          />
        )}
      </motion.span>
    </Link>
  );
};

export default function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();
  const [scrolled, setScrolled] = useState(false);
  const isBookingPage = location.startsWith('/booking');
  const isHomePage = location === '/';

  // Track scroll position for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isHomePage]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout.mutate();
  };

  const headerClasses = isHomePage
    ? `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' 
          : 'bg-transparent py-6'
      }`
    : 'bg-white py-6';

  return (
    <header className={headerClasses}>
      {/* Main Navigation */}
      <nav className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center cursor-pointer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -10, 0],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }
              }
            }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={logoAmon} 
              alt="Amon Logo" 
              className="h-24 w-auto"
            />
          </motion.div>
        </Link>
        
        {/* Mobile Menu Button */}
        <motion.button 
          onClick={toggleMobileMenu}
          className="md:hidden text-neutral-700 focus:outline-none"
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* Desktop Navigation */}
        <motion.div 
          className="hidden md:flex space-x-10 items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <NavLink href="/" isActive={location === '/'}>
            Home
          </NavLink>
          <NavLink href="/tours" isActive={location === '/tours'}>
            Tours
          </NavLink>
          <NavLink href="/experiences" isActive={location === '/experiences'}>
            Journey
          </NavLink>
          {/* Menu Séjour temporairement masqué */}
          {/* <NavLink href="/stays" isActive={location === '/stays'}>
            Séjour
          </NavLink> */}
          <NavLink href="/custom-tour" isActive={location === '/custom-tour'}>
            Custom Tour
          </NavLink>
          

        </motion.div>
      </nav>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t border-gray-200 px-4 py-3 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="flex flex-col space-y-5 py-3"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <NavLink href="/" isActive={location === '/'} onClick={closeMobileMenu}>
                Home
              </NavLink>
              <NavLink href="/tours" isActive={location === '/tours'} onClick={closeMobileMenu}>
                Tours
              </NavLink>
              <NavLink href="/experiences" isActive={location === '/experiences'} onClick={closeMobileMenu}>
                Journey
              </NavLink>
              {/* Menu Séjour temporairement masqué */}
              {/* <NavLink href="/stays" isActive={location === '/stays'} onClick={closeMobileMenu}>
                Séjour
              </NavLink> */}
              <NavLink href="/custom-tour" isActive={location === '/custom-tour'} onClick={closeMobileMenu}>
                Custom Tour
              </NavLink>

              

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
