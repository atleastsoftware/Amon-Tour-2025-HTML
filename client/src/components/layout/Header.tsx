import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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
      <a
        onClick={onClick}
        className={`font-heading font-semibold transition-colors ${
          isActive 
            ? "text-primary border-b-2 border-primary" 
            : "text-neutral-700 hover:text-primary"
        }`}
      >
        {children}
      </a>
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
          <a className="flex items-center">
            <span className="text-primary font-heading font-bold text-2xl">Senthang</span>
            <span className="text-secondary font-accent text-2xl ml-1">Siam</span>
            <span className="text-primary font-heading font-bold text-2xl ml-1">Tour</span>
          </a>
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
            Accueil
          </NavLink>
          <NavLink href="/tours" isActive={location === '/tours'}>
            Nos Tours
          </NavLink>
          <NavLink href="/#about" isActive={false}>
            À Propos
          </NavLink>
          <NavLink href="/custom-tour" isActive={location === '/custom-tour'}>
            Voyage Sur Mesure
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
                    <a className="w-full">Dashboard</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/admin/login">
              <a className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
                Admin
              </a>
            </Link>
          )}
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <div className={`md:hidden bg-white border-t border-gray-200 px-4 py-3 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col space-y-3">
          <NavLink href="/" isActive={location === '/'} onClick={closeMobileMenu}>
            Accueil
          </NavLink>
          <NavLink href="/tours" isActive={location === '/tours'} onClick={closeMobileMenu}>
            Nos Tours
          </NavLink>
          <NavLink href="/#about" isActive={false} onClick={closeMobileMenu}>
            À Propos
          </NavLink>
          <NavLink href="/custom-tour" isActive={location === '/custom-tour'} onClick={closeMobileMenu}>
            Voyage Sur Mesure
          </NavLink>
          <NavLink href="/#contact" isActive={false} onClick={closeMobileMenu}>
            Contact
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <Link href="/admin/dashboard">
                <a className="font-heading font-semibold text-neutral-700 hover:text-primary transition-colors py-2" onClick={closeMobileMenu}>
                  Dashboard
                </a>
              </Link>
              <Button 
                variant="default" 
                className="bg-primary text-white hover:bg-primary-dark mt-2"
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Link href="/admin/login">
              <a className="bg-primary text-white px-4 py-2 rounded text-center hover:bg-primary-dark transition-colors" onClick={closeMobileMenu}>
                Admin
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
