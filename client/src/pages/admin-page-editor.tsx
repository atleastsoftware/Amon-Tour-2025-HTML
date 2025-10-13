import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Eye, EyeOff, ChevronUp, ChevronDown, Settings, Save, Undo, Trash2, AlertTriangle, Plus, ExternalLink, ChevronRight, Users, Compass, Sparkles, Star, Heart, FormInput, Clock, MapPin, Search } from 'lucide-react';
import BlockSelectionPopup from '@/components/admin/BlockSelectionPopup';
import TourNinjaCard from '@/components/tour/TourNinjaCard';
import URLInput from '@/components/admin/URLInput';
import { useTourNinja } from '@/hooks/useTourNinja';

// Couleurs principales du thème
const THEME_COLORS = {
  primary: '#084F6E',
  secondary: '#3BA8AF',
  secondaryLight: 'rgba(59, 168, 175, 0.1)',
  secondaryHover: '#2e8a91' // Version plus foncée pour hover
};

// Fonction helper pour convertir hex en rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  // Cas spécifique pour expats_welcome : afficher "Text" au lieu de "Text + Images"
  if (block.identifier === 'expats_welcome') {
    return 'Text';
  }
  
  // Si c'est un card_grid, utiliser l'identifier pour distinguer les types
  if (block.blockType === 'card_grid') {
    const cardGridNames: { [key: string]: string } = {
      'popular_experiences': 'Card Grid Date',
      'tour_ninja_section': 'Card Grid Price'
    };
    return cardGridNames[block.identifier] || 'Card Grid';
  }
  
  // Pour les formulaires personnalisés, toujours afficher "Form"
  if (block.blockType === 'custom_tour_form') {
    return 'Form';
  }
  
  // Sinon utiliser le blockType normal
  const blockNames: { [key: string]: string } = {
    'video_hero': 'Hero Section',
    'hero': 'Hero Section',
    'text': 'Text',
    'text_image': 'Text + Images',
    'form': 'Form',
    'advantages': 'Text + Icones',
    'testimonials': 'Testimonials',
    'features': 'Features',
    'about': 'About',
    'popular_experiences': 'Card Grid Date',
    'custom_tour_form': 'Form',
    'tour_ninja_section': 'Card Grid Price',
    'why_choose_us': 'Text + Icones',
    'who_we_are': 'Text + Images',
    'travelers_reviews': 'Reviews'
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

// System colors for form preview
const SYSTEM_COLORS = {
  primary: '#084F6E',
  secondary: '#3BA8AF',
  white: '#ffffff',
  black: '#000000',
};

// Dynamic Form Block Preview Component
interface DynamicFormBlockPreviewProps {
  title?: string;
  subtitle?: string;
  formId?: number | null;
  titleColor?: string;
  subtitleColor?: string;
  dividerColor?: string;
  backgroundColor?: string;
}

function DynamicFormBlockPreview({ title, subtitle, formId, titleColor, subtitleColor, dividerColor, backgroundColor }: DynamicFormBlockPreviewProps) {
  const { data: formData, isLoading } = useQuery<any>({
    queryKey: ['/api/admin/custom-forms', formId],
    queryFn: () => formId ? fetch(`/api/admin/custom-forms/${formId}`).then(res => res.json()) : null,
    enabled: !!formId,
    refetchInterval: 2000, // Rafraîchir toutes les 2 secondes pour avoir les modifications en temps réel
    staleTime: 0, // Les données sont considérées obsolètes immédiatement
  });

  // Fonction pour résoudre la couleur (convertit 'primary' en '#084F6E', etc.)
  const resolveColor = (colorValue: string) => {
    return SYSTEM_COLORS[colorValue as keyof typeof SYSTEM_COLORS] || colorValue;
  };

  const renderFieldPreview = (field: any) => {
    const fieldStyle = {
      marginBottom: `${field.style?.marginBottom || 16}px`
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="w-full" style={fieldStyle}>
            <Label className="mb-2 block" style={{ color: resolveColor(formData.textColor) }}>
              {field.label}{field.required ? ' *' : ''}
            </Label>
            <Input placeholder={field.placeholder} type={field.type} style={{ color: resolveColor(formData.textColor) }} />
          </div>
        );
        
      case 'textarea':
        return (
          <div className="w-full" style={fieldStyle}>
            <Label className="mb-2 block" style={{ color: resolveColor(formData.textColor) }}>
              {field.label}{field.required ? ' *' : ''}
            </Label>
            <Textarea placeholder={field.placeholder} rows={4} style={{ color: resolveColor(formData.textColor) }} />
          </div>
        );
        
      case 'select':
        return (
          <div className="w-full" style={fieldStyle}>
            <Label className="mb-2 block" style={{ color: resolveColor(formData.textColor) }}>
              {field.label}{field.required ? ' *' : ''}
            </Label>
            <Select>
              <SelectTrigger style={{ color: resolveColor(formData.textColor) }}>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string, index: number) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="w-full" style={fieldStyle}>
            <Label className="mb-4 block" style={{ color: resolveColor(formData.textColor) }}>
              {field.label}{field.required ? ' *' : ''}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {field.options?.map((option: string, index: number) => (
                <div key={index} className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox 
                    id={`${field.id}-${index}`} 
                    className="mt-1 checkbox-custom" 
                    style={{ 
                      '--checkbox-color': resolveColor(formData.primaryColor),
                      accentColor: resolveColor(formData.primaryColor)
                    } as React.CSSProperties}
                  />
                  <Label 
                    htmlFor={`${field.id}-${index}`} 
                    className="text-sm font-normal cursor-pointer leading-5"
                    style={{ color: resolveColor(formData.textColor) }}
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div className="w-full" style={fieldStyle}>
            <Label className="mb-2 block" style={{ color: resolveColor(formData.textColor) }}>
              {field.label}{field.required ? ' *' : ''}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name={field.id} 
                    id={`${field.id}-${index}`}
                    style={{ accentColor: resolveColor(formData.primaryColor) }}
                  />
                  <Label htmlFor={`${field.id}-${index}`} style={{ color: resolveColor(formData.textColor) }}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'file':
        return (
          <div className="w-full" style={fieldStyle}>
            <Label className="mb-2 block" style={{ color: resolveColor(formData.textColor) }}>
              {field.label}{field.required ? ' *' : ''}
            </Label>
            <Input type="file" style={{ color: resolveColor(formData.textColor) }} />
          </div>
        );
        
      case 'date':
        return (
          <div className="w-full" style={fieldStyle}>
            <Label className="mb-2 block" style={{ color: resolveColor(formData.textColor) }}>
              {field.label}{field.required ? ' *' : ''}
            </Label>
            <Input 
              placeholder={field.placeholder || "Select trip dates"} 
              readOnly 
              className="cursor-pointer flatpickr-input" 
              style={{ color: resolveColor(formData.textColor) }}
              onClick={() => {}}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <section className="py-16" style={{ backgroundColor: backgroundColor || '#ffffff' }}>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="text-center mb-12 max-w-4xl mx-auto">
            {title && (
              <h2 
                className="font-heading font-bold text-3xl md:text-4xl mb-3"
                style={{
                  color: titleColor || '#333333'
                }}
              >
                {title}
              </h2>
            )}
            <div 
              className="w-20 h-1 mx-auto mb-8"
              style={{
                backgroundColor: dividerColor || '#3BA8AF'
              }}
            ></div>
            {subtitle && (
              <p 
                className="text-lg leading-relaxed"
                style={{
                  color: subtitleColor || '#666666'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Form Section */}
        {!formId ? (
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <FormInput className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">Aucun formulaire sélectionné</p>
            <p className="text-gray-400 text-sm mt-2">Sélectionnez un formulaire dans les options d'édition</p>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500">Chargement du formulaire...</p>
          </div>
        ) : formData ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {formData.formLayout === 'full' ? (
              // Layout Full (formulaire uniquement)
              <div className="p-8" style={{ backgroundColor: resolveColor(formData.frameColor) }}>
                {formData.headerImage && (
                  <div className="w-full h-64 mb-6 overflow-hidden rounded-lg">
                    <img 
                      src={formData.headerImage}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/catamaran-cruise.png';
                      }}
                    />
                  </div>
                )}
                <div className="max-w-3xl mx-auto">
                  <h3 
                    className="font-heading font-bold text-3xl mb-3"
                    style={{ color: resolveColor(formData.titleColor) }}
                  >
                    {formData.title || 'Titre du formulaire'}
                  </h3>
                  {formData.subtitle && (
                    <p 
                      className="mb-6"
                      style={{ color: resolveColor(formData.subtitleColor) }}
                    >
                      {formData.subtitle}
                    </p>
                  )}
                  {formData.fields?.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <FormInput className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun champ dans ce formulaire</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4">
                        {formData.fields?.map((field: any, index: number) => {
                          let colSpan = 'col-span-12';
                          
                          switch (field.style?.width) {
                            case 'half':
                              colSpan = 'col-span-12 md:col-span-6';
                              break;
                            case 'third':
                              colSpan = 'col-span-12 md:col-span-4';
                              break;
                            case 'twothirds':
                              colSpan = 'col-span-12 md:col-span-8';
                              break;
                            case 'full':
                            default:
                              colSpan = 'col-span-12';
                              break;
                          }
                          
                          return (
                            <div key={field.id || index} className={colSpan}>
                              {renderFieldPreview(field)}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="pt-4">
                        <button 
                          style={{ 
                            backgroundColor: resolveColor(formData.primaryColor),
                            color: '#ffffff'
                          }}
                          className="w-full px-8 py-3 rounded-md font-semibold"
                          disabled
                        >
                          {formData.settings?.submitButtonText || 'Envoyer'}
                        </button>
                        
                        {/* WhatsApp Button */}
                        {formData.settings?.whatsappButtonEnabled && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-600 mb-3">
                              {formData.settings?.whatsappButtonText || 'Or contact us directly via WhatsApp'}
                            </p>
                            <a
                              href="https://wa.me/66653496445?text=Hello%20Amon%20Tour,%20I%20would%20like%20to%20inquire%20about%20a%20custom%20tour."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-heading font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <i className="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                              Contact via WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Layout Colonnes (normal ou inversé)
              <div className={`grid grid-cols-1 md:grid-cols-2 min-h-[500px] ${
                formData.formLayout === 'columns-reversed' ? 'md:[&>:first-child]:order-2 md:[&>:last-child]:order-1' : ''
              }`}>
                {/* Image Side */}
                <div className="h-64 md:h-auto relative">
                  {formData.headerImage ? (
                    <img 
                      src={formData.headerImage}
                      alt="Header image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/catamaran-cruise.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                  <div 
                    className={`absolute inset-0 flex flex-col justify-center p-8 ${
                      formData.formLayout === 'columns-reversed' ? 'items-end text-right' : ''
                    }`}
                    style={{ 
                      background: `linear-gradient(to ${formData.formLayout === 'columns' ? 'right' : 'left'}, ${resolveColor(formData.primaryColor)}CC, transparent)` 
                    }}
                  >
                    <h3 
                      className="font-heading font-bold text-3xl mb-3"
                      style={{ color: resolveColor(formData.titleColor) }}
                    >
                      {formData.title || 'Titre du formulaire'}
                    </h3>
                    {formData.subtitle && (
                      <p 
                        className="max-w-xs"
                        style={{ color: resolveColor(formData.subtitleColor) }}
                      >
                        {formData.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Form Side */}
                <div className="p-8" style={{ backgroundColor: resolveColor(formData.frameColor) }}>
                  {formData.fields?.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 h-full flex flex-col items-center justify-center">
                      <FormInput className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun champ dans ce formulaire</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4">
                        {formData.fields?.map((field: any, index: number) => {
                          let colSpan = 'col-span-12';
                          
                          switch (field.style?.width) {
                            case 'half':
                              colSpan = 'col-span-12 md:col-span-6';
                              break;
                            case 'third':
                              colSpan = 'col-span-12 md:col-span-4';
                              break;
                            case 'twothirds':
                              colSpan = 'col-span-12 md:col-span-8';
                              break;
                            case 'full':
                            default:
                              colSpan = 'col-span-12';
                              break;
                          }
                          
                          return (
                            <div key={field.id || index} className={colSpan}>
                              {renderFieldPreview(field)}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="pt-4">
                        <button 
                          style={{ 
                            backgroundColor: resolveColor(formData.primaryColor),
                            color: '#ffffff'
                          }}
                          className="w-full px-8 py-3 rounded-md font-semibold"
                          disabled
                        >
                          {formData.settings?.submitButtonText || 'Envoyer'}
                        </button>
                        
                        {/* WhatsApp Button */}
                        {formData.settings?.whatsappButtonEnabled && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-600 mb-3">
                              {formData.settings?.whatsappButtonText || 'Or contact us directly via WhatsApp'}
                            </p>
                            <a
                              href="https://wa.me/66653496445?text=Hello%20Amon%20Tour,%20I%20would%20like%20to%20inquire%20about%20a%20custom%20tour."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-heading font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <i className="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                              Contact via WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500">Formulaire introuvable</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Form Selector Component
interface FormSelectorProps {
  selectedFormId: number | null;
  onFormSelect: (formId: number | null) => void;
  pageSlug: string;
  blockId: number;
}

function FormSelector({ selectedFormId, onFormSelect, pageSlug, blockId }: FormSelectorProps) {
  const { data: forms = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/custom-forms'],
  });

  const selectedForm = forms.find(f => f.id === selectedFormId);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Chargement des formulaires...</div>;
  }

  return (
    <div className="space-y-3">
      {selectedFormId ? (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedForm ? selectedForm.name : `Formulaire ID ${selectedFormId}`}
            </span>
            <Button
              onClick={() => onFormSelect(null)}
              variant="ghost"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </div>
          <Select 
            value={selectedFormId.toString()} 
            onValueChange={(value) => onFormSelect(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un formulaire" />
            </SelectTrigger>
            <SelectContent>
              {forms.map(form => (
                <SelectItem key={form.id} value={form.id.toString()}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator />
          <Button
            onClick={() => {
              sessionStorage.setItem('formEditorContext', JSON.stringify({
                returnToPage: pageSlug,
                blockId: blockId,
                formId: selectedFormId
              }));
              window.location.href = `/admin-editor-form`;
            }}
            className="w-full"
            variant="outline"
          >
            <FormInput className="w-4 h-4 mr-2" />
            Modifier le formulaire complet
          </Button>
        </div>
      ) : (
        <Select 
          value="" 
          onValueChange={(value) => {
            if (value === "new") {
              sessionStorage.setItem('formEditorContext', JSON.stringify({
                returnToPage: pageSlug,
                blockId: blockId,
                formId: null
              }));
              window.location.href = `/admin-editor-form`;
            } else {
              onFormSelect(parseInt(value));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir ou créer un formulaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Créer un nouveau formulaire
              </div>
            </SelectItem>
            {forms.map(form => (
              <SelectItem key={form.id} value={form.id.toString()}>
                {form.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

// Real Component Previews - Using ACTUAL website components only
const RealBlockPreview = ({ block, isFullscreen, liveConfiguration }: { block: PageBlock; isFullscreen: boolean; liveConfiguration?: any }) => {
  // Appeler tous les hooks au niveau du composant (règle de React)
  const { tours: tourNinjaTours, isLoading: tourNinjaLoading } = useTourNinja();
  
  const getActualComponent = () => {
    // Utiliser blockType pour les nouveaux blocs, identifier pour les anciens blocs hardcodés
    const matchKey = block.identifier.includes('_') && block.identifier.match(/_\d+$/) 
      ? block.blockType 
      : block.identifier;
    
    switch (matchKey) {
      case 'hero_main':
        const heroConfig = liveConfiguration || block.configuration || {};
        
        // Helper function to render title with colored accent
        const renderTitle = () => {
          const fullTitle = heroConfig.title || "Your exclusive experiences\nin Krabi –\nTHAILAND";
          const accentText = heroConfig.titleAccentText || "in Krabi –";
          const titleColor = heroConfig.titleColor || '#ffffff';
          const accentColor = heroConfig.titleAccentColor || '#084F6E';
          
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
                  style={{ backgroundColor: heroConfig.backgroundColor || '#084F6E' }}
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
                  {(heroConfig.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}]).map((button: any, index: number) => (
                    <span 
                      key={index}
                      className={`px-8 py-3 mt-4 rounded transition-colors cursor-pointer inline-block shadow-lg ${
                        (button.style || 'filled') === 'filled' 
                          ? 'text-white hover:opacity-90' 
                          : 'bg-transparent border-2 hover:bg-opacity-10'
                      }`}
                      style={{
                        backgroundColor: (button.style || 'filled') === 'filled' ? (button.color || '#084F6E') : 'transparent',
                        borderColor: (button.style || 'filled') === 'outline' ? (button.color || '#084F6E') : 'transparent',
                        color: (button.style || 'filled') === 'outline' ? (button.color || '#084F6E') : '#ffffff'
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
        // Section Text + Images complète
        const textImagesConfig = liveConfiguration || block.configuration || {};
        const sections = textImagesConfig.sections || [];
        const images = textImagesConfig.images || [];
        const buttons = textImagesConfig.buttons || [];
        
        return (
          <section className="py-20" style={{ backgroundColor: textImagesConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Titre */}
                <div className="text-center mb-12">
                  <h2 
                    className="font-heading font-bold text-3xl md:text-4xl mb-3"
                    style={{ 
                      color: textImagesConfig.titleColor || '#084F6E',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {textImagesConfig.title || "Who We Are"}
                  </h2>
                  <div 
                    className="w-20 h-1 mx-auto mb-8"
                    style={{ backgroundColor: textImagesConfig.dividerColor || '#3BA8AF' }}
                  ></div>
                </div>

                {/* Introduction */}
                {textImagesConfig.introduction && (
                  <div className="mb-12 text-center max-w-2xl mx-auto">
                    <p 
                      className="text-lg leading-relaxed"
                      style={{ 
                        color: textImagesConfig.introColor || '#666666',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {textImagesConfig.introduction}
                    </p>
                  </div>
                )}

                {/* Sous-sections dynamiques avec images */}
                <div className="space-y-16">
                  {sections.map((section: any, index: number) => {
                    const sectionImage = images.find((img: any) => img.sectionIndex === index);
                    const isLeftImage = sectionImage?.position === 'left';
                    
                    return (
                      <div key={index} className={`flex flex-col ${sectionImage ? 'md:flex-row' : ''} gap-8 items-center`}>
                        {sectionImage && isLeftImage && (
                          <div className="md:w-1/2">
                            <img 
                              src={sectionImage.url} 
                              alt={sectionImage.alt || section.subtitle}
                              className="w-full h-auto rounded-lg shadow-lg object-cover"
                              style={{ maxHeight: '500px' }}
                            />
                          </div>
                        )}
                        
                        <div className={sectionImage ? 'md:w-1/2' : 'max-w-4xl mx-auto'}>
                          <h3 
                            className="font-heading font-bold text-2xl md:text-3xl mb-4"
                            style={{ color: textImagesConfig.subtitleColor || '#084F6E' }}
                          >
                            {section.subtitle}
                          </h3>
                          <p 
                            className="text-lg leading-relaxed"
                            style={{ 
                              color: textImagesConfig.textColor || '#666666',
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {section.text}
                          </p>
                        </div>

                        {sectionImage && !isLeftImage && (
                          <div className="md:w-1/2">
                            <img 
                              src={sectionImage.url} 
                              alt={sectionImage.alt || section.subtitle}
                              className="w-full h-auto rounded-lg shadow-lg object-cover"
                              style={{ maxHeight: '500px' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Boutons */}
                {buttons.length > 0 && (
                  <div className="flex flex-wrap gap-4 justify-center mt-12">
                    {buttons.map((button: any, index: number) => (
                      <a
                        key={index}
                        href={button.url || '#'}
                        className={`px-8 py-3 rounded transition-colors inline-block ${
                          button.style === 'filled' 
                            ? 'text-white hover:opacity-90' 
                            : 'bg-transparent border-2 hover:bg-opacity-10'
                        }`}
                        style={{
                          backgroundColor: button.style === 'filled' ? (button.color || '#084F6E') : 'transparent',
                          borderColor: button.style === 'outline' ? (button.color || '#084F6E') : 'transparent',
                          color: button.style === 'outline' ? (button.color || '#084F6E') : '#ffffff'
                        }}
                      >
                        {button.text}
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        );

      case 'expats_welcome':
        // Section d'accueil basée sur le style du vrai site
        const expatsConfig = liveConfiguration || block.configuration || {};
        return (
          <section className="py-20" style={{ backgroundColor: expatsConfig.backgroundColor || '#ffffff' }}>
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
                  {expatsConfig.title || block.configuration?.title || block.title || "Titre de la section"}
                </h2>
                <div 
                  className="w-20 h-1 mx-auto mb-8"
                  style={{ backgroundColor: expatsConfig.dividerColor || '#3BA8AF' }}
                ></div>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: expatsConfig.contentColor || '#666666' }}
                >
                  {expatsConfig.content || block.configuration?.content || block.content || "Ajoutez ici le contenu de votre section de texte. Vous pouvez décrire vos services, partager votre histoire, ou présenter des informations importantes."}
                </p>
              </motion.div>
            </div>
          </section>
        );

      case 'text':
        // Section de texte - même rendu que expats_welcome
        const textConfig = liveConfiguration || block.configuration || {};
        return (
          <section className="py-20" style={{ backgroundColor: textConfig.backgroundColor || '#ffffff' }}>
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
                  {textConfig.title || block.configuration?.title || block.title || "Titre de la section"}
                </h2>
                <div 
                  className="w-20 h-1 mx-auto mb-8"
                  style={{ backgroundColor: textConfig.dividerColor || '#3BA8AF' }}
                ></div>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: textConfig.contentColor || '#666666' }}
                >
                  {textConfig.content || block.configuration?.content || block.content || "Ajoutez ici le contenu de votre section de texte. Vous pouvez décrire vos services, partager votre histoire, ou présenter des informations importantes."}
                </p>
              </motion.div>
            </div>
          </section>
        );

      case 'header_page':
        // Header de page (style "Our Experiences")
        const headerPageConfig = liveConfiguration || block.configuration || {};
        
        // Fonction pour afficher l'arrière-plan
        const renderHeaderBackground = () => {
          const bgType = headerPageConfig.backgroundType || 'image';
          
          switch (bgType) {
            case 'color':
              return (
                <div 
                  className="absolute inset-0 w-full h-full z-0"
                  style={{ backgroundColor: headerPageConfig.backgroundColor || '#084F6E' }}
                />
              );
            
            case 'gradient':
              return (
                <div 
                  className="absolute inset-0 w-full h-full z-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${headerPageConfig.gradientColor1 || '#084F6E'} 0%, ${headerPageConfig.gradientColor2 || '#3BA8AF'} 100%)` 
                  }}
                />
              );
            
            case 'video':
              if (headerPageConfig.videoUrl) {
                return (
                  <div className="absolute inset-0 w-full h-full z-0">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    >
                      <source src={headerPageConfig.videoUrl} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
                  </div>
                );
              }
              return <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-secondary z-0" />;
            
            case 'image':
            default:
              if (headerPageConfig.imageUrl) {
                return (
                  <>
                    <img 
                      src={headerPageConfig.imageUrl} 
                      alt={headerPageConfig.imageAlt || headerPageConfig.title || 'Header background'} 
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute inset-0 bg-black/50 z-10"></div>
                  </>
                );
              }
              return (
                <>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-secondary z-0" />
                  <div className="absolute inset-0 bg-black/50 z-10"></div>
                </>
              );
          }
        };
        
        // Déterminer la taille du cadre
        const frameSize = headerPageConfig.frameSize || 'small';
        const heightClass = frameSize === 'large' ? 'h-[70vh]' : 'h-[35vh] md:h-[52vh]';
        
        return (
          <section className={`relative ${heightClass}`}>
            {renderHeaderBackground()}
            <div className="relative z-20 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
              {headerPageConfig.iconUrl && (
                <div 
                  className="w-16 h-16 mx-auto mb-6"
                  style={{ 
                    WebkitMaskImage: `url(${headerPageConfig.iconUrl})`,
                    maskImage: `url(${headerPageConfig.iconUrl})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    backgroundColor: headerPageConfig.iconColor || '#ffffff'
                  }}
                />
              )}
              <h1 
                className="text-4xl md:text-5xl font-heading font-bold mb-4"
                style={{ color: headerPageConfig.titleColor || '#ffffff', whiteSpace: 'pre-line' }}
              >
                {headerPageConfig.title || 'Titre de la page'}
              </h1>
              {headerPageConfig.subtitle && (
                <p 
                  className="text-lg md:text-xl max-w-2xl mx-auto mb-6"
                  style={{ color: headerPageConfig.subtitleColor || '#ffffff', whiteSpace: 'pre-line' }}
                >
                  {headerPageConfig.subtitle}
                </p>
              )}
              {headerPageConfig.buttons && headerPageConfig.buttons.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {headerPageConfig.buttons.map((button: any, index: number) => (
                    <span 
                      key={index}
                      className={`px-8 py-3 rounded transition-colors cursor-pointer inline-block shadow-lg ${
                        (button.style || 'filled') === 'filled' 
                          ? 'text-white hover:opacity-90' 
                          : 'bg-transparent border-2 hover:bg-opacity-10'
                      }`}
                      style={{
                        backgroundColor: (button.style || 'filled') === 'filled' ? (button.color || '#084F6E') : 'transparent',
                        borderColor: (button.style || 'filled') === 'outline' ? (button.color || '#084F6E') : 'transparent',
                        color: (button.style || 'filled') === 'outline' ? (button.color || '#084F6E') : '#ffffff'
                      }}
                    >
                      {button.text || `Bouton ${index + 1}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'popular_experiences':
        // Section "Our Popular Experiences" - Card Grid Date avec badges de jours
        const realTours = tourNinjaTours;
        const toursLoading = tourNinjaLoading;
        
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
        } else if (categoryFilter === 'custom') {
          // Filtrer uniquement les tours sélectionnés manuellement
          const selectedIds = popularConfig.selectedTourIds || [];
          if (selectedIds.length > 0) {
            filteredTours = filteredTours.filter(tour => selectedIds.includes(tour.id));
          }
        }
        // 'all' garde tous les tours
        
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
          <section id="tours" className="py-16" style={{ backgroundColor: popularConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4 max-w-4xl text-center mb-8">
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
                  className="w-20 h-1 mx-auto mb-8"
                  style={{
                    backgroundColor: popularConfig.dividerColor || '#3BA8AF'
                  }}
                ></div>
                <p 
                  className="text-lg leading-relaxed"
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
                  displayTours.map((tour, index) => {
                    const bgColor = popularConfig.cardButtonColor || '#2563eb';
                    const hasImage = !!tour.primaryImage;
                    
                    return (
                      <motion.div
                        key={`${tour.id || index}-${bgColor}`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                      >
                        <div className="relative h-48">
                          {!hasImage ? (
                            <div 
                              key={bgColor}
                              className="w-full h-full relative overflow-hidden"
                              style={{ 
                                background: `linear-gradient(135deg, ${hexToRgba(bgColor, 0.3)}, ${hexToRgba(bgColor, 0.6)})`
                              }}
                            >
                            </div>
                          ) : (
                            <img
                              src={tour.primaryImage}
                              alt={tour.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parentDiv = target.parentElement;
                                if (parentDiv) {
                                  target.remove();
                                  parentDiv.innerHTML = `
                                    <div class="w-full h-full relative overflow-hidden" style="background: linear-gradient(135deg, ${hexToRgba(bgColor, 0.3)}, ${hexToRgba(bgColor, 0.6)})">
                                    </div>
                                  `;
                                }
                              }}
                            />
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
                          <button 
                            className="flex-1 border py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                            style={{
                              borderColor: popularConfig.cardButtonColor || '#2563eb',
                              color: popularConfig.cardButtonColor || '#2563eb',
                              backgroundColor: 'white',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = (popularConfig.cardButtonColor || '#2563eb') + '10';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            View details
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button 
                            className="flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-white flex items-center justify-center gap-1"
                            style={{
                              backgroundColor: popularConfig.cardButtonColor || '#2563eb',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.filter = 'brightness(110%)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.filter = 'brightness(100%)';
                            }}
                          >
                            Book now
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })
                ) : (
                  // Fallback si pas de tours avec le bon nombre
                  Array.from({ length: Math.min(displayCount, 12) }).map((_, index) => (
                    <motion.div
                      key={`${index}-${popularConfig.cardButtonColor || '#2563eb'}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                    >
                      <div 
                        key={popularConfig.cardButtonColor}
                        className="relative h-48 overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${hexToRgba(popularConfig.cardButtonColor || '#2563eb', 0.3)}, ${hexToRgba(popularConfig.cardButtonColor || '#2563eb', 0.6)})`
                        }}
                      >
                        <div className="absolute top-4 right-4 z-20">
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
                          <button 
                            className="flex-1 border py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                            style={{
                              borderColor: popularConfig.cardButtonColor || '#2563eb',
                              color: popularConfig.cardButtonColor || '#2563eb',
                              backgroundColor: 'white',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = (popularConfig.cardButtonColor || '#2563eb') + '10';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            View details
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button 
                            className="flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-white flex items-center justify-center gap-1"
                            style={{
                              backgroundColor: popularConfig.cardButtonColor || '#2563eb',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.filter = 'brightness(110%)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.filter = 'brightness(100%)';
                            }}
                          >
                            Book now
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Bouton d'action en bas de section */}
              {popularConfig.buttonText && (
                <div className="flex justify-center mt-8">
                  {popularConfig.buttonUrl ? (
                    <a 
                      href={popularConfig.buttonUrl}
                      className="px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all"
                      style={{
                        backgroundColor: popularConfig.buttonStyle === 'outline' ? 'transparent' : (popularConfig.buttonBackgroundColor || '#084F6E'),
                        color: popularConfig.buttonStyle === 'outline' ? (popularConfig.buttonBackgroundColor || '#084F6E') : (popularConfig.buttonTextColor || '#ffffff'),
                        border: popularConfig.buttonStyle === 'outline' ? `2px solid ${popularConfig.buttonBackgroundColor || '#084F6E'}` : 'none'
                      }}
                    >
                      {popularConfig.buttonText}
                    </a>
                  ) : (
                    <button 
                      className="px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all"
                      style={{
                        backgroundColor: popularConfig.buttonStyle === 'outline' ? 'transparent' : (popularConfig.buttonBackgroundColor || '#084F6E'),
                        color: popularConfig.buttonStyle === 'outline' ? (popularConfig.buttonBackgroundColor || '#084F6E') : (popularConfig.buttonTextColor || '#ffffff'),
                        border: popularConfig.buttonStyle === 'outline' ? `2px solid ${popularConfig.buttonBackgroundColor || '#084F6E'}` : 'none'
                      }}
                    >
                      {popularConfig.buttonText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case 'custom_tour_form':
        // Utiliser liveConfiguration pour l'édition en temps réel
        const customFormTitle = (liveConfiguration?.title !== undefined ? liveConfiguration.title : block.title) || 'Our Tailor-made trips';
        const customFormSubtitle = (liveConfiguration?.subtitle !== undefined ? liveConfiguration.subtitle : block.subtitle) || 'Design your own journey through Thailand with our tailor-made stays: from cultural discoveries and family adventures to romantic getaways and island escapes. Every itinerary is crafted to match your wishes, offering authentic experiences, quality services, and a unique immersion far from mass tourism.';
        const selectedFormId = (liveConfiguration?.formId !== undefined ? liveConfiguration.formId : block.configuration?.formId);
        const customFormTitleColor = (liveConfiguration?.titleColor !== undefined ? liveConfiguration.titleColor : block.configuration?.titleColor) || '#333333';
        const customFormSubtitleColor = (liveConfiguration?.subtitleColor !== undefined ? liveConfiguration.subtitleColor : block.configuration?.subtitleColor) || '#666666';
        const customFormDividerColor = (liveConfiguration?.dividerColor !== undefined ? liveConfiguration.dividerColor : block.configuration?.dividerColor) || '#3BA8AF';
        const customFormBackgroundColor = (liveConfiguration?.backgroundColor !== undefined ? liveConfiguration.backgroundColor : block.configuration?.backgroundColor) || '#ffffff';
        
        return (
          <DynamicFormBlockPreview 
            title={customFormTitle} 
            subtitle={customFormSubtitle}
            formId={selectedFormId}
            titleColor={customFormTitleColor}
            subtitleColor={customFormSubtitleColor}
            dividerColor={customFormDividerColor}
            backgroundColor={customFormBackgroundColor}
          />
        );

      case 'tour_ninja_section':
        // Section "Some Ideas For Your Next Trip" - Card Grid Price avec badges de prix
        const realToursPrice = tourNinjaTours;
        const toursLoadingPrice = tourNinjaLoading;
        
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
        } else if (categoryFilterPrice === 'custom') {
          // Filtrer uniquement les tours sélectionnés manuellement
          const selectedIds = config.selectedTourIds || [];
          if (selectedIds.length > 0) {
            filteredToursPrice = filteredToursPrice.filter(tour => selectedIds.includes(tour.id));
          }
        }
        // 'all' garde tous les tours
        
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
          <section className="py-16" style={{ backgroundColor: config.backgroundColor || '#f9fafb' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 max-w-4xl mx-auto">
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
                    className="w-20 h-1 mx-auto mb-8"
                    style={{
                      backgroundColor: config.dividerColor || '#3BA8AF'
                    }}
                  ></div>
                  <p 
                    className="text-lg leading-relaxed"
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
                    <motion.div
                      key={`${tour.id || index}-${config.cardsColor || THEME_COLORS.primary}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full">
                        <div className="relative h-48">
                          {!tour.primaryImage ? (
                            <div 
                              key={config.cardsColor}
                              className="h-48 relative overflow-hidden"
                              style={{ 
                                background: `linear-gradient(135deg, ${hexToRgba(config.cardsColor || THEME_COLORS.primary, 0.3)}, ${hexToRgba(config.cardsColor || THEME_COLORS.primary, 0.6)})`
                              }}
                            ></div>
                          ) : (
                            <img
                              src={tour.primaryImage}
                              alt={tour.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parentDiv = target.parentElement;
                                const bgColor = config.cardsColor || THEME_COLORS.primary;
                                if (parentDiv) {
                                  target.remove();
                                  parentDiv.innerHTML = `
                                    <div class="h-48 relative overflow-hidden" style="background: linear-gradient(135deg, ${hexToRgba(bgColor, 0.3)}, ${hexToRgba(bgColor, 0.6)})">
                                    </div>
                                  `;
                                }
                              }}
                              loading="lazy"
                            />
                          )}
                          
                          <div className="absolute top-3 right-3">
                            <span className="bg-white/90 text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">
                              {tour.price > 0 
                                ? (tour.currency === 'THB' ? `฿${tour.price.toLocaleString()}` : `${tour.price} ${tour.currency || 'THB'}`)
                                : 'Prix sur demande'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {tour.name}
                          </h3>
                          
                          {tour.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {tour.description}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <button 
                              className="flex-1 border py-2 px-4 rounded-md font-medium text-sm transition-colors"
                              style={{
                                borderColor: config.cardsColor || THEME_COLORS.primary,
                                color: config.cardsColor || THEME_COLORS.primary,
                                backgroundColor: 'white'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = (config.cardsColor || THEME_COLORS.primary) + '10';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                              }}
                            >
                              View details
                            </button>
                            <button 
                              className="flex-1 py-2 px-4 rounded-md font-medium text-sm text-white transition-colors"
                              style={{
                                backgroundColor: config.cardsColor || THEME_COLORS.primary
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter = 'brightness(110%)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = 'brightness(100%)';
                              }}
                            >
                              Book now
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tours available at the moment.</p>
                </div>
              )}
              
              {/* Bouton d'action en bas de section */}
              {config.buttonText && (
                <div className="flex justify-center mt-8">
                  {config.buttonUrl ? (
                    <a 
                      href={config.buttonUrl}
                      className="px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all"
                      style={{
                        backgroundColor: config.buttonStyle === 'outline' ? 'transparent' : (config.buttonBackgroundColor || '#084F6E'),
                        color: config.buttonStyle === 'outline' ? (config.buttonBackgroundColor || '#084F6E') : (config.buttonTextColor || '#ffffff'),
                        border: config.buttonStyle === 'outline' ? `2px solid ${config.buttonBackgroundColor || '#084F6E'}` : 'none'
                      }}
                    >
                      {config.buttonText}
                    </a>
                  ) : (
                    <button 
                      className="px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all"
                      style={{
                        backgroundColor: config.buttonStyle === 'outline' ? 'transparent' : (config.buttonBackgroundColor || '#084F6E'),
                        color: config.buttonStyle === 'outline' ? (config.buttonBackgroundColor || '#084F6E') : (config.buttonTextColor || '#ffffff'),
                        border: config.buttonStyle === 'outline' ? `2px solid ${config.buttonBackgroundColor || '#084F6E'}` : 'none'
                      }}
                    >
                      {config.buttonText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case 'search_bar_tours':
        // Barre de recherche + grille de tours (style page /tours)
        const searchBarConfig = liveConfiguration || block.configuration || {};
        const allTours = tourNinjaTours || [];
        const searchBarLoading = tourNinjaLoading;
        
        // Configuration des paramètres
        const filtersTitle = searchBarConfig.filtersTitle || '';
        const searchPlaceholder = searchBarConfig.searchPlaceholder || '';
        const filtersBgColor = searchBarConfig.filtersBgColor || '#ffffff';
        const filtersTextColor = searchBarConfig.filtersTextColor || '#333333';
        const cardsColor = searchBarConfig.cardsColor || '#084F6E';
        const sectionBgColor = searchBarConfig.backgroundColor || '#ffffff';
        const mobileColumns = searchBarConfig.mobileColumns || 1;
        const tabletColumns = searchBarConfig.tabletColumns || 2;
        const desktopColumns = searchBarConfig.desktopColumns || 3;
        
        return (
          <section className="py-16" style={{ backgroundColor: sectionBgColor }}>
            <div className="container mx-auto px-4">
              {/* Barre de filtres */}
              <div 
                className="rounded-xl shadow-lg p-6 mb-8"
                style={{ backgroundColor: filtersBgColor }}
              >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                  <h2 
                    className="text-xl font-semibold"
                    style={{ color: filtersTextColor }}
                  >
                    {filtersTitle}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                  {/* Recherche */}
                  <div className="relative md:col-span-2 lg:col-span-2">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      placeholder={searchPlaceholder}
                      className="pl-10 w-full p-2 border rounded-md"
                      style={{ color: filtersTextColor }}
                    />
                  </div>

                  {/* Prix */}
                  <select className="p-2 border rounded-md" style={{ color: filtersTextColor }}>
                    <option>All prices</option>
                  </select>

                  {/* Durée */}
                  <select className="p-2 border rounded-md" style={{ color: filtersTextColor }}>
                    <option>All durations</option>
                  </select>

                  {/* Destination */}
                  <select className="p-2 border rounded-md" style={{ color: filtersTextColor }}>
                    <option>All destinations</option>
                  </select>
                </div>
              </div>

              {/* Grille de tours */}
              {searchBarLoading ? (
                <div 
                  className={`grid gap-8 ${
                    mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  } ${
                    tabletColumns === 1 ? 'md:grid-cols-1' :
                    tabletColumns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                  } ${
                    desktopColumns === 1 ? 'lg:grid-cols-1' :
                    desktopColumns === 2 ? 'lg:grid-cols-2' :
                    desktopColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                  }`}
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" />
                  ))}
                </div>
              ) : allTours.length > 0 ? (
                <motion.div 
                  className={`grid gap-8 ${
                    mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  } ${
                    tabletColumns === 1 ? 'md:grid-cols-1' :
                    tabletColumns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                  } ${
                    desktopColumns === 1 ? 'lg:grid-cols-1' :
                    desktopColumns === 2 ? 'lg:grid-cols-2' :
                    desktopColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {allTours.map((tour: any, index: number) => (
                    <motion.div
                      key={tour.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card 
                        className="h-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden bg-white"
                      >
                        <div 
                          className="relative h-64 cursor-pointer"
                          style={{
                            background: tour.primaryImage 
                              ? 'none'
                              : `linear-gradient(to bottom right, ${hexToRgba(cardsColor, 0.4)}, ${hexToRgba(cardsColor, 0.6)})`
                          }}
                        >
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
                              <MapPin className="h-16 w-16" style={{ color: hexToRgba(cardsColor, 0.7) }} />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-white/90 text-gray-800">
                              <Clock className="h-3 w-3 mr-1" />
                              {tour.duration} day{Number(tour.duration) > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 cursor-pointer hover:text-primary transition-colors">
                            {tour.name}
                          </h3>
                          
                          {tour.shortDescription && (
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {tour.shortDescription}
                            </p>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            {tour.location}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              className="flex-1"
                              style={{
                                borderColor: cardsColor,
                                color: cardsColor
                              }}
                            >
                              View details
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                            <Button 
                              className="flex-1 text-white"
                              style={{
                                backgroundColor: cardsColor
                              }}
                            >
                              Book
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
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
          <section className="py-16" style={{ backgroundColor: featuresConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 max-w-4xl mx-auto">
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
                    className="w-20 h-1 mx-auto mb-8"
                    style={{ backgroundColor: featuresConfig.dividerColor || '#3BA8AF' }}
                  ></div>
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: featuresConfig.subtitleColor || '#666666' }}
                  >
{featuresConfig.subtitle || 'Experience an exclusive private day trip with our English or French-speaking and certified guides.'}
                  </p>
                </motion.div>
              </div>
              
              {(() => {
                const allBlocks = featuresConfig.iconBlocks || [
                  {
                    id: 1,
                    mainIcon: 'fas fa-user-friends',
                    title: 'Private Tours',
                    description: 'Experience an exclusive day trip with our professional guides and private vehicles.',
                    iconColor: THEME_COLORS.primary,
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
                    iconColor: THEME_COLORS.primary,
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
                    iconColor: THEME_COLORS.primary,
                    miniIcons: [
                      { icon: 'fas fa-utensils', text: 'Local Food' },
                      { icon: 'fas fa-hands-helping', text: 'Local People' },
                      { icon: 'fas fa-landmark', text: 'Culture' }
                    ]
                  }
                ];
                
                const blocksCount = allBlocks.length;
                const iconStyle = featuresConfig.iconStyle || 'modern-card';
                
                // 1-4 blocs : une seule ligne
                // 5 blocs : 3 en haut, 2 en bas centrés
                // 6 blocs : 3 en haut, 3 en bas
                
                const renderBlock = (feature: any, index: number) => {
                  // Style Minimaliste
                  if (iconStyle === 'minimalist') {
                    return (
                      <motion.div 
                        key={`minimalist-${feature.id}-${feature.iconColor || THEME_COLORS.primary}`}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ 
                            backgroundColor: hexToRgba(feature.iconColor || THEME_COLORS.primary, 0.06),
                            color: feature.iconColor || THEME_COLORS.primary 
                          }}
                        >
                          {/* Si c'est une URL d'image, afficher l'image */}
                          {feature.mainIcon && (feature.mainIcon.startsWith('http') || feature.mainIcon.startsWith('/')) ? (
                            <img 
                              src={feature.mainIcon} 
                              alt={feature.title} 
                              className="w-8 h-8 object-cover"
                              style={{ filter: `brightness(0) saturate(100%)`, color: feature.iconColor || THEME_COLORS.primary }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                const fallbackIcon = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                if (fallbackIcon) fallbackIcon.style.display = 'block';
                              }}
                            />
                          ) : (
                            <>
                              {feature.mainIcon === 'fas fa-user-friends' && <Users size={28} />}
                              {feature.mainIcon === 'fas fa-compass' && <Compass size={28} />}
                              {feature.mainIcon === 'fas fa-sparkles' && <Sparkles size={28} />}
                              {!['fas fa-user-friends', 'fas fa-compass', 'fas fa-sparkles'].includes(feature.mainIcon) && (
                                <i className={`${feature.mainIcon} text-2xl`} style={{ display: feature.mainIcon && (feature.mainIcon.startsWith('http') || feature.mainIcon.startsWith('/')) ? 'none' : 'block' }}></i>
                              )}
                            </>
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-xl mb-3">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                        
                        {/* Mini icônes si présentes */}
                        {feature.miniIcons && feature.miniIcons.length > 0 && (
                          <div className={`mt-4 grid gap-4 ${
                            feature.miniIcons.length === 1 ? 'grid-cols-1 justify-items-center' : 
                            feature.miniIcons.length === 2 ? 'grid-cols-2 justify-items-center max-w-[200px] mx-auto' : 
                            'grid-cols-3'
                          }`}>
                            {feature.miniIcons.slice(0, 3).map((miniIcon: any, miniIndex: number) => (
                              <div key={miniIndex} className="flex flex-col items-center">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                                  style={{ 
                                    backgroundColor: hexToRgba(feature.iconColor || THEME_COLORS.primary, 0.06),
                                    color: feature.iconColor || THEME_COLORS.primary 
                                  }}
                                >
                                  {miniIcon.icon && (miniIcon.icon.startsWith('http') || miniIcon.icon.startsWith('/')) ? (
                                    <img 
                                      src={miniIcon.icon} 
                                      alt={miniIcon.text} 
                                      className="w-5 h-5 object-cover"
                                    />
                                  ) : (
                                    <i className={`${miniIcon.icon || 'fas fa-question'} text-sm`}></i>
                                  )}
                                </div>
                                <span className="text-xs text-center">{miniIcon.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  }
                  
                  // Style Carte moderne (par défaut)
                  return (
                    <motion.div 
                      key={`modern-card-${feature.id}-${feature.iconColor || THEME_COLORS.primary}`}
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
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg"
                        style={{ backgroundColor: feature.iconColor || THEME_COLORS.primary }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Si c'est une URL d'image, afficher l'image */}
                        {feature.mainIcon && (feature.mainIcon.startsWith('http') || feature.mainIcon.startsWith('/')) ? (
                          <img 
                            src={feature.mainIcon} 
                            alt={feature.title} 
                            className="w-10 h-10 object-cover rounded-full"
                            style={{ filter: 'brightness(0) invert(1)' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                              const fallbackIcon = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                              if (fallbackIcon) fallbackIcon.style.display = 'block';
                            }}
                          />
                        ) : (
                          <>
                            {feature.mainIcon === 'fas fa-user-friends' && <Users size={28} className="text-white" />}
                            {feature.mainIcon === 'fas fa-compass' && <Compass size={28} className="text-white" />}
                            {feature.mainIcon === 'fas fa-sparkles' && <Sparkles size={28} className="text-white" />}
                            {!['fas fa-user-friends', 'fas fa-compass', 'fas fa-sparkles'].includes(feature.mainIcon) && (
                              <i className={`${feature.mainIcon} text-white text-2xl`} style={{ display: feature.mainIcon && (feature.mainIcon.startsWith('http') || feature.mainIcon.startsWith('/')) ? 'none' : 'block' }}></i>
                            )}
                          </>
                        )}
                      </motion.div>
                      <h3 className="font-heading font-bold text-xl mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      
                      <motion.div 
                        className={`mt-4 grid gap-4 ${
                          (feature.miniIcons?.length || 0) === 1 ? 'grid-cols-1 justify-items-center' : 
                          (feature.miniIcons?.length || 0) === 2 ? 'grid-cols-2 justify-items-center max-w-[200px] mx-auto' : 
                          'grid-cols-3'
                        }`}
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
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                              style={{ backgroundColor: hexToRgba(feature.iconColor || THEME_COLORS.primary, 0.06) }}
                            >
                              {miniIcon.icon && (miniIcon.icon.startsWith('http') || miniIcon.icon.startsWith('/')) ? (
                                <img 
                                  src={miniIcon.icon} 
                                  alt={miniIcon.text} 
                                  className="w-6 h-6 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                    const fallbackIcon = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                    if (fallbackIcon) fallbackIcon.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <i 
                                className={`${miniIcon.icon && !miniIcon.icon.startsWith('http') && !miniIcon.icon.startsWith('/') ? miniIcon.icon : 'fas fa-question'} text-sm`}
                                style={{ 
                                  display: miniIcon.icon && (miniIcon.icon.startsWith('http') || miniIcon.icon.startsWith('/')) ? 'none' : 'block',
                                  color: feature.iconColor || THEME_COLORS.primary
                                }}
                              ></i>
                            </div>
                            <span className="text-xs text-center">{miniIcon.text}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  );
                };
                
                // Logique d'affichage selon le nombre de blocs
                if (blocksCount === 5) {
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {allBlocks.slice(0, 3).map((feature: any, index: number) => renderBlock(feature, index))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-start-1">
                          {renderBlock(allBlocks[3], 3)}
                        </div>
                        <div className="md:col-start-2">
                          {renderBlock(allBlocks[4], 4)}
                        </div>
                      </div>
                    </>
                  );
                } else if (blocksCount === 6) {
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {allBlocks.slice(0, 3).map((feature: any, index: number) => renderBlock(feature, index))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {allBlocks.slice(3, 6).map((feature: any, index: number) => renderBlock(feature, index + 3))}
                      </div>
                    </>
                  );
                } else {
                  const gridClass = blocksCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                                    blocksCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                                    blocksCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
                                    blocksCount === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                                    'grid-cols-1 md:grid-cols-3';
                  
                  return (
                    <div className={`grid ${gridClass} gap-8`}>
                      {allBlocks.map((feature: any, index: number) => renderBlock(feature, index))}
                    </div>
                  );
                }
              })()}
            </div>
          </section>
        );

      case 'who_we_are':
        // Structure exacte du site réel : 2 colonnes (contenu + images)
        const whoWeAreConfig = liveConfiguration || block.configuration || {};
        const whoSections = whoWeAreConfig.sections || [];
        const whoImages = whoWeAreConfig.images || [];
        const whoButtons = whoWeAreConfig.buttons || [];
        const imagesPosition = whoWeAreConfig.layoutStyle || 'right'; // 'left' ou 'right'
        
        return (
          <section className="py-16" style={{ backgroundColor: whoWeAreConfig.backgroundColor || '#ffffff' }}>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* Bloc de contenu textuel */}
                <div className={imagesPosition === 'right' ? 'order-2 lg:order-1' : 'order-2 lg:order-2'}>
                  {/* Titre principal avec tiret */}
                  {whoWeAreConfig.title && (
                    <div className="mb-6">
                      <h2 
                        className="font-heading font-bold text-3xl md:text-4xl mb-3"
                        style={{ color: whoWeAreConfig.titleColor || '#084F6E' }}
                      >
                        {whoWeAreConfig.title}
                      </h2>
                      <div 
                        className="w-20 h-1"
                        style={{ backgroundColor: whoWeAreConfig.dividerColor || '#3BA8AF' }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Introduction */}
                  {whoWeAreConfig.introduction && (
                    <div className="mb-6">
                      {whoWeAreConfig.introduction.split('\n').map((para: string, i: number) => 
                        para.trim() && (
                          <p 
                            key={i}
                            className="text-muted-foreground mb-4"
                            style={{ color: whoWeAreConfig.textColor || '#666666' }}
                          >
                            {para.trim()}
                          </p>
                        )
                      )}
                    </div>
                  )}

                  {/* Sous-sections */}
                  {whoSections.map((section: any, index: number) => (
                    <div key={index} className="mt-6">
                      <h3 
                        className="font-heading font-semibold text-2xl mb-3"
                        style={{ color: whoWeAreConfig.subtitleColor || '#084F6E' }}
                      >
                        {section.subtitle}
                      </h3>
                      {section.text.split('\n').map((para: string, i: number) => 
                        para.trim() && (
                          <p 
                            key={i}
                            className="text-muted-foreground mb-4"
                            style={{ color: whoWeAreConfig.textColor || '#666666' }}
                          >
                            {para.trim()}
                          </p>
                        )
                      )}
                    </div>
                  ))}

                  {/* Boutons */}
                  {whoButtons.length > 0 && (
                    <div className="flex items-center space-x-4 mt-6">
                      {whoButtons.map((button: any, index: number) => (
                        <a
                          key={index}
                          href={button.url || '#'}
                          className={`px-6 py-2 rounded font-heading font-semibold transition-colors inline-flex items-center ${
                            button.style === 'filled' 
                              ? 'hover:opacity-90' 
                              : 'hover:opacity-80'
                          }`}
                          style={{
                            backgroundColor: button.style === 'filled' ? (button.color || '#084F6E') : 'transparent',
                            color: button.textColor || (button.style === 'outline' ? (button.color || '#084F6E') : '#ffffff'),
                            border: button.style === 'outline' ? `2px solid ${button.color || '#084F6E'}` : 'none'
                          }}
                        >
                          {button.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bloc d'images empilées */}
                <div className={imagesPosition === 'right' ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}>
                  <div className="flex flex-col gap-6 h-full">
                    {whoImages.map((image: any, index: number) => (
                      <div key={index} className="relative" style={{ flex: `1 1 ${100 / whoImages.length}%`, minHeight: 0 }}>
                        {image.url ? (
                          <img 
                            src={image.url} 
                            alt={image.alt || `Image ${index + 1}`}
                            className="w-full h-full rounded-lg shadow-lg object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full rounded-lg shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${hexToRgba('#084F6E', 0.6)}, ${hexToRgba('#084F6E', 0.9)})`
                            }}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'travelers_reviews':
        const reviewsConfig = liveConfiguration || block.configuration || {};
        
        // Valeurs par défaut pour les avis
        const defaultReviews = [
          {
            id: 1,
            name: 'Sophie L.',
            rating: 5,
            text: 'We spent 2 wonderful days with Eric and Margaux who showed us amazing places. A unique and authentic experience...'
          },
          {
            id: 2,
            name: 'Pierre M.',
            rating: 5,
            text: 'The French explanations, the Thai meal in a local spot, the magnificent landscapes and the warm welcome from Eric and Margaux, everything was perfect!'
          },
          {
            id: 3,
            name: 'Martin Family',
            rating: 5,
            text: 'An unforgettable day, everything was perfect. We discovered beautiful places away from the tourist crowds. Thanks to Eric and Margaux for their kindness...'
          }
        ];
        
        const reviews = reviewsConfig.reviews && reviewsConfig.reviews.length > 0 
          ? reviewsConfig.reviews 
          : defaultReviews;
        
        return (
          <section className="py-16 bg-primary text-white">
            <div className="container mx-auto px-4">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    {Array.from({ length: parseInt(reviewsConfig.starRating || '5') }).map((_, i) => (
                      <i key={i} className="fas fa-star text-[hsl(var(--star))] text-3xl mx-1"></i>
                    ))}
                  </div>
                  <h3 className="text-primary font-heading font-bold text-2xl mb-1">
                    {reviewsConfig.googleRating || '5.0'} on Google
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Based on {reviewsConfig.reviewCount || '80'} reviews
                  </p>
                </div>
                
                {/* Reviews Carousel - Horizontal Scroll */}
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
                    {reviews.map((review: any) => {
                      const initials = review.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);
                      
                      return (
                        <div key={review.id} className="flex-shrink-0 w-80 p-4">
                          <div className="flex gap-1 mb-3">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <i key={i} className="fas fa-star text-[hsl(var(--star))] text-sm"></i>
                            ))}
                          </div>
                          <p className="text-gray-700 italic text-sm mb-4">"{review.text}"</p>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: THEME_COLORS.primary }}
                            >
                              {initials}
                            </div>
                            <div className="font-medium text-primary">{review.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {reviewsConfig.googleLink && (
                  <div className="text-center mt-6 pt-4 border-t">
                    <a 
                      href={reviewsConfig.googleLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center"
                    >
                      <span>{reviewsConfig.googleLinkText || 'View all reviews on Google'}</span>
                      <i className="fas fa-external-link-alt ml-2 text-sm"></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      default:
        // Cas général pour les blocs Hero (quand ce n'est pas hero_main) - Prévisualisation simple
        if (block.blockType === 'hero') {
          const heroConfig = liveConfiguration || block.configuration || {};
          
          // Helper function to render title with colored accent
          const renderTitle = () => {
            const fullTitle = heroConfig.title || "Titre principal";
            const accentText = heroConfig.titleAccentText || "";
            const titleColor = heroConfig.titleColor || '#ffffff';
            const accentColor = heroConfig.titleAccentColor || '#084F6E';
            
            if (accentText && fullTitle.includes(accentText)) {
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
            const bgType = heroConfig.backgroundType || 'gradient';
            
            switch (bgType) {
              case 'gradient':
                const color1 = heroConfig.gradientColor1 || '#084F6E';
                const color2 = heroConfig.gradientColor2 || '#3BA8AF';
                return (
                  <div 
                    className="absolute inset-0 w-full h-full z-0"
                    style={{ background: `linear-gradient(to right, ${color1}, ${color2})` }}
                  />
                );
              
              case 'color':
                return (
                  <div 
                    className="absolute inset-0 w-full h-full z-0"
                    style={{ backgroundColor: heroConfig.backgroundColor || '#084F6E' }}
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
                        src={images[0]}
                        alt="Hero background"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
                  </div>
                );
              
              case 'video':
                const videoUrl = heroConfig.videoUrl;
                return (
                  <div className="absolute inset-0 w-full h-full z-0">
                    {videoUrl ? (
                      <>
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
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
                    )}
                  </div>
                );
              
              default:
                return (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] z-0"></div>
                );
            }
          };
          
          const buttons = heroConfig.buttons || [
            {text: 'Bouton 1', url: '', color: '#ffffff', textColor: '#084F6E', style: 'filled'}, 
            {text: 'Bouton 2', url: '', color: '#ffffff', textColor: '#ffffff', style: 'outline'}
          ];
          
          const heroSize = heroConfig.heroSize || 'petite';
          const heightClass = heroSize === 'grande' ? 'min-h-screen' : 'min-h-[400px]';
          const hasAnimation = heroConfig.hasAnimation || false;
          
          return (
            <section className={`relative pt-32 pb-20 ${heightClass} flex items-center overflow-hidden`}>
              {renderBackground()}
              <div className="container mx-auto px-4 relative z-10">
                {hasAnimation ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      x: [0, 5, 0, -5, 0],
                      transition: {
                        y: { duration: 0.6 },
                        x: {
                          repeat: Infinity,
                          duration: 5,
                          ease: "easeInOut"
                        }
                      }
                    }}
                    className={`max-w-xl ${
                      heroConfig.contentAlignment === 'center' ? 'mx-auto text-center' : 
                      heroConfig.contentAlignment === 'right' ? 'ml-auto text-right' : 
                      heroConfig.contentAlignment === 'left' ? 'ml-3 md:ml-6 text-left' :
                      'mx-auto text-center'
                    }`}
                  >
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
                    {heroConfig.subtitle || "Sous-titre descriptif"}
                  </p>
                  <div className={`flex flex-col sm:flex-row gap-4 ${
                    heroConfig.contentAlignment === 'center' ? 'justify-center' :
                    heroConfig.contentAlignment === 'right' ? 'justify-end' :
                    heroConfig.contentAlignment === 'left' ? 'justify-start' :
                    'justify-center'
                  }`}>
                    {buttons.map((button: any, index: number) => (
                      <span 
                        key={index}
                        className={`px-8 py-3 mt-4 rounded transition-colors cursor-pointer inline-block shadow-lg ${
                          (button.style || 'filled') === 'filled' 
                            ? 'hover:opacity-90' 
                            : 'bg-transparent border-2 hover:bg-opacity-10'
                        }`}
                        style={{
                          backgroundColor: (button.style || 'filled') === 'filled' ? (button.color || '#ffffff') : 'transparent',
                          borderColor: (button.style || 'filled') === 'outline' ? (button.color || '#ffffff') : 'transparent',
                          color: button.textColor || ((button.style || 'filled') === 'outline' ? '#ffffff' : '#084F6E')
                        }}
                      >
                        {button.text || `Bouton ${index + 1}`}
                      </span>
                    ))}
                  </div>
                  </motion.div>
                ) : (
                  <div
                    className={`max-w-xl ${
                      heroConfig.contentAlignment === 'center' ? 'mx-auto text-center' : 
                      heroConfig.contentAlignment === 'right' ? 'ml-auto text-right' : 
                      heroConfig.contentAlignment === 'left' ? 'ml-3 md:ml-6 text-left' :
                      'mx-auto text-center'
                    }`}
                  >
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
                        {heroConfig.subtitle || "Sous-titre descriptif"}
                      </p>
                      <div className={`flex flex-col sm:flex-row gap-4 ${
                        heroConfig.contentAlignment === 'center' ? 'justify-center' :
                        heroConfig.contentAlignment === 'right' ? 'justify-end' :
                        heroConfig.contentAlignment === 'left' ? 'justify-start' :
                        'justify-center'
                      }`}>
                        {buttons.map((button: any, index: number) => (
                          <span 
                            key={index}
                            className={`px-8 py-3 mt-4 rounded transition-colors cursor-pointer inline-block shadow-lg ${
                              (button.style || 'filled') === 'filled' 
                                ? 'hover:opacity-90' 
                                : 'bg-transparent border-2 hover:bg-opacity-10'
                            }`}
                            style={{
                              backgroundColor: (button.style || 'filled') === 'filled' ? (button.color || '#ffffff') : 'transparent',
                              borderColor: (button.style || 'filled') === 'outline' ? (button.color || '#ffffff') : 'transparent',
                              color: button.textColor || ((button.style || 'filled') === 'outline' ? '#ffffff' : '#084F6E')
                            }}
                          >
                            {button.text || `Bouton ${index + 1}`}
                          </span>
                        ))}
                      </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        // Gérer les blocs par blockType si identifier ne match pas
        if (block.blockType === 'text') {
          const textConfig = liveConfiguration || block.configuration || {};
          return (
            <section className="py-20" style={{ backgroundColor: textConfig.backgroundColor || '#ffffff' }}>
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
                    {textConfig.title || block.configuration?.title || block.title || "Titre de la section"}
                  </h2>
                  <div 
                    className="w-20 h-1 mx-auto mb-8"
                    style={{ backgroundColor: textConfig.dividerColor || '#3BA8AF' }}
                  ></div>
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: textConfig.contentColor || '#666666' }}
                  >
                    {textConfig.content || block.configuration?.content || block.content || "Ajoutez ici le contenu de votre section de texte. Vous pouvez décrire vos services, partager votre histoire, ou présenter des informations importantes."}
                  </p>
                </motion.div>
              </div>
            </section>
          );
        }

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
  onPreviewUpdate,
  pageSlug 
}: { 
  block: PageBlock; 
  isOpen: boolean;
  onSave: (data: any) => void; 
  onCancel: () => void;
  pageSlug?: string; 
  onPreviewUpdate?: (config: any) => void;
}) => {
  const [formData, setFormData] = useState(block.configuration || {});
  
  // Récupérer les tours Tour Ninja pour la sélection manuelle
  const { tours: tourNinjaTours } = useTourNinja();
  const realTours = tourNinjaTours;
  const realToursPrice = tourNinjaTours;

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
    // Utiliser blockType pour les nouveaux blocs, identifier pour les anciens blocs hardcodés
    const matchKey = block.identifier.includes('_') && block.identifier.match(/_\d+$/) 
      ? block.blockType 
      : block.identifier;
    
    switch (matchKey) {
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
                  value={formData.titleAccentColor || '#084F6E'}
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
                    const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}];
                    updateField('buttons', [...buttons, {text: 'Nouveau bouton', url: '', color: '#084F6E', style: 'filled'}]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un bouton
                </Button>
              </div>
              
              <div className="space-y-3">
                {(formData.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}]).map((button: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Bouton {index + 1}</Label>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}];
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
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, text: e.target.value} : b
                          );
                          updateField('buttons', newButtons);
                        }}
                      />
                    </div>
                    <div>
                      <URLInput 
                        value={button.url || ''} 
                        onChange={(value: string) => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, url: value} : b
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
                        value={button.color || '#084F6E'}
                        onChange={(value) => {
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}];
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
                          const buttons = formData.buttons || [{text: 'See our offers', url: '/tours', color: '#084F6E', style: 'filled'}, {text: 'Custom your trip', url: '/custom-tour', color: '#084F6E', style: 'filled'}];
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
                      value={formData.backgroundColor || '#084F6E'}
                      onChange={e => updateField('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    style={{ border: 'none', outline: 'none' }}
                    />
                    <Input 
                      value={formData.backgroundColor || '#084F6E'}
                      onChange={e => updateField('backgroundColor', e.target.value)}
                      placeholder="#084F6E"
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
        // Initialiser avec valeurs par défaut
        const defaultTextImagesData = {
          title: 'Who We Are',
          introduction: "We are Eric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.\n\nFrom our life here, we created Amon Tour — a small, independent travel agency built on a simple idea: personally welcome our travelers to Krabi and offer them a different way to experience Thailand.",
          sections: [
            {
              subtitle: 'Deep Local Roots',
              text: "We live here year-round, in the heart of the region we love. This close connection to the destination allows us to offer exclusive experiences in Krabi, designed and guided by our team of professional local guides or trusted partners.\n\nYou're not booking a generic tour — you're being welcomed, guided, and cared for by people who live here, who know the tides, the seasons, the crowds to avoid, and the hidden gems worth discovering."
            },
            {
              subtitle: 'Our Concept',
              text: "Combine the warmth and proximity of a local agency in Krabi with the expertise of a tailor-made travel designer for all of Thailand. At Amon Tour, you're supported before, during, and after your trip. You're in contact with real people – a face, a voice, a team – not a call center or an algorithm. We're here, on the ground, to make your trip a seamless, personal, and unforgettable experience."
            }
          ],
          images: [
            {
              url: '/family-photo.png',
              alt: 'Amon Tour family - Éric, Margaux, Gabriel, and Raphaël',
              sectionIndex: 0,
              position: 'right'
            },
            {
              url: '/attached_assets/amon-tour-team.png',
              alt: 'Amon Tour team',
              sectionIndex: 1,
              position: 'left'
            }
          ],
          buttons: [
            { text: 'Contact Us', url: '/contact', color: '#084F6E', style: 'filled' },
            { text: 'Create Your Journey →', url: '/custom-tour', color: '#084F6E', style: 'outline' }
          ]
        };
        
        // Si les données n'existent pas encore, les initialiser
        if (!formData.title && !formData.sections) {
          Object.keys(defaultTextImagesData).forEach(key => {
            updateField(key, defaultTextImagesData[key as keyof typeof defaultTextImagesData]);
          });
        }
        
        const textSections = formData.sections || defaultTextImagesData.sections;
        const textImages = formData.images || defaultTextImagesData.images;
        const textButtons = formData.buttons || defaultTextImagesData.buttons;
        
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre principal</Label>
              <Textarea 
                id="title"
                value={formData.title || defaultTextImagesData.title} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Who We Are"
                rows={2}
                className="mt-2"
              />
              <div className="mt-3">
                <Label className="text-sm">Couleur du titre</Label>
                <ColorPicker
                  value={formData.titleColor || '#084F6E'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
            </div>

            {/* Introduction */}
            <div>
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea 
                id="introduction"
                value={formData.introduction || defaultTextImagesData.introduction} 
                onChange={e => updateField('introduction', e.target.value)}
                placeholder="Texte d'introduction..."
                rows={4}
                className="mt-2"
              />
              <div className="mt-3">
                <Label className="text-sm">Couleur de l'introduction</Label>
                <ColorPicker
                  value={formData.introColor || '#666666'}
                  onChange={(value) => updateField('introColor', value)}
                />
              </div>
            </div>

            {/* Couleur du trait de séparation */}
            <div>
              <Label>Couleur du trait de séparation</Label>
              <div className="mt-2">
                <ColorPicker
                  value={formData.dividerColor || '#3BA8AF'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Couleur de fond */}
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(value) => updateField('backgroundColor', value)}
                />
              </div>
            </div>

            {/* Sous-sections dynamiques */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Sous-sections</Label>
                <button
                  type="button"
                  onClick={() => {
                    const newSection = {
                      subtitle: 'Nouveau sous-titre',
                      text: 'Nouveau texte...'
                    };
                    updateField('sections', [...textSections, newSection]);
                  }}
                  className="px-3 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus size={14} className="inline mr-1" />
                  Ajouter une sous-section
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {textSections.map((section: any, index: number) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Sous-section {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = textSections.filter((_: any, i: number) => i !== index);
                          updateField('sections', updated);
                        }}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Sous-titre</Label>
                        <Input 
                          value={section.subtitle || ''} 
                          onChange={e => {
                            const updated = [...textSections];
                            updated[index].subtitle = e.target.value;
                            updateField('sections', updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Texte</Label>
                        <Textarea 
                          value={section.text || ''} 
                          onChange={e => {
                            const updated = [...textSections];
                            updated[index].text = e.target.value;
                            updateField('sections', updated);
                          }}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Label className="text-sm">Couleur des sous-titres</Label>
                <ColorPicker
                  value={formData.subtitleColor || '#084F6E'}
                  onChange={(value) => updateField('subtitleColor', value)}
                />
              </div>

              <div className="mt-4">
                <Label className="text-sm">Couleur du texte</Label>
                <ColorPicker
                  value={formData.textColor || '#666666'}
                  onChange={(value) => updateField('textColor', value)}
                />
              </div>
            </div>

            {/* Images */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Images</Label>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        const newImage = {
                          url,
                          alt: '',
                          sectionIndex: 0,
                          position: 'left'
                        };
                        updateField('images', [...textImages, newImage]);
                      }
                    };
                    input.click();
                  }}
                  className="px-3 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus size={14} className="inline mr-1" />
                  Ajouter une image
                </button>
              </div>

              <div className="space-y-3">
                {textImages.map((image: any, index: number) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Image {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = textImages.filter((_: any, i: number) => i !== index);
                          updateField('images', updated);
                        }}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">URL de l'image</Label>
                        <Input 
                          value={image.url || ''} 
                          onChange={e => {
                            const updated = [...textImages];
                            updated[index].url = e.target.value;
                            updateField('images', updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Texte alternatif</Label>
                        <Input 
                          value={image.alt || ''} 
                          onChange={e => {
                            const updated = [...textImages];
                            updated[index].alt = e.target.value;
                            updateField('images', updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Associer à la sous-section</Label>
                        <select 
                          value={image.sectionIndex || 0}
                          onChange={e => {
                            const updated = [...textImages];
                            updated[index].sectionIndex = parseInt(e.target.value);
                            updateField('images', updated);
                          }}
                          className="w-full p-2 border rounded"
                        >
                          {textSections.map((section: any, sIndex: number) => (
                            <option key={sIndex} value={sIndex}>
                              {section.subtitle || `Section ${sIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm">Position</Label>
                        <select 
                          value={image.position || 'left'}
                          onChange={e => {
                            const updated = [...textImages];
                            updated[index].position = e.target.value;
                            updateField('images', updated);
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="left">Gauche</option>
                          <option value="right">Droite</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Boutons</Label>
                <button
                  type="button"
                  onClick={() => {
                    const newButton = {
                      text: 'Nouveau bouton',
                      url: '',
                      color: '#084F6E',
                      style: 'filled'
                    };
                    updateField('buttons', [...textButtons, newButton]);
                  }}
                  className="px-3 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus size={14} className="inline mr-1" />
                  Ajouter un bouton
                </button>
              </div>

              <div className="space-y-3">
                {textButtons.map((button: any, index: number) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Bouton {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = textButtons.filter((_: any, i: number) => i !== index);
                          updateField('buttons', updated);
                        }}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Texte du bouton</Label>
                        <Input 
                          value={button.text || ''} 
                          onChange={e => {
                            const updated = [...textButtons];
                            updated[index].text = e.target.value;
                            updateField('buttons', updated);
                          }}
                        />
                      </div>
                      <div>
                        <URLInput 
                          value={button.url || ''} 
                          onChange={(value: string) => {
                            const updated = [...textButtons];
                            updated[index].url = value;
                            updateField('buttons', updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Style</Label>
                        <select 
                          value={button.style || 'filled'}
                          onChange={e => {
                            const updated = [...textButtons];
                            updated[index].style = e.target.value;
                            updateField('buttons', updated);
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="filled">Plein</option>
                          <option value="outline">Contour</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm">Couleur</Label>
                        <ColorPicker
                          value={button.color || '#084F6E'}
                          onChange={(value) => {
                            const updated = [...textButtons];
                            updated[index].color = value;
                            updateField('buttons', updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  value={formData.dividerColor || '#3BA8AF'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Couleur de fond */}
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(value) => updateField('backgroundColor', value)}
                />
              </div>
            </div>
          </div>
        );

      case 'text':
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
                  value={formData.dividerColor || '#3BA8AF'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Couleur de fond */}
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(value) => updateField('backgroundColor', value)}
                />
              </div>
            </div>
          </div>
        );

      case 'header_page':
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre</Label>
              <Textarea 
                id="title"
                value={formData.title !== undefined ? formData.title : (block.configuration?.title || '')} 
                onChange={e => updateField('title', e.target.value)}
                rows={2}
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.titleColor || '#ffffff'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
            </div>
            
            {/* Sous-titre */}
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Textarea 
                id="subtitle"
                value={formData.subtitle !== undefined ? formData.subtitle : (block.configuration?.subtitle || '')} 
                onChange={e => updateField('subtitle', e.target.value)}
                rows={2}
                className="mt-2"
              />
              <div className="mt-3">
                <ColorPicker
                  value={formData.subtitleColor || '#ffffff'}
                  onChange={(value) => updateField('subtitleColor', value)}
                />
              </div>
            </div>

            {/* Icône */}
            <div>
              <Label htmlFor="iconUrl">Icône</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  id="iconUrl"
                  value={formData.iconUrl !== undefined ? formData.iconUrl : (block.configuration?.iconUrl || '')} 
                  onChange={e => updateField('iconUrl', e.target.value)}
                  placeholder="https://example.com/icon.svg"
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant="outline"
                  className="border-2 border-dashed border-gray-300 px-3"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        updateField('iconUrl', url);
                      }
                    };
                    input.click();
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <ColorPicker
                  value={formData.iconColor || '#ffffff'}
                  onChange={(value) => updateField('iconColor', value)}
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
                    const buttons = formData.buttons || [];
                    updateField('buttons', [...buttons, {text: 'Nouveau bouton', url: '', color: '#084F6E', style: 'filled'}]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un bouton
                </Button>
              </div>
              
              <div className="space-y-3">
                {(formData.buttons || []).map((button: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Bouton {index + 1}</Label>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const buttons = formData.buttons || [];
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
                          const buttons = formData.buttons || [];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, text: e.target.value} : b
                          );
                          updateField('buttons', newButtons);
                        }}
                      />
                    </div>
                    <div>
                      <URLInput
                        value={button.url || ''}
                        onChange={(value: string) => {
                          const buttons = formData.buttons || [];
                          const newButtons = buttons.map((b: any, i: number) => 
                            i === index ? {...b, url: value} : b
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
                        value={button.color || '#084F6E'}
                        onChange={(value) => {
                          const buttons = formData.buttons || [];
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
                          const buttons = formData.buttons || [];
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

            {/* Arrière-plan */}
            <div>
              <Label>Arrière-plan</Label>
              <div className="mt-3">
                <Select value={formData.backgroundType || 'image'} onValueChange={value => updateField('backgroundType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type d'arrière-plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="color">Couleur unie</SelectItem>
                    <SelectItem value="gradient">Dégradé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.backgroundType === 'color' && (
                <div className="mt-3">
                  <Label htmlFor="backgroundColor">Couleur de fond</Label>
                  <div className="mt-2">
                    <ColorPicker
                      value={formData.backgroundColor || '#084F6E'}
                      onChange={(value) => updateField('backgroundColor', value)}
                    />
                  </div>
                </div>
              )}
              
              {formData.backgroundType === 'gradient' && (
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor="gradientColor1">Couleur 1</Label>
                    <div className="mt-2">
                      <ColorPicker
                        value={formData.gradientColor1 || '#084F6E'}
                        onChange={(value) => updateField('gradientColor1', value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gradientColor2">Couleur 2</Label>
                    <div className="mt-2">
                      <ColorPicker
                        value={formData.gradientColor2 || '#3BA8AF'}
                        onChange={(value) => updateField('gradientColor2', value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {formData.backgroundType === 'video' && (
                <div className="mt-3">
                  <Label htmlFor="videoUrl">URL de la vidéo</Label>
                  <Input 
                    id="videoUrl"
                    value={formData.videoUrl || ''} 
                    onChange={e => updateField('videoUrl', e.target.value)}
                    placeholder="/attached_assets/video.mp4"
                    className="mt-2"
                  />
                </div>
              )}
              
              {formData.backgroundType === 'image' && (
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor="imageUrl">URL de l'image de fond</Label>
                    <Input 
                      id="imageUrl"
                      value={formData.imageUrl || ''} 
                      onChange={e => updateField('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageAlt">Texte alternatif</Label>
                    <Input 
                      id="imageAlt"
                      value={formData.imageAlt || ''} 
                      onChange={e => updateField('imageAlt', e.target.value)}
                      placeholder="Description de l'image"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Taille du cadre */}
            <div>
              <Label>Taille du cadre</Label>
              <div className="mt-3">
                <Select value={formData.frameSize || 'small'} onValueChange={value => updateField('frameSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Taille du cadre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petite</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'search_bar_tours':
        return (
          <div className="space-y-6">
            {/* Barre de filtres */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Barre de filtres</h3>
              
              {/* Titre */}
              <div>
                <Label htmlFor="filtersTitle">Titre</Label>
                <Input 
                  id="filtersTitle"
                  value={formData.filtersTitle !== undefined ? formData.filtersTitle : (block.configuration?.filtersTitle || '')} 
                  onChange={e => updateField('filtersTitle', e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Placeholder de recherche */}
              <div>
                <Label htmlFor="searchPlaceholder">Placeholder de recherche</Label>
                <Input 
                  id="searchPlaceholder"
                  value={formData.searchPlaceholder !== undefined ? formData.searchPlaceholder : (block.configuration?.searchPlaceholder || '')} 
                  onChange={e => updateField('searchPlaceholder', e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Couleur de texte */}
              <div>
                <Label htmlFor="filtersTextColor">Couleur de texte</Label>
                <div className="mt-3">
                  <ColorPicker
                    value={formData.filtersTextColor || '#333333'}
                    onChange={(value) => updateField('filtersTextColor', value)}
                  />
                </div>
              </div>

              {/* Couleur du bloc */}
              <div>
                <Label htmlFor="filtersBgColor">Couleur du bloc</Label>
                <div className="mt-3">
                  <ColorPicker
                    value={formData.filtersBgColor || '#ffffff'}
                    onChange={(value) => updateField('filtersBgColor', value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Configuration de la grille */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Configuration de la grille</h3>

              {/* Couleurs des annonces */}
              <div>
                <Label className="text-sm font-medium">Couleurs des annonces</Label>
                <div className="mt-2">
                  <ColorPicker
                    value={formData.cardsColor || '#084F6E'}
                    onChange={(value) => updateField('cardsColor', value)}
                  />
                </div>
              </div>

              {/* Colonnes par appareil */}
              <div>
                <Label>Colonnes par appareil</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <Label htmlFor="mobileColumns" className="text-xs">Mobile</Label>
                    <Select 
                      value={String(formData.mobileColumns || 1)} 
                      onValueChange={value => updateField('mobileColumns', parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tabletColumns" className="text-xs">Tablette</Label>
                    <Select 
                      value={String(formData.tabletColumns || 2)} 
                      onValueChange={value => updateField('tabletColumns', parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="desktopColumns" className="text-xs">Ordinateur</Label>
                    <Select 
                      value={String(formData.desktopColumns || 3)} 
                      onValueChange={value => updateField('desktopColumns', parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
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
            </div>

            <Separator />

            {/* Couleur de fond */}
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(value) => updateField('backgroundColor', value)}
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
                  value={formData.dividerColor || '#3BA8AF'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Couleur de fond */}
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(value) => updateField('backgroundColor', value)}
                />
              </div>
            </div>

            {/* Configuration de la grille */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900">Configuration de la grille</h4>
              
              {/* Couleurs des annonces */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Couleurs des annonces</Label>
                <ColorPicker
                  value={formData.cardButtonColor || '#2563eb'}
                  onChange={(value) => {
                    updateField('cardBackgroundColor', value);
                    updateField('cardButtonColor', value);
                  }}
                  label=""
                />
              </div>
              
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

              {/* Sélection manuelle des tours (affiché uniquement en mode "Personnalisé") */}
              {formData.categoryFilter === 'custom' && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium mb-3 block">Sélectionner les tours à afficher</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {realTours && realTours.length > 0 ? (
                      realTours.map((tour: any) => (
                        <div key={tour.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`tour-${tour.id}`}
                            checked={(formData.selectedTourIds || []).includes(tour.id)}
                            onChange={(e) => {
                              const currentIds = formData.selectedTourIds || [];
                              const newIds = e.target.checked
                                ? [...currentIds, tour.id]
                                : currentIds.filter((id: string) => id !== tour.id);
                              updateField('selectedTourIds', newIds);
                            }}
                            className="w-4 h-4 text-primary"
                          />
                          <label htmlFor={`tour-${tour.id}`} className="text-sm cursor-pointer flex-1">
                            {tour.name} {tour.price ? `(${tour.price} ${tour.currency || 'THB'})` : ''}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Aucun tour disponible</p>
                    )}
                  </div>
                  {formData.selectedTourIds && formData.selectedTourIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      {formData.selectedTourIds.length} tour(s) sélectionné(s)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bouton d'action */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Bouton d'action en bas de section</Label>
              <div>
                <Label className="text-xs text-gray-500">Texte du bouton</Label>
                <Input 
                  value={formData.buttonText || ''} 
                  onChange={e => updateField('buttonText', e.target.value)}
                  placeholder="Voir tous les tours"
                  className="mt-2"
                />
              </div>
              <div>
                <URLInput
                  label="URL du bouton"
                  value={formData.buttonUrl || ''}
                  onChange={(value) => updateField('buttonUrl', value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Couleur du bouton</Label>
                  <ColorPicker
                    value={formData.buttonBackgroundColor || '#084F6E'}
                    onChange={(value) => updateField('buttonBackgroundColor', value)}
                    label=""
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Couleur du texte</Label>
                  <ColorPicker
                    value={formData.buttonTextColor || '#ffffff'}
                    onChange={(value) => updateField('buttonTextColor', value)}
                    label=""
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Style du bouton</Label>
                <Select 
                  value={formData.buttonStyle || 'solid'} 
                  onValueChange={value => updateField('buttonStyle', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Plein</SelectItem>
                    <SelectItem value="outline">Contour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                  value={formData.dividerColor || '#3BA8AF'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Couleur de fond */}
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.backgroundColor || '#f9fafb'}
                  onChange={(value) => updateField('backgroundColor', value)}
                />
              </div>
            </div>

            {/* Configuration de la grille */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900">Configuration de la grille</h4>
              
              {/* Couleurs des annonces */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Couleurs des annonces</Label>
                <ColorPicker
                  value={formData.cardButtonColor || '#2563eb'}
                  onChange={(value) => {
                    updateField('cardBackgroundColor', value);
                    updateField('cardButtonColor', value);
                  }}
                  label=""
                />
              </div>
              
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

              {/* Sélection manuelle des tours (affiché uniquement en mode "Personnalisé") */}
              {formData.categoryFilter === 'custom' && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium mb-3 block">Sélectionner les tours à afficher</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {realToursPrice && realToursPrice.length > 0 ? (
                      realToursPrice.map((tour: any) => (
                        <div key={tour.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`tour-price-${tour.id}`}
                            checked={(formData.selectedTourIds || []).includes(tour.id)}
                            onChange={(e) => {
                              const currentIds = formData.selectedTourIds || [];
                              const newIds = e.target.checked
                                ? [...currentIds, tour.id]
                                : currentIds.filter((id: string) => id !== tour.id);
                              updateField('selectedTourIds', newIds);
                            }}
                            className="w-4 h-4 text-primary"
                          />
                          <label htmlFor={`tour-price-${tour.id}`} className="text-sm cursor-pointer flex-1">
                            {tour.name} {tour.price ? `(${tour.price} ${tour.currency || 'THB'})` : ''}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Aucun tour disponible</p>
                    )}
                  </div>
                  {formData.selectedTourIds && formData.selectedTourIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      {formData.selectedTourIds.length} tour(s) sélectionné(s)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bouton d'action */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Bouton d'action en bas de section</Label>
              <div>
                <Label className="text-xs text-gray-500">Texte du bouton</Label>
                <Input 
                  value={formData.buttonText || ''} 
                  onChange={e => updateField('buttonText', e.target.value)}
                  placeholder="Voir tous les tours"
                  className="mt-2"
                />
              </div>
              <div>
                <URLInput
                  label="URL du bouton"
                  value={formData.buttonUrl || ''}
                  onChange={(value) => updateField('buttonUrl', value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Couleur du bouton</Label>
                  <ColorPicker
                    value={formData.buttonBackgroundColor || '#084F6E'}
                    onChange={(value) => updateField('buttonBackgroundColor', value)}
                    label=""
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Couleur du texte</Label>
                  <ColorPicker
                    value={formData.buttonTextColor || '#ffffff'}
                    onChange={(value) => updateField('buttonTextColor', value)}
                    label=""
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Style du bouton</Label>
                <Select 
                  value={formData.buttonStyle || 'solid'} 
                  onValueChange={value => updateField('buttonStyle', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Plein</SelectItem>
                    <SelectItem value="outline">Contour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                  placeholder="Experience an exclusive private day trip with our English or French-speaking and certified guides."
                  value={formData.subtitle || ''} 
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
                    value={formData.dividerColor || '#3BA8AF'}
                    onChange={(value) => updateField('dividerColor', value)}
                  />
                </div>
              </div>

              {/* Couleur de fond */}
              <div>
                <Label htmlFor="backgroundColor">Couleur de fond</Label>
                <div className="mt-3">
                  <ColorPicker
                    value={formData.backgroundColor || '#ffffff'}
                    onChange={(value) => updateField('backgroundColor', value)}
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
                      if (blocks.length < 6) {
                        const newBlock = {
                          id: Date.now(),
                          mainIcon: 'fas fa-sparkles',
                          title: 'Nouveau Bloc',
                          description: 'Description de ce bloc d\'avantages.',
                          iconColor: THEME_COLORS.primary,
                          miniIcons: [
                            { icon: 'fas fa-check', text: 'Avantage 1' },
                            { icon: 'fas fa-check', text: 'Avantage 2' },
                            { icon: 'fas fa-check', text: 'Avantage 3' }
                          ]
                        };
                        updateField('iconBlocks', [...blocks, newBlock]);
                      }
                    }}
                    style={formData.iconBlocks?.length >= 6 ? {} : { 
                      backgroundColor: THEME_COLORS.secondary,
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.iconBlocks?.length < 6) {
                        e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.iconBlocks?.length < 6) {
                        e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm ${formData.iconBlocks?.length >= 6 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}`}
                    disabled={formData.iconBlocks?.length >= 6}
                  >
                    + Ajouter un nouveau bloc
                  </button>
                </div>
              </div>
              
              {/* Sélecteur de style */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2">Style de design</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateField('iconStyle', 'modern-card')}
                    className="p-3 border-2 rounded-lg text-left transition-all"
                    style={(formData.iconStyle || 'modern-card') === 'modern-card' 
                      ? { borderColor: THEME_COLORS.secondary, backgroundColor: THEME_COLORS.secondaryLight } 
                      : { borderColor: '#d1d5db' }
                    }
                  >
                    <div className="font-medium text-sm">Carte moderne</div>
                    <div className="text-xs text-gray-500 mt-1">Avec cadres et fond coloré</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('iconStyle', 'minimalist')}
                    className="p-3 border-2 rounded-lg text-left transition-all"
                    style={formData.iconStyle === 'minimalist' 
                      ? { borderColor: THEME_COLORS.secondary, backgroundColor: THEME_COLORS.secondaryLight } 
                      : { borderColor: '#d1d5db' }
                    }
                  >
                    <div className="font-medium text-sm">Minimaliste</div>
                    <div className="text-xs text-gray-500 mt-1">Sans cadres, fond coloré teinté</div>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {(() => {
                  const getDefaultBlocks = () => [
                    {
                      id: 1,
                      mainIcon: 'fas fa-user-friends',
                      title: 'Private Tours',
                      description: 'Experience an exclusive day trip with our professional guides and private vehicles.',
                      iconColor: THEME_COLORS.primary,
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
                      iconColor: THEME_COLORS.primary,
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
                      iconColor: THEME_COLORS.primary,
                      miniIcons: [
                        { icon: 'fas fa-utensils', text: 'Local Food' },
                        { icon: 'fas fa-hands-helping', text: 'Local People' },
                        { icon: 'fas fa-landmark', text: 'Culture' }
                      ]
                    }
                  ];
                  
                  const blocks = formData.iconBlocks && formData.iconBlocks.length > 0 ? formData.iconBlocks : getDefaultBlocks();
                  
                  // Initialiser les iconBlocks si elles ne sont pas déjà définies
                  if (!formData.iconBlocks) {
                    updateField('iconBlocks', getDefaultBlocks());
                  }
                  
                  return blocks;
                })().map((block: any, index: number) => (
                  <div key={block.id} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col gap-2">
                        <Label className="font-medium text-base">Bloc {index + 1}</Label>
                        <ColorPicker
                          value={block.iconColor || THEME_COLORS.primary}
                          onChange={(value) => {
                            const blocks = formData.iconBlocks || [];
                            const updatedBlocks = blocks.map((b: any) => 
                              b.id === block.id ? { ...b, iconColor: value } : b
                            );
                            updateField('iconBlocks', updatedBlocks);
                          }}
                          label=""
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const blocks = formData.iconBlocks || [];
                          const updatedBlocks = blocks.filter((b: any) => b.id !== block.id);
                          updateField('iconBlocks', updatedBlocks);
                        }}
                        className="px-3 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer le bloc
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
                              { icon: 'far fa-clock', component: <i className="far fa-clock text-lg text-black"></i> }
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
                                className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                                style={block.mainIcon === icon 
                                  ? { borderColor: THEME_COLORS.secondary, backgroundColor: THEME_COLORS.secondaryLight } 
                                  : { borderColor: '#d1d5db' }
                                }
                                title={icon}
                              >
                                {component}
                              </button>
                            ))}
                            
                            {/* Icône médaille */}
                            <button
                              type="button"
                              onClick={() => {
                                const blocks = formData.iconBlocks || [];
                                const updatedBlocks = blocks.map((b: any) => 
                                  b.id === block.id ? { ...b, mainIcon: 'fas fa-medal' } : b
                                );
                                updateField('iconBlocks', updatedBlocks);
                              }}
                              className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                              style={block.mainIcon === 'fas fa-medal' 
                                ? { borderColor: THEME_COLORS.secondary, backgroundColor: THEME_COLORS.secondaryLight } 
                                : { borderColor: '#d1d5db' }
                              }
                              title="Médaille"
                            >
                              <i className="fas fa-medal text-lg text-gray-700"></i>
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Sélectionnez une icône principale pour ce bloc ou entrez une URL d'image :</p>
                          
                          {/* Champ URL pour icône principale */}
                          <div className="mt-3">
                            <div className="flex gap-2">
                              <Input 
                                placeholder=""
                                value={block.mainIcon || ''}
                                onChange={(e) => {
                                  const blocks = formData.iconBlocks || [];
                                  const updatedBlocks = blocks.map((b: any) => 
                                    b.id === block.id ? { ...b, mainIcon: e.target.value } : b
                                  );
                                  updateField('iconBlocks', updatedBlocks);
                                }}
                                className="flex-1 text-xs h-9"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = async (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      try {
                                        const uploadFormData = new FormData();
                                        uploadFormData.append('image', file);
                                        
                                        const response = await fetch('/api/upload/image', {
                                          method: 'POST',
                                          body: uploadFormData
                                        });
                                        
                                        if (response.ok) {
                                          const { filePath } = await response.json();
                                          
                                          const blocks = formData.iconBlocks || [];
                                          const updatedBlocks = blocks.map((b: any) => 
                                            b.id === block.id ? { ...b, mainIcon: filePath } : b
                                          );
                                          updateField('iconBlocks', updatedBlocks);
                                          
                                          console.log('Icône principale uploadée:', filePath);
                                        } else {
                                          console.error('Erreur upload:', response.statusText);
                                        }
                                      } catch (error) {
                                        console.error('Erreur lors de l\'upload:', error);
                                      }
                                    }
                                  };
                                  input.click();
                                }}
                                className="w-9 h-9 border-2 border-dashed rounded transition-colors flex items-center justify-center"
                                style={{ 
                                  borderColor: '#9ca3af',
                                  backgroundColor: '#f9fafb'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                title="Upload icône principale personnalisée"
                              >
                                <Plus size={14} style={{ color: '#6b7280' }} />
                              </button>
                            </div>
                          </div>
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
                              const currentBlock = blocks.find((b: any) => b.id === block.id);
                              const currentMiniIcons = currentBlock?.miniIcons || [];
                              
                              if (currentMiniIcons.length >= 3) {
                                return; // Ne rien faire si déjà 3 mini-icônes
                              }
                              
                              const updatedBlocks = blocks.map((b: any) => {
                                if (b.id === block.id) {
                                  const newMiniIcons = [...(b.miniIcons || []), { icon: 'fas fa-check', text: 'Nouveau' }];
                                  return { ...b, miniIcons: newMiniIcons };
                                }
                                return b;
                              });
                              updateField('iconBlocks', updatedBlocks);
                            }}
                            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                              (block.miniIcons || []).length >= 3 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : ''
                            }`}
                            style={(block.miniIcons || []).length < 3 
                              ? { backgroundColor: THEME_COLORS.secondary, color: 'white' } 
                              : {}
                            }
                            onMouseEnter={(e) => {
                              if ((block.miniIcons || []).length < 3) {
                                e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if ((block.miniIcons || []).length < 3) {
                                e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                              }
                            }}
                            disabled={(block.miniIcons || []).length >= 3}
                          >
                            <Plus size={12} />
                            Ajouter un mini bloc
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(block.miniIcons || []).map((miniIcon: any, miniIndex: number) => (
                            <div key={miniIndex} className="bg-gray-50 p-3 rounded-lg border">
                              {/* Texte en premier */}
                              <div className="mb-3">
                                <div className="flex gap-2 items-end">
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
                                    className="w-9 h-9 rounded transition-colors flex items-center justify-center"
                                    style={{ backgroundColor: THEME_COLORS.secondary, color: 'white' }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                                    }}
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
                                      className="p-1.5 border rounded hover:bg-gray-50 flex items-center justify-center transition-colors"
                                      style={miniIcon.icon === icon 
                                        ? { borderColor: THEME_COLORS.secondary, backgroundColor: THEME_COLORS.secondaryLight } 
                                        : { borderColor: '#d1d5db' }
                                      }
                                      title={label}
                                    >
                                      {component}
                                    </button>
                                  ))}
                                </div>
                                
                                {/* Input manuel avec boutons carrés bleus à côté */}
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder={miniIcon.icon && !miniIcon.icon.startsWith('http') && !miniIcon.icon.startsWith('/') ? `Icône sélectionnée: ${miniIcon.icon}` : ""} 
                                    value={miniIcon.icon} 
                                    data-mini-icon={`${block.id}-${miniIndex}`}
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
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                          try {
                                            // Créer FormData pour l'upload
                                            const uploadFormData = new FormData();
                                            uploadFormData.append('image', file);
                                            
                                            // Upload vers le serveur
                                            const response = await fetch('/api/upload/image', {
                                              method: 'POST',
                                              body: uploadFormData
                                            });
                                            
                                            if (response.ok) {
                                              const { filePath } = await response.json();
                                              
                                              // Mettre à jour la mini-icône
                                              const currentBlocks = formData.iconBlocks || [];
                                              const updatedBlocks = currentBlocks.map((b: any) => {
                                                if (b.id === block.id) {
                                                  const newMiniIcons = [...(b.miniIcons || [])];
                                                  newMiniIcons[miniIndex] = { ...newMiniIcons[miniIndex], icon: filePath };
                                                  return { ...b, miniIcons: newMiniIcons };
                                                }
                                                return b;
                                              });
                                              updateField('iconBlocks', updatedBlocks);
                                              
                                              // Mettre à jour le champ input avec le nom du fichier
                                              const iconInput = document.querySelector(`input[data-mini-icon="${block.id}-${miniIndex}"]`) as HTMLInputElement;
                                              if (iconInput) {
                                                iconInput.value = filePath;
                                              }
                                              
                                              // Afficher un message de succès
                                              console.log('Mini-icône uploadée et champ mis à jour:', filePath);
                                              
                                              console.log('Mini-icône uploadée avec succès:', filePath);
                                            } else {
                                              console.error('Erreur upload:', response.statusText);
                                            }
                                          } catch (error) {
                                            console.error('Erreur lors de l\'upload:', error);
                                          }
                                        }
                                      };
                                      input.click();
                                    }}
                                    className="w-9 h-9 border-2 border-dashed rounded transition-colors flex items-center justify-center"
                                    style={{ 
                                      borderColor: '#9ca3af',
                                      backgroundColor: '#f9fafb'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }}
                                    title="Upload icône personnalisée"
                                  >
                                    <Plus size={14} style={{ color: '#6b7280' }} />
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
        // Utiliser les mêmes champs que text_image pour la cohérence
        const whoWeAreDefaultData = {
          title: 'Who We Are',
          introduction: "We are Eric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.\n\nFrom our life here, we created Amon Tour — a small, independent travel agency built on a simple idea: personally welcome our travelers to Krabi and offer them a different way to experience Thailand.",
          sections: [
            {
              subtitle: 'Deep Local Roots',
              text: "We live here year-round, in the heart of the region we love. This close connection to the destination allows us to offer exclusive experiences in Krabi, designed and guided by our team of professional local guides or trusted partners.\n\nYou're not booking a generic tour — you're being welcomed, guided, and cared for by people who live here, who know the tides, the seasons, the crowds to avoid, and the hidden gems worth discovering."
            },
            {
              subtitle: 'Our Concept',
              text: "Combine the warmth and proximity of a local agency in Krabi with the expertise of a tailor-made travel designer for all of Thailand. At Amon Tour, you're supported before, during, and after your trip. You're in contact with real people – a face, a voice, a team – not a call center or an algorithm. We're here, on the ground, to make your trip a seamless, personal, and unforgettable experience."
            }
          ],
          images: [
            {
              url: '/family-photo.png',
              alt: 'Amon Tour family - Éric, Margaux, Gabriel, and Raphaël'
            },
            {
              url: '/amon-tour-team.jpg',
              alt: 'Amon Tour team'
            }
          ],
          buttons: [
            { text: 'Contact Us', url: '/contact', color: '#084F6E', style: 'filled' },
            { text: 'Create Your Journey →', url: '/custom-tour', color: '#084F6E', style: 'outline' }
          ],
          layoutStyle: 'right',
          showTitleDivider: true,
          titleDividerAlign: 'left',
          dividerColor: '#3BA8AF'
        };
        
        const whoWeAreSections = formData.sections || whoWeAreDefaultData.sections;
        const whoWeAreImages = formData.images || whoWeAreDefaultData.images;
        const whoWeAreButtons = formData.buttons || whoWeAreDefaultData.buttons;
        
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre principal</Label>
              <Input 
                id="title"
                value={formData.title ?? ''} 
                onChange={e => updateField('title', e.target.value)}
                className="mt-2"
              />
              <div className="mt-3">
                <Label className="text-sm">Couleur du titre</Label>
                <ColorPicker
                  value={formData.titleColor || '#084F6E'}
                  onChange={(value) => updateField('titleColor', value)}
                />
              </div>
              
              <div className="mt-3">
                <Label className="text-sm">Couleur du tiret</Label>
                <ColorPicker
                  value={formData.dividerColor || '#3BA8AF'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>

              <div className="mt-3">
                <Label className="text-sm">Couleur du fond</Label>
                <ColorPicker
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(value) => updateField('backgroundColor', value)}
                />
              </div>
            </div>

            {/* Introduction */}
            <div>
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea 
                id="introduction"
                value={formData.introduction ?? ''} 
                onChange={e => updateField('introduction', e.target.value)}
                rows={4}
                className="mt-2"
              />
              <div className="mt-3">
                <Label className="text-sm">Couleur de l'introduction</Label>
                <ColorPicker
                  value={formData.introColor || '#666666'}
                  onChange={(value) => updateField('introColor', value)}
                />
              </div>
            </div>

            {/* Sous-sections */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Sous-sections</Label>
                <button
                  type="button"
                  onClick={() => {
                    const newSection = {
                      subtitle: 'Nouveau sous-titre',
                      text: 'Nouveau texte...'
                    };
                    updateField('sections', [...whoWeAreSections, newSection]);
                  }}
                  className="px-3 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus size={14} className="inline mr-1" />
                  Ajouter une sous-section
                </button>
              </div>

              <div className="space-y-4">
                {whoWeAreSections.map((section: any, index: number) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Sous-section {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = whoWeAreSections.filter((_: any, i: number) => i !== index);
                          updateField('sections', updated);
                        }}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Sous-titre</Label>
                        <Input 
                          value={section.subtitle || ''} 
                          onChange={e => {
                            const updated = [...whoWeAreSections];
                            updated[index].subtitle = e.target.value;
                            updateField('sections', updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Texte</Label>
                        <Textarea 
                          value={section.text || ''} 
                          onChange={e => {
                            const updated = [...whoWeAreSections];
                            updated[index].text = e.target.value;
                            updateField('sections', updated);
                          }}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Label className="text-sm">Couleur des sous-titres</Label>
                <ColorPicker
                  value={formData.subtitleColor || '#084F6E'}
                  onChange={(value) => updateField('subtitleColor', value)}
                />
              </div>

              <div className="mt-4">
                <Label className="text-sm">Couleur du texte</Label>
                <ColorPicker
                  value={formData.textColor || '#666666'}
                  onChange={(value) => updateField('textColor', value)}
                />
              </div>
            </div>

            {/* Images */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Images</Label>
                <button
                  type="button"
                  onClick={() => {
                    const newImage = {
                      url: '',
                      alt: ''
                    };
                    updateField('images', [...whoWeAreImages, newImage]);
                  }}
                  className="px-3 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus size={14} className="inline mr-1" />
                  Ajouter une image
                </button>
              </div>

              {/* Disposition des images */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2">Disposition des images</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateField('layoutStyle', 'left')}
                    className="p-3 border-2 rounded-lg text-left transition-all"
                    style={formData.layoutStyle === 'left' 
                      ? { borderColor: THEME_COLORS.secondary, backgroundColor: THEME_COLORS.secondaryLight } 
                      : { borderColor: '#d1d5db' }
                    }
                  >
                    <div className="font-medium text-sm">Images à gauche</div>
                    <div className="text-xs text-gray-500 mt-1">Images à gauche, contenu à droite</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('layoutStyle', 'right')}
                    className="p-3 border-2 rounded-lg text-left transition-all"
                    style={(formData.layoutStyle || 'right') === 'right' 
                      ? { borderColor: THEME_COLORS.secondary, backgroundColor: THEME_COLORS.secondaryLight } 
                      : { borderColor: '#d1d5db' }
                    }
                  >
                    <div className="font-medium text-sm">Images à droite</div>
                    <div className="text-xs text-gray-500 mt-1">Contenu à gauche, images à droite</div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {whoWeAreImages.map((image: any, index: number) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Image {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = whoWeAreImages.filter((_: any, i: number) => i !== index);
                          updateField('images', updated);
                        }}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">URL de l'image</Label>
                        <div className="flex gap-2 items-center">
                          <Input 
                            value={image.url || ''} 
                            onChange={e => {
                              const updated = [...whoWeAreImages];
                              updated[index].url = e.target.value;
                              updateField('images', updated);
                            }}
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const formData = new FormData();
                                  formData.append('image', file);
                                  
                                  try {
                                    const response = await fetch('/api/upload/image', {
                                      method: 'POST',
                                      body: formData,
                                    });
                                    
                                    if (response.ok) {
                                      const data = await response.json();
                                      const updated = [...whoWeAreImages];
                                      updated[index].url = data.url;
                                      updateField('images', updated);
                                    }
                                  } catch (error) {
                                    console.error('Upload error:', error);
                                  }
                                }
                              };
                              input.click();
                            }}
                            className="w-10 h-10 border-2 border-dashed border-gray-400 rounded flex items-center justify-center hover:border-gray-600 hover:bg-gray-50 transition-colors"
                            title="Télécharger une image"
                          >
                            <Plus size={20} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Texte alternatif</Label>
                        <Input 
                          value={image.alt || ''} 
                          onChange={e => {
                            const updated = [...whoWeAreImages];
                            updated[index].alt = e.target.value;
                            updateField('images', updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Boutons</Label>
                <button
                  type="button"
                  onClick={() => {
                    const newButton = {
                      text: 'Nouveau bouton',
                      url: '',
                      color: '#084F6E',
                      style: 'filled'
                    };
                    updateField('buttons', [...whoWeAreButtons, newButton]);
                  }}
                  className="px-3 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus size={14} className="inline mr-1" />
                  Ajouter un bouton
                </button>
              </div>

              <div className="space-y-3">
                {whoWeAreButtons.map((button: any, index: number) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Bouton {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = whoWeAreButtons.filter((_: any, i: number) => i !== index);
                          updateField('buttons', updated);
                        }}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Texte du bouton</Label>
                          <Input 
                            value={button.text || ''} 
                            onChange={e => {
                              const updated = [...whoWeAreButtons];
                              updated[index].text = e.target.value;
                              updateField('buttons', updated);
                            }}
                          />
                        </div>
                        <div>
                          <URLInput
                            value={button.url || ''}
                            onChange={(value) => {
                              const updated = [...whoWeAreButtons];
                              updated[index].url = value;
                              updateField('buttons', updated);
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Couleur du bouton</Label>
                          <ColorPicker
                            value={button.color || '#084F6E'}
                            onChange={(value) => {
                              const updated = [...whoWeAreButtons];
                              updated[index].color = value;
                              updateField('buttons', updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Couleur du texte</Label>
                          <ColorPicker
                            value={button.textColor || '#ffffff'}
                            onChange={(value) => {
                              const updated = [...whoWeAreButtons];
                              updated[index].textColor = value;
                              updateField('buttons', updated);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Style</Label>
                        <select 
                          value={button.style || 'filled'}
                          onChange={e => {
                            const updated = [...whoWeAreButtons];
                            updated[index].style = e.target.value;
                            updateField('buttons', updated);
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="filled">Plein</option>
                          <option value="outline">Contour</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'travelers_reviews':
        // Initialiser les avis par défaut s'ils n'existent pas
        const defaultReviewsForEdit = [
          {
            id: 1,
            name: 'Sophie L.',
            rating: 5,
            text: 'We spent 2 wonderful days with Eric and Margaux who showed us amazing places. A unique and authentic experience...'
          },
          {
            id: 2,
            name: 'Pierre M.',
            rating: 5,
            text: 'The French explanations, the Thai meal in a local spot, the magnificent landscapes and the warm welcome from Eric and Margaux, everything was perfect!'
          },
          {
            id: 3,
            name: 'Martin Family',
            rating: 5,
            text: 'An unforgettable day, everything was perfect. We discovered beautiful places away from the tourist crowds. Thanks to Eric and Margaux for their kindness...'
          }
        ];
        
        // Si les avis n'existent pas encore, les initialiser
        if (!formData.reviews || formData.reviews.length === 0) {
          updateField('reviews', defaultReviewsForEdit);
        }
        
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
              <Label htmlFor="starRating">Nombre d'étoiles (affichées sous la note)</Label>
              <Input 
                id="starRating"
                type="number"
                min="1"
                max="5"
                step="1"
                value={formData.starRating || '5'} 
                onChange={e => updateField('starRating', e.target.value)}
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
            <div>
              <Label htmlFor="googleLink">Lien de redirection Google</Label>
              <Input 
                id="googleLink"
                type="url"
                placeholder="https://g.page/..."
                value={formData.googleLink || ''} 
                onChange={e => updateField('googleLink', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="googleLinkText">Texte du lien Google</Label>
              <Input 
                id="googleLinkText"
                value={formData.googleLinkText || 'View all reviews on Google'} 
                onChange={e => updateField('googleLinkText', e.target.value)}
              />
            </div>

            {/* Section des avis individuels */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Avis clients</Label>
                <button
                  type="button"
                  onClick={() => {
                    const reviews = formData.reviews || [];
                    const newReview = {
                      id: Date.now(),
                      name: 'Nouveau Client',
                      rating: 5,
                      text: 'Excellent service!'
                    };
                    updateField('reviews', [...reviews, newReview]);
                  }}
                  className="px-3 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus size={14} className="inline mr-1" />
                  Ajouter une note
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {(formData.reviews || []).map((review: any, index: number) => (
                  <div key={review.id} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Avis {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const reviews = formData.reviews || [];
                          const updatedReviews = reviews.filter((r: any) => r.id !== review.id);
                          updateField('reviews', updatedReviews);
                        }}
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Nom</Label>
                        <Input 
                          value={review.name || ''} 
                          onChange={e => {
                            const reviews = formData.reviews || [];
                            const updatedReviews = reviews.map((r: any) => 
                              r.id === review.id ? { ...r, name: e.target.value } : r
                            );
                            updateField('reviews', updatedReviews);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Nombre d'étoiles</Label>
                        <Input 
                          type="number"
                          min="1"
                          max="5"
                          step="1"
                          value={review.rating || 5} 
                          onChange={e => {
                            const reviews = formData.reviews || [];
                            const updatedReviews = reviews.map((r: any) => 
                              r.id === review.id ? { ...r, rating: parseInt(e.target.value) || 5 } : r
                            );
                            updateField('reviews', updatedReviews);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Texte</Label>
                        <Textarea 
                          value={review.text || ''} 
                          onChange={e => {
                            const reviews = formData.reviews || [];
                            const updatedReviews = reviews.map((r: any) => 
                              r.id === review.id ? { ...r, text: e.target.value } : r
                            );
                            updateField('reviews', updatedReviews);
                          }}
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'custom_tour_form':
        return (
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Our Tailor-made trips'} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Our Tailor-made trips"
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
              <Textarea 
                id="subtitle"
                value={formData.subtitle || 'Design your own journey through Thailand with our tailor-made stays: from cultural discoveries and family adventures to romantic getaways and island escapes. Every itinerary is crafted to match your wishes, offering authentic experiences, quality services, and a unique immersion far from mass tourism.'} 
                onChange={e => updateField('subtitle', e.target.value)}
                rows={4}
                placeholder="Design your own journey through Thailand..."
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
                  value={formData.dividerColor || '#3BA8AF'}
                  onChange={(value) => updateField('dividerColor', value)}
                />
              </div>
            </div>

            {/* Couleur de fond */}
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <div className="mt-3">
                <ColorPicker
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(value) => updateField('backgroundColor', value)}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t space-y-3">
              <Label>Formulaire lié</Label>
              <FormSelector 
                selectedFormId={formData.formId}
                onFormSelect={(formId: number | null) => updateField('formId', formId)}
                pageSlug={pageSlug || 'home'}
                blockId={block.id}
              />
            </div>
          </div>
        );

      default:
        // Gérer les blocs Text génériques
        if (block.blockType === 'text') {
          return (
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input 
                  id="title"
                  value={formData.title || block.configuration?.title || ''} 
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
                    value={formData.dividerColor || '#3BA8AF'}
                    onChange={(value) => updateField('dividerColor', value)}
                  />
                </div>
              </div>

              {/* Couleur de fond */}
              <div>
                <Label htmlFor="backgroundColor">Couleur de fond</Label>
                <div className="mt-3">
                  <ColorPicker
                    value={formData.backgroundColor || '#ffffff'}
                    onChange={(value) => updateField('backgroundColor', value)}
                  />
                </div>
              </div>
            </div>
          );
        }
        
        // Cas général pour les blocs Hero (quand ce n'est pas hero_main) - Champs vides par défaut
        if (block.blockType === 'hero') {
          return (
            <div className="space-y-6">
              {/* Titre principal */}
              <div>
                <Label htmlFor="title">Titre principal</Label>
                <Textarea 
                  id="title"
                  value={formData.title || block.configuration?.title || ''} 
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Votre titre principal"
                  rows={3}
                  className="mt-2"
                />
                <div className="mt-3">
                  <ColorPicker
                    value={formData.titleColor || ''}
                    onChange={(value) => updateField('titleColor', value)}
                  />
                </div>
              </div>
              
              {/* Mot du titre en seconde couleur */}
              <div>
                <Label htmlFor="titleAccentText">Mot du titre en seconde couleur</Label>
                <Input 
                  id="titleAccentText"
                  value={formData.titleAccentText || ''} 
                  onChange={e => updateField('titleAccentText', e.target.value)}
                  placeholder="Mot à colorer"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tapez exactement les mots du titre que vous voulez colorer
                </p>
                <div className="mt-3">
                  <ColorPicker
                    value={formData.titleAccentColor || ''}
                    onChange={(value) => updateField('titleAccentColor', value)}
                  />
                </div>
              </div>

              {/* Sous-titre */}
              <div>
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Textarea 
                  id="subtitle"
                  value={formData.subtitle || block.configuration?.subtitle || ''} 
                  onChange={e => updateField('subtitle', e.target.value)}
                  placeholder="Votre sous-titre descriptif"
                  rows={3}
                  className="mt-2"
                />
                <div className="mt-3">
                  <ColorPicker
                    value={formData.subtitleColor || ''}
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
                      const buttons = formData.buttons || [{text: 'Bouton 1', url: '', color: '#ffffff', textColor: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#ffffff', textColor: '#ffffff', style: 'outline'}];
                      updateField('buttons', [...buttons, {text: 'Nouveau bouton', url: '', color: '#ffffff', textColor: '#084F6E', style: 'filled'}]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter un bouton
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {(formData.buttons || [{text: 'Bouton 1', url: '', color: '#ffffff', textColor: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#ffffff', textColor: '#ffffff', style: 'outline'}]).map((button: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Bouton {index + 1}</Label>
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const buttons = formData.buttons || [{text: 'Bouton 1', url: '', color: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#084F6E', style: 'filled'}];
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
                            const buttons = formData.buttons || [{text: 'Bouton 1', url: '', color: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#084F6E', style: 'filled'}];
                            const newButtons = buttons.map((b: any, i: number) => 
                              i === index ? {...b, text: e.target.value} : b
                            );
                            updateField('buttons', newButtons);
                          }}
                        />
                      </div>
                      <div>
                        <URLInput 
                          value={button.url || ''} 
                          onChange={(value: string) => {
                            const buttons = formData.buttons || [{text: 'Bouton 1', url: '', color: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#084F6E', style: 'filled'}];
                            const newButtons = buttons.map((b: any, i: number) => 
                              i === index ? {...b, url: value} : b
                            );
                            updateField('buttons', newButtons);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Couleur du bouton</Label>
                        <ColorPicker
                          value={button.color || '#084F6E'}
                          onChange={(value) => {
                            const buttons = formData.buttons || [{text: 'Bouton 1', url: '', color: '#ffffff', textColor: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#ffffff', textColor: '#ffffff', style: 'outline'}];
                            const newButtons = buttons.map((b: any, i: number) => 
                              i === index ? {...b, color: value} : b
                            );
                            updateField('buttons', newButtons);
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Couleur du texte</Label>
                        <ColorPicker
                          value={button.textColor || '#ffffff'}
                          onChange={(value) => {
                            const buttons = formData.buttons || [{text: 'Bouton 1', url: '', color: '#ffffff', textColor: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#ffffff', textColor: '#ffffff', style: 'outline'}];
                            const newButtons = buttons.map((b: any, i: number) => 
                              i === index ? {...b, textColor: value} : b
                            );
                            updateField('buttons', newButtons);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Style</Label>
                      <Select 
                        value={button.style || 'filled'} 
                        onValueChange={value => {
                          const buttons = formData.buttons || [{text: 'Bouton 1', url: '', color: '#ffffff', textColor: '#084F6E', style: 'filled'}, {text: 'Bouton 2', url: '', color: '#ffffff', textColor: '#ffffff', style: 'outline'}];
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
                  ))}
                </div>
              </div>

              {/* Alignement du contenu */}
              <div>
                <Label>Alignement du contenu</Label>
                <div className="mt-3">
                  <Select value={formData.contentAlignment || 'center'} onValueChange={value => updateField('contentAlignment', value)}>
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

              {/* Animation */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="animation"
                  checked={formData.hasAnimation || false}
                  onCheckedChange={(checked) => updateField('hasAnimation', checked)}
                />
                <Label htmlFor="animation" className="cursor-pointer">
                  Animation du contenu
                </Label>
              </div>

              {/* Arrière-plan */}
              <div>
                <Label>Arrière-plan</Label>
                <div className="mt-3">
                  <Select value={formData.backgroundType || 'gradient'} onValueChange={value => updateField('backgroundType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'arrière-plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Couleur dégradé</SelectItem>
                      <SelectItem value="color">Couleur unie</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="images">Images en rotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.backgroundType === 'gradient' && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label htmlFor="gradientColor1">Première couleur du dégradé</Label>
                      <ColorPicker
                        value={formData.gradientColor1 || '#084F6E'}
                        onChange={(value) => updateField('gradientColor1', value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gradientColor2">Deuxième couleur du dégradé</Label>
                      <ColorPicker
                        value={formData.gradientColor2 || '#3BA8AF'}
                        onChange={(value) => updateField('gradientColor2', value)}
                      />
                    </div>
                  </div>
                )}
                
                {formData.backgroundType === 'color' && (
                  <div className="mt-3">
                    <Label htmlFor="backgroundColor">Couleur de fond</Label>
                    <ColorPicker
                      value={formData.backgroundColor || '#084F6E'}
                      onChange={(value) => updateField('backgroundColor', value)}
                    />
                  </div>
                )}
                
                {formData.backgroundType === 'video' && (
                  <div className="mt-3">
                    <Label htmlFor="videoUrl">URL de la vidéo</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="videoUrl"
                        value={formData.videoUrl || ''} 
                        onChange={e => updateField('videoUrl', e.target.value)}
                        placeholder="URL de la vidéo"
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

              {/* Taille du cadre */}
              <div>
                <Label>Taille du cadre</Label>
                <div className="mt-3">
                  <Select value={formData.heroSize || 'petite'} onValueChange={value => updateField('heroSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Taille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petite">Petite</SelectItem>
                      <SelectItem value="grande">Grande (plein écran)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        }

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
  const searchString = useSearch();
  const [previewMode, setPreviewMode] = useState<'normal' | 'fullscreen'>('normal');
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [previewBlock, setPreviewBlock] = useState<PageBlock | null>(null);
  const [livePreviewData, setLivePreviewData] = useState<{ [blockId: number]: any }>({});
  const [isBlockPopupOpen, setIsBlockPopupOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Get page slug from URL parameters
  const urlParams = new URLSearchParams(searchString);
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

  // Insert block mutation
  const insertBlockMutation = useMutation({
    mutationFn: async ({ blockType, position }: { blockType: string; position: number }) => {
      const response = await fetch('/api/admin/page-blocks/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType,
          position,
          pageSlug,
          pageId: currentPageConfig?.id
        }),
      });
      if (!response.ok) throw new Error('Failed to insert block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', pageSlug] });
      toast({ title: "Succès", description: "Bloc ajouté avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'ajouter le bloc", variant: "destructive" });
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
    setLocation('/admin-editor-page');
  };

  const viewLivePage = () => {
    // Open the live page in a new tab
    const url = pageSlug === 'home' ? '/' : `/${pageSlug}`;
    window.open(url, '_blank');
  };

  const handlePageChange = (newPageSlug: string) => {
    setLocation(`/admin-editor-page?page=${newPageSlug}`);
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
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: THEME_COLORS.secondaryLight }}
                >
                  <Settings className="w-5 h-5" style={{ color: THEME_COLORS.secondary }} />
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
              <div className="text-gray-500 mb-4 font-medium">Aucune section sur cette page</div>
              <p className="text-gray-400 text-sm mb-6">
                Commencez par ajouter votre premier bloc pour construire cette page
              </p>
              <Button
                onClick={() => {
                  setInsertPosition(0);
                  setIsBlockPopupOpen(true);
                }}
                className="text-white"
                style={{ backgroundColor: THEME_COLORS.secondary }}
                data-testid="button-add-first-block"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un premier bloc
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              <AnimatePresence mode="popLayout">
                {sortedBlocks.map((block, index) => (
                  <div key={block.id}>
                    {/* Zone d'insertion discrète au hover */}
                    <div 
                      className="group relative h-8 flex items-center justify-center transition-all hover:h-12"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 168, 175, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <button
                        onClick={() => {
                          setInsertPosition(block.blockOrder);
                          setIsBlockPopupOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium"
                        style={{ 
                          backgroundColor: THEME_COLORS.secondary,
                          color: 'white'
                        }}
                        data-testid={`button-insert-before-${index}`}
                      >
                        <Plus className="w-4 h-4" />
                        Insérer un bloc ici
                      </button>
                    </div>

                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4"
                    >
                      <Card className={`overflow-hidden ${!block.isActive ? 'bg-gray-200' : ''}`}>
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
                              <div className="flex items-center justify-between gap-3 min-w-[120px] h-9 px-3 rounded-md border border-input bg-background">
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
                              </div>
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
                              className="flex items-center gap-1"
                              style={editingBlockId === block.id 
                                ? { backgroundColor: THEME_COLORS.secondaryLight } 
                                : {}
                              }
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
                              pageSlug={pageSlug}
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
                  </div>
                ))}
              </AnimatePresence>


              {/* Bouton visible pour ajouter un bloc à la fin */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    const lastBlock = sortedBlocks[sortedBlocks.length - 1];
                    setInsertPosition(lastBlock ? lastBlock.blockOrder + 1 : 0);
                    setIsBlockPopupOpen(true);
                  }}
                  className="flex items-center gap-2"
                  style={{ 
                    backgroundColor: THEME_COLORS.secondary,
                    color: 'white'
                  }}
                  data-testid="button-add-block-end"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = THEME_COLORS.secondary;
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un bloc
                </Button>
              </div>
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

      {/* Block Selection Popup */}
      <BlockSelectionPopup
        isOpen={isBlockPopupOpen}
        onClose={() => {
          setIsBlockPopupOpen(false);
          setInsertPosition(null);
        }}
        onSelect={(blockType) => {
          if (insertPosition !== null) {
            insertBlockMutation.mutate({ blockType, position: insertPosition });
            setIsBlockPopupOpen(false);
            setInsertPosition(null);
          }
        }}
      />
    </div>
  );
}