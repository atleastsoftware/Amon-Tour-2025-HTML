import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "lucide-react";

// System colors for form
const SYSTEM_COLORS = {
  primary: '#084F6E',
  secondary: '#3BA8AF',
  white: '#ffffff',
  black: '#000000',
};

interface DynamicFormBlockProps {
  title?: string;
  subtitle?: string;
  formId?: number | null;
  titleColor?: string;
  subtitleColor?: string;
  dividerColor?: string;
  backgroundColor?: string;
  isPreview?: boolean;
}

export default function DynamicFormBlock({ 
  title, 
  subtitle, 
  formId, 
  titleColor, 
  subtitleColor, 
  dividerColor, 
  backgroundColor,
  isPreview = false
}: DynamicFormBlockProps) {
  const { data: formData, isLoading } = useQuery<any>({
    queryKey: ['/api/admin/custom-forms', formId],
    queryFn: () => formId ? fetch(`/api/admin/custom-forms/${formId}`).then(res => res.json()) : null,
    enabled: !!formId,
    refetchInterval: isPreview ? 2000 : false, // Rafraîchir toutes les 2s seulement dans l'éditeur
    staleTime: isPreview ? 0 : 60000, // Dans l'éditeur: obsolète immédiatement, sur le site: 1 minute
  });

  const resolveColor = (colorValue: string) => {
    return SYSTEM_COLORS[colorValue as keyof typeof SYSTEM_COLORS] || colorValue;
  };

  const renderField = (field: any) => {
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
          <div className={`${formData.formLayout === 'footer' ? '' : 'bg-white'} rounded-lg shadow-lg overflow-hidden ${formData.formLayout === 'footer' ? 'max-w-2xl' : 'max-w-5xl'} mx-auto`} style={formData.formLayout === 'footer' ? { backgroundColor: resolveColor(formData.frameColor) } : {}}>
            {formData.formLayout === 'header' ? (
              // Layout Header
              <div className="flex flex-col">
                <div className="h-56 relative">
                  {formData.headerImage ? (
                    <img 
                      src={formData.headerImage}
                      alt="Header image"
                      className="w-full h-full object-cover"
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
                      {formData.title || 'Titre du formulaire'}
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
                <div className="p-8" style={{ backgroundColor: resolveColor(formData.frameColor) }}>
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
                          {renderField(field)}
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
                    >
                      {formData.settings?.submitButtonText || 'Envoyer'}
                    </button>
                    
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
              </div>
            ) : formData.formLayout === 'footer' ? (
              // Layout Footer
              <div className="p-8">
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
                        {renderField(field)}
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
                  >
                    {formData.settings?.submitButtonText || 'Envoyer'}
                  </button>
                  
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
            ) : (
              // Layout Side-by-side (default)
              <div className="grid md:grid-cols-2">
                <div className="bg-primary p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                  {formData.headerImage && (
                    <img 
                      src={formData.headerImage}
                      alt="Form background"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  )}
                  <div className="relative z-10">
                    <h3 
                      className="font-heading font-bold text-4xl mb-4"
                      style={{ color: resolveColor(formData.titleColor) }}
                    >
                      {formData.title || 'Titre du formulaire'}
                    </h3>
                    {formData.subtitle && (
                      <p 
                        className="text-lg leading-relaxed"
                        style={{ color: resolveColor(formData.subtitleColor) }}
                      >
                        {formData.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="p-8" style={{ backgroundColor: resolveColor(formData.frameColor) }}>
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
                          {renderField(field)}
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
                    >
                      {formData.settings?.submitButtonText || 'Envoyer'}
                    </button>
                    
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
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
