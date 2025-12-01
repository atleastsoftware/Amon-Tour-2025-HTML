import { useState, useRef, useEffect } from 'react';
import { useTranslationSection } from '@/hooks/useTranslationSection';

// CSS personnalisé pour les checkboxes
const checkboxStyles = `
  .checkbox-custom[data-state="checked"] {
    background-color: var(--checkbox-color) !important;
    border-color: var(--checkbox-color) !important;
  }
  
  .checkbox-custom:focus-visible {
    outline: 2px solid var(--checkbox-color) !important;
    outline-offset: 2px !important;
  }
  
  .checkbox-custom[data-state="unchecked"] {
    border-color: var(--checkbox-color) !important;
  }
`;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  Type,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  Circle,
  File,
  Hash,
  ChevronDown,
  ChevronUp,
  Upload,
  Palette,
  Layout,
  Settings,
  Save,
  FormInput,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// Types for the form builder
interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  style?: {
    width?: 'full' | 'half' | 'third' | 'twothirds';
    marginBottom?: number;
  };
}

interface FormSettings {
  submitButtonText?: string;
  submitButtonColor?: string;
  successMessage?: string;
  errorMessage?: string;
  emailNotification?: boolean;
  redirectUrl?: string;
  whatsappButtonEnabled?: boolean;
  whatsappButtonText?: string;
}

interface FormData {
  id?: number;
  name: string;
  title: string;
  subtitle?: string;
  description?: string;
  headerImage?: string;
  layout: 'single-column' | 'two-column' | 'grid';
  formLayout: 'columns' | 'columns-reversed' | 'header' | 'footer';
  backgroundColor: string;
  primaryColor: string;
  frameColor: string;
  titleColor: string;
  subtitleColor: string;
  textColor: string;
  fields: FormField[];
  settings: FormSettings;
  isActive: boolean;
}

interface FormBuilderProps {
  initialForm?: FormData;
  onSave: (form: FormData) => Promise<void>;
  onCancel: () => void;
}

const getFieldTypes = (t: (key: string) => string) => [
  { type: 'text', label: t('formBuilder.fieldTypes.text'), icon: Type },
  { type: 'email', label: t('formBuilder.fieldTypes.email'), icon: Mail },
  { type: 'phone', label: t('formBuilder.fieldTypes.phone'), icon: Phone },
  { type: 'textarea', label: t('formBuilder.fieldTypes.textarea'), icon: Type },
  { type: 'select', label: t('formBuilder.fieldTypes.select'), icon: ChevronDown },
  { type: 'checkbox', label: t('formBuilder.fieldTypes.checkbox'), icon: CheckSquare },
  { type: 'radio', label: t('formBuilder.fieldTypes.radio'), icon: Circle },
  { type: 'file', label: t('formBuilder.fieldTypes.file'), icon: File },
  { type: 'date', label: t('formBuilder.fieldTypes.date'), icon: Calendar },
  { type: 'number', label: t('formBuilder.fieldTypes.number'), icon: Hash },
] as const;

// Couleurs principales du système
const SYSTEM_COLORS = {
  primary: '#084F6E',
  secondary: '#3BA8AF',
  heading: '#1f2937',
  text: '#374151',
  background: '#ffffff',
  white: '#ffffff',
  gray: '#6b7280',
  dark: '#1f2937'
};

// Couleurs principales du thème
const THEME_COLORS = {
  primary: '#084F6E',
  secondary: '#3BA8AF',
  heading: '#1f2937',
  text: '#374151',
  background: '#ffffff'
};

