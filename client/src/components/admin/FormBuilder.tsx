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
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    title: '',
    subtitle: '',
    description: '',
    headerImage: '/catamaran-cruise.png',
    layout: 'single-column',
    backgroundColor: '#ffffff',
    primaryColor: '#1e73be',
    textColor: '#333333',
    fields: [],
    settings: {
      submitButtonText: 'Envoyer',
      submitButtonColor: '#1e73be',
      successMessage: 'Merci ! Votre message a été envoyé avec succès.',
      errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
      emailNotification: true,
      redirectUrl: ''
    },
    isActive: true,
    ...initialForm
  });

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
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input placeholder={field.placeholder} type={field.type} />
          </div>
        );
        
      case 'textarea':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea placeholder={field.placeholder} rows={3} />
          </div>
        );
        
      case 'select':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Sélectionner une option"} />
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
            <Label className="mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
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
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input type="file" />
          </div>
        );
        
      case 'date':
        return (
          <div className={baseFieldClasses} style={fieldStyle}>
            <Label className="mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input type="date" />
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

      <div className="flex flex-1">
        {/* Left Panel - Builder */}
        <div className={`${showPreview ? 'w-1/3' : 'w-full'} border-r bg-white overflow-auto`}>
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

        {/* Right Panel - Full Screen Preview */}
        {showPreview && (
          <div className="flex-1 bg-gray-100 overflow-auto">
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
                        {/* Render fields with exact site layout */}
                        {formData.fields.map((field, index) => {
                          const nextField = formData.fields[index + 1];
                          const isHalfWidth = field.style?.width === 'half';
                          const nextIsHalfWidth = nextField?.style?.width === 'half';
                          
                          if (isHalfWidth && nextIsHalfWidth) {
                            // Skip rendering this field if it's already rendered as part of a grid
                            if (index % 2 === 1) return null;
                            
                            return (
                              <div key={`grid-${field.id}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                >
                                  {renderFieldPreview(field)}
                                </motion.div>
                                {nextField && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                  >
                                    {renderFieldPreview(nextField)}
                                  </motion.div>
                                )}
                              </div>
                            );
                          } else if (!isHalfWidth || (isHalfWidth && !nextIsHalfWidth && index % 2 === 0)) {
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
                          }
                          return null;
                        })}
                        
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
      </div>
    </div>
  );
}