import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';

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
import { Plus, Trash2, Edit, Eye, EyeOff, GripVertical, Type, Mail, Phone, Calendar, CheckSquare, Circle, File, Hash, ChevronDown, ChevronUp, Palette, Layout, Settings, Save, FormInput } from 'lucide-react';
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
    width: 'full' | 'half' | 'third';
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
}
interface FormData {
  id?: number;
  name: string;
  title: string;
  subtitle?: string;
  description?: string;
  headerImage?: string;
  layout: 'single-column' | 'two-column' | 'grid';
  formLayout: 'columns' | 'columns-reversed' | 'header';
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
const FIELD_TYPES = [{
  type: 'text',
  label: t("Texte", {
    defaultValue: "Texte"
  }),
  icon: Type
}, {
  type: 'email',
  label: t("Email", {
    defaultValue: "Email"
  }),
  icon: Mail
}, {
  type: 'phone',
  label: t("Txe9lxe9phone", {
    defaultValue: "Txe9lxe9phone"
  }),
  icon: Phone
}, {
  type: 'textarea',
  label: t("Zone de texte", {
    defaultValue: "Zone de texte"
  }),
  icon: Type
}, {
  type: 'select',
  label: t("Sxe9lection", {
    defaultValue: "Sxe9lection"
  }),
  icon: ChevronDown
}, {
  type: 'checkbox',
  label: t("Casesxe0cocher", {
    defaultValue: "Casesxe0cocher"
  }),
  icon: CheckSquare
}, {
  type: 'radio',
  label: t("Boutons radio", {
    defaultValue: "Boutons radio"
  }),
  icon: Circle
}, {
  type: 'file',
  label: t("Fichier", {
    defaultValue: "Fichier"
  }),
  icon: File
}, {
  type: 'date',
  label: t("Date", {
    defaultValue: "Date"
  }),
  icon: Calendar
}, {
  type: 'number',
  label: t("Nombre", {
    defaultValue: "Nombre"
  }),
  icon: Hash
}] as const;

// Couleurs principales du système - utilisation du système de tokens CSS
const SYSTEM_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  white: 'hsl(var(--background))',
  gray: 'hsl(var(--muted-foreground))',
  dark: 'hsl(var(--foreground))'
};

// Couleurs principales du thème
const THEME_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))'
};

