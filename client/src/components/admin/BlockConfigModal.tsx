import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Upload } from 'lucide-react';

import type { PageBlock } from '../../../../shared/schema';

interface BlockConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block?: PageBlock | null;
  onSave: (config: any) => void;
}

// Couleurs principales du système
const SYSTEM_COLORS = {
  primary: '#084F6E',
  secondary: '#3BA8AF',
  white: '#ffffff',
  gray: '#6b7280',
  dark: '#1f2937'
};

// Composant ColorPicker avec cases rapides + curseur personnalisé
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const getColorValue = (colorName: string) => {
    return SYSTEM_COLORS[colorName as keyof typeof SYSTEM_COLORS] || colorName;
  };

  const handleQuickColorClick = (colorName: string) => {
    onChange(colorName);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexValue = e.target.value;
    // Valider que c'est un code hex valide
    if (/^#[0-9A-F]{6}$/i.test(hexValue) || hexValue === '') {
      onChange(hexValue);
    }
  };

  const currentColorValue = getColorValue(value);

  return (
    <div className="space-y-4">
      {/* Champ de référence couleur */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Référence couleur</Label>
        <Input
          type="text"
          value={currentColorValue}
          onChange={handleHexInputChange}
          placeholder="#ffffff"
          className="font-mono text-sm"
          title="Tapez le code couleur ou sélectionnez une couleur prédéfinie"
        />
      </div>
      
      {/* Couleurs prédéfinies du thème */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Couleurs du thème</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleQuickColorClick('primary')}
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${
              value === 'primary' ? 'border-primary ring-2 ring-primary/30 bg-primary/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            title="Couleur principale du thème"
          >
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: SYSTEM_COLORS.primary }}
            />
            <span className="text-sm font-medium">Couleur principale</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleQuickColorClick('secondary')}
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${
              value === 'secondary' ? 'border-secondary ring-2 ring-secondary/30 bg-secondary/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            title="Couleur secondaire du thème"
          >
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: SYSTEM_COLORS.secondary }}
            />
            <span className="text-sm font-medium">Couleur secondaire</span>
          </button>
        </div>
      </div>

      {/* Aperçu visuel avec color picker natif */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Aperçu</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={currentColorValue}
            onChange={handleCustomColorChange}
            className="w-12 h-8 p-0 border cursor-pointer"
            title="Sélectionneur de couleur"
          />
          <span className="text-sm text-gray-600">
            Cliquez pour ouvrir le sélectionneur de couleur
          </span>
        </div>
      </div>
    </div>
  );
}

