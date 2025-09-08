import { useState, useRef, useEffect } from 'react';
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
  Palette,
  Layout,
  Settings,
  Save,
  FormInput
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
  backgroundColor: string;
  primaryColor: string;
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

const FIELD_TYPES = [
  { type: 'text', label: 'Texte', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Téléphone', icon: Phone },
  { type: 'textarea', label: 'Zone de texte', icon: Type },
  { type: 'select', label: 'Sélection', icon: ChevronDown },
  { type: 'checkbox', label: 'Cases à cocher', icon: CheckSquare },
  { type: 'radio', label: 'Boutons radio', icon: Circle },
  { type: 'file', label: 'Fichier', icon: File },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'number', label: 'Nombre', icon: Hash },
] as const;

export default function FormBuilder({ initialForm, onSave, onCancel }: FormBuilderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'builder' | 'style' | 'settings'>('builder');
  const [showPreview, setShowPreview] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  
  // Pre-populate with Custom Tour Request form if no initial form provided
  const getDefaultFormData = () => {
    if (initialForm) return initialForm;
    
    // Default to Custom Tour Request form structure
    return {
      name: 'Custom Tour Request',
      title: 'Create Your Custom Trip',
      subtitle: 'Your travel story starts with your dreams – let us write the rest.',
      description: 'Créez votre expérience unique en Thaïlande',
      headerImage: '/catamaran-cruise.png',
      layout: 'single-column' as const,
      backgroundColor: '#ffffff',
      primaryColor: '#1e73be',
      textColor: '#333333',
      fields: [
        {
          id: 'fullname',
          type: 'text' as const,
          label: 'Full Name *',
          placeholder: 'Your name',
          required: true,
          style: { width: 'half' as const }
        },
        {
          id: 'email',
          type: 'email' as const,
          label: 'Email *',
          placeholder: 'Your email',
          required: true,
          style: { width: 'half' as const }
        },
        {
          id: 'countrycode',
          type: 'select' as const,
          label: 'Country Code *',
          placeholder: 'Code',
          required: true,
          options: ['🇫🇷 +33', '🇹🇭 +66', '🇺🇸 +1', '🇬🇧 +44', '🇩🇪 +49', '🇪🇸 +34'],
          style: { width: 'third' as const }
        },
        {
          id: 'whatsapp',
          type: 'phone' as const,
          label: 'WhatsApp Number *',
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
        submitButtonColor: '#1e73be',
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
    if (!formData.name.trim() || !formData.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et le titre du formulaire sont obligatoires.",
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
      await onSave(formData);
      toast({
        title: "Formulaire sauvegardé",
        description: "Le formulaire a été sauvegardé avec succès."
      });
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
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label}
            </Label>
            <Input placeholder={field.placeholder} type={field.type} />
          </div>
        );
        
      case 'textarea':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label}
            </Label>
            <Textarea placeholder={field.placeholder} rows={4} />
          </div>
        );
        
      case 'select':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label}
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
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
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-4 block">
              {field.label}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox id={`${field.id}-${index}`} className="mt-1" />
                  <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal cursor-pointer leading-5">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" name={field.id} id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'file':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label}
            </Label>
            <Input type="file" />
          </div>
        );
        
      case 'date':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label}
            </Label>
            <Input placeholder={field.placeholder} readOnly className="cursor-pointer" />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Constructeur de formulaire</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Masquer aperçu' : 'Afficher aperçu'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData(getDefaultFormData());
                  setForceRefresh(prev => prev + 1);
                }}
              >
                🔄 Actualiser
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" size="sm">
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mt-4">
          {[
            { id: 'builder', label: 'Constructeur', icon: Layout },
            { id: 'style', label: 'Style', icon: Palette },
            { id: 'settings', label: 'Paramètres', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
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

      {/* Full Width Preview */}
      {showPreview && (
        <div className="bg-gray-100 border-b">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
                {/* Image Side - Reproduction exacte du site */}
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
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Image d'en-tête</p>
                    </div>
                  )}
                  <div 
                    className="absolute inset-0 flex flex-col justify-center p-8 text-white"
                    style={{ 
                      background: `linear-gradient(to right, ${formData.primaryColor}CC, transparent)` 
                    }}
                  >
                    <h3 className="font-heading font-bold text-3xl mb-3">
                      {formData.title || 'Titre du formulaire'}
                    </h3>
                    <p className="max-w-xs">
                      {formData.subtitle || formData.description || 'Description du formulaire'}
                    </p>
                  </div>
                </div>
                
                {/* Form Side - Reproduction exacte du site */}
                <div className="p-8">
                  {formData.fields.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 h-full flex flex-col items-center justify-center">
                      <FormInput className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Ajoutez des champs pour voir la prévisualisation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Render fields with exact site layout logic */}
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
                            return (
                              <div key={`phone-grid-${field.id}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                >
                                  {renderFieldPreview(field)}
                                </motion.div>
                                <div className="md:col-span-2">
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                  >
                                    {renderFieldPreview(nextField)}
                                  </motion.div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Regular half-width fields (2 columns)
                          if (isHalfWidth && nextField && nextIsHalfWidth) {
                            renderedIndexes.add(index);
                            renderedIndexes.add(index + 1);
                            return (
                              <div key={`grid-${field.id}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                >
                                  {renderFieldPreview(field)}
                                </motion.div>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                >
                                  {renderFieldPreview(nextField)}
                                </motion.div>
                              </div>
                            );
                          }
                          
                          // Full width fields
                          renderedIndexes.add(index);
                          return (
                            <motion.div
                              key={field.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              {renderFieldPreview(field)}
                            </motion.div>
                          );
                        }).filter(Boolean);
                      })()}
                      
                      {/* Submit Button */}
                      <div className="pt-4">
                        <Button 
                          style={{ 
                            backgroundColor: formData.settings.submitButtonColor || formData.primaryColor,
                            color: '#ffffff'
                          }}
                          className="w-full md:w-auto px-8 py-2"
                        >
                          {formData.settings.submitButtonText || 'Envoyer'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Panel - Editor */}
      <div className="bg-white overflow-auto flex-1">
        <div className="p-4">
          {activeTab === 'builder' && (
              <div className="space-y-6">
                {/* Form Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nom du formulaire *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Formulaire de contact"
                      />
                    </div>
                    <div>
                      <Label>Titre *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Contactez-nous"
                      />
                    </div>
                    <div>
                      <Label>Sous-titre</Label>
                      <Input
                        value={formData.subtitle || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Ex: Nous vous répondrons rapidement"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du formulaire..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Image d'en-tête</Label>
                      <Input
                        value={formData.headerImage || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, headerImage: e.target.value }))}
                        placeholder="URL de l'image (ex: /catamaran-cruise.png)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cette image apparaîtra à gauche du formulaire comme sur le site</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Field Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Types de champs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.map(fieldType => {
                        const Icon = fieldType.icon;
                        return (
                          <Button
                            key={fieldType.type}
                            variant="outline"
                            size="sm"
                            onClick={() => addField(fieldType.type)}
                            className="justify-start"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {fieldType.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Form Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Champs du formulaire ({formData.fields.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formData.fields.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center">
                        Aucun champ ajouté. Utilisez les boutons ci-dessus pour ajouter des champs.
                      </p>
                    ) : (
                      <Reorder.Group values={formData.fields} onReorder={reorderFields}>
                        {formData.fields.map((field) => (
                          <Reorder.Item key={field.id} value={field}>
                            <Card 
                              className={`mb-2 cursor-pointer transition-colors ${
                                selectedField === field.id ? 'ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => setSelectedField(field.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                    <Badge variant="outline" className="text-xs">
                                      {FIELD_TYPES.find(t => t.type === field.type)?.label}
                                    </Badge>
                                    <span className="font-medium text-sm">{field.label}</span>
                                    {field.required && <Badge variant="destructive" className="text-xs">Requis</Badge>}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateField(field.id);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteField(field.id);
                                      }}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </CardContent>
                </Card>

                {/* Field Configuration */}
                {selectedField && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Configuration du champ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const field = formData.fields.find(f => f.id === selectedField);
                        if (!field) return null;
                        
                        return (
                          <div className="space-y-4">
                            <div>
                              <Label>Label du champ</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                              />
                            </div>
                            
                            <div>
                              <Label>Placeholder</Label>
                              <Input
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                              />
                              <Label>Champ requis</Label>
                            </div>
                            
                            <div>
                              <Label>Largeur</Label>
                              <Select
                                value={field.style?.width || 'full'}
                                onValueChange={(value) => updateField(field.id, {
                                  style: { ...field.style, width: value as any }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full">Pleine largeur</SelectItem>
                                  <SelectItem value="half">Demi-largeur</SelectItem>
                                  <SelectItem value="third">Tiers de largeur</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
                              <div>
                                <Label>Options</Label>
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
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const newOptions = field.options?.filter((_, i) => i !== index);
                                          updateField(field.id, { options: newOptions });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
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
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter une option
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Couleurs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Couleur principale</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-16"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Couleur du texte</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-16"
                        />
                        <Input
                          value={formData.textColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Bouton de soumission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Texte du bouton</Label>
                      <Input
                        value={formData.settings.submitButtonText || 'Envoyer'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, submitButtonText: e.target.value }
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Message de succès</Label>
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
                      <Label>Message d'erreur</Label>
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