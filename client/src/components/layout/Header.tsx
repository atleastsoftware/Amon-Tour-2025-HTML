import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoWhite from "@/assets/logo-white.png";
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <header className="bg-white shadow-md">
      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
          >
            <img 
              src={logoWhite} 
              alt="Senthang Siam Tour" 
              className="h-7 w-auto"
              style={{ 
                filter: 'invert(28%) sepia(54%) saturate(796%) hue-rotate(178deg) brightness(96%) contrast(94%)',
                marginTop: '1px',
                marginBottom: '1px'
              }}
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
          className="hidden md:flex space-x-8 items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ height: '40px' }}
        >
          <NavLink href="/" isActive={location === '/'}>
            Home
          </NavLink>
          <NavLink href="/tours" isActive={location === '/tours'}>
            Our Tours
          </NavLink>
          <NavLink href="/#about" isActive={false}>
            About Us
          </NavLink>
          <NavLink href="/custom-tour" isActive={location === '/custom-tour'}>
            Custom Tour
          </NavLink>
          <NavLink href="/#contact" isActive={false}>
            Contact
          </NavLink>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="bg-primary text-white hover:bg-primary-dark">
                    Admin
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">
                    <motion.span 
                      className="w-full cursor-pointer"
                      whileHover={{ x: 3 }}
                    >
                      Dashboard
                    </motion.span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} asChild>
                  <motion.div
                    className="cursor-pointer w-full"
                    whileHover={{ x: 3 }}
                  >
                    Logout
                  </motion.div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/admin/login">
              <motion.span 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Admin
              </motion.span>
            </Link>
          )}
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
              className="flex flex-col space-y-3"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <NavLink href="/" isActive={location === '/'} onClick={closeMobileMenu}>
                Home
              </NavLink>
              <NavLink href="/tours" isActive={location === '/tours'} onClick={closeMobileMenu}>
                Our Tours
              </NavLink>
              <NavLink href="/#about" isActive={false} onClick={closeMobileMenu}>
                About Us
              </NavLink>
              <NavLink href="/custom-tour" isActive={location === '/custom-tour'} onClick={closeMobileMenu}>
                Custom Tour
              </NavLink>
              <NavLink href="/#contact" isActive={false} onClick={closeMobileMenu}>
                Contact
              </NavLink>
              
              {isAuthenticated ? (
                <>
                  <Link href="/admin/dashboard">
                    <motion.span 
                      className="font-heading font-semibold text-neutral-700 hover:text-primary transition-colors py-2 cursor-pointer" 
                      onClick={closeMobileMenu}
                      whileHover={{ x: 5 }}
                    >
                      Dashboard
                    </motion.span>
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      variant="default" 
                      className="bg-primary text-white hover:bg-primary-dark mt-2 w-full"
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                    >
                      Logout
                    </Button>
                  </motion.div>
                </>
              ) : (
                <Link href="/admin/login">
                  <motion.span 
                    className="bg-primary text-white px-4 py-2 rounded text-center hover:bg-primary-dark transition-colors cursor-pointer block" 
                    onClick={closeMobileMenu}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Admin
                  </motion.span>
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