export function BlockConfigModal({ open, onOpenChange, block, onSave }: BlockConfigModalProps) {
  const [config, setConfig] = useState<any>({});
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (block) {
      setConfig({
        title: block.title || '',
        subtitle: block.subtitle || '',
        description: block.description || '',
        content: block.content || '',
        imageUrl: block.imageUrl || '',
        ctaText: block.ctaText || '',
        ctaUrl: block.ctaUrl || '',
        backgroundColor: block.backgroundColor || 'white',
        configuration: block.configuration || {},
        ...block.configuration,
      });
    }
  }, [block]);

  const handleSave = () => {
    const { configuration, ...basicFields } = config;
    
    onSave({
      ...basicFields,
      configuration: {
        ...configuration,
        // Include all advanced configuration
        ...config,
      },
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayAdd = (key: string, item: any) => {
    const array = config[key] || [];
    handleConfigChange(key, [...array, item]);
  };

  const handleArrayRemove = (key: string, index: number) => {
    const array = config[key] || [];
    handleConfigChange(key, array.filter((_: any, i: number) => i !== index));
  };

  const handleArrayUpdate = (key: string, index: number, item: any) => {
    const array = config[key] || [];
    const newArray = [...array];
    newArray[index] = item;
    handleConfigChange(key, newArray);
  };

  if (!block) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Block: {block.blockType}</DialogTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{block.identifier}</Badge>
            <Badge>{block.blockType}</Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={config.title || ''}
                  onChange={(e) => handleConfigChange('title', e.target.value)}
                  placeholder="Block title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={config.subtitle || ''}
                  onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                  placeholder="Block subtitle"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Block description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={config.content || ''}
                onChange={(e) => handleConfigChange('content', e.target.value)}
                placeholder="Main content (supports HTML)"
                rows={4}
              />
            </div>

            {/* Block-specific content fields */}
            {renderBlockSpecificContent(block.blockType, config, handleConfigChange, handleArrayAdd, handleArrayRemove, handleArrayUpdate)}
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value={config.imageUrl || ''}
                    onChange={(e) => handleConfigChange('imageUrl', e.target.value)}
                    placeholder="/path/to/image.jpg"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Select 
                  value={config.backgroundColor || 'white'} 
                  onValueChange={(value) => handleConfigChange('backgroundColor', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="primary">Primary Blue</SelectItem>
                    <SelectItem value="secondary">Secondary Gold</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {block.blockType === 'text_image' && (
              <div className="space-y-4">
                <div>
                  <Label>Layout</Label>
                  <Select 
                    value={config.layout || 'text-left'} 
                    onValueChange={(value) => handleConfigChange('layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-left">Text Left, Image Right</SelectItem>
                      <SelectItem value="image-left">Image Left, Text Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Couleur du texte</Label>
                  <ColorPicker 
                    value={config.textColor || 'dark'} 
                    onChange={(value) => handleConfigChange('textColor', value)}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctaText">Call-to-Action Text</Label>
                <Input
                  id="ctaText"
                  value={config.ctaText || ''}
                  onChange={(e) => handleConfigChange('ctaText', e.target.value)}
                  placeholder="Learn More"
                />
              </div>
              <div>
                <Label htmlFor="ctaUrl">Call-to-Action URL</Label>
                <Input
                  id="ctaUrl"
                  value={config.ctaUrl || ''}
                  onChange={(e) => handleConfigChange('ctaUrl', e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </div>

            {/* CTA Buttons for Hero blocks */}
            {(block.blockType === 'hero' || block.blockType === 'video_hero') && (
              <div>
                <Label>CTA Buttons</Label>
                <div className="space-y-2">
                  {(config.ctaButtons || []).map((button: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={button.text || ''}
                            onChange={(e) => handleArrayUpdate('ctaButtons', index, { ...button, text: e.target.value })}
                            placeholder="Button text"
                          />
                          <Select
                            value={button.style || 'primary'}
                            onValueChange={(value) => handleArrayUpdate('ctaButtons', index, { ...button, style: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArrayRemove('ctaButtons', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => handleArrayAdd('ctaButtons', { text: 'New Button', style: 'primary', url: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Button
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="identifier">Block Identifier</Label>
                <Input
                  id="identifier"
                  value={block.identifier}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="blockOrder">Block Order</Label>
                <Input
                  id="blockOrder"
                  type="number"
                  value={block.blockOrder}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={block.isActive !== false}
                disabled
              />
              <Label htmlFor="isActive">Block is active</Label>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Raw Configuration (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(config.configuration || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleConfigChange('configuration', parsed);
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="{ }"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Block-specific configuration components
function renderBlockSpecificContent(
  blockType: string,
  config: any,
  handleConfigChange: (key: string, value: any) => void,
  handleArrayAdd: (key: string, item: any) => void,
  handleArrayRemove: (key: string, index: number) => void,
  handleArrayUpdate: (key: string, index: number, item: any) => void
) {
  switch (blockType) {
    case 'video_hero':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={config.videoUrl || ''}
              onChange={(e) => handleConfigChange('videoUrl', e.target.value)}
              placeholder="/path/to/video.mp4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleMainColor">Titre principal</Label>
              <Textarea
                id="titleMainColor"
                value={config.titleMainColor || ''}
                onChange={(e) => handleConfigChange('titleMainColor', e.target.value)}
                placeholder="Titre principal du héros"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="titlePrimaryColor">Couleur principale du titre</Label>
              <ColorPicker 
                value={config.titlePrimaryColor || 'primary'} 
                onChange={(value) => handleConfigChange('titlePrimaryColor', value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleColorPart">Mot du titre en seconde couleur</Label>
              <Input
                id="titleColorPart"
                value={config.titleColorPart || ''}
                onChange={(e) => handleConfigChange('titleColorPart', e.target.value)}
                placeholder="Mot à colorier différemment"
              />
            </div>
            <div>
              <Label htmlFor="titleAccentColor">Couleur accent</Label>
              <ColorPicker 
                value={config.titleAccentColor || 'secondary'} 
                onChange={(value) => handleConfigChange('titleAccentColor', value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subtitleColor">Couleur du sous-titre</Label>
            <ColorPicker 
              value={config.subtitleColor || 'white'} 
              onChange={(value) => handleConfigChange('subtitleColor', value)}
            />
          </div>

          <div>
            <Label htmlFor="heroCountry">Pays/Région</Label>
            <Input
              id="heroCountry"
              value={config.heroCountry || ''}
              onChange={(e) => handleConfigChange('heroCountry', e.target.value)}
              placeholder="ex: in Krabi"
            />
          </div>
        </div>
      );

    case 'advantages':
      return (
        <div>
          <Label>Features</Label>
          <div className="space-y-2">
            {(config.features || []).map((feature: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <Input
                      value={feature.icon || ''}
                      onChange={(e) => handleArrayUpdate('features', index, { ...feature, icon: e.target.value })}
                      placeholder="Icon name"
                    />
                    <Input
                      value={feature.title || ''}
                      onChange={(e) => handleArrayUpdate('features', index, { ...feature, title: e.target.value })}
                      placeholder="Feature title"
                    />
                    <Input
                      value={feature.description || ''}
                      onChange={(e) => handleArrayUpdate('features', index, { ...feature, description: e.target.value })}
                      placeholder="Feature description"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleArrayRemove('features', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => handleArrayAdd('features', { icon: 'Users', title: 'New Feature', description: 'Feature description' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="formType">Form Type</Label>
            <Select 
              value={config.formType || 'contact'} 
              onValueChange={(value) => handleConfigChange('formType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">Contact Form</SelectItem>
                <SelectItem value="custom_tour">Custom Tour Form</SelectItem>
                <SelectItem value="newsletter">Newsletter Signup</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="submitText">Submit Button Text</Label>
            <Input
              id="submitText"
              value={config.submitText || ''}
              onChange={(e) => handleConfigChange('submitText', e.target.value)}
              placeholder="Send Message"
            />
          </div>
        </div>
      );

    case 'card_grid':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayCount">Number of Cards</Label>
            <Input
              id="displayCount"
              type="number"
              value={config.displayCount || 6}
              onChange={(e) => handleConfigChange('displayCount', parseInt(e.target.value))}
              min="1"
              max="12"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showTourNinja"
              checked={config.showTourNinja || false}
              onCheckedChange={(checked) => handleConfigChange('showTourNinja', checked)}
            />
            <Label htmlFor="showTourNinja">Show Tour Ninja integration</Label>
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={config.rating || 5.0}
                onChange={(e) => handleConfigChange('rating', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="reviewCount">Review Count</Label>
              <Input
                id="reviewCount"
                type="number"
                value={config.reviewCount || 80}
                onChange={(e) => handleConfigChange('reviewCount', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="googleReviewsWidget"
              checked={config.googleReviewsWidget || false}
              onCheckedChange={(checked) => handleConfigChange('googleReviewsWidget', checked)}
            />
            <Label htmlFor="googleReviewsWidget">Show Google Reviews widget</Label>
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-4">
          {/* Titre et sous-titre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactTitle">Titre</Label>
              <Input
                id="contactTitle"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Contactez-nous"
              />
            </div>
            <div>
              <Label htmlFor="contactSubtitle">Sous-titre</Label>
              <Textarea
                id="contactSubtitle"
                value={config.subtitle || ''}
                onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                placeholder="Nous sommes là pour vous aider..."
                rows={2}
              />
            </div>
          </div>

          {/* Couleurs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="titleColor">Couleur du titre</Label>
              <ColorPicker 
                value={config.titleColor || 'primary'} 
                onChange={(value) => handleConfigChange('titleColor', value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitleColor">Couleur du sous-titre</Label>
              <ColorPicker 
                value={config.subtitleColor || '#666666'} 
                onChange={(value) => handleConfigChange('subtitleColor', value)}
              />
            </div>
            <div>
              <Label htmlFor="dividerColor">Couleur du séparateur</Label>
              <ColorPicker 
                value={config.dividerColor || 'secondary'} 
                onChange={(value) => handleConfigChange('dividerColor', value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="backgroundColor">Couleur de fond</Label>
            <ColorPicker 
              value={config.backgroundColor || '#ffffff'} 
              onChange={(value) => handleConfigChange('backgroundColor', value)}
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emailLabel">Label Email</Label>
              <Input
                id="emailLabel"
                value={config.emailLabel || ''}
                onChange={(e) => handleConfigChange('emailLabel', e.target.value)}
                placeholder="Email"
              />
            </div>
            <div>
              <Label htmlFor="email">Adresse Email</Label>
              <Input
                id="email"
                type="email"
                value={config.email || ''}
                onChange={(e) => handleConfigChange('email', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneLabel">Label Téléphone</Label>
              <Input
                id="phoneLabel"
                value={config.phoneLabel || ''}
                onChange={(e) => handleConfigChange('phoneLabel', e.target.value)}
                placeholder="Téléphone"
              />
            </div>
            <div>
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={config.phone || ''}
                onChange={(e) => handleConfigChange('phone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsappLabel">Label WhatsApp</Label>
              <Input
                id="whatsappLabel"
                value={config.whatsappLabel || ''}
                onChange={(e) => handleConfigChange('whatsappLabel', e.target.value)}
                placeholder="WhatsApp"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={config.whatsapp || ''}
                onChange={(e) => handleConfigChange('whatsapp', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          {/* Line ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lineIdLabel">Label Line ID</Label>
              <Input
                id="lineIdLabel"
                value={config.lineIdLabel || ''}
                onChange={(e) => handleConfigChange('lineIdLabel', e.target.value)}
                placeholder="Line ID"
              />
            </div>
            <div>
              <Label htmlFor="lineId">Line ID</Label>
              <Input
                id="lineId"
                value={config.lineId || ''}
                onChange={(e) => handleConfigChange('lineId', e.target.value)}
                placeholder="moncompte"
              />
            </div>
          </div>

          {/* Section À propos */}
          <div className="flex items-center space-x-2">
            <Switch
              id="showAboutCompany"
              checked={config.showAboutCompany ?? true}
              onCheckedChange={(checked) => handleConfigChange('showAboutCompany', checked)}
            />
            <Label htmlFor="showAboutCompany">Afficher la section "À propos de notre entreprise"</Label>
          </div>

          {(config.showAboutCompany ?? true) && (
            <div className="space-y-4 border-l-4 border-secondary pl-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyBrand">Nom de la marque</Label>
                  <Input
                    id="companyBrand"
                    value={config.companyBrand || ''}
                    onChange={(e) => handleConfigChange('companyBrand', e.target.value)}
                    placeholder="Votre Marque"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={config.companyName || ''}
                    onChange={(e) => handleConfigChange('companyName', e.target.value)}
                    placeholder="Votre Entreprise SARL"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tatLicense">Licence TAT</Label>
                <Input
                  id="tatLicense"
                  value={config.tatLicense || ''}
                  onChange={(e) => handleConfigChange('tatLicense', e.target.value)}
                  placeholder="12/34567"
                />
              </div>

              <div>
                <Label htmlFor="companyDescription">Description de l'entreprise</Label>
                <Textarea
                  id="companyDescription"
                  value={config.companyDescription || ''}
                  onChange={(e) => handleConfigChange('companyDescription', e.target.value)}
                  placeholder="Nous sommes un opérateur touristique agréé..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}