// Composant ColorPicker compact avec sélecteur natif + cases rapides
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const { t } = useTranslationSection('admin');
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
      case 'heading':
        onChange(THEME_COLORS.heading);
        setIsEditingCustom(false);
        break;
      case 'text':
        onChange(THEME_COLORS.text);
        setIsEditingCustom(false);
        break;
      case 'background':
        onChange(THEME_COLORS.background);
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
    if (currentColorValue === THEME_COLORS.heading) return 'heading';
    if (currentColorValue === THEME_COLORS.text) return 'text';
    if (currentColorValue === THEME_COLORS.background) return 'background';
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
                setCustomInput('');
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
                {getCurrentOption() === 'primary' && t('formBuilder.colorPicker.primary')}
                {getCurrentOption() === 'secondary' && t('formBuilder.colorPicker.secondary')}
                {getCurrentOption() === 'heading' && t('formBuilder.colorPicker.heading')}
                {getCurrentOption() === 'text' && t('formBuilder.colorPicker.text')}
                {getCurrentOption() === 'background' && t('formBuilder.colorPicker.background')}
                {getCurrentOption() === 'custom' && t('formBuilder.colorPicker.colorReference', { color: displayValue })}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">{t('formBuilder.colorPicker.customColor')}</SelectItem>
              <SelectItem value="primary">{t('formBuilder.colorPicker.primary')}</SelectItem>
              <SelectItem value="secondary">{t('formBuilder.colorPicker.secondary')}</SelectItem>
              <SelectItem value="heading">{t('formBuilder.colorPicker.heading')}</SelectItem>
              <SelectItem value="text">{t('formBuilder.colorPicker.text')}</SelectItem>
              <SelectItem value="background">{t('formBuilder.colorPicker.background')}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <p className="text-xs text-gray-500">
        {t('formBuilder.colorPicker.colorHint')}
      </p>
    </div>
  );
}