// Composant ColorPicker compact avec sélecteur natif + cases rapides
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}
function ColorPicker({
  value,
  onChange,
  label
}: ColorPickerProps) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const currentColorValue = value || 'hsl(var(--background))';

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
  return <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <div className="flex items-center gap-2">
        {/* Cadre de couleur personnalisable à gauche */}
        <div className="relative">
          <div className="w-8 h-8 rounded border border-border cursor-pointer relative overflow-hidden hover:border-border/80 transition-colors" style={{
          backgroundColor: currentColorValue
        }} title={t("Cliquez pour personnaliser la couleur", {
          defaultValue: "Cliquez pour personnaliser la couleur"
        })}>
            <input type="color" value={currentColorValue} onChange={e => handleColorChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>

        {/* Dropdown avec les 3 options OU champ de saisie directe */}
        {isEditingCustom ? <Input value={customInput} onChange={handleCustomInputChange} onBlur={handleCustomInputBlur} onKeyDown={e => {
        if (e.key === 'Enter') {
          handleCustomInputBlur();
        }
        if (e.key === 'Escape') {
          setIsEditingCustom(false);
          setCustomInput('');
        }
      }} placeholder="hsl(var(--background))" className="flex-1 font-mono text-sm" autoFocus /> : <Select value={getCurrentOption()} onValueChange={handleOptionSelect}>
            <SelectTrigger className="flex-1">
              <SelectValue>
                {getCurrentOption() === 'primary' && 'Couleur principale'}
                {getCurrentOption() === 'secondary' && 'Couleur secondaire'}  
                {getCurrentOption() === 'custom' && `Référence couleur : ${displayValue}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">{t("Rxe9fxe9rencecouleur", {
              defaultValue: "Rxe9fxe9rencecouleur"
            })}</SelectItem>
              <SelectItem value="primary">{t("Couleur principale", {
              defaultValue: "Couleur principale"
            })}</SelectItem>
              <SelectItem value="secondary">{t("Couleur secondaire", {
              defaultValue: "Couleur secondaire"
            })}</SelectItem>
            </SelectContent>
          </Select>}
      </div>
      <p className="text-xs text-muted-foreground">{t("Cliquezsurlecarrxe9d", {
        defaultValue: "Cliquezsurlecarrxe9d"
      })}</p>
    </div>;
}
export default function FormBuilder({
  initialForm,
  onSave,
  onCancel
}: FormBuilderProps) {
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState<'informations' | 'builder' | 'style' | 'settings'>('informations');
  const [showPreview, setShowPreview] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

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

  // Fonction pour résoudre la couleur (convertit 'primary' en variables CSS, etc.)
  const resolveColor = (colorValue: string) => {
    return SYSTEM_COLORS[colorValue as keyof typeof SYSTEM_COLORS] || colorValue;
  };

  // Pre-populate with Custom Tour Request form if no initial form provided
  const getDefaultFormData = () => {
    if (initialForm) {
      // S'assurer que les couleurs titre et sous-titre sont blanches pour la visibilité
      return {
        ...initialForm,
        titleColor: initialForm.titleColor || 'hsl(var(--background))',
        subtitleColor: initialForm.subtitleColor || 'hsl(var(--background))',
        formLayout: initialForm.formLayout || 'columns'
      };
    }

    // Default to Custom Tour Request form structure
    return {
      name: t("Custom Tour Request", {
        defaultValue: "Custom Tour Request"
      }),
      title: t("Create Your Custom Trip", {
        defaultValue: "Create Your Custom Trip"
      }),
      subtitle: t("Your travel story starts with your dreams \u2013 let us write the rest.", {
        defaultValue: "Your travel story starts with your dreams \u2013 let us write the rest."
      }),
      description: t("Crxe9ezvotreexpxe9ri", {
        defaultValue: "Crxe9ezvotreexpxe9ri"
      }),
      headerImage: '/catamaran-cruise.png',
      layout: 'single-column' as const,
      formLayout: 'columns' as const,
      backgroundColor: 'hsl(var(--background))',
      primaryColor: 'hsl(var(--primary))',
      frameColor: 'hsl(var(--background))',
      titleColor: 'hsl(var(--background))',
      subtitleColor: 'hsl(var(--background))',
      textColor: 'hsl(var(--foreground))',
      fields: [{
        id: 'fullname',
        type: 'text' as const,
        label: t("Full Name", {
          defaultValue: "Full Name"
        }),
        placeholder: t("Your name", {
          defaultValue: "Your name"
        }),
        required: true,
        style: {
          width: 'half' as const
        }
      }, {
        id: 'email',
        type: 'email' as const,
        label: t("Email", {
          defaultValue: "Email"
        }),
        placeholder: t("Your email", {
          defaultValue: "Your email"
        }),
        required: true,
        style: {
          width: 'half' as const
        }
      }, {
        id: 'countrycode',
        type: 'select' as const,
        label: t("Country Code *", {
          defaultValue: "Country Code *"
        }),
        placeholder: t("Code", {
          defaultValue: "Code"
        }),
        required: true,
        options: ['🇫🇷 +33', '🇹🇭 +66', '🇺🇸 +1', '🇬🇧 +44', '🇩🇪 +49', '🇪🇸 +34'],
        style: {
          width: 'third' as const
        }
      }, {
        id: 'whatsapp',
        type: 'phone' as const,
        label: t("WhatsApp Number", {
          defaultValue: "WhatsApp Number"
        }),
        placeholder: t("Your WhatsApp number", {
          defaultValue: "Your WhatsApp number"
        }),
        required: true,
        style: {
          width: 'half' as const
        }
      }, {
        id: 'adults',
        type: 'select' as const,
        label: t("Number of adults", {
          defaultValue: "Number of adults"
        }),
        placeholder: t("Select number of adults", {
          defaultValue: "Select number of adults"
        }),
        required: false,
        options: ['1 adult', '2 adults', '3 adults', '4 adults', '5 adults', '6+ adults'],
        style: {
          width: 'half' as const
        }
      }, {
        id: 'kids',
        type: 'select' as const,
        label: t("Number of kids (under 12 years old)", {
          defaultValue: "Number of kids (under 12 years old)"
        }),
        placeholder: t("Select number of kids", {
          defaultValue: "Select number of kids"
        }),
        required: false,
        options: ['No kids', '1 kid', '2 kids', '3 kids', '4 kids', '5+ kids'],
        style: {
          width: 'half' as const
        }
      }, {
        id: 'dates',
        type: 'date' as const,
        label: t("Dates of trip", {
          defaultValue: "Dates of trip"
        }),
        placeholder: t("Select trip dates", {
          defaultValue: "Select trip dates"
        }),
        required: false,
        style: {
          width: 'full' as const
        }
      }, {
        id: 'duration',
        type: 'select' as const,
        label: t("Or approximate duration", {
          defaultValue: "Or approximate duration"
        }),
        placeholder: t("Select duration", {
          defaultValue: "Select duration"
        }),
        required: false,
        options: ['1-3 days', '4-7 days', '8-14 days', '15+ days'],
        style: {
          width: 'full' as const
        }
      }, {
        id: 'triptypes',
        type: 'checkbox' as const,
        label: t("Triptypes", {
          defaultValue: "Triptypes"
        }),
        required: false,
        options: ['Culture & History', 'Nature & Adventure', 'Beaches & Islands', 'Family trip', 'Group trip', 'Wedding & Honeymoon'],
        style: {
          width: 'full' as const
        }
      }, {
        id: 'destinations',
        type: 'checkbox' as const,
        label: t("Destinations", {
          defaultValue: "Destinations"
        }),
        required: false,
        options: ['Khao Sok', 'Krabi', 'Koh Mook', 'Bangkok', 'Chiang Mai', 'Others destinations'],
        style: {
          width: 'full' as const
        }
      }, {
        id: 'message',
        type: 'textarea' as const,
        label: t("Describe your ideal trip", {
          defaultValue: "Describe your ideal trip"
        }),
        placeholder: t("Tell us what you would like to see and do during your journey...", {
          defaultValue: "Tell us what you would like to see and do during your journey..."
        }),
        required: true,
        style: {
          width: 'full' as const
        }
      }],
      settings: {
        submitButtonText: 'Send my request',
        submitButtonColor: 'hsl(var(--primary))',
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
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => field.id === fieldId ? {
        ...field,
        ...updates
      } : field)
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
    setFormData(prev => ({
      ...prev,
      fields: newFields
    }));
  };

  // Save form
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.title.trim()) {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Le nom et le titre du formulaire sont obligatoires.", {
          defaultValue: "Le nom et le titre du formulaire sont obligatoires."
        }),
        variant: "destructive"
      });
      return;
    }
    if (formData.fields.length === 0) {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Le formulaire doit contenir au moins un champ.", {
          defaultValue: "Le formulaire doit contenir au moins un champ."
        }),
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
      toast({
        title: t("Formulairesauvegardx", {
          defaultValue: "Formulairesauvegardx"
        }),
        description: t("Leformulaireaxe9txe9", {
          defaultValue: "Leformulaireaxe9txe9"
        })
      });
    } catch (error) {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Erreur lors de la sauvegarde du formulaire.", {
          defaultValue: "Erreur lors de la sauvegarde du formulaire."
        }),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Render field preview - adapted for the real site layout
  const renderFieldPreview = (field: FormField) => {
    const isHalfWidth = field.style?.width === 'half';
    const fieldStyle = {
      marginBottom: `${field.style?.marginBottom || 16}px`
    };
    const baseFieldClasses = isHalfWidth ? "w-full" : "w-full";
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block" style={{
            color: resolveColor(formData.textColor)
          }}>
              {field.label}
            </Label>
            <Input placeholder={field.placeholder} type={field.type} style={{
            color: resolveColor(formData.textColor)
          }} />
          </div>;
      case 'textarea':
        return <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block" style={{
            color: resolveColor(formData.textColor)
          }}>
              {field.label}
            </Label>
            <Textarea placeholder={field.placeholder} rows={4} style={{
            color: resolveColor(formData.textColor)
          }} />
          </div>;
      case 'select':
        return <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block" style={{
            color: resolveColor(formData.textColor)
          }}>
              {field.label}
            </Label>
            <Select>
              <SelectTrigger style={{
              color: resolveColor(formData.textColor)
            }}>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => <SelectItem key={index} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>;
      case 'checkbox':
        return <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-4 block" style={{
            color: resolveColor(formData.textColor)
          }}>
              {field.label}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {field.options?.map((option, index) => <div key={index} className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox id={`${field.id}-${index}`} className="mt-1 checkbox-custom" style={{
                '--checkbox-color': resolveColor(formData.primaryColor),
                accentColor: resolveColor(formData.primaryColor)
              } as React.CSSProperties} />
                  <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal cursor-pointer leading-5" style={{
                color: resolveColor(formData.textColor)
              }}>
                    {option}
                  </Label>
                </div>)}
            </div>
          </div>;
      case 'radio':
        return <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block" style={{
            color: resolveColor(formData.textColor)
          }}>
              {field.label}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => <div key={index} className="flex items-center space-x-2">
                  <input type="radio" name={field.id} id={`${field.id}-${index}`} style={{
                accentColor: resolveColor(formData.primaryColor)
              }} />
                  <Label htmlFor={`${field.id}-${index}`} style={{
                color: resolveColor(formData.textColor)
              }}>{option}</Label>
                </div>)}
            </div>
          </div>;
      case 'file':
        return <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block" style={{
            color: resolveColor(formData.textColor)
          }}>
              {field.label}
            </Label>
            <Input type="file" style={{
            color: resolveColor(formData.textColor)
          }} />
          </div>;
      case 'date':
        return <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block" style={{
            color: resolveColor(formData.textColor)
          }}>
              {field.label}
            </Label>
            <Input placeholder={field.placeholder} readOnly className="cursor-pointer" style={{
            color: resolveColor(formData.textColor)
          }} />
          </div>;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-muted/30">
      {/* Header Bar */}
      <div className="bg-card border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold">{t("Constructeur de formulaire", {
              defaultValue: "Constructeur de formulaire"
            })}</h2>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">{t("Nom du formulaire :", {
                defaultValue: "Nom du formulaire :"
              })}</Label>
              <Input value={formData.name} onChange={e => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))} placeholder={t("Ex: Formulaire de contact", {
              defaultValue: "Ex: Formulaire de contact"
            })} className="w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" size="sm">{t("Annuler", {
              defaultValue: "Annuler"
            })}</Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

      </div>

      {/* Full Width Preview */}
      {showPreview && <div className="bg-gray-100 border-b">
          <div className="p-6">
            <div className="bg-card rounded-lg shadow-lg overflow-hidden max-w-6xl mx-auto">
              {formData.formLayout === 'header' ?
          // Layout Header - Image en haut, formulaire en dessous
          <div className="flex flex-col">
                  {/* Image Header */}
                  <div className="h-48 relative">
                    {formData.headerImage ? <img src={formData.headerImage} alt={t("Header image", {
                defaultValue: "Header image"
              })} className="w-full h-full object-cover" onError={e => {
                e.currentTarget.src = '/catamaran-cruise.png';
              }} /> : <div className="w-full h-full bg-muted"></div>}
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8" style={{
                background: `linear-gradient(to bottom, ${resolveColor(formData.primaryColor)}CC, transparent)`
              }}>
                      <h3 className="font-heading font-bold text-4xl mb-3" style={{
                  color: resolveColor(formData.titleColor)
                }}>
                        {formData.title || 'Titre du formulaire'}
                      </h3>
                      <p className="max-w-md" style={{
                  color: resolveColor(formData.subtitleColor)
                }}>
                        {formData.subtitle || formData.description || 'Description du formulaire'}
                      </p>
                    </div>
                  </div>
                  {/* Form Below */}
                  <div className="p-8" style={{
              backgroundColor: resolveColor(formData.frameColor)
            }}>
                    {/* Form Content pour Header Layout */}
                    {formData.fields.length === 0 ? <div className="text-center py-16 text-muted-foreground">
                        <FormInput className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p>{t("Ajoutez des champs pour voir la pr\xE9visualisation", {
                    defaultValue: "Ajoutez des champs pour voir la pr\xE9visualisation"
                  })}</p>
                      </div> : <div className="space-y-4">
                        {/* Rendu des champs du formulaire */}
                        {(() => {
                  const renderedIndexes = new Set();
                  return formData.fields.map((field, index) => {
                    if (renderedIndexes.has(index)) return null;
                    const nextField = formData.fields[index + 1];
                    const isHalfWidth = field.style?.width === 'half';
                    const isThirdWidth = field.style?.width === 'third';
                    const nextIsHalfWidth = nextField?.style?.width === 'half';

                    // Country Code (1/3) + WhatsApp (2/3) special case
                    if (isThirdWidth && nextField && nextIsHalfWidth && field.id === 'countrycode') {
                      renderedIndexes.add(index);
                      renderedIndexes.add(index + 1);
                      return <div key={`phone-grid-${field.id}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <motion.div initial={{
                          opacity: 0,
                          y: 20
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          y: -20
                        }}>
                                    {renderFieldPreview(field)}
                                  </motion.div>
                                  <div className="md:col-span-2">
                                    <motion.div initial={{
                            opacity: 0,
                            y: 20
                          }} animate={{
                            opacity: 1,
                            y: 0
                          }} exit={{
                            opacity: 0,
                            y: -20
                          }}>
                                      {renderFieldPreview(nextField)}
                                    </motion.div>
                                  </div>
                                </div>;
                    }

                    // Regular half-width fields (2 columns)
                    if (isHalfWidth && nextField && nextIsHalfWidth) {
                      renderedIndexes.add(index);
                      renderedIndexes.add(index + 1);
                      return <div key={`grid-${field.id}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <motion.div initial={{
                          opacity: 0,
                          y: 20
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          y: -20
                        }}>
                                    {renderFieldPreview(field)}
                                  </motion.div>
                                  <motion.div initial={{
                          opacity: 0,
                          y: 20
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          y: -20
                        }}>
                                    {renderFieldPreview(nextField)}
                                  </motion.div>
                                </div>;
                    }

                    // Full width fields
                    renderedIndexes.add(index);
                    return <motion.div key={field.id} initial={{
                      opacity: 0,
                      y: 20
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} exit={{
                      opacity: 0,
                      y: -20
                    }}>
                                {renderFieldPreview(field)}
                              </motion.div>;
                  }).filter(Boolean);
                })()}
                        
                        {/* Submit Button */}
                        <div className="pt-4">
                          <Button style={{
                    backgroundColor: resolveColor(formData.primaryColor),
                    color: 'hsl(var(--primary-foreground))'
                  }} className="w-full px-8 py-2">
                            {formData.settings.submitButtonText || 'Envoyer'}
                          </Button>
                        </div>
                      </div>}
                  </div>
                </div> :
          // Layout Colonnes (normal ou inversé)
          <div className={`grid grid-cols-1 md:grid-cols-2 min-h-[500px] ${formData.formLayout === 'columns-reversed' ? 'md:[&>:first-child]:order-2 md:[&>:last-child]:order-1' : ''}`}>
                  {/* Image Side */}
                  <div className="h-64 md:h-auto relative">
                    {formData.headerImage ? <img src={formData.headerImage} alt={t("Header image", {
                defaultValue: "Header image"
              })} className="w-full h-full object-cover" onError={e => {
                e.currentTarget.src = '/catamaran-cruise.png';
              }} /> : <div className="w-full h-full bg-muted"></div>}
                    <div className="absolute inset-0 flex flex-col justify-center p-8" style={{
                background: `linear-gradient(to ${formData.formLayout === 'columns' ? 'right' : 'left'}, ${resolveColor(formData.primaryColor)}CC, transparent)`
              }}>
                      <h3 className="font-heading font-bold text-3xl mb-3" style={{
                  color: resolveColor(formData.titleColor)
                }}>
                        {formData.title || 'Titre du formulaire'}
                      </h3>
                      <p className="max-w-xs" style={{
                  color: resolveColor(formData.subtitleColor)
                }}>
                        {formData.subtitle || formData.description || 'Description du formulaire'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Form Side */}
                  <div className="p-8" style={{
              backgroundColor: resolveColor(formData.frameColor)
            }}>
                    {formData.fields.length === 0 ? <div className="text-center py-16 text-muted-foreground h-full flex flex-col items-center justify-center">
                        <FormInput className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p>{t("Ajoutez des champs pour voir la pr\xE9visualisation", {
                    defaultValue: "Ajoutez des champs pour voir la pr\xE9visualisation"
                  })}</p>
                      </div> : <div className="space-y-4">
                        {/* Rendu des champs du formulaire */}
                        {(() => {
                  const renderedIndexes = new Set();
                  return formData.fields.map((field, index) => {
                    if (renderedIndexes.has(index)) return null;
                    const nextField = formData.fields[index + 1];
                    const isHalfWidth = field.style?.width === 'half';
                    const isThirdWidth = field.style?.width === 'third';
                    const nextIsHalfWidth = nextField?.style?.width === 'half';

                    // Country Code (1/3) + WhatsApp (2/3) special case
                    if (isThirdWidth && nextField && nextIsHalfWidth && field.id === 'countrycode') {
                      renderedIndexes.add(index);
                      renderedIndexes.add(index + 1);
                      return <div key={`phone-grid-${field.id}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <motion.div initial={{
                          opacity: 0,
                          y: 20
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          y: -20
                        }}>
                                    {renderFieldPreview(field)}
                                  </motion.div>
                                  <div className="md:col-span-2">
                                    <motion.div initial={{
                            opacity: 0,
                            y: 20
                          }} animate={{
                            opacity: 1,
                            y: 0
                          }} exit={{
                            opacity: 0,
                            y: -20
                          }}>
                                      {renderFieldPreview(nextField)}
                                    </motion.div>
                                  </div>
                                </div>;
                    }

                    // Regular half-width fields (2 columns)
                    if (isHalfWidth && nextField && nextIsHalfWidth) {
                      renderedIndexes.add(index);
                      renderedIndexes.add(index + 1);
                      return <div key={`grid-${field.id}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <motion.div initial={{
                          opacity: 0,
                          y: 20
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          y: -20
                        }}>
                                    {renderFieldPreview(field)}
                                  </motion.div>
                                  <motion.div initial={{
                          opacity: 0,
                          y: 20
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          y: -20
                        }}>
                                    {renderFieldPreview(nextField)}
                                  </motion.div>
                                </div>;
                    }

                    // Full width fields
                    renderedIndexes.add(index);
                    return <motion.div key={field.id} initial={{
                      opacity: 0,
                      y: 20
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} exit={{
                      opacity: 0,
                      y: -20
                    }}>
                                {renderFieldPreview(field)}
                              </motion.div>;
                  }).filter(Boolean);
                })()}
                        
                        {/* Submit Button */}
                        <div className="pt-4">
                          <Button style={{
                    backgroundColor: resolveColor(formData.primaryColor),
                    color: 'hsl(var(--primary-foreground))'
                  }} className="w-full px-8 py-2">
                            {formData.settings.submitButtonText || 'Envoyer'}
                          </Button>
                        </div>
                      </div>}
                  </div>
                </div>}
            </div>
          </div>
        </div>}

      {/* Bottom Panel - Editor */}
      <div className="bg-card overflow-auto flex-1">
        {/* Tab Navigation */}
        <div className="flex border-b p-4 pb-0">
          <div className="flex">
            {[{
            id: 'informations',
            label: t("Informations", {
              defaultValue: "Informations"
            }),
            icon: FormInput
          }, {
            id: 'builder',
            label: t("Constructeur", {
              defaultValue: "Constructeur"
            }),
            icon: Layout
          }, {
            id: 'style',
            label: 'Style',
            icon: Palette
          }, {
            id: 'settings',
            label: t("Paramxe8tres", {
              defaultValue: "Paramxe8tres"
            }),
            icon: Settings
          }].map(tab => {
            const Icon = tab.icon;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>;
          })}
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === 'informations' && <div className="space-y-6">
              {/* Form Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t("Informationsgxe9nxe9", {
                  defaultValue: "Informationsgxe9nxe9"
                })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t("Titre", {
                    defaultValue: "Titre"
                  })}</Label>
                    <Input value={formData.title} onChange={e => setFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))} placeholder={t("Ex: Contactez-nous", {
                  defaultValue: "Ex: Contactez-nous"
                })} />
                  </div>
                  <div>
                    <Label>{t("Soustitre", {
                    defaultValue: "Soustitre"
                  })}</Label>
                    <Textarea value={formData.subtitle || ''} onChange={e => setFormData(prev => ({
                  ...prev,
                  subtitle: e.target.value
                }))} placeholder={t("Exnousvousrxe9pondro", {
                  defaultValue: "Exnousvousrxe9pondro"
                })} rows={2} />
                  </div>
                  <div>
                    <Label>{t('Image d\'en-t\xEAte', {
                    defaultValue: 'Image d\'en-t\xEAte'
                  })}</Label>
                    <Input value={formData.headerImage || ''} onChange={e => setFormData(prev => ({
                  ...prev,
                  headerImage: e.target.value
                }))} placeholder={t('URL de l\'image (ex: /catamaran-cruise.png)', {
                  defaultValue: 'URL de l\'image (ex: /catamaran-cruise.png)'
                })} />
                    <p className="text-xs text-muted-foreground mt-1">{t("Cetteimageapparaxeet", {
                    defaultValue: "Cetteimageapparaxeet"
                  })}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t("Bouton de soumission", {
                  defaultValue: "Bouton de soumission"
                })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t("Texte du bouton", {
                    defaultValue: "Texte du bouton"
                  })}</Label>
                    <Input value={formData.settings.submitButtonText || 'Envoyer'} onChange={e => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    submitButtonText: e.target.value
                  }
                }))} />
                  </div>
                </CardContent>
              </Card>
            </div>}

          {activeTab === 'builder' && <div className="space-y-6">

                {/* Field Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t("Types de champs", {
                  defaultValue: "Types de champs"
                })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.map(fieldType => {
                  const Icon = fieldType.icon;
                  return <Button key={fieldType.type} variant="outline" size="sm" onClick={() => addField(fieldType.type)} className="justify-start">
                            <Icon className="h-4 w-4 mr-2" />
                            {fieldType.label}
                          </Button>;
                })}
                    </div>
                  </CardContent>
                </Card>

                {/* Form Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t("Champs du formulaire (", {
                  defaultValue: "Champs du formulaire ("
                })}{formData.fields.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formData.fields.length === 0 ? <p className="text-muted-foreground text-sm py-4 text-center">{t("Aucunchampajoutxe9ut", {
                  defaultValue: "Aucunchampajoutxe9ut"
                })}</p> : <Reorder.Group values={formData.fields} onReorder={reorderFields}>
                        {formData.fields.map(field => <Reorder.Item key={field.id} value={field}>
                            <Card className={`mb-2 cursor-pointer transition-colors ${selectedField === field.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedField(field.id)}>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/60" />
                                    <Badge variant="outline" className="text-xs">
                                      {FIELD_TYPES.find(t => t.type === field.type)?.label}
                                    </Badge>
                                    <span className="font-medium text-sm">{field.label}</span>
                                    {field.required && <Badge variant="destructive" className="text-xs">{t("Requis", {
                              defaultValue: "Requis"
                            })}</Badge>}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={e => {
                            e.stopPropagation();
                            duplicateField(field.id);
                          }} className="h-6 w-6 p-0">
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={e => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }} className="h-6 w-6 p-0 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive)/0.8)]">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Reorder.Item>)}
                      </Reorder.Group>}
                  </CardContent>
                </Card>

                {/* Field Configuration */}
                {selectedField && <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">{t("Configuration du champ", {
                  defaultValue: "Configuration du champ"
                })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                const field = formData.fields.find(f => f.id === selectedField);
                if (!field) return null;
                return <div className="space-y-4">
                            <div>
                              <Label>{t("Label du champ", {
                        defaultValue: "Label du champ"
                      })}</Label>
                              <Input value={field.label} onChange={e => updateField(field.id, {
                      label: e.target.value
                    })} />
                            </div>
                            
                            <div>
                              <Label>{t("Placeholder", {
                        defaultValue: "Placeholder"
                      })}</Label>
                              <Input value={field.placeholder || ''} onChange={e => updateField(field.id, {
                      placeholder: e.target.value
                    })} />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch checked={field.required} onCheckedChange={checked => updateField(field.id, {
                      required: checked
                    })} />
                              <Label>{t("Champ requis", {
                        defaultValue: "Champ requis"
                      })}</Label>
                            </div>
                            
                            <div>
                              <Label>{t("Largeur", {
                        defaultValue: "Largeur"
                      })}</Label>
                              <Select value={field.style?.width || 'full'} onValueChange={value => updateField(field.id, {
                      style: {
                        ...field.style,
                        width: value as any
                      }
                    })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full">{t("Pleine largeur", {
                            defaultValue: "Pleine largeur"
                          })}</SelectItem>
                                  <SelectItem value="half">{t("Demi-largeur", {
                            defaultValue: "Demi-largeur"
                          })}</SelectItem>
                                  <SelectItem value="third">{t("Tiers de largeur", {
                            defaultValue: "Tiers de largeur"
                          })}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && <div>
                                <Label>{t("Options", {
                        defaultValue: "Options"
                      })}</Label>
                                <div className="space-y-2">
                                  {field.options?.map((option, index) => <div key={index} className="flex gap-2">
                                      <Input value={option} onChange={e => {
                          const newOptions = [...(field.options || [])];
                          newOptions[index] = e.target.value;
                          updateField(field.id, {
                            options: newOptions
                          });
                        }} />
                                      <Button size="sm" variant="outline" onClick={() => {
                          const newOptions = field.options?.filter((_, i) => i !== index);
                          updateField(field.id, {
                            options: newOptions
                          });
                        }}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>)}
                                  <Button size="sm" variant="outline" onClick={() => {
                        const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                        updateField(field.id, {
                          options: newOptions
                        });
                      }}>
                                    <Plus className="h-4 w-4 mr-2" />{t("Ajouter une option", {
                          defaultValue: "Ajouter une option"
                        })}</Button>
                                </div>
                              </div>}
                          </div>;
              })()}
                    </CardContent>
                  </Card>}
              </div>}

            {activeTab === 'style' && <div className="space-y-6">
                {/* Nouveau bloc Disposition */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t("Disposition", {
                  defaultValue: "Disposition"
                })}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t('Choisissez comment organiser l\'image et le formulaire', {
                  defaultValue: 'Choisissez comment organiser l\'image et le formulaire'
                })}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${formData.formLayout === 'columns' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setFormData(prev => ({
                  ...prev,
                  formLayout: 'columns' as const
                }))}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-1">
                            <div className="w-4 h-3 bg-primary/20 rounded-sm"></div>
                            <div className="w-4 h-3 bg-muted rounded-sm"></div>
                          </div>
                          <Label className="font-medium text-sm">{t("Colonnes", {
                        defaultValue: "Colonnes"
                      })}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("Imageettitrexe0gauch", {
                      defaultValue: "Imageettitrexe0gauch"
                    })}</p>
                      </div>
                      
                      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${formData.formLayout === 'columns-reversed' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setFormData(prev => ({
                  ...prev,
                  formLayout: 'columns-reversed' as const
                }))}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-1">
                            <div className="w-4 h-3 bg-muted rounded-sm"></div>
                            <div className="w-4 h-3 bg-primary/20 rounded-sm"></div>
                          </div>
                          <Label className="font-medium text-sm">{t("Colonnesinversxe9es", {
                        defaultValue: "Colonnesinversxe9es"
                      })}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("Formulairexe0gauchei", {
                      defaultValue: "Formulairexe0gauchei"
                    })}</p>
                      </div>
                      
                      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${formData.formLayout === 'header' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setFormData(prev => ({
                  ...prev,
                  formLayout: 'header' as const
                }))}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex flex-col gap-1">
                            <div className="w-8 h-2 bg-primary/20 rounded-sm"></div>
                            <div className="w-8 h-3 bg-muted rounded-sm"></div>
                          </div>
                          <Label className="font-medium text-sm">{t("Header", {
                        defaultValue: "Header"
                      })}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("Image et titre en haut, formulaire en dessous sur toute la largeur", {
                      defaultValue: "Image et titre en haut, formulaire en dessous sur toute la largeur"
                    })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t("Couleurs", {
                  defaultValue: "Couleurs"
                })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <ColorPicker label={t("Couleur principale", {
                  defaultValue: "Couleur principale"
                })} value={formData.primaryColor} onChange={value => setFormData(prev => ({
                  ...prev,
                  primaryColor: value
                }))} />
                    </div>
                    
                    <div>
                      <ColorPicker label={t("Couleur du cadre", {
                  defaultValue: "Couleur du cadre"
                })} value={formData.frameColor} onChange={value => setFormData(prev => ({
                  ...prev,
                  frameColor: value
                }))} />
                    </div>
                    
                    <div>
                      <ColorPicker label={t("Couleur du titre", {
                  defaultValue: "Couleur du titre"
                })} value={formData.titleColor} onChange={value => setFormData(prev => ({
                  ...prev,
                  titleColor: value
                }))} />
                    </div>
                    
                    <div>
                      <ColorPicker label={t("Couleur du sous-titre", {
                  defaultValue: "Couleur du sous-titre"
                })} value={formData.subtitleColor} onChange={value => setFormData(prev => ({
                  ...prev,
                  subtitleColor: value
                }))} />
                    </div>
                    
                    <div>
                      <ColorPicker label={t("Couleur du texte", {
                  defaultValue: "Couleur du texte"
                })} value={formData.textColor} onChange={value => setFormData(prev => ({
                  ...prev,
                  textColor: value
                }))} />
                    </div>
                  </CardContent>
                </Card>
              </div>}

            {activeTab === 'settings' && <div className="space-y-6">

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t("Messages", {
                  defaultValue: "Messages"
                })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>{t("Messagedesuccxe8s", {
                    defaultValue: "Messagedesuccxe8s"
                  })}</Label>
                      <Textarea value={formData.settings.successMessage || ''} onChange={e => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    successMessage: e.target.value
                  }
                }))} rows={2} />
                    </div>
                    
                    <div>
                      <Label>{t('Message d\'erreur', {
                    defaultValue: 'Message d\'erreur'
                  })}</Label>
                      <Textarea value={formData.settings.errorMessage || ''} onChange={e => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    errorMessage: e.target.value
                  }
                }))} rows={2} />
                    </div>
                  </CardContent>
                </Card>
              </div>}
        </div>
      </div>
    </div>;
}