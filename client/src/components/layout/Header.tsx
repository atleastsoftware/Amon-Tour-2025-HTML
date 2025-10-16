import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import logoAmon from "@/assets/logo-amon.png";
import LanguageSelector from "@/components/LanguageSelector";
import { translationService } from "@/services/translationService";

type NavLinkProps = {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

const NavLink = ({ href, isActive, children, onClick, isHomePage, scrolled }: NavLinkProps & { isHomePage?: boolean; scrolled?: boolean }) => {
  return (
    <Link href={href}>
      <motion.span
        onClick={onClick}
        className={`font-heading font-semibold transition-colors cursor-pointer relative ${
          isHomePage && !scrolled ? "drop-shadow-lg" : ""
        }`}
        style={{
          color: isActive ? 'hsl(var(--primary))' : 'inherit',
          opacity: isActive ? 1 : 0.9
        }}
        whileHover={{ scale: 1.05, opacity: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
        {isActive && (
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-[2px]"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
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
  
  // Get translations for fallback
  const nav = translationService.getNav();

  // Fetch navigation menu items from database
  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ['/api/navigation-menu'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch theme settings for notification bar
  const { data: themeSettings } = useQuery({
    queryKey: ['/api/public/theme-settings'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch header settings for logo
  const { data: headerSettings } = useQuery({
    queryKey: ['/api/public/header-settings'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const notificationSettings = Array.isArray(themeSettings) 
    ? themeSettings.find((s: any) => s.key === 'notification_bar')?.value 
    : null;
  const notificationConfig = notificationSettings 
    ? (typeof notificationSettings === 'string' ? JSON.parse(notificationSettings) : notificationSettings) 
    : { enabled: true, text: "Welcome to the new Amon Tour website! This site is currently in a testing phase, so a few issues may still occur. For any reference, the previous site remains accessible at www.amon-tour.fr. Thank you for your understanding", background_color: "#3BA8AF", text_color: "#ffffff" };
  
  // Fetch logo settings
  const logoSettings = Array.isArray(headerSettings) 
    ? headerSettings.find((s: any) => s.key === 'logo_settings')?.value 
    : null;
  const logoConfig = logoSettings 
    ? (typeof logoSettings === 'string' ? JSON.parse(logoSettings) : logoSettings) 
    : { header_logo: logoAmon, header_logo_height: "80px" };
  
  const headerLogoSrc = logoConfig.header_logo?.startsWith('/src/') ? logoAmon : (logoConfig.header_logo || logoAmon);
  const headerLogoHeight = logoConfig.header_logo_height || "80px";

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
          ? 'backdrop-blur-md shadow-lg py-1' 
          : 'bg-transparent py-2'
      }`
    : 'fixed left-0 w-full z-50 py-2';

  const headerStyle = { 
    top: `${notificationBarHeight}px`,
    backgroundColor: isHomePage && !scrolled ? 'transparent' : 'hsl(var(--menu-background))',
    color: 'hsl(var(--menu-text))'
  };

  return (
    <>
      {/* Dynamic Notification Header */}
      {notificationConfig.enabled && (
        notificationConfig.is_clickable && notificationConfig.url ? (
          <a
            href={notificationConfig.url}
            {...(notificationConfig.url.startsWith('http') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
              lineHeight: '1.4',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            <span 
              className={notificationConfig.scrolling ? `animate-scroll-${notificationConfig.scroll_speed || 'medium'}` : ""}
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                wordWrap: 'break-word',
                hyphens: 'none',
                whiteSpace: notificationConfig.scrolling ? 'nowrap' : 'normal',
                pointerEvents: 'none'
              }}
            >
              {notificationConfig.text}
              {notificationConfig.scrolling && (
                <span style={{ paddingLeft: '3em' }}>{notificationConfig.text}</span>
              )}
            </span>
          </a>
        ) : (
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
              lineHeight: '1.4',
              overflow: 'hidden'
            }}
          >
            <span 
              className={notificationConfig.scrolling ? `animate-scroll-${notificationConfig.scroll_speed || 'medium'}` : ""}
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                wordWrap: 'break-word',
                hyphens: 'none',
                whiteSpace: notificationConfig.scrolling ? 'nowrap' : 'normal'
              }}
            >
              {notificationConfig.text}
              {notificationConfig.scrolling && (
                <span style={{ paddingLeft: '3em' }}>{notificationConfig.text}</span>
              )}
            </span>
          </div>
        )
      )}
      
      <header ref={headerRef} className={headerClasses} style={headerStyle}>
        {/* Main Navigation */}
        <nav className="container mx-auto pl-2 pr-12 flex justify-between items-center">
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
              src={headerLogoSrc} 
              alt="Amon Logo" 
              className="w-auto mt-1 ml-3"
              style={{ height: headerLogoHeight }}
            />
            <span 
              className={`ml-3 text-3xl font-bold ${
                isHomePage && !scrolled ? 'drop-shadow-lg' : ''
              }`}
              style={{ 
                fontFamily: 'Lobster, cursive',
                color: isHomePage && !scrolled ? 'white' : 'hsl(var(--menu-text))'
              }}
            >
              Amon Tour
            </span>
          </motion.div>
        </Link>
        
        {/* Mobile Menu Button */}
        <motion.button 
          onClick={toggleMobileMenu}
          className="md:hidden focus:outline-none"
          style={{
            color: isHomePage && !scrolled ? 'white' : 'hsl(var(--menu-text))'
          }}
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
          className="hidden md:flex space-x-10 items-center ml-[2px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!isHomePage && (
            <NavLink href="/" isActive={false} isHomePage={isHomePage} scrolled={scrolled}>
              Home
            </NavLink>
          )}
          {menuItems
            .filter((item: any) => !item.parentId && item.isActive && item.url !== '/')
            .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
            .map((item: any) => (
              <NavLink 
                key={item.id} 
                href={item.url} 
                isActive={location === item.url} 
                isHomePage={isHomePage} 
                scrolled={scrolled}
              >
                {item.name}
              </NavLink>
            ))}
          
          {/* Language Selector */}
          <div className="ml-4 pl-4 border-l border-gray-300/50">
            <LanguageSelector />
          </div>
        </motion.div>
      </nav>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className={`md:hidden border-t px-4 py-3 overflow-hidden ${
              isHomePage && !scrolled ? 'backdrop-blur-md' : ''
            }`}
            style={{
              backgroundColor: isHomePage && !scrolled ? 'rgba(0, 0, 0, 0.8)' : 'hsl(var(--menu-background))',
              borderColor: isHomePage && !scrolled ? 'rgba(255, 255, 255, 0.2)' : 'hsl(var(--menu-background) / 0.8)',
              color: 'hsl(var(--menu-text))'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="flex flex-col space-y-5 py-3 ml-[-4px]"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {!isHomePage && (
                <NavLink href="/" isActive={false} onClick={closeMobileMenu} isHomePage={isHomePage} scrolled={scrolled}>
                  Home
                </NavLink>
              )}
              {menuItems
                .filter((item: any) => !item.parentId && item.isActive && item.url !== '/')
                .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                .map((item: any) => (
                  <NavLink 
                    key={item.id} 
                    href={item.url} 
                    isActive={location === item.url} 
                    onClick={closeMobileMenu} 
                    isHomePage={isHomePage} 
                    scrolled={scrolled}
                  >
                    {item.name}
                  </NavLink>
                ))}
              
              {/* Language Selector for Mobile */}
              <div className="pt-3 mt-3 border-t border-gray-300/30">
                <LanguageSelector />
              </div>
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
