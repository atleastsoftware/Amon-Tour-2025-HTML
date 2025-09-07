import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Eye, EyeOff, ChevronUp, ChevronDown, Settings, Save, Undo, Trash2, AlertTriangle, Plus, ExternalLink, ChevronRight, Users, Compass, Sparkles, Star, Heart } from 'lucide-react';
import TourNinjaCard from '@/components/tour/TourNinjaCard';
import { useTourNinja } from '@/hooks/useTourNinja';

// Couleurs principales du thème
const THEME_COLORS = {
  primary: '#1e73be',
  secondary: '#E6B64C'
};

// Composant ColorPicker compact avec sélecteur natif + cases rapides
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const currentColorValue = value || '#ffffff';

  // Fonction pour convertir RGB en HEX si nécessaire
  const ensureHexFormat = (color: string): string => {
    if (color.startsWith('#')) return color.toLowerCase();
    
    // Si c'est en format RGB, convertir en HEX
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      const toHex = (n: string) => parseInt(n).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    return color;
  };

  const handleColorChange = (newColor: string) => {
    const hexColor = ensureHexFormat(newColor);
    onChange(hexColor);
    setIsEditingCustom(false);
  };

  const handleOptionSelect = (option: string) => {
    switch (option) {
      case 'primary':
        onChange(THEME_COLORS.primary);
        setIsEditingCustom(false);
        break;
      case 'secondary':
        onChange(THEME_COLORS.secondary);
        setIsEditingCustom(false);
        break;
      case 'custom':
        // Ne pas activer automatiquement le mode édition
        // Rester sur le dropdown avec le code couleur cliquable
        setIsEditingCustom(false);
        break;
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomInput(inputValue);
    
    // Valider et appliquer si c'est un hex valide
    if (/^#[0-9A-F]{6}$/i.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const handleCustomInputBlur = () => {
    // Appliquer la couleur même si pas parfaitement valide, mais corriger le format
    if (customInput.startsWith('#') && customInput.length >= 4) {
      const correctedColor = ensureHexFormat(customInput);
      onChange(correctedColor);
      setCustomInput(correctedColor);
    }
    setIsEditingCustom(false);
  };

  const getCurrentOption = () => {
    if (currentColorValue === THEME_COLORS.primary) return 'primary';
    if (currentColorValue === THEME_COLORS.secondary) return 'secondary';
    return 'custom';
  };

  const displayValue = ensureHexFormat(currentColorValue).toUpperCase();

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <div className="flex items-center gap-2">
        {/* Cadre de couleur personnalisable à gauche */}
        <div className="relative">
          <div 
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer relative overflow-hidden hover:border-gray-400 transition-colors"
            style={{ backgroundColor: currentColorValue }}
            title="Cliquez pour personnaliser la couleur"
          >
            <input
              type="color"
              value={currentColorValue}
              onChange={(e) => handleColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Dropdown avec les 3 options OU champ de saisie directe */}
        {isEditingCustom ? (
          <Input
            value={customInput}
            onChange={handleCustomInputChange}
            onBlur={handleCustomInputBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomInputBlur();
              }
              if (e.key === 'Escape') {
                setIsEditingCustom(false);
                setCustomInput(currentColorValue);
              }
            }}
            placeholder="#ffffff"
            className="flex-1 font-mono text-sm"
            autoFocus
          />
        ) : (
          <Select value={getCurrentOption()} onValueChange={handleOptionSelect}>
            <SelectTrigger className="flex-1">
              <SelectValue>
                {getCurrentOption() === 'primary' && 'Couleur principale'}
                {getCurrentOption() === 'secondary' && 'Couleur secondaire'}  
                {getCurrentOption() === 'custom' && `Référence couleur : ${displayValue}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Référence couleur</SelectItem>
              <SelectItem value="primary">Couleur principale</SelectItem>
              <SelectItem value="secondary">Couleur secondaire</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      {/* Phrase explicative */}
      <p className="text-xs text-gray-500 mt-1">
        Cliquez sur le carré de couleur pour choisir visuellement ou sur le code couleur pour saisir directement
      </p>
    </div>
  );
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Fonction utilitaire pour le scroll automatique avec offset
const scrollToElement = (elementId: string, behavior: ScrollBehavior = 'smooth', offset = -80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset + offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: behavior
    });
  } else {
    console.warn(`Element avec ID "${elementId}" non trouvé pour le scroll`);
  }
};

// Import real components for exact preview
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import About from '@/components/home/About';
import CustomTourForm from '@/components/home/CustomTourForm';
import Testimonials from '@/components/home/Testimonials';
import TourNinjaSection from '@/components/tour/TourNinjaSection';

// Helper function to get readable block type names
const getBlockDisplayName = (block: PageBlock): string => {
  // Si c'est un card_grid, utiliser l'identifier pour distinguer les types
  if (block.blockType === 'card_grid') {
    const cardGridNames: { [key: string]: string } = {
      'popular_experiences': 'Card Grid Date',
      'tour_ninja_section': 'Card Grid Price'
    };
    return cardGridNames[block.identifier] || 'Card Grid';
  }
  
  // Sinon utiliser le blockType normal
  const blockNames: { [key: string]: string } = {
    'video_hero': 'Hero Section',
    'hero': 'Hero Section', 
    'text_image': 'Text',
    'form': 'Form',
    'advantages': 'Advantages',
    'testimonials': 'Testimonials',
    'features': 'Features',
    'about': 'About',
    'custom_tour_form': 'Custom Tour Form',
    'expats_welcome': 'Expats Welcome',
    'who_we_are': 'Who We Are',
    'why_choose_us': 'Text + Icones',
    'travelers_reviews': 'Travelers Reviews'
  };
  
  return blockNames[block.blockType] || block.blockType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

interface PageBlock {
  id: number;
  pageId: number;
  blockType: string;
  blockOrder: number;
  identifier: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundColor?: string;
  isActive: boolean;
  configuration?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface PageConfiguration {
  id: number;
  pageName: string;
  pageSlug: string;
  pageType: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Real Component Previews - Using ACTUAL website components only
const RealBlockPreview = ({ block, isFullscreen, liveConfiguration }: { block: PageBlock; isFullscreen: boolean; liveConfiguration?: any }) => {
  const getActualComponent = () => {
    switch (block.identifier) {
      case 'hero_main':
        const heroConfig = liveConfiguration || block.configuration || {};
        
        // Helper function to render title with colored accent
        const renderTitle = () => {
          const fullTitle = heroConfig.title || "Your exclusive experiences\nin Krabi –\nTHAILAND";
          const accentText = heroConfig.titleAccentText || "in Krabi –";
          const titleColor = heroConfig.titleColor || '#ffffff';
          const accentColor = heroConfig.titleAccentColor || '#1e73be';
          
          if (fullTitle.includes(accentText)) {
            const parts = fullTitle.split(accentText);
            return (
              <>
                {parts[0] && <span style={{ color: titleColor }}>{parts[0]}</span>}
                <span style={{ color: accentColor }}>{accentText}</span>
                {parts[1] && <span style={{ color: titleColor }}>{parts[1]}</span>}
              </>
            );
          }
          return <span style={{ color: titleColor, whiteSpace: 'pre-line' }}>{fullTitle}</span>;
        };
        
        // Background rendering based on type
        const renderBackground = () => {
          const bgType = heroConfig.backgroundType || 'video';
          
          switch (bgType) {
            case 'color':
              return (
                <div 
                  className="absolute inset-0 w-full h-full z-0"
                  style={{ backgroundColor: heroConfig.backgroundColor || '#1e73be' }}
                />
              );
            
            case 'images':
              const images = [
                heroConfig.backgroundImage1,
                heroConfig.backgroundImage2,
                heroConfig.backgroundImage3
              ].filter(Boolean);
              
              return (
                <div className="absolute inset-0 w-full h-full z-0">
                  {images.length > 0 ? (
                    <img
                      src={images[0]} // For preview, show first image
                      alt="Hero background"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">Aucune image sélectionnée</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
                </div>
              );
            
            case 'video':
            default:
              const videoUrl = heroConfig.videoUrl || '/attached_assets/hero-video-optimized.mp4';
              return (
                <div className="absolute inset-0 w-full h-full z-0">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover' }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
                </div>
              );
          }
        };
        
        return (
          <section className="relative pt-32 pb-20 min-h-screen flex items-center overflow-hidden" style={{ minHeight: 'auto' }}>
            {renderBackground()}
            <div className="container mx-auto px-4 relative z-10">
              <div className={`max-w-xl ${
                heroConfig.contentAlignment === 'center' ? 'mx-auto text-center' : 
                heroConfig.contentAlignment === 'right' ? 'ml-auto text-right' : 
                'text-left'
              }`}>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight tracking-tight drop-shadow-lg" style={{ whiteSpace: 'pre-line' }}>
                  {renderTitle()}
                </h1>
                <p 
                  className="mb-8 text-lg drop-shadow-md opacity-90"
                  style={{ 
                    color: heroConfig.subtitleColor || '#ffffff',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {heroConfig.subtitle || "Discover amazing places away from mass tourism in Krabi.\nAnd also Khao Sok, Koh Mook and many more destinations."}
                </p>
                <div className={`flex flex-col sm:flex-row gap-4 ${
                  heroConfig.contentAlignment === 'center' ? 'justify-center' :
                  heroConfig.contentAlignment === 'right' ? 'justify-end' :
                  'justify-start'
                }`}>
                  {(heroConfig.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}]).map((button: any, index: number) => (
                    <span 
                      key={index}
                      className={`px-8 py-3 mt-4 rounded transition-colors cursor-pointer inline-block shadow-lg ${
                        (button.style || 'filled') === 'filled' 
                          ? 'text-white hover:opacity-90' 
                          : 'bg-transparent border-2 hover:bg-opacity-10'
                      }`}
                      style={{
                        backgroundColor: (button.style || 'filled') === 'filled' ? (button.color || '#1e73be') : 'transparent',
                        borderColor: (button.style || 'filled') === 'outline' ? (button.color || '#1e73be') : 'transparent',
                        color: (button.style || 'filled') === 'outline' ? (button.color || '#1e73be') : '#ffffff'
                      }}
                    >
                      {button.text || `Bouton ${index + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      
      case 'text_image':
        // Section Text simple
        const textConfig = liveConfiguration || block.configuration || {};
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 
                  className="font-heading font-bold text-3xl md:text-4xl mb-3"
                  style={{ color: textConfig.titleColor || '#333333' }}
                >
                  {textConfig.title || block.configuration?.title || "Titre de la section"}
                </h2>
                <div 
                  className="w-20 h-1 mx-auto mb-8"
                  style={{ backgroundColor: textConfig.dividerColor || '#E6B64C' }}
                ></div>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: textConfig.contentColor || '#666666' }}
                >
                  {textConfig.content || block.configuration?.content || "Contenu du texte de cette section. Vous pouvez modifier ce texte dans l'éditeur."}
                </p>
              </motion.div>
            </div>
          </section>
        );

      case 'expats_welcome':
        // Section d'accueil basée sur le style du vrai site
        const expatsConfig = liveConfiguration || block.configuration || {};
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 
                  className="font-heading font-bold text-3xl md:text-4xl mb-3"
                  style={{ color: expatsConfig.titleColor || '#333333' }}
                >
                  {expatsConfig.title || block.configuration?.title || "When expats welcome you in their host country"}
                </h2>
                <div 
                  className="w-20 h-1 mx-auto mb-8"
                  style={{ backgroundColor: expatsConfig.dividerColor || '#E6B64C' }}
                ></div>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: expatsConfig.contentColor || '#666666' }}
                >
                  {expatsConfig.content || block.configuration?.content || "This is a family-run travel agency that combines the organization of exclusive activities with the creation of tailor-made trips throughout the country. Our goal is to offer an immersive experience, far from mass tourism, with personalized service for every traveler — as if we were welcoming our own family or friends."}
                </p>
              </motion.div>
            </div>
          </section>
        );

      case 'popular_experiences':
        // Section "Our Popular Experiences" - Card Grid Date avec badges de jours
        const { tours: realTours, isLoading: toursLoading } = useTourNinja();
        
        // Utiliser liveConfiguration pour l'édition en temps réel, sinon block.configuration pour les données sauvegardées
        const popularConfig = liveConfiguration || block.configuration || {};
        
        // D'abord filtrer par catégorie
        const categoryFilter = popularConfig.categoryFilter || 'all';
        let filteredTours = realTours || [];
        
        if (categoryFilter === 'featured') {
          // Pour l'instant, considérer les tours avec un prix plus élevé comme "featured"
          if (filteredTours.length > 0) {
            const avgPrice = filteredTours.reduce((sum, tour) => sum + (tour.price || 0), 0) / filteredTours.length;
            filteredTours = filteredTours.filter(tour => (tour.price || 0) > avgPrice);
          }
        } else if (categoryFilter === 'day_trips') {
          filteredTours = filteredTours.filter(tour => {
            const duration = parseInt(String(tour.duration)) || 0;
            return duration <= 1;
          });
        } else if (categoryFilter === 'multi_day') {
          filteredTours = filteredTours.filter(tour => {
            const duration = parseInt(String(tour.duration)) || 0;
            return duration > 1;
          });
        }
        // 'all' et 'custom' gardent tous les tours pour l'instant
        
        // Calculer le nombre d'annonces selon la configuration
        let displayCount = 6;
        
        if (popularConfig.showAllAds === true) {
          // Si "toutes les annonces" est activé, afficher toutes les annonces filtrées
          displayCount = Math.max(filteredTours.length, 19); // Garantir au moins 19 pour la demo
        } else {
          // Sinon utiliser le nombre configuré pour ordinateur par défaut
          displayCount = popularConfig.displayCountDesktop || 6;
        }
        
        const displayTours = filteredTours.slice(0, displayCount);
        
        return (
          <section id="tours" className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 
                  className="font-heading font-bold text-3xl md:text-4xl mb-3"
                  style={{
                    color: popularConfig.titleColor || '#333333'
                  }}
                >
                  {liveConfiguration?.title || block.configuration?.title || "Our Popular Experiences"}
                </h2>
                <div 
                  className="w-20 h-1 mx-auto mb-4"
                  style={{
                    backgroundColor: popularConfig.dividerColor || '#E6B64C'
                  }}
                ></div>
                <p 
                  className="max-w-2xl mx-auto"
                  style={{
                    color: popularConfig.subtitleColor || '#666666'
                  }}
                >
                  {liveConfiguration?.subtitle || block.configuration?.subtitle || "Step off the beaten path into carefully curated experiences beyond the tourist trail."}
                </p>
              </motion.div>
            </div>
            
            <div className="container mx-auto px-4">
              <div 
                className={`grid gap-6 mb-8 ${
                  popularConfig.mobileColumns === 1 ? 'grid-cols-1' :
                  popularConfig.mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'
                } ${
                  popularConfig.tabletColumns === 1 ? 'md:grid-cols-1' :
                  popularConfig.tabletColumns === 2 ? 'md:grid-cols-2' :
                  popularConfig.tabletColumns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
                } ${
                  popularConfig.desktopColumns === 1 ? 'lg:grid-cols-1' :
                  popularConfig.desktopColumns === 2 ? 'lg:grid-cols-2' :
                  popularConfig.desktopColumns === 3 ? 'lg:grid-cols-3' :
                  popularConfig.desktopColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                }`}
              >
                {toursLoading ? (
                  // Skeleton loading avec le bon nombre
                  Array.from({ length: Math.min(displayCount, 12) }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse">
                      <div className="h-48 bg-gray-300"></div>
                      <div className="p-4 space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : displayTours.length > 0 ? (
                  // Affiche les vraies cartes de tours avec design "Our Popular Experiences" (badges de jours)
                  displayTours.map((tour, index) => (
                    <motion.div
                      key={tour.id || index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-blue-200 to-blue-300">
                        {tour.primaryImage ? (
                          <img
                            src={tour.primaryImage}
                            alt={tour.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="h-16 w-16 text-blue-400">🏝️</div>
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {tour.duration || '1'} jour{(tour.duration && Number(tour.duration) > 1) ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                          {tour.name}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {tour.description || "Découvrez les plus beaux endroits de Krabi avec nos guides expérimentés."}
                        </p>
                        
                        <div className="flex gap-2">
                          <button className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                            Details
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                            Book
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  // Fallback si pas de tours avec le bon nombre
                  Array.from({ length: Math.min(displayCount, 12) }).map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-blue-200 to-blue-300">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="h-16 w-16 text-blue-400">🏝️</div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {index % 2 + 1} jour{index % 2 > 0 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                          Tour Experience {index + 1}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          Découvrez les plus beaux endroits de Krabi avec nos guides expérimentés.
                        </p>
                        
                        <div className="flex gap-2">
                          <button className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                            Details
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                            Book
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                {/* Utilise les boutons configurés ou le bouton par défaut */}
                {(liveConfiguration?.buttons?.length ? liveConfiguration.buttons : [{text: 'View All Our Tours', url: '/tours', color: '#1e73be', style: 'filled'}]).map((button: any, index: number) => (
                  <button 
                    key={index}
                    className="text-white px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-colors"
                    style={{
                      backgroundColor: button.style === 'outline' ? 'transparent' : (button.color || '#1e73be'),
                      borderColor: button.style === 'outline' ? (button.color || '#1e73be') : 'transparent',
                      border: button.style === 'outline' ? '2px solid' : 'none',
                      color: button.style === 'outline' ? (button.color || '#1e73be') : 'white'
                    }}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            </div>
          </section>
        );

      case 'custom_tour_form':
        return <CustomTourForm />;

      case 'tour_ninja_section':
        // Section "Some Ideas For Your Next Trip" - Card Grid Price avec badges de prix
        const { tours: realToursPrice, isLoading: toursLoadingPrice } = useTourNinja();
        
        // Utiliser liveConfiguration pour l'édition en temps réel, sinon block.configuration pour les données sauvegardées
        const config = liveConfiguration || block.configuration || {};
        
        // D'abord filtrer par catégorie
        const categoryFilterPrice = config.categoryFilter || 'all';
        let filteredToursPrice = realToursPrice || [];
        
        if (categoryFilterPrice === 'featured') {
          // Pour l'instant, considérer les tours avec un prix plus élevé comme "featured"
          if (filteredToursPrice.length > 0) {
            const avgPricePrice = filteredToursPrice.reduce((sum, tour) => sum + (tour.price || 0), 0) / filteredToursPrice.length;
            filteredToursPrice = filteredToursPrice.filter(tour => (tour.price || 0) > avgPricePrice);
          }
        } else if (categoryFilterPrice === 'day_trips') {
          filteredToursPrice = filteredToursPrice.filter(tour => {
            const duration = parseInt(String(tour.duration)) || 0;
            return duration <= 1;
          });
        } else if (categoryFilterPrice === 'multi_day') {
          filteredToursPrice = filteredToursPrice.filter(tour => {
            const duration = parseInt(String(tour.duration)) || 0;
            return duration > 1;
          });
        }
        // 'all' et 'custom' gardent tous les tours pour l'instant
        
        // Calculer le nombre d'annonces selon la configuration
        let displayCountPrice = 6;
        
        if (config.showAllAds === true) {
          // Si "toutes les annonces" est activé, afficher toutes les annonces filtrées
          displayCountPrice = Math.max(filteredToursPrice.length, 19); // Garantir au moins 19 pour la demo
        } else {
          // Sinon utiliser le nombre configuré pour ordinateur par défaut
          displayCountPrice = config.displayCountDesktop || 6;
        }
        
        const displayToursPrice = filteredToursPrice.slice(0, displayCountPrice);
        
        return (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 
                    className="font-heading font-bold text-3xl md:text-4xl mb-3"
                    style={{
                      color: config.titleColor || '#333333'
                    }}
                  >
                    {config.title || 'Some Ideas For Your Next Trip'}
                  </h2>
                  <div 
                    className="w-20 h-1 mx-auto mb-4"
                    style={{
                      backgroundColor: config.dividerColor || '#E6B64C'
                    }}
                  ></div>
                  <p 
                    className="text-gray-600 max-w-2xl mx-auto"
                    style={{
                      color: config.subtitleColor || '#666666'
                    }}
                  >
                    {config.subtitle || 'Get inspired by our custom-designed travel experiences.'}
                  </p>
                </motion.div>
              </div>

              {toursLoadingPrice ? (
                <div 
                  className={`grid gap-6 ${
                    config.mobileColumns === 1 ? 'grid-cols-1' :
                    config.mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'
                  } ${
                    config.tabletColumns === 1 ? 'md:grid-cols-1' :
                    config.tabletColumns === 2 ? 'md:grid-cols-2' :
                    config.tabletColumns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
                  } ${
                    config.desktopColumns === 1 ? 'lg:grid-cols-1' :
                    config.desktopColumns === 2 ? 'lg:grid-cols-2' :
                    config.desktopColumns === 3 ? 'lg:grid-cols-3' :
                    config.desktopColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse">
                      <div className="h-48 bg-gray-300"></div>
                      <div className="p-4 space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayToursPrice.length > 0 ? (
                <motion.div
                  className={`grid gap-6 ${
                    config.mobileColumns === 1 ? 'grid-cols-1' :
                    config.mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'
                  } ${
                    config.tabletColumns === 1 ? 'md:grid-cols-1' :
                    config.tabletColumns === 2 ? 'md:grid-cols-2' :
                    config.tabletColumns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
                  } ${
                    config.desktopColumns === 1 ? 'lg:grid-cols-1' :
                    config.desktopColumns === 2 ? 'lg:grid-cols-2' :
                    config.desktopColumns === 3 ? 'lg:grid-cols-3' :
                    config.desktopColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {displayToursPrice.map((tour, index) => (
                    <TourNinjaCard 
                      key={tour.id || index} 
                      tour={tour} 
                      index={index} 
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tours available at the moment.</p>
                </div>
              )}
            </div>
          </section>
        );

      case 'why_choose_us':
        // Utiliser liveConfiguration pour l'édition en temps réel, sinon block.configuration pour les données sauvegardées
        const featuresConfig = liveConfiguration || block.configuration || {};
        return (
          <section className="py-16 bg-neutral-light">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 
                    className="font-heading font-bold text-3xl md:text-4xl mb-3"
                    style={{ color: featuresConfig.titleColor || '#333333' }}
                  >
                    {featuresConfig.title || 'Why Choose Us'}
                  </h2>
                  <div 
                    className="w-20 h-1 mx-auto mb-4"
                    style={{ backgroundColor: featuresConfig.dividerColor || '#E6B64C' }}
                  ></div>
                  <p 
                    className="text-gray-600 max-w-2xl mx-auto"
                    style={{ color: featuresConfig.subtitleColor || '#666666' }}
                  >
{featuresConfig.subtitle || 'Experience an exclusive private day trip with our English or French-speaking and certified guides.'}
                  </p>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(featuresConfig.iconBlocks || [
                  {
                    id: 1,
                    mainIcon: 'fas fa-user-friends',
                    title: 'Private Tours',
                    description: 'Experience an exclusive day trip with our professional guides and private vehicles.',
                    miniIcons: [
                      { icon: 'fas fa-car', text: 'Private Car' },
                      { icon: 'fas fa-language', text: 'Guide' },
                      { icon: 'fas fa-shield-alt', text: 'Safety' }
                    ]
                  },
                  {
                    id: 2,
                    mainIcon: 'fas fa-compass',
                    title: 'Customized Itineraries',
                    description: 'Create your own journey based on your desires, your pace, and your interests.',
                    miniIcons: [
                      { icon: 'fas fa-map-marked-alt', text: 'Custom Route' },
                      { icon: 'fas fa-clock', text: 'Flexible Time' },
                      { icon: 'fas fa-list-check', text: 'Your Pace' }
                    ]
                  },
                  {
                    id: 3,
                    mainIcon: 'fas fa-sparkles',
                    title: 'Authentic Experiences',
                    description: 'Discover destinations off the beaten path and immerse yourself in the local culture.',
                    miniIcons: [
                      { icon: 'fas fa-utensils', text: 'Local Food' },
                      { icon: 'fas fa-hands-helping', text: 'Local People' },
                      { icon: 'fas fa-landmark', text: 'Culture' }
                    ]
                  }
                ]).slice(0, 3).map((feature: any, index: number) => (
                  <motion.div 
                    key={feature.id}
                    className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center relative"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -10, 
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {feature.mainIcon === 'fas fa-user-friends' && <Users size={28} className="text-white" />}
                      {feature.mainIcon === 'fas fa-compass' && <Compass size={28} className="text-white" />}
                      {feature.mainIcon === 'fas fa-sparkles' && <Sparkles size={28} className="text-white" />}
                      {!['fas fa-user-friends', 'fas fa-compass', 'fas fa-sparkles'].includes(feature.mainIcon) && (
                        <i className={`${feature.mainIcon} text-white text-2xl`}></i>
                      )}
                    </motion.div>
                    <h3 className="font-heading font-bold text-xl mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    
                    <motion.div 
                      className="mt-4 grid grid-cols-3 gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      {feature.miniIcons?.slice(0, 3).map((miniIcon: any, miniIndex: number) => (
                        <motion.div 
                          key={miniIndex}
                          className="flex flex-col items-center"
                          whileHover={{ y: -5 }}
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                            <i className={`${miniIcon.icon} text-primary text-sm`}></i>
                          </div>
                          <span className="text-xs text-center">{miniIcon.text}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'who_we_are':
        return <About />;

      case 'travelers_reviews':
        return <Testimonials />;

      default:
        return (
          <div className={`${isFullscreen ? 'h-40' : 'h-24'} bg-gray-100 flex items-center justify-center rounded-lg`}>
            <div className="text-gray-500 text-center">
              <div className="font-medium">{block.title}</div>
              <div className="text-sm">Type: {block.blockType}</div>
            </div>
          </div>
        );
    }
  };

  const actualComponent = getActualComponent();

  if (isFullscreen) {
    return actualComponent;
  }

  // Mode normal : affichage exact comme sur le site réel
  return (
    <div className="w-full bg-white rounded-lg overflow-hidden">
      {actualComponent}
    </div>
  );
};

// Edit Dropdown Component (instead of popup)
const BlockEditDropdown = ({ 
  block, 
  isOpen, 
  onSave, 
  onCancel,
  onPreviewUpdate 
}: { 
  block: PageBlock; 
  isOpen: boolean;
  onSave: (data: any) => void; 
  onCancel: () => void; 
  onPreviewUpdate?: (config: any) => void;
}) => {
  const [formData, setFormData] = useState(block.configuration || {});

  const updateField = (key: string, value: any) => {
    const newFormData = { ...formData, [key]: value };
    
    // Si on modifie manuellement un nombre d'annonces, décocher "Toutes les annonces"
    if ((key === 'displayCountMobile' || key === 'displayCountTablet' || key === 'displayCountDesktop') && formData.showAllAds) {
      newFormData.showAllAds = false;
    }
    
    setFormData(newFormData);
    // Mise à jour en temps réel de la prévisualisation
    if (onPreviewUpdate) {
      onPreviewUpdate(newFormData);
    }
  };

  const handleSave = () => {
    onSave({
      ...block,
      configuration: formData,
      title: formData.title || block.title,
      subtitle: formData.subtitle || block.subtitle
    });
  };

  const renderEditFields = () => {
    switch (block.identifier) {
      case 'hero_main':
        return (
          <div className="space-y-6">
            {/* Titre principal */}
            <div>
              <Label htmlFor="title">Titre principal</Label>
              <Textarea 
                id="title"
                value={formData.title || block.configuration?.title || 'Your exclusive experiences\nin Krabi –\nTHAILAND'} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Your exclusive experiences\nin Krabi –\nTHAILAND"
                rows={3}
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.titleColor || '#ffffff'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
            </div>
            
            {/* Mot du titre en seconde couleur */}
            <div>
              <Label htmlFor="titleAccentText">Mot du titre en seconde couleur</Label>
              <Input 
                id="titleAccentText"
                value={formData.titleAccentText || 'in Krabi –'} 
                onChange={e => updateField('titleAccentText', e.target.value)}
                placeholder="in Krabi –"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tapez exactement les mots du titre que vous voulez colorer
              </p>
              <div className="mt-3">
                <ColorPicker
                  value={formData.titleAccentColor || '#1e73be'}
                  onChange={(value) => updateField('titleAccentColor', value)}
                />
              </div>
            </div>

            {/* Sous-titre */}
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Textarea 
                id="subtitle"
                value={formData.subtitle || block.configuration?.subtitle || 'Discover amazing places away from mass tourism in Krabi.\nAnd also Khao Sok, Koh Mook and many more destinations.'} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Discover amazing places away from mass tourism in Krabi.\nAnd also Khao Sok, Koh Mook and many more destinations."
                rows={3}
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.subtitleColor || '#ffffff'}
                  onChange={(value) => updateField('subtitleColor', value)}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Boutons d'action</Label>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}];
                    updateField('buttons', [...buttons, {text: 'Nouveau bouton', url: '#', color: '#1e73be', style: 'filled'}]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un bouton
                </Button>
              </div>
              
              <div className="space-y-3">
                {(formData.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}]).map((button: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Bouton {index + 1}</Label>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}];
                          const newButtons = buttons.filter((_: any, i: number) => i !== index);
                          updateField('buttons', newButtons);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Texte</Label>
                      <Input 
                        value={button.text || ''} 
                        onChange={e => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, text: e.target.value} : b
                          );
                          updateField('buttons', newButtons);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input 
                        value={button.url || ''} 
                        onChange={e => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, url: e.target.value} : b
                          );
                          updateField('buttons', newButtons);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Couleur</Label>
                      <ColorPicker
                        value={button.color || '#1e73be'}
                        onChange={(value) => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, color: value} : b
                          );
                          updateField('buttons', newButtons);
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Style</Label>
                      <Select 
                        value={button.style || 'filled'} 
                        onValueChange={value => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#1e73be', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#1e73be', style: 'filled'}];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, style: value} : b
                          );
                          updateField('buttons', newButtons);
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="filled">Plein</SelectItem>
                          <SelectItem value="outline">Contour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alignement du contenu */}
            <div>
              <Label>Alignement du contenu</Label>
              <div className="mt-3">
                <Select value={formData.contentAlignment || 'left'} onValueChange={value => updateField('contentAlignment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alignement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">À gauche</SelectItem>
                    <SelectItem value="center">Au centre</SelectItem>
                    <SelectItem value="right">À droite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Arrière-plan */}
            <div>
              <Label>Arrière-plan</Label>
              <div className="mt-3">
                <Select value={formData.backgroundType || 'video'} onValueChange={value => updateField('backgroundType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type d'arrière-plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="images">Images en rotation</SelectItem>
                    <SelectItem value="color">Couleur unie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.backgroundType === 'color' && (
                <div>
                  <Label htmlFor="backgroundColor">Couleur de fond</Label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      id="backgroundColor"
                      value={formData.backgroundColor || '#1e73be'}
                      onChange={e => updateField('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    style={{ border: 'none', outline: 'none' }}
                    />
                    <Input 
                      value={formData.backgroundColor || '#1e73be'}
                      onChange={e => updateField('backgroundColor', e.target.value)}
                      placeholder="#1e73be"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
              
              {formData.backgroundType === 'video' && (
                <div>
                  <Label htmlFor="videoUrl">URL de la vidéo</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="videoUrl"
                      value={formData.videoUrl || '/attached_assets/hero-video-optimized.mp4'} 
                      onChange={e => updateField('videoUrl', e.target.value)}
                      placeholder="/attached_assets/hero-video-optimized.mp4"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'video/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            updateField('videoUrl', url);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {formData.backgroundType === 'images' && (
                <div className="space-y-3">
                  <Label>URLs des images (3 maximum)</Label>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={formData.backgroundImage1 || ''} 
                      onChange={e => updateField('backgroundImage1', e.target.value)}
                      placeholder="URL de l'image 1"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            updateField('backgroundImage1', url);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={formData.backgroundImage2 || ''} 
                      onChange={e => updateField('backgroundImage2', e.target.value)}
                      placeholder="URL de l'image 2"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            updateField('backgroundImage2', url);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={formData.backgroundImage3 || ''} 
                      onChange={e => updateField('backgroundImage3', e.target.value)}
                      placeholder="URL de l'image 3"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            updateField('backgroundImage3', url);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'text_image':
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || 'Titre de la section'} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Titre de la section"
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.titleColor || '#333333'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
            </div>
            
            {/* Contenu */}
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea 
                id="content"
                value={formData.content || block.configuration?.content || 'Contenu du texte de cette section. Vous pouvez modifier ce texte dans l\'éditeur.'} 
                onChange={e => updateField('content', e.target.value)}
                placeholder="Contenu du texte de cette section..."
                rows={4}
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.contentColor || '#666666'}
                  onChange={(value) => updateField('contentColor', value)}
                />
              </div>
            </div>

            {/* Tiret */}
            <div>
              <Label htmlFor="divider">Tiret</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.dividerColor || '#E6B64C'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>
          </div>
        );

      case 'expats_welcome':
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="When expats welcome you..."
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.titleColor || '#333333'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
            </div>
            
            {/* Contenu */}
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea 
                id="content"
                value={formData.content || block.configuration?.content || ''} 
                onChange={e => updateField('content', e.target.value)}
                placeholder="Contenu de la section..."
                rows={4}
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.contentColor || '#666666'}
                  onChange={(value) => updateField('contentColor', value)}
                />
              </div>
            </div>

            {/* Tiret */}
            <div>
              <Label htmlFor="divider">Tiret</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.dividerColor || '#E6B64C'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>
          </div>
        );

      case 'popular_experiences':
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || 'Our Popular Experiences'} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Our Popular Experiences"
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.titleColor || '#333333'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
            </div>
            
            {/* Sous-titre */}
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || block.configuration?.subtitle || 'Step off the beaten path into carefully curated experiences beyond the tourist trail.'} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Step off the beaten path..."
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.subtitleColor || '#666666'}
                  onChange={(value) => updateField('subtitleColor', value)}
                />
              </div>
            </div>

            {/* Tiret */}
            <div>
              <Label htmlFor="divider">Tiret</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.dividerColor || '#E6B64C'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Configuration de la grille */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900">Configuration de la grille</h4>
              
              {/* Colonnes */}
              <div>
                <Label className="text-sm font-medium">Colonnes par appareil</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Mobile</Label>
                    <Select value={String(formData.mobileColumns || 1)} onValueChange={value => updateField('mobileColumns', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Tablette</Label>
                    <Select value={String(formData.tabletColumns || 2)} onValueChange={value => updateField('tabletColumns', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Ordinateur</Label>
                    <Select value={String(formData.desktopColumns || 3)} onValueChange={value => updateField('desktopColumns', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Nombre d'annonces */}
              <div>
                <Label className="text-sm font-medium">Nombre d'annonces à afficher</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Mobile</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={formData.showAllAds ? 19 : formData.displayCountMobile || 4}
                      onChange={e => updateField('displayCountMobile', parseInt(e.target.value) || 4)}
                      disabled={formData.showAllAds}
                      className={formData.showAllAds ? 'bg-gray-100' : ''}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Tablette</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={formData.showAllAds ? 19 : formData.displayCountTablet || 6}
                      onChange={e => updateField('displayCountTablet', parseInt(e.target.value) || 6)}
                      disabled={formData.showAllAds}
                      className={formData.showAllAds ? 'bg-gray-100' : ''}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Ordinateur</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={formData.showAllAds ? 19 : formData.displayCountDesktop || 6}
                      onChange={e => updateField('displayCountDesktop', parseInt(e.target.value) || 6)}
                      disabled={formData.showAllAds}
                      className={formData.showAllAds ? 'bg-gray-100' : ''}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <input 
                    type="checkbox" 
                    id="show_all_ads" 
                    checked={formData.showAllAds || false}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      const newFormData = { ...formData, showAllAds: isChecked };
                      
                      if (isChecked) {
                        // Quand activé, utiliser le nombre total d'annonces pour tous les appareils
                        const totalAds = 19;
                        newFormData.displayCountMobile = totalAds;
                        newFormData.displayCountTablet = totalAds;
                        newFormData.displayCountDesktop = totalAds;
                      }
                      
                      setFormData(newFormData);
                      if (onPreviewUpdate) {
                        onPreviewUpdate(newFormData);
                      }
                    }}
                  />
                  <Label htmlFor="show_all_ads" className="text-sm">Toutes les annonces disponibles</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="categoryFilter">Catégorie d'annonces</Label>
                <Select value={formData.categoryFilter || 'all'} onValueChange={value => updateField('categoryFilter', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les annonces</SelectItem>
                    <SelectItem value="featured">Annonces vedettes</SelectItem>
                    <SelectItem value="day_trips">Excursions d'une journée</SelectItem>
                    <SelectItem value="multi_day">Séjours multi-jours</SelectItem>
                    <SelectItem value="custom">Personnalisé (manuelle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Note: Cette section n'a pas de boutons dans le design original */}
          </div>
        );

      case 'tour_ninja_section':
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Some Ideas For Your Next Trip'} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Some Ideas For Your Next Trip"
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.titleColor || '#333333'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
            </div>
            
            {/* Sous-titre */}
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Get inspired by our custom-designed travel experiences.'} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Get inspired by our custom-designed travel experiences."
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.subtitleColor || '#666666'}
                  onChange={(value) => updateField('subtitleColor', value)}
                />
              </div>
            </div>

            {/* Tiret */}
            <div>
              <Label htmlFor="divider">Tiret</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.dividerColor || '#E6B64C'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Configuration de la grille */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900">Configuration de la grille</h4>
              
              {/* Colonnes */}
              <div>
                <Label className="text-sm font-medium">Colonnes par appareil</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Mobile</Label>
                    <Select value={String(formData.mobileColumns || 1)} onValueChange={value => updateField('mobileColumns', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Tablette</Label>
                    <Select value={String(formData.tabletColumns || 2)} onValueChange={value => updateField('tabletColumns', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Ordinateur</Label>
                    <Select value={String(formData.desktopColumns || 3)} onValueChange={value => updateField('desktopColumns', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Nombre d'annonces */}
              <div>
                <Label className="text-sm font-medium">Nombre d'annonces à afficher</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Mobile</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={formData.showAllAds ? 19 : formData.displayCountMobile || 4}
                      onChange={e => updateField('displayCountMobile', parseInt(e.target.value) || 4)}
                      disabled={formData.showAllAds}
                      className={formData.showAllAds ? 'bg-gray-100' : ''}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Tablette</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={formData.showAllAds ? 19 : formData.displayCountTablet || 6}
                      onChange={e => updateField('displayCountTablet', parseInt(e.target.value) || 6)}
                      disabled={formData.showAllAds}
                      className={formData.showAllAds ? 'bg-gray-100' : ''}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Ordinateur</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={formData.showAllAds ? 19 : formData.displayCountDesktop || 6}
                      onChange={e => updateField('displayCountDesktop', parseInt(e.target.value) || 6)}
                      disabled={formData.showAllAds}
                      className={formData.showAllAds ? 'bg-gray-100' : ''}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <input 
                    type="checkbox" 
                    id="show_all_ads_price" 
                    checked={formData.showAllAds || false}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      const newFormData = { ...formData, showAllAds: isChecked };
                      
                      if (isChecked) {
                        // Quand activé, utiliser le nombre total d'annonces pour tous les appareils
                        const totalAds = 19;
                        newFormData.displayCountMobile = totalAds;
                        newFormData.displayCountTablet = totalAds;
                        newFormData.displayCountDesktop = totalAds;
                      }
                      
                      setFormData(newFormData);
                      if (onPreviewUpdate) {
                        onPreviewUpdate(newFormData);
                      }
                    }}
                  />
                  <Label htmlFor="show_all_ads_price" className="text-sm">Toutes les annonces disponibles</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="categoryFilter">Catégorie d'annonces</Label>
                <Select value={formData.categoryFilter || 'all'} onValueChange={value => updateField('categoryFilter', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les annonces</SelectItem>
                    <SelectItem value="featured">Annonces vedettes</SelectItem>
                    <SelectItem value="day_trips">Excursions d'une journée</SelectItem>
                    <SelectItem value="multi_day">Séjours multi-jours</SelectItem>
                    <SelectItem value="custom">Personnalisé (manuelle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Note: Cette section n'a pas de boutons dans le design original */}
          </div>
        );

      case 'why_choose_us':
        return (
          <div className="space-y-6">
            {/* Configuration des couleurs */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input 
                  id="title"
                  value={formData.title || 'Why Choose Us'} 
                  onChange={e => updateField('title', e.target.value)}
                  className="mt-2"
                />
                <div className="mt-3">
                  <ColorPicker
                    value={formData.titleColor || '#333333'}
                    onChange={(value) => updateField('titleColor', value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input 
                  id="subtitle"
                  value={formData.subtitle || 'Experience an exclusive private day trip with our English or French-speaking and certified guides.'} 
                  onChange={e => updateField('subtitle', e.target.value)}
                  className="mt-2"
                />
                <div className="mt-3">
                  <ColorPicker
                    value={formData.subtitleColor || '#666666'}
                    onChange={(value) => updateField('subtitleColor', value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="divider">Tiret</Label>
                <div className="mt-3">
                  <ColorPicker
                    value={formData.dividerColor || '#E6B64C'}
                    onChange={(value) => updateField('dividerColor', value)}
                  />
                </div>
              </div>
            </div>

            {/* Gestion des blocs d'icônes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Bloc d'icones</Label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const blocks = formData.iconBlocks || [];
                      if (blocks.length < 3) {
                        const newBlock = {
                          id: Date.now(),
                          mainIcon: 'fas fa-sparkles',
                          title: 'Nouveau Bloc',
                          description: 'Description de ce bloc d\'avantages.',
                          miniIcons: [
                            { icon: 'fas fa-check', text: 'Avantage 1' },
                            { icon: 'fas fa-check', text: 'Avantage 2' },
                            { icon: 'fas fa-check', text: 'Avantage 3' }
                          ]
                        };
                        updateField('iconBlocks', [...blocks, newBlock]);
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm ${formData.iconBlocks?.length >= 3 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    disabled={formData.iconBlocks?.length >= 3}
                  >
                    + Ajouter
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {(formData.iconBlocks || [
                  {
                    id: 1,
                    mainIcon: 'fas fa-user-friends',
                    title: 'Private Tours',
                    description: 'Experience an exclusive day trip with our professional guides and private vehicles.',
                    miniIcons: [
                      { icon: 'fas fa-car', text: 'Private Car' },
                      { icon: 'fas fa-language', text: 'Guide' },
                      { icon: 'fas fa-shield-alt', text: 'Safety' }
                    ]
                  },
                  {
                    id: 2,
                    mainIcon: 'fas fa-compass',
                    title: 'Customized Itineraries',
                    description: 'Create your own journey based on your desires, your pace, and your interests.',
                    miniIcons: [
                      { icon: 'fas fa-map-marked-alt', text: 'Custom Route' },
                      { icon: 'fas fa-clock', text: 'Flexible Time' },
                      { icon: 'fas fa-list-check', text: 'Your Pace' }
                    ]
                  },
                  {
                    id: 3,
                    mainIcon: 'fas fa-sparkles',
                    title: 'Authentic Experiences',
                    description: 'Discover destinations off the beaten path and immerse yourself in the local culture.',
                    miniIcons: [
                      { icon: 'fas fa-utensils', text: 'Local Food' },
                      { icon: 'fas fa-hands-helping', text: 'Local People' },
                      { icon: 'fas fa-landmark', text: 'Culture' }
                    ]
                  }
                ]).map((block: any, index: number) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-medium">Bloc {index + 1}</Label>
                      <button 
                        type="button"
                        onClick={() => {
                          const blocks = formData.iconBlocks || [];
                          const updatedBlocks = blocks.filter((b: any) => b.id !== block.id);
                          updateField('iconBlocks', updatedBlocks);
                        }}
                        className="text-black hover:text-gray-700 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Icône principale */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Icône principale</Label>
                        <div className="mt-2">
                          <div className="grid grid-cols-6 gap-2">
                            {[
                              { icon: 'fas fa-user-friends', component: <Users size={20} /> },
                              { icon: 'fas fa-compass', component: <Compass size={20} /> },
                              { icon: 'fas fa-sparkles', component: <Sparkles size={20} /> },
                              { icon: 'fas fa-heart', component: <Heart size={20} /> },
                              { icon: 'fas fa-trophy', component: <i className="fas fa-trophy text-lg"></i> }
                            ].map(({ icon, component }) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  const blocks = formData.iconBlocks || [];
                                  const updatedBlocks = blocks.map((b: any) => 
                                    b.id === block.id ? { ...b, mainIcon: icon } : b
                                  );
                                  updateField('iconBlocks', updatedBlocks);
                                }}
                                className={`p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors ${
                                  block.mainIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                                title={icon}
                              >
                                {component}
                              </button>
                            ))}
                            
                            {/* Option d'upload personnalisé */}
                            <button
                              type="button"
                              onClick={() => {
                                // TODO: Implémenter l'upload d'icône personnalisée
                                console.log('Upload d\'icône personnalisée');
                              }}
                              className="p-3 border-2 border-dashed border-blue-400 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors bg-blue-25"
                              title="Upload icône personnalisée"
                            >
                              <Plus size={20} className="text-blue-600" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Sélectionnez une icône principale pour ce bloc</p>
                        </div>
                      </div>
                      
                      {/* Titre et description */}
                      <div>
                        <Label>Titre</Label>
                        <Input 
                          value={block.title} 
                          onChange={e => {
                            const blocks = formData.iconBlocks || [];
                            const updatedBlocks = blocks.map((b: any) => 
                              b.id === block.id ? { ...b, title: e.target.value } : b
                            );
                            updateField('iconBlocks', updatedBlocks);
                          }}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea 
                          value={block.description} 
                          onChange={e => {
                            const blocks = formData.iconBlocks || [];
                            const updatedBlocks = blocks.map((b: any) => 
                              b.id === block.id ? { ...b, description: e.target.value } : b
                            );
                            updateField('iconBlocks', updatedBlocks);
                          }}
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Mini-icônes */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-gray-700">Mini-icônes</Label>
                          <button
                            type="button"
                            onClick={() => {
                              const blocks = formData.iconBlocks || [];
                              const updatedBlocks = blocks.map((b: any) => {
                                if (b.id === block.id) {
                                  const newMiniIcons = [...(b.miniIcons || []), { icon: 'fas fa-check', text: 'Nouveau' }];
                                  return { ...b, miniIcons: newMiniIcons };
                                }
                                return b;
                              });
                              updateField('iconBlocks', updatedBlocks);
                            }}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                          >
                            <Plus size={12} />
                            Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(block.miniIcons || []).map((miniIcon: any, miniIndex: number) => (
                            <div key={miniIndex} className="bg-gray-50 p-3 rounded-lg border">
                              {/* Texte en premier */}
                              <div className="mb-3">
                                <div className="flex gap-2 items-start">
                                  <div className="flex-1">
                                    <Label className="text-xs font-medium text-gray-600">Texte</Label>
                                    <Input 
                                      placeholder="Texte de la mini-icône (ex: Private Car)" 
                                      value={miniIcon.text} 
                                      onChange={e => {
                                        const blocks = formData.iconBlocks || [];
                                        const updatedBlocks = blocks.map((b: any) => {
                                          if (b.id === block.id) {
                                            const newMiniIcons = [...(b.miniIcons || [])];
                                            newMiniIcons[miniIndex] = { ...newMiniIcons[miniIndex], text: e.target.value };
                                            return { ...b, miniIcons: newMiniIcons };
                                          }
                                          return b;
                                        });
                                        updateField('iconBlocks', updatedBlocks);
                                      }}
                                      className="mt-1 h-9"
                                    />
                                  </div>
                                  
                                  {/* Bouton poubelle carré bleu */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const blocks = formData.iconBlocks || [];
                                      const updatedBlocks = blocks.map((b: any) => {
                                        if (b.id === block.id) {
                                          const newMiniIcons = [...(b.miniIcons || [])];
                                          newMiniIcons.splice(miniIndex, 1);
                                          return { ...b, miniIcons: newMiniIcons };
                                        }
                                        return b;
                                      });
                                      updateField('iconBlocks', updatedBlocks);
                                    }}
                                    className="bg-blue-500 text-white w-9 h-9 rounded hover:bg-blue-600 transition-colors flex items-center justify-center mt-6"
                                    title="Supprimer cette mini-icône"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Sélecteur d'icône */}
                              <div>
                                <Label className="text-xs font-medium text-gray-600 mb-2 block">Icône</Label>
                                <div className="grid grid-cols-9 gap-1 mb-2">
                                  {[
                                    { icon: 'fas fa-car', component: <i className="fas fa-car text-xs"></i>, label: 'Private Car' },
                                    { icon: 'fas fa-language', component: <i className="fas fa-language text-xs"></i>, label: 'Guide' },
                                    { icon: 'fas fa-shield-alt', component: <i className="fas fa-shield-alt text-xs"></i>, label: 'Safety' },
                                    { icon: 'fas fa-map-marked-alt', component: <i className="fas fa-map-marked-alt text-xs"></i>, label: 'Custom Route' },
                                    { icon: 'fas fa-clock', component: <i className="fas fa-clock text-xs"></i>, label: 'Flexible Time' },
                                    { icon: 'fas fa-list-check', component: <i className="fas fa-list-check text-xs"></i>, label: 'Your Pace' },
                                    { icon: 'fas fa-utensils', component: <i className="fas fa-utensils text-xs"></i>, label: 'Local Food' },
                                    { icon: 'fas fa-hands-helping', component: <i className="fas fa-hands-helping text-xs"></i>, label: 'Local People' },
                                    { icon: 'fas fa-landmark', component: <i className="fas fa-landmark text-xs"></i>, label: 'Culture' }
                                  ].map(({ icon, component, label }) => (
                                    <button
                                      key={icon}
                                      type="button"
                                      onClick={() => {
                                        const blocks = formData.iconBlocks || [];
                                        const updatedBlocks = blocks.map((b: any) => {
                                          if (b.id === block.id) {
                                            const newMiniIcons = [...(b.miniIcons || [])];
                                            newMiniIcons[miniIndex] = { ...newMiniIcons[miniIndex], icon: icon };
                                            return { ...b, miniIcons: newMiniIcons };
                                          }
                                          return b;
                                        });
                                        updateField('iconBlocks', updatedBlocks);
                                      }}
                                      className={`p-1.5 border rounded hover:bg-gray-50 flex items-center justify-center transition-colors ${
                                        miniIcon.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                      }`}
                                      title={label}
                                    >
                                      {component}
                                    </button>
                                  ))}
                                </div>
                                
                                {/* Input manuel avec boutons carrés bleus à côté */}
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="ou tapez fas fa-custom" 
                                    value={miniIcon.icon} 
                                    onChange={e => {
                                      const blocks = formData.iconBlocks || [];
                                      const updatedBlocks = blocks.map((b: any) => {
                                        if (b.id === block.id) {
                                          const newMiniIcons = [...(b.miniIcons || [])];
                                          newMiniIcons[miniIndex] = { ...newMiniIcons[miniIndex], icon: e.target.value };
                                          return { ...b, miniIcons: newMiniIcons };
                                        }
                                        return b;
                                      });
                                      updateField('iconBlocks', updatedBlocks);
                                    }}
                                    className="flex-1 text-xs h-9"
                                  />
                                  
                                  {/* Bouton upload avec contour pointillé bleu */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // TODO: Implémenter l'upload d'icône personnalisée pour mini-icônes
                                      console.log('Upload d\'icône personnalisée pour mini-icône');
                                    }}
                                    className="w-9 h-9 border-2 border-dashed border-blue-400 rounded hover:bg-blue-50 transition-colors flex items-center justify-center bg-blue-25"
                                    title="Upload icône personnalisée"
                                  >
                                    <Plus size={14} className="text-blue-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!block.miniIcons || block.miniIcons.length === 0) && (
                            <p className="text-xs text-gray-500 italic">Aucune mini-icône ajoutée. Utilisez le bouton "Ajouter" ci-dessus.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'who_we_are':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Who We Are'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mainText">Texte principal</Label>
              <Textarea 
                id="mainText"
                value={formData.mainText || 'We are Éric, Margaux, Gabriel, and Raphaël...'} 
                onChange={e => updateField('mainText', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="conceptTitle">Titre "Our Concept"</Label>
              <Input 
                id="conceptTitle"
                value={formData.conceptTitle || 'Our Concept'} 
                onChange={e => updateField('conceptTitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="conceptText">Texte concept</Label>
              <Textarea 
                id="conceptText"
                value={formData.conceptText || 'Combine the warmth and proximity...'} 
                onChange={e => updateField('conceptText', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'travelers_reviews':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Our Travelers Reviews'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Discover the authentic experiences...'} 
                onChange={e => updateField('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="googleRating">Note Google</Label>
              <Input 
                id="googleRating"
                value={formData.googleRating || '5.0'} 
                onChange={e => updateField('googleRating', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reviewCount">Nombre d'avis</Label>
              <Input 
                id="reviewCount"
                value={formData.reviewCount || '80'} 
                onChange={e => updateField('reviewCount', e.target.value)}
              />
            </div>
          </div>
        );

      case 'custom_tour_form':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Create Your Custom Trip'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Your travel story starts with your dreams...'} 
                onChange={e => updateField('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="formImage">Image du formulaire</Label>
              <Input 
                id="formImage"
                value={formData.formImage || '/catamaran-cruise.png'} 
                onChange={e => updateField('formImage', e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Aucune option d'édition pour ce type de bloc</p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t bg-gray-50 overflow-hidden"
    >
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-lg mb-1">Modifier: {getBlockDisplayName(block)}</h4>
        </div>
        
        {renderEditFields()}
        
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminPageEditor() {
  const [, setLocation] = useLocation();
  const [previewMode, setPreviewMode] = useState<'normal' | 'fullscreen'>('normal');
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [previewBlock, setPreviewBlock] = useState<PageBlock | null>(null);
  const [livePreviewData, setLivePreviewData] = useState<{ [blockId: number]: any }>({});
  const queryClient = useQueryClient();
  
  // Get page slug from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const pageSlug = urlParams.get('page') || 'home';

  // Fetch page configurations
  const { data: pageConfigs = [] } = useQuery<PageConfiguration[]>({
    queryKey: ['/api/admin/page-configurations'],
  });

  // Fetch page blocks
  const { data: pageBlocks = [], isLoading: loadingBlocks } = useQuery<PageBlock[]>({
    queryKey: ['/api/admin/page-blocks', pageSlug],
    queryFn: () => fetch(`/api/admin/page-blocks/${pageSlug}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch blocks');
      return res.json();
    }),
  });

  const currentPageConfig = pageConfigs?.find(p => p.pageSlug === pageSlug);

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: async (blockData: PageBlock) => {
      const response = await fetch(`/api/admin/page-blocks/${blockData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData),
      });
      if (!response.ok) throw new Error('Failed to update block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', pageSlug] });
      toast({ title: "Succès", description: "Bloc mis à jour avec succès" });
      setEditingBlockId(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le bloc", variant: "destructive" });
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: number) => {
      const response = await fetch(`/api/admin/page-blocks/${blockId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', pageSlug] });
      toast({ title: "Succès", description: "Bloc supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer le bloc", variant: "destructive" });
    },
  });

  // Toggle block visibility
  const toggleBlockVisibility = (block: PageBlock) => {
    updateBlockMutation.mutate({
      ...block,
      isActive: !block.isActive
    });
  };

  // Move block up/down
  const moveBlock = (block: PageBlock, direction: 'up' | 'down') => {
    const sortedBlocks = [...pageBlocks].sort((a, b) => a.blockOrder - b.blockOrder);
    const currentIndex = sortedBlocks.findIndex(b => b.id === block.id);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetBlock = sortedBlocks[currentIndex - 1];
      updateBlockMutation.mutate({ ...block, blockOrder: targetBlock.blockOrder });
      updateBlockMutation.mutate({ ...targetBlock, blockOrder: block.blockOrder });
    } else if (direction === 'down' && currentIndex < sortedBlocks.length - 1) {
      const targetBlock = sortedBlocks[currentIndex + 1];
      updateBlockMutation.mutate({ ...block, blockOrder: targetBlock.blockOrder });
      updateBlockMutation.mutate({ ...targetBlock, blockOrder: block.blockOrder });
    }
  };

  const sortedBlocks = [...pageBlocks].sort((a, b) => a.blockOrder - b.blockOrder);

  const goBack = () => {
    setLocation('/admin-appearance');
  };

  const viewLivePage = () => {
    // Open the live page in a new tab
    window.open(`/${pageSlug}`, '_blank');
  };

  const handlePageChange = (newPageSlug: string) => {
    setLocation(`/admin-page-editor/page=${newPageSlug}`);
  };

  if (!currentPageConfig) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-500">Page configuration not found</div>
            <Button onClick={goBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={goBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Éditeur de page</h1>
                  <p className="text-sm text-gray-600">Chaque bloc reproduit exactement la section correspondante de votre site web.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={pageSlug} onValueChange={handlePageChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sélectionner une page" />
                </SelectTrigger>
                <SelectContent>
                  {pageConfigs.map((page: PageConfiguration) => (
                    <SelectItem key={page.pageSlug} value={page.pageSlug}>
                      {page.pageName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={viewLivePage}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Voir la page
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">

        {/* Blocks List */}
        <div className="space-y-4">

          {loadingBlocks ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : pageBlocks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">Aucune section sur cette page</div>
              <p className="text-gray-400 text-sm mb-6">
                Les sections de votre site web s'afficheront ici
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedBlocks.map((block, index) => (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`overflow-hidden ${!block.isActive ? 'opacity-60' : ''}`}>
                      <CardHeader className="pb-4" id={`header-${block.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBlock(block, 'up')}
                                disabled={index === 0}
                                className="h-6 w-6 p-0"
                                title="Déplacer vers le haut"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBlock(block, 'down')}
                                disabled={index === sortedBlocks.length - 1}
                                className="h-6 w-6 p-0"
                                title="Déplacer vers le bas"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div>
                              <CardTitle className="text-lg">
                                {getBlockDisplayName(block)}
                              </CardTitle>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Visibility Toggle with integrated Switch */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center justify-between gap-3 min-w-[120px]"
                              >
                                <div className="flex items-center gap-2">
                                  {block.isActive ? (
                                    <><Eye className="w-4 h-4" />Visible</>
                                  ) : (
                                    <><EyeOff className="w-4 h-4" />Masqué</>
                                  )}
                                </div>
                                <Switch 
                                  checked={block.isActive}
                                  onCheckedChange={() => toggleBlockVisibility(block)}
                                />
                              </Button>
                            </div>

                            {/* Edit Dropdown Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newEditingId = editingBlockId === block.id ? null : block.id;
                                setEditingBlockId(newEditingId);
                                // Scroll automatique vers la section de modification
                                if (newEditingId) {
                                  setTimeout(() => scrollToElement(`edit-${block.id}`), 300);
                                }
                              }}
                              className={`flex items-center gap-1 ${editingBlockId === block.id ? 'bg-blue-100' : ''}`}
                            >
                              <Settings className="w-4 h-4" />
                              {editingBlockId === block.id ? 'Fermer' : 'Modifier'}
                            </Button>

                            {/* Delete Button with Confirmation */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    Supprimer cette section
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer la section "{block.title}" ? 
                                    Cette action est irréversible et la section disparaîtra définitivement de votre site web.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteBlockMutation.mutate(block.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer définitivement
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-0" id={`preview-${block.id}`}>
                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4" style={{ minHeight: 'auto' }}>
                          <RealBlockPreview 
                            block={block} 
                            isFullscreen={false} 
                            liveConfiguration={livePreviewData[block.id]} 
                          />
                        </div>
                        
                        {/* Edit Dropdown */}
                        <AnimatePresence>
                          <div id={`edit-${block.id}`}>
                            <BlockEditDropdown
                              block={block}
                              isOpen={editingBlockId === block.id}
                            onSave={(updatedBlock) => {
                              updateBlockMutation.mutate(updatedBlock);
                              setEditingBlockId(null);
                              // Garder les données de prévisualisation pour continuité visuelle
                              // Les nouvelles données sauvegardées seront automatiquement reflétées
                              // Scroll automatique vers la section de prévisualisation
                              setTimeout(() => scrollToElement(`header-${block.id}`), 300);
                            }}
                            onCancel={() => {
                              setEditingBlockId(null);
                              setLivePreviewData(prev => {
                                const newData = { ...prev };
                                delete newData[block.id];
                                return newData;
                              });
                              // Scroll automatique vers la section de prévisualisation
                              setTimeout(() => scrollToElement(`header-${block.id}`), 300);
                            }}
                            onPreviewUpdate={(config) => {
                              setLivePreviewData(prev => ({
                                ...prev,
                                [block.id]: config
                              }));
                            }}
                            />
                          </div>
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <Dialog open={previewBlock !== null} onOpenChange={() => setPreviewBlock(null)}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Aperçu plein écran: {previewBlock?.title}</DialogTitle>
            <DialogDescription>
              Reproduction exacte de la section telle qu'elle apparaît sur votre site web
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {previewBlock && (
              <RealBlockPreview block={previewBlock} isFullscreen={true} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}