export default function FormBuilder({ initialForm, onSave, onCancel }: FormBuilderProps) {
  const { t } = useTranslationSection('admin');
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'informations' | 'builder' | 'style' | 'settings'>('informations');
  const [showPreview, setShowPreview] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const FIELD_TYPES = getFieldTypes(t);

  // Injecter le CSS personnalisé pour les checkboxes
  useEffect(() => {
    const styleId = 'checkbox-custom-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.innerHTML = checkboxStyles;
    
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  // Fonction pour résoudre la couleur (convertit 'primary' en '#084F6E', etc.)
  const resolveColor = (colorValue: string) => {
    return SYSTEM_COLORS[colorValue as keyof typeof SYSTEM_COLORS] || colorValue;
  };
  
  // Pre-populate with Custom Tour Request form if no initial form provided
  const getDefaultFormData = () => {
    if (initialForm) {
      // S'assurer que les couleurs titre et sous-titre sont blanches pour la visibilité
      return {
        ...initialForm,
        titleColor: initialForm.titleColor || '#ffffff',
        subtitleColor: initialForm.subtitleColor || '#ffffff',
        formLayout: initialForm.formLayout || 'columns',
      };
    }
    
    // Default to Custom Tour Request form structure
    return {
      name: 'Custom Tour Request',
      title: 'Create Your Custom Trip',
      subtitle: 'Your travel story starts with your dreams – let us write the rest.',
      description: 'Créez votre expérience unique en Thaïlande',
      headerImage: '/catamaran-cruise.png',
      layout: 'single-column' as const,
      formLayout: 'columns' as const,
      backgroundColor: '#ffffff',
      primaryColor: '#084F6E',
      frameColor: '#ffffff',
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
      textColor: '#333333',
      fields: [
        {
          id: 'fullname',
          type: 'text' as const,
          label: 'Full Name',
          placeholder: 'Your name',
          required: true,
          style: { width: 'half' as const }
        },
        {
          id: 'email',
          type: 'email' as const,
          label: 'Email',
          placeholder: 'Your email',
          required: true,
          style: { width: 'half' as const }
        },
        {
          id: 'countrycode',
          type: 'select' as const,
          label: 'Country Code',
          placeholder: 'Code',
          required: true,
          options: ['🇫🇷 +33', '🇹🇭 +66', '🇺🇸 +1', '🇬🇧 +44', '🇩🇪 +49', '🇪🇸 +34'],
          style: { width: 'third' as const }
        },
        {
          id: 'whatsapp',
          type: 'phone' as const,
          label: 'WhatsApp Number',
          placeholder: 'Your WhatsApp number',
          required: true,
          style: { width: 'half' as const }
        },
        {
          id: 'adults',
          type: 'select' as const,
          label: 'Number of adults',
          placeholder: 'Select number of adults',
          required: false,
          options: ['1 adult', '2 adults', '3 adults', '4 adults', '5 adults', '6+ adults'],
          style: { width: 'half' as const }
        },
        {
          id: 'kids',
          type: 'select' as const,
          label: 'Number of kids (under 12 years old)',
          placeholder: 'Select number of kids',
          required: false,
          options: ['No kids', '1 kid', '2 kids', '3 kids', '4 kids', '5+ kids'],
          style: { width: 'half' as const }
        },
        {
          id: 'dates',
          type: 'date' as const,
          label: 'Dates of trip',
          placeholder: 'Select trip dates',
          required: false,
          style: { width: 'full' as const }
        },
        {
          id: 'duration',
          type: 'select' as const,
          label: 'Or approximate duration',
          placeholder: 'Select duration',
          required: false,
          options: ['1-3 days', '4-7 days', '8-14 days', '15+ days'],
          style: { width: 'full' as const }
        },
        {
          id: 'triptypes',
          type: 'checkbox' as const,
          label: 'Trip Types',
          required: false,
          options: ['Culture & History', 'Nature & Adventure', 'Beaches & Islands', 'Family trip', 'Group trip', 'Wedding & Honeymoon'],
          style: { width: 'full' as const }
        },
        {
          id: 'destinations',
          type: 'checkbox' as const,
          label: 'Destinations',
          required: false,
          options: ['Khao Sok', 'Krabi', 'Koh Mook', 'Bangkok', 'Chiang Mai', 'Others destinations'],
          style: { width: 'full' as const }
        },
        {
          id: 'message',
          type: 'textarea' as const,
          label: 'Describe your ideal trip',
          placeholder: 'Tell us what you would like to see and do during your journey...',
          required: true,
          style: { width: 'full' as const }
        }
      ],
      settings: {
        submitButtonText: 'Send my request',
        submitButtonColor: '#084F6E',
        successMessage: 'We will contact you very soon to discuss your travel project.',
        errorMessage: 'There was a problem sending your request. Please try again.',
        emailNotification: true,
        redirectUrl: ''
      },
      isActive: true
    };
  };

  const [formData, setFormData] = useState<FormData>(() => getDefaultFormData());

  // Generate unique field ID
  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new field
  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: `Nouveau champ ${type}`,
      placeholder: '',
      required: false,
      options: type === 'select' || type === 'checkbox' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
      validation: {},
      style: {
        width: 'full',
        marginBottom: 16
      }
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setSelectedField(newField.id);
    
    // Scroll automatiquement vers le bas de la section des champs
    setTimeout(() => {
      const fieldsSection = document.querySelector('[data-fields-section]');
      if (fieldsSection) {
        // Aller au bas de la section des champs
        const rect = fieldsSection.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top;
        const sectionHeight = rect.height;
        
        window.scrollTo({
          top: absoluteTop + sectionHeight - 100, // Bas de section moins un peu d'espace
          behavior: 'smooth'
        });
      }
    }, 200); // Plus de délai pour s'assurer que le DOM est mis à jour
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    setSelectedField(null);
  };

  // Duplicate field
  const duplicateField = (fieldId: string) => {
    const field = formData.fields.find(f => f.id === fieldId);
    if (field) {
      const duplicatedField = {
        ...field,
        id: generateFieldId(),
        label: field.label + ' (copie)'
      };
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, duplicatedField]
      }));
    }
  };

  // Reorder fields
  const reorderFields = (newFields: FormField[]) => {
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  // Save form
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du formulaire est obligatoire.",
        variant: "destructive"
      });
      return;
    }

    if (formData.fields.length === 0) {
      toast({
        title: "Erreur", 
        description: "Le formulaire doit contenir au moins un champ.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Définir explicitement isActive: true pour publier
      const publishData = { ...formData, isActive: true };
      await onSave(publishData);
      // Toast et redirection gérés dans admin-editor-form.tsx
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du formulaire.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Render field preview - adapted for the real site layout
  const renderFieldPreview = (field: FormField) => {
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
                <SelectValue placeholder={field.placeholder || t('formBuilder.preview.selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
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
              {field.options?.map((option, index) => (
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
              {field.options?.map((option, index) => (
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
              onClick={() => {
                alert(t('formBuilder.datePicker.alertMessage'));
              }}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-card border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold">{t('formEditor.formBuilder')}</h2>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">{t('formEditor.formName')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('formEditor.formNamePlaceholder')}
                className="w-64 h-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" size="sm" className="h-9">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm" className="h-9">
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>

      </div>

      {/* Full Width Preview */}
      {showPreview && (
        <div className="bg-gray-100 border-b" data-preview-section>
          <div className="p-6">
            <div className={`${formData.formLayout === 'footer' ? '' : 'bg-card'} rounded-lg shadow-lg overflow-hidden ${formData.formLayout === 'footer' ? 'max-w-2xl' : 'max-w-6xl'} mx-auto`} style={formData.formLayout === 'footer' ? { backgroundColor: resolveColor(formData.frameColor) } : {}}>
              {formData.formLayout === 'header' ? (
                // Layout Header - Image en haut, formulaire en dessous
                <div className="flex flex-col">
                  {/* Image Header */}
                  <div className="h-56 relative">
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
                      className="absolute inset-0 flex flex-col justify-center items-center text-center p-8"
                      style={{ 
                        background: `linear-gradient(to bottom, ${resolveColor(formData.primaryColor)}CC, transparent)` 
                      }}
                    >
                      <h3 
                        className="font-heading font-bold text-4xl mb-3"
                        style={{ color: resolveColor(formData.titleColor) }}
                      >
                        {formData.title || t('formBuilder.preview.formTitle')}
                      </h3>
                      {formData.subtitle && (
                        <p 
                          className="max-w-md"
                          style={{ color: resolveColor(formData.subtitleColor) }}
                        >
                          {formData.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Form Below */}
                  <div className="p-8" style={{ backgroundColor: resolveColor(formData.frameColor) }}>
                    {/* Form Content pour Header Layout */}
                    {formData.fields.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <FormInput className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{t('formBuilder.preview.addFieldsToPreview')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Rendu des champs du formulaire avec largeurs individuelles */}
                        <div className="grid grid-cols-12 gap-4">
                          {formData.fields.map((field, index) => {
                            let colSpan = 'col-span-12'; // Default: full width
                            
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
                              <motion.div
                                key={field.id}
                                className={colSpan}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                              >
                                {renderFieldPreview(field)}
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* Submit Button */}
                        <div className="pt-4">
                          <Button 
                            style={{ 
                              backgroundColor: resolveColor(formData.primaryColor),
                              color: '#ffffff'
                            }}
                            className="w-full px-8 py-2"
                          >
                            {formData.settings.submitButtonText || t('formBuilder.informations.submitButtonTextDefault')}
                          </Button>
                          
                          {/* WhatsApp Button */}
                          {formData.settings.whatsappButtonEnabled && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-center text-sm text-gray-600 mb-3">
                                {formData.settings.whatsappButtonText || 'Or contact us directly via WhatsApp'}
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
              ) : formData.formLayout === 'footer' ? (
                // Layout Footer - Juste le formulaire centré (comme la partie droite du layout colonnes)
                <div className="p-8">
                  {formData.fields.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <FormInput className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>{t('formBuilder.preview.addFieldsToPreview')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Rendu des champs du formulaire avec largeurs individuelles */}
                      <div className="grid grid-cols-12 gap-4">
                        {formData.fields.map((field, index) => {
                          let colSpan = 'col-span-12'; // Default: full width
                          
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
                            <motion.div
                              key={field.id}
                              className={colSpan}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              {renderFieldPreview(field)}
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button 
                          style={{ 
                            backgroundColor: resolveColor(formData.primaryColor),
                            color: '#ffffff'
                          }}
                          className="w-full px-8 py-3"
                        >
                          {formData.settings.submitButtonText || t('formBuilder.informations.submitButtonTextDefault')}
                        </Button>
                        
                        {/* WhatsApp Footer - Always visible in footer layout */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-center text-sm text-gray-600 mb-3">
                            {formData.settings.whatsappButtonText || 'Or contact us directly via WhatsApp'}
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
                      </div>
                    </div>
                  )}
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
                      {formData.title && (
                        <h3 
                          className="font-heading font-bold text-3xl mb-3"
                          style={{ color: resolveColor(formData.titleColor) }}
                        >
                          {formData.title}
                        </h3>
                      )}
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
                    {formData.fields.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 h-full flex flex-col items-center justify-center">
                        <FormInput className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{t('formBuilder.preview.addFieldsToPreview')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Rendu des champs du formulaire avec largeurs individuelles */}
                        <div className="grid grid-cols-12 gap-4">
                          {formData.fields.map((field, index) => {
                            let colSpan = 'col-span-12'; // Default: full width
                            
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
                              <motion.div
                                key={field.id}
                                className={colSpan}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                              >
                                {renderFieldPreview(field)}
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* Submit Button */}
                        <div className="pt-4">
                          <Button 
                            style={{ 
                              backgroundColor: resolveColor(formData.primaryColor),
                              color: '#ffffff'
                            }}
                            className="w-full px-8 py-2"
                          >
                            {formData.settings.submitButtonText || t('formBuilder.informations.submitButtonTextDefault')}
                          </Button>
                          
                          {/* WhatsApp Button */}
                          {formData.settings.whatsappButtonEnabled && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-center text-sm text-gray-600 mb-3">
                                {formData.settings.whatsappButtonText || 'Or contact us directly via WhatsApp'}
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
          </div>
        </div>
      )}

      {/* Bottom Panel - Editor */}
      <div className="bg-card overflow-auto flex-1">
        {/* Tab Navigation */}
        <div className="flex border-b p-4 pb-0">
          <div className="flex">
            {[
              { id: 'informations', label: t('formBuilder.tabs.informations') || 'Information', icon: FormInput },
              { id: 'builder', label: t('formBuilder.tabs.builder') || 'Builder', icon: Layout },
              { id: 'style', label: t('formBuilder.tabs.style') || 'Style', icon: Palette },
              { id: 'settings', label: t('formBuilder.tabs.settings') || 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === 'informations' && (
            <div className="space-y-6">
              {/* Form Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm" data-testid="title-general-info">{t('formBuilder.informations.generalInfo') || 'General Information'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label data-testid="label-title">{t('formBuilder.informations.title') || 'Title'}</Label>
                    <Input
                      data-testid="input-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('formBuilder.informations.titlePlaceholder') || 'e.g., Contact Us'}
                    />
                  </div>
                  <div>
                    <Label data-testid="label-subtitle">{t('formBuilder.informations.subtitle') || 'Subtitle'}</Label>
                    <Textarea
                      data-testid="input-subtitle"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder={t('formBuilder.informations.subtitlePlaceholder') || "e.g., We'll get back to you quickly"}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label data-testid="label-header-image">{t('formBuilder.informations.headerImage') || 'Header Image'}</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        data-testid="input-header-image"
                        value={formData.headerImage || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, headerImage: e.target.value }))}
                        placeholder={t('formBuilder.informations.headerImagePlaceholder') || 'Image URL (e.g., /catamaran-cruise.png)'}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const dataUrl = event.target?.result as string;
                                setFormData(prev => ({ ...prev, headerImage: dataUrl }));
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm" data-testid="title-submit-button">{t('formBuilder.informations.submitButton') || 'Submit Button'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label data-testid="label-button-text">{t('formBuilder.informations.submitButtonText') || 'Button Text'}</Label>
                    <Input
                      data-testid="input-submit-button-text"
                      value={formData.settings.submitButtonText || t('formBuilder.informations.submitButtonTextDefault') || 'Submit'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, submitButtonText: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="whatsapp-button-enabled"
                      data-testid="checkbox-whatsapp-enabled"
                      checked={formData.settings.whatsappButtonEnabled || false}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { 
                          ...prev.settings, 
                          whatsappButtonEnabled: checked as boolean,
                          whatsappButtonText: checked && !prev.settings.whatsappButtonText 
                            ? t('formBuilder.informations.whatsappButtonTextDefault') || 'Or contact us directly via WhatsApp' 
                            : prev.settings.whatsappButtonText
                        }
                      }))}
                    />
                    <Label htmlFor="whatsapp-button-enabled" className="cursor-pointer" data-testid="label-whatsapp-button">
                      {t('formBuilder.informations.addWhatsappButton') || 'Add WhatsApp Button'}
                    </Label>
                  </div>

                  {formData.settings.whatsappButtonEnabled && (
                    <div>
                      <Label data-testid="label-whatsapp-text">{t('formBuilder.informations.whatsappButtonText') || 'Text Above WhatsApp Button'}</Label>
                      <Input
                        data-testid="input-whatsapp-text"
                        value={formData.settings.whatsappButtonText || t('formBuilder.informations.whatsappButtonTextDefault') || 'Or contact us directly via WhatsApp'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, whatsappButtonText: e.target.value }
                        }))}
                        placeholder={t('formBuilder.informations.whatsappButtonTextDefault') || 'Or contact us directly via WhatsApp'}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'builder' && (
              <div className="space-y-6">

                {/* Form Fields */}
                <Card data-fields-section>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm" data-testid="title-form-fields">{t('formBuilder.builder.formFields') || 'Form Fields'} ({formData.fields.length})</CardTitle>
                      <Button
                        data-testid="button-add-field"
                        size="sm"
                        onClick={() => addField('text')}
                        className="h-8"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('formBuilder.builder.newField') || 'New Field'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="fields-container">
                    {formData.fields.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center" data-testid="text-no-fields">
                        {t('formBuilder.builder.noFields') || 'No fields added. Click "New Field" to get started.'}
                      </p>
                    ) : (
                      <Reorder.Group values={formData.fields} onReorder={reorderFields}>
                        {formData.fields.map((field) => (
                          <Reorder.Item key={field.id} value={field}>
                            <div className="mb-2 field-card">
                              <Card>
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                      <Badge variant="outline" className="text-xs">
                                        {FIELD_TYPES.find(t => t.type === field.type)?.label}
                                      </Badge>
                                      {field.required && <Badge variant="destructive" className="text-xs" data-testid="badge-required">{t('formBuilder.builder.required') || 'Required'}</Badge>}
                                      <span className="font-medium text-sm">{field.label}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        data-testid={`button-edit-field-${field.id}`}
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdown(openDropdown === field.id ? null : field.id);
                                        }}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        data-testid={`button-duplicate-field-${field.id}`}
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicateField(field.id);
                                        }}
                                        className="h-6 w-6 p-0"
                                        title={t('formBuilder.builder.duplicate') || 'Duplicate this field'}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteField(field.id);
                                        }}
                                        className="h-6 w-6 p-0 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive)/0.8)]"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Configuration Dropdown */}
                                  {openDropdown === field.id && (
                                    <div className="mt-3 pt-3 border-t space-y-4">
                                      {/* Type de champ */}
                                      <div>
                                        <Label className="text-xs font-medium" data-testid="label-field-type">{t('formBuilder.builder.fieldType') || 'Field Type'}</Label>
                                        <Select
                                          value={field.type}
                                          onValueChange={(value) => updateField(field.id, { type: value as any })}
                                        >
                                          <SelectTrigger className="h-8" data-testid="select-field-type">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {FIELD_TYPES.map(fieldType => (
                                              <SelectItem key={fieldType.type} value={fieldType.type}>
                                                <div className="flex items-center gap-2">
                                                  <fieldType.icon className="h-3 w-3" />
                                                  {fieldType.label}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Largeur */}
                                      <div>
                                        <Label className="text-xs font-medium" data-testid="label-width">{t('formBuilder.builder.width') || 'Width'}</Label>
                                        <Select
                                          value={field.style?.width || 'full'}
                                          onValueChange={(value) => updateField(field.id, {
                                            style: { ...field.style, width: value as any }
                                          })}
                                        >
                                          <SelectTrigger className="h-8" data-testid="select-width">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="full">{t('formBuilder.builder.widthFull') || 'Full Width'}</SelectItem>
                                            <SelectItem value="half">{t('formBuilder.builder.widthHalf') || 'Half Width'}</SelectItem>
                                            <SelectItem value="third">{t('formBuilder.builder.widthThird') || 'Third (1/3)'}</SelectItem>
                                            <SelectItem value="twothirds">{t('formBuilder.builder.widthTwoThirds') || 'Two Thirds (2/3)'}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Configuration basique */}
                                      <div className="grid grid-cols-1 gap-3">
                                        <div>
                                          <Label className="text-xs font-medium" data-testid="label-field-label">{t('formBuilder.builder.fieldLabel') || 'Field Label'}</Label>
                                          <Input
                                            data-testid="input-field-label"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            className="h-8"
                                          />
                                        </div>
                                        
                                        <div>
                                          <Label className="text-xs font-medium" data-testid="label-placeholder">{t('formBuilder.builder.placeholder') || 'Placeholder'}</Label>
                                          <Input
                                            data-testid="input-placeholder"
                                            value={field.placeholder || ''}
                                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                            className="h-8"
                                          />
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            data-testid="switch-required"
                                            checked={field.required}
                                            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                          />
                                          <Label className="text-xs font-medium" data-testid="label-required-field">{t('formBuilder.builder.requiredField') || 'Required Field'}</Label>
                                        </div>
                                        
                                        {/* Options pour select, checkbox, radio */}
                                        {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
                                          <div>
                                            <Label className="text-xs font-medium" data-testid="label-options">{t('formBuilder.builder.options') || 'Options'}</Label>
                                            <div className="space-y-2">
                                              {field.options?.map((option, index) => (
                                                <div key={index} className="flex gap-2">
                                                  <Input
                                                    value={option}
                                                    onChange={(e) => {
                                                      const newOptions = [...(field.options || [])];
                                                      newOptions[index] = e.target.value;
                                                      updateField(field.id, { options: newOptions });
                                                    }}
                                                    className="h-8 flex-1"
                                                  />
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                      const newOptions = field.options?.filter((_, i) => i !== index);
                                                      updateField(field.id, { options: newOptions });
                                                    }}
                                                    className="h-8 w-8 p-0"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              ))}
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                                  updateField(field.id, { options: newOptions });
                                                }}
                                                className="h-8"
                                              >
                                                <Plus className="h-3 w-3 mr-2" />
                                                {t('formBuilder.builder.add')}
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* Layout Block */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('formBuilder.style.layout')}</CardTitle>
                    <p className="text-xs text-gray-500">{t('formBuilder.style.layoutDescription')}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/30 ${
                          formData.formLayout === 'columns' ? 'border-primary bg-primary/10' : 'border-gray-200'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, formLayout: 'columns' as const }))}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-1">
                            <div className="w-4 h-3 bg-primary/20 rounded-sm"></div>
                            <div className="w-4 h-3 bg-gray-200 rounded-sm"></div>
                          </div>
                          <Label className="font-medium text-sm">{t('formBuilder.style.columns')}</Label>
                        </div>
                        <p className="text-xs text-gray-600">{t('formBuilder.style.columnsDesc')}</p>
                      </div>
                      
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/30 ${
                          formData.formLayout === 'columns-reversed' ? 'border-primary bg-primary/10' : 'border-gray-200'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, formLayout: 'columns-reversed' as const }))}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-1">
                            <div className="w-4 h-3 bg-gray-200 rounded-sm"></div>
                            <div className="w-4 h-3 bg-primary/20 rounded-sm"></div>
                          </div>
                          <Label className="font-medium text-sm">{t('formBuilder.style.columnsReversed')}</Label>
                        </div>
                        <p className="text-xs text-gray-600">{t('formBuilder.style.columnsReversedDesc')}</p>
                      </div>
                      
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/30 ${
                          formData.formLayout === 'header' ? 'border-primary bg-primary/10' : 'border-gray-200'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, formLayout: 'header' as const }))}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex flex-col gap-1">
                            <div className="w-8 h-2 bg-primary/20 rounded-sm"></div>
                            <div className="w-8 h-3 bg-gray-200 rounded-sm"></div>
                          </div>
                          <Label className="font-medium text-sm">{t('formBuilder.style.header')}</Label>
                        </div>
                        <p className="text-xs text-gray-600">{t('formBuilder.style.headerLayoutDesc')}</p>
                      </div>
                      
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/30 ${
                          formData.formLayout === 'footer' ? 'border-primary bg-primary/10' : 'border-gray-200'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, formLayout: 'footer' as const }))}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex flex-col gap-1">
                            <div className="w-8 h-3 bg-gray-200 rounded-sm"></div>
                            <div className="w-8 h-2 bg-primary/20 rounded-sm"></div>
                          </div>
                          <Label className="font-medium text-sm">{t('formBuilder.style.footer')}</Label>
                        </div>
                        <p className="text-xs text-gray-600">{t('formBuilder.style.footerLayoutDesc')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('formBuilder.style.colors')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <ColorPicker
                        label={t('formBuilder.style.primaryColor')}
                        value={formData.primaryColor}
                        onChange={(value) => setFormData(prev => ({ ...prev, primaryColor: value }))}
                      />
                    </div>
                    
                    <div>
                      <ColorPicker
                        label={t('formBuilder.style.frameColor')}
                        value={formData.frameColor}
                        onChange={(value) => setFormData(prev => ({ ...prev, frameColor: value }))}
                      />
                    </div>
                    
                    <div>
                      <ColorPicker
                        label={t('formBuilder.style.titleColor')}
                        value={formData.titleColor}
                        onChange={(value) => setFormData(prev => ({ ...prev, titleColor: value }))}
                      />
                    </div>
                    
                    <div>
                      <ColorPicker
                        label={t('formBuilder.style.subtitleColor')}
                        value={formData.subtitleColor}
                        onChange={(value) => setFormData(prev => ({ ...prev, subtitleColor: value }))}
                      />
                    </div>
                    
                    <div>
                      <ColorPicker
                        label={t('formBuilder.style.textColor')}
                        value={formData.textColor}
                        onChange={(value) => setFormData(prev => ({ ...prev, textColor: value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>{t('formBuilder.settings.successMessage')}</Label>
                      <Textarea
                        value={formData.settings.successMessage || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, successMessage: e.target.value }
                        }))}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label>{t('formBuilder.settings.errorMessage')}</Label>
                      <Textarea
                        value={formData.settings.errorMessage || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, errorMessage: e.target.value }
                        }))}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}