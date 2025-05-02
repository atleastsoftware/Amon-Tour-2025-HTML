import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
          <span className="flex items-center cursor-pointer">
            <span className="text-primary font-heading font-bold text-2xl">Senthang</span>
            <span className="text-secondary font-accent text-2xl ml-1">Siam</span>
            <span className="text-primary font-heading font-bold text-2xl ml-1">Tour</span>
          </span>
        </Link>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-neutral-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
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
                <Button variant="outline" className="bg-primary text-white hover:bg-primary-dark">
                  Admin
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">
                    <span className="w-full cursor-pointer">Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/admin/login">
              <span className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer">
                Admin
              </span>
            </Link>
          )}
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <div className={`md:hidden bg-white border-t border-gray-200 px-4 py-3 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col space-y-3">
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
                <span className="font-heading font-semibold text-neutral-700 hover:text-primary transition-colors py-2 cursor-pointer" onClick={closeMobileMenu}>
                  Dashboard
                </span>
              </Link>
              <Button 
                variant="default" 
                className="bg-primary text-white hover:bg-primary-dark mt-2"
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/admin/login">
              <span className="bg-primary text-white px-4 py-2 rounded text-center hover:bg-primary-dark transition-colors cursor-pointer block" onClick={closeMobileMenu}>
                Admin
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
