import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Eye, EyeOff, ChevronUp, ChevronDown, Settings, Save, Undo, Trash2, AlertTriangle, Plus, ExternalLink } from 'lucide-react';

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
  const currentColorValue = value || '#ffffff';

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <div className="flex items-center gap-2">
        {/* Zone de sélection de couleur intégrée */}
        <div className="flex items-center gap-1 p-1 border border-gray-300 rounded bg-gray-50">
          {/* Case de couleur principale */}
          <div className="relative">
            <div 
              className="w-8 h-8 rounded border border-black cursor-pointer relative overflow-hidden"
              style={{ backgroundColor: currentColorValue }}
              title="Couleur actuelle - cliquez pour personnaliser"
            >
              <input
                type="color"
                value={currentColorValue}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Choisir une couleur personnalisée"
              />
            </div>
          </div>
          
          {/* Couleurs de thème intégrées */}
          <button
            type="button"
            onClick={() => onChange(THEME_COLORS.primary)}
            className={`w-6 h-6 rounded border transition-all hover:scale-105 ${
              currentColorValue === THEME_COLORS.primary ? 'border-gray-600 ring-1 ring-blue-200' : 'border-gray-300'
            }`}
            style={{ backgroundColor: THEME_COLORS.primary }}
            title="Bleu principal"
          />
          <button
            type="button"
            onClick={() => onChange(THEME_COLORS.secondary)}
            className={`w-6 h-6 rounded border transition-all hover:scale-105 ${
              currentColorValue === THEME_COLORS.secondary ? 'border-gray-600 ring-1 ring-yellow-200' : 'border-gray-300'
            }`}
            style={{ backgroundColor: THEME_COLORS.secondary }}
            title="Or secondaire"
          />
        </div>
        
        {/* Champ hex */}
        <Input
          value={currentColorValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="flex-1 font-mono text-sm"
        />
      </div>
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

// Import real components for exact preview
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import About from '@/components/home/About';
import CustomTourForm from '@/components/home/CustomTourForm';
import Testimonials from '@/components/home/Testimonials';
import TourNinjaSection from '@/components/tour/TourNinjaSection';

// Helper function to get readable block type names
const getBlockDisplayName = (blockType: string): string => {
  const blockNames: { [key: string]: string } = {
    'video_hero': 'Hero Section',
    'hero': 'Hero Section', 
    'text_image': 'Text & Image',
    'form': 'Form',
    'advantages': 'Advantages',
    'testimonials': 'Testimonials',
    'tour_ninja_section': 'Tour Section',
    'features': 'Features',
    'about': 'About',
    'custom_tour_form': 'Custom Tour Form',
    'popular_experiences': 'Popular Experiences',
    'expats_welcome': 'Expats Welcome',
    'who_we_are': 'Who We Are',
    'why_choose_us': 'Why Choose Us',
    'travelers_reviews': 'Travelers Reviews'
  };
  
  return blockNames[blockType] || blockType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
      
      case 'expats_welcome':
        // Section d'accueil basée sur le style du vrai site
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                  {liveConfiguration?.title || block.configuration?.title || "When expats welcome you in their host country"}
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {liveConfiguration?.content || block.configuration?.content || "This is a family-run travel agency that combines the organization of exclusive activities with the creation of tailor-made trips throughout the country. Our goal is to offer an immersive experience, far from mass tourism, with personalized service for every traveler — as if we were welcoming our own family or friends."}
                </p>
              </motion.div>
            </div>
          </section>
        );

      case 'popular_experiences':
        // Section "Our Popular Experiences" avec tours TourNinja
        return (
          <section id="tours" className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                  {liveConfiguration?.title || block.configuration?.title || "Our Popular Experiences"}
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {liveConfiguration?.subtitle || block.configuration?.subtitle || "Step off the beaten path into carefully curated experiences beyond the tourist trail."}
                </p>
              </motion.div>
            </div>
            
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, index) => (
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
                        <button className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg font-semibold transition-colors">
                          Details
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors">
                          Book
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'custom_tour_form':
        return <CustomTourForm />;

      case 'tour_ninja_section':
        return <TourNinjaSection />;

      case 'why_choose_us':
        return <Features />;

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

      case 'expats_welcome':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="When expats welcome you..."
              />
            </div>
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea 
                id="content"
                value={formData.content || block.configuration?.content || ''} 
                onChange={e => updateField('content', e.target.value)}
                placeholder="Contenu de la section..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'popular_experiences':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Our Popular Experiences"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || block.configuration?.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Step off the beaten path..."
              />
            </div>
            <div>
              <Label htmlFor="displayCount">Nombre de tours affichés</Label>
              <Select value={String(formData.displayCount || 6)} onValueChange={value => updateField('displayCount', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 tours</SelectItem>
                  <SelectItem value="6">6 tours</SelectItem>
                  <SelectItem value="9">9 tours</SelectItem>
                  <SelectItem value="12">12 tours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={formData.showViewAllButton !== false}
                onCheckedChange={checked => updateField('showViewAllButton', checked)}
              />
              <Label>Afficher le bouton "View All Our Tours"</Label>
            </div>
          </div>
        );

      case 'tour_ninja_section':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Some Ideas For Your Next Trip'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Get inspired by our custom-designed travel experiences.'} 
                onChange={e => updateField('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="displayCount">Nombre de tours affichés</Label>
              <Select value={String(formData.displayCount || 8)} onValueChange={value => updateField('displayCount', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 tours</SelectItem>
                  <SelectItem value="8">8 tours</SelectItem>
                  <SelectItem value="12">12 tours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'why_choose_us':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Why Choose Us'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Experience an exclusive private day trip...'} 
                onChange={e => updateField('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label>Les 3 avantages</Label>
              <div className="space-y-3 mt-2">
                <div className="border border-gray-200 rounded-lg p-3">
                  <Input 
                    placeholder="Private Tours" 
                    value={formData.feature1Title || 'Private Tours'} 
                    onChange={e => updateField('feature1Title', e.target.value)}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Experience an exclusive day trip..."
                    value={formData.feature1Desc || 'Experience an exclusive day trip with our professional guides and private vehicles.'} 
                    onChange={e => updateField('feature1Desc', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <Input 
                    placeholder="Customized Itineraries" 
                    value={formData.feature2Title || 'Customized Itineraries'} 
                    onChange={e => updateField('feature2Title', e.target.value)}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Create your own journey..."
                    value={formData.feature2Desc || 'Create your own journey based on your desires, your pace, and your interests.'} 
                    onChange={e => updateField('feature2Desc', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <Input 
                    placeholder="Authentic Experiences" 
                    value={formData.feature3Title || 'Authentic Experiences'} 
                    onChange={e => updateField('feature3Title', e.target.value)}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Discover destinations off the beaten path..."
                    value={formData.feature3Desc || 'Discover destinations off the beaten path and immerse yourself in the local culture.'} 
                    onChange={e => updateField('feature3Desc', e.target.value)}
                    rows={2}
                  />
                </div>
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
          <h4 className="font-semibold text-lg mb-1">Modifier: {getBlockDisplayName(block.blockType)}</h4>
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

  const currentPageConfig = pageConfigs.find(p => p.pageSlug === pageSlug);

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
                      <CardHeader className="pb-4">
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
                                {getBlockDisplayName(block.blockType)}
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
                              onClick={() => setEditingBlockId(editingBlockId === block.id ? null : block.id)}
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

                      <CardContent className="pb-0">
                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4" style={{ minHeight: 'auto' }}>
                          <RealBlockPreview 
                            block={block} 
                            isFullscreen={false} 
                            liveConfiguration={livePreviewData[block.id]} 
                          />
                        </div>
                        
                        {/* Edit Dropdown */}
                        <AnimatePresence>
                          <BlockEditDropdown
                            block={block}
                            isOpen={editingBlockId === block.id}
                            onSave={(updatedBlock) => {
                              updateBlockMutation.mutate(updatedBlock);
                              setLivePreviewData(prev => {
                                const newData = { ...prev };
                                delete newData[block.id];
                                return newData;
                              });
                            }}
                            onCancel={() => {
                              setEditingBlockId(null);
                              setLivePreviewData(prev => {
                                const newData = { ...prev };
                                delete newData[block.id];
                                return newData;
                              });
                            }}
                            onPreviewUpdate={(config) => {
                              setLivePreviewData(prev => ({
                                ...prev,
                                [block.id]: config
                              }));
                            }}
                          />
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