import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import logoAmon from "@/assets/logo-amon.png";

type NavLinkProps = {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

const NavLink = ({ href, isActive, children, onClick, isHomePage, scrolled }: NavLinkProps & { isHomePage?: boolean; scrolled?: boolean }) => {
  const textColor = isHomePage && !scrolled 
    ? isActive 
      ? "text-primary drop-shadow-lg" 
      : "text-white hover:text-primary drop-shadow-lg"
    : isActive 
      ? "text-primary" 
      : "text-neutral-700 hover:text-primary";

  return (
    <Link href={href}>
      <motion.span
        onClick={onClick}
        className={`font-heading font-semibold transition-colors cursor-pointer relative ${textColor}`}
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
  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(64);
  const headerRef = useRef<HTMLElement>(null);
  const isBookingPage = location.startsWith('/booking');
  const isHomePage = location === '/';

  // Fetch notification bar settings
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/public/header-settings'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const notificationSettings = Array.isArray(siteSettings) 
    ? siteSettings.find((s: any) => s.key === 'notification_bar')?.value 
    : null;
  const notificationConfig = notificationSettings 
    ? (typeof notificationSettings === 'string' ? JSON.parse(notificationSettings) : notificationSettings) 
    : { enabled: true, text: "Our previous website is still online at www.Amon-Tour.fr", background_color: "#084F6E", text_color: "#ffffff" };

  // Track scroll position for header transparency and measure header height
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const measureHeader = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderHeight(rect.height);
      }
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
    }
    
    // Measure header height on mount and when state changes
    measureHeader();
    window.addEventListener('resize', measureHeader);
    
    return () => {
      if (isHomePage) {
        window.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', measureHeader);
    };
  }, [isHomePage, scrolled, isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };



  // Calculate the notification bar height (dynamic for mobile/desktop)
  const notificationBarHeight = notificationConfig.enabled ? 48 : 0;
  
  const headerClasses = isHomePage
    ? `fixed left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-3'
      }`
    : 'fixed left-0 w-full z-50 bg-white py-3';

  const headerStyle = { top: `${notificationBarHeight}px` };

  return (
    <>
      {/* Dynamic Notification Header */}
      {notificationConfig.enabled && (
        <div 
          style={{
            background: `linear-gradient(135deg, ${notificationConfig.background_color}, ${notificationConfig.background_color}e6)`,
            color: notificationConfig.text_color,
            textAlign: 'center',
            padding: '12px 20px',
            fontWeight: '500',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 60,
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            fontSize: '14px',
            fontFamily: 'inherit',
            letterSpacing: '0.025em',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            backdropFilter: 'blur(8px)',
            lineHeight: '1.4'
          }}
        >
          <span 
            style={{
              display: 'inline-block',
              maxWidth: '100%',
              wordWrap: 'break-word',
              hyphens: 'none'
            }}
            dangerouslySetInnerHTML={{
              __html: notificationConfig.text.replace('www.Amon-Tour.fr', '<span style="white-space: nowrap;">www.Amon-Tour.fr</span>')
            }}
          />
        </div>
      )}
      
      <header ref={headerRef} className={headerClasses} style={headerStyle}>
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
              className="h-20 w-auto"
            />
          </motion.div>
        </Link>
        
        {/* Mobile Menu Button */}
        <motion.button 
          onClick={toggleMobileMenu}
          className={`md:hidden focus:outline-none ${
            isHomePage && !scrolled ? 'text-white' : 'text-neutral-700'
          }`}
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
          {!isHomePage && (
            <NavLink href="/" isActive={false} isHomePage={isHomePage} scrolled={scrolled}>
              Home
            </NavLink>
          )}
          <NavLink href="/tours" isActive={location === '/tours'} isHomePage={isHomePage} scrolled={scrolled}>
            Experiences
          </NavLink>
          <NavLink href="/cruise" isActive={location === '/cruise'} isHomePage={isHomePage} scrolled={scrolled}>
            Cruise
          </NavLink>
          <NavLink href="/custom-tour" isActive={location === '/custom-tour'} isHomePage={isHomePage} scrolled={scrolled}>
            Custom Trip
          </NavLink>
          <NavLink href="/blog" isActive={location === '/blog'} isHomePage={isHomePage} scrolled={scrolled}>
            Blog
          </NavLink>
          <NavLink href="/contact" isActive={location === '/contact'} isHomePage={isHomePage} scrolled={scrolled}>
            Contact
          </NavLink>
        </motion.div>
      </nav>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className={`md:hidden border-t px-4 py-3 overflow-hidden ${
              isHomePage && !scrolled 
                ? 'bg-black/80 backdrop-blur-md border-white/20' 
                : 'bg-white border-gray-200'
            }`}
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
              {!isHomePage && (
                <NavLink href="/" isActive={false} onClick={closeMobileMenu} isHomePage={isHomePage} scrolled={scrolled}>
                  Home
                </NavLink>
              )}
              <NavLink href="/tours" isActive={location === '/tours'} onClick={closeMobileMenu} isHomePage={isHomePage} scrolled={scrolled}>
                Experiences
              </NavLink>
              <NavLink href="/cruise" isActive={location === '/cruise'} onClick={closeMobileMenu} isHomePage={isHomePage} scrolled={scrolled}>
                Cruise
              </NavLink>
              <NavLink href="/custom-tour" isActive={location === '/custom-tour'} onClick={closeMobileMenu} isHomePage={isHomePage} scrolled={scrolled}>
                Custom Trip
              </NavLink>
              <NavLink href="/blog" isActive={location === '/blog'} onClick={closeMobileMenu} isHomePage={isHomePage} scrolled={scrolled}>
                Blog
              </NavLink>
              <NavLink href="/contact" isActive={location === '/contact'} onClick={closeMobileMenu} isHomePage={isHomePage} scrolled={scrolled}>
                Contact
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    
    {/* Dynamic spacer to offset fixed headers - but not on home page when header is transparent */}
    {!(isHomePage && !scrolled) && (
      <div 
        aria-hidden="true" 
        style={{ height: notificationBarHeight + headerHeight }}
        className="flex-shrink-0"
      />
    )}
    </>
  );
}
