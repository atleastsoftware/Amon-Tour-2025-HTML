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
import { useTranslationSection } from '@/hooks/useTranslationSection';

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
  heading: '#1f2937',
  text: '#374151',
  background: '#ffffff',
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
  const { t } = useTranslationSection('admin');
  
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
    if (/^#[0-9A-F]{6}$/i.test(hexValue) || hexValue === '') {
      onChange(hexValue);
    }
  };

  const currentColorValue = getColorValue(value);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('blockEditor.colorPicker.colorReference')}</Label>
        <Input
          type="text"
          value={currentColorValue}
          onChange={handleHexInputChange}
          placeholder={t('blockEditor.colorPicker.colorPlaceholder')}
          className="font-mono text-sm"
          title={t('blockEditor.colorPicker.inputHelp')}
        />
      </div>
      
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('blockEditor.colorPicker.themeColors')}</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickColorClick('primary')}
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${
              value === 'primary' ? 'border-primary ring-2 ring-primary/30 bg-primary/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            title={t('blockEditor.colorPicker.primaryTitle')}
          >
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: SYSTEM_COLORS.primary }}
            />
            <span className="text-sm font-medium">{t('blockEditor.colorPicker.primary')}</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleQuickColorClick('secondary')}
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${
              value === 'secondary' ? 'border-secondary ring-2 ring-secondary/30 bg-secondary/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            title={t('blockEditor.colorPicker.secondaryTitle')}
          >
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: SYSTEM_COLORS.secondary }}
            />
            <span className="text-sm font-medium">{t('blockEditor.colorPicker.secondary')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickColorClick('heading')}
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${
              value === 'heading' ? 'border-gray-900 ring-2 ring-gray-900/30 bg-gray-900/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            title={t('blockEditor.colorPicker.headingTitle')}
          >
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: SYSTEM_COLORS.heading }}
            />
            <span className="text-sm font-medium">{t('blockEditor.colorPicker.heading')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickColorClick('text')}
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${
              value === 'text' ? 'border-gray-700 ring-2 ring-gray-700/30 bg-gray-700/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            title={t('blockEditor.colorPicker.textTitle')}
          >
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: SYSTEM_COLORS.text }}
            />
            <span className="text-sm font-medium">{t('blockEditor.colorPicker.text')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickColorClick('background')}
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${
              value === 'background' ? 'border-gray-400 ring-2 ring-gray-400/30 bg-gray-400/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            title={t('blockEditor.colorPicker.backgroundTitle')}
          >
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: SYSTEM_COLORS.background }}
            />
            <span className="text-sm font-medium">{t('blockEditor.colorPicker.background')}</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('blockEditor.colorPicker.preview')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={currentColorValue}
            onChange={handleCustomColorChange}
            className="w-12 h-8 p-0 border cursor-pointer"
            title={t('blockEditor.colorPicker.pickerTitle')}
          />
          <span className="text-sm text-gray-600">
            {t('blockEditor.colorPicker.pickerHelp')}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BlockConfigModal({ open, onOpenChange, block, onSave }: BlockConfigModalProps) {
  const { t } = useTranslationSection('admin');
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
          <DialogTitle>{t('blockEditor.title', { type: block.blockType })}</DialogTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{block.identifier}</Badge>
            <Badge>{block.blockType}</Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">{t('blockEditor.tabs.content')}</TabsTrigger>
            <TabsTrigger value="style">{t('blockEditor.tabs.style')}</TabsTrigger>
            <TabsTrigger value="actions">{t('blockEditor.tabs.actions')}</TabsTrigger>
            <TabsTrigger value="advanced">{t('blockEditor.tabs.advanced')}</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">{t('blockEditor.fields.title')}</Label>
                <Input
                  id="title"
                  value={config.title || ''}
                  onChange={(e) => handleConfigChange('title', e.target.value)}
                  placeholder={t('blockEditor.fields.blockTitlePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">{t('blockEditor.fields.subtitle')}</Label>
                <Input
                  id="subtitle"
                  value={config.subtitle || ''}
                  onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                  placeholder={t('blockEditor.fields.blockSubtitlePlaceholder')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t('blockEditor.fields.description')}</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder={t('blockEditor.fields.blockDescriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">{t('blockEditor.fields.content')}</Label>
              <Textarea
                id="content"
                value={config.content || ''}
                onChange={(e) => handleConfigChange('content', e.target.value)}
                placeholder={t('blockEditor.fields.mainContentPlaceholder')}
                rows={4}
              />
            </div>

            {/* Block-specific content fields */}
            {renderBlockSpecificContent(block.blockType, config, handleConfigChange, handleArrayAdd, handleArrayRemove, handleArrayUpdate, t)}
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">{t('blockEditor.fields.imageUrl')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value={config.imageUrl || ''}
                    onChange={(e) => handleConfigChange('imageUrl', e.target.value)}
                    placeholder={t('blockEditor.fields.imageUrlPlaceholder')}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="backgroundColor">{t('blockEditor.fields.backgroundColor')}</Label>
                <Select 
                  value={config.backgroundColor || 'white'} 
                  onValueChange={(value) => handleConfigChange('backgroundColor', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">{t('blockEditor.fields.backgroundColors.white')}</SelectItem>
                    <SelectItem value="gray">{t('blockEditor.fields.backgroundColors.gray')}</SelectItem>
                    <SelectItem value="primary">{t('blockEditor.fields.backgroundColors.primaryBlue')}</SelectItem>
                    <SelectItem value="secondary">{t('blockEditor.fields.backgroundColors.secondaryGold')}</SelectItem>
                    <SelectItem value="dark">{t('blockEditor.fields.backgroundColors.dark')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {block.blockType === 'text_image' && (
              <div className="space-y-4">
                <div>
                  <Label>{t('blockEditor.fields.layout')}</Label>
                  <Select 
                    value={config.layout || 'text-left'} 
                    onValueChange={(value) => handleConfigChange('layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-left">{t('blockEditor.fields.layouts.textLeftImageRight')}</SelectItem>
                      <SelectItem value="image-left">{t('blockEditor.fields.layouts.imageLeftTextRight')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('blockEditor.fields.textColor')}</Label>
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
                <Label htmlFor="ctaText">{t('blockEditor.fields.ctaText')}</Label>
                <Input
                  id="ctaText"
                  value={config.ctaText || ''}
                  onChange={(e) => handleConfigChange('ctaText', e.target.value)}
                  placeholder={t('blockEditor.fields.ctaTextPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="ctaUrl">{t('blockEditor.fields.ctaUrl')}</Label>
                <Input
                  id="ctaUrl"
                  value={config.ctaUrl || ''}
                  onChange={(e) => handleConfigChange('ctaUrl', e.target.value)}
                  placeholder={t('blockEditor.fields.ctaUrlPlaceholder')}
                />
              </div>
            </div>

            {(block.blockType === 'hero' || block.blockType === 'video_hero') && (
              <div>
                <Label>{t('blockEditor.fields.ctaButtons')}</Label>
                <div className="space-y-2">
                  {(config.ctaButtons || []).map((button: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={button.text || ''}
                            onChange={(e) => handleArrayUpdate('ctaButtons', index, { ...button, text: e.target.value })}
                            placeholder={t('blockEditor.fields.buttonText')}
                          />
                          <Select
                            value={button.style || 'primary'}
                            onValueChange={(value) => handleArrayUpdate('ctaButtons', index, { ...button, style: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">{t('blockEditor.fields.buttonStyles.primary')}</SelectItem>
                              <SelectItem value="secondary">{t('blockEditor.fields.buttonStyles.secondary')}</SelectItem>
                              <SelectItem value="outline">{t('blockEditor.fields.buttonStyles.outline')}</SelectItem>
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
                    onClick={() => handleArrayAdd('ctaButtons', { text: t('blockEditor.fields.newButton'), style: 'primary', url: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('blockEditor.fields.addButton')}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="identifier">{t('blockEditor.fields.blockId')}</Label>
                <Input
                  id="identifier"
                  value={block.identifier}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="blockOrder">{t('blockEditor.fields.blockOrder')}</Label>
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
              <Label htmlFor="isActive">{t('blockEditor.fields.isActive')}</Label>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('blockEditor.fields.rawConfig')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(config.configuration || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleConfigChange('configuration', parsed);
                    } catch (err) {
                      //
                    }
                  }}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder={t('blockEditor.fields.rawConfigPlaceholder')}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('common.save')}
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
  handleArrayUpdate: (key: string, index: number, item: any) => void,
  t: (key: string, params?: Record<string, any>) => string
) {
  switch (blockType) {
    case 'video_hero':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="videoUrl">{t('blockEditor.fields.videoUrl')}</Label>
            <Input
              id="videoUrl"
              value={config.videoUrl || ''}
              onChange={(e) => handleConfigChange('videoUrl', e.target.value)}
              placeholder={t('blockEditor.fields.videoUrlPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleMainColor">{t('blockEditor.fields.mainTitle')}</Label>
              <Textarea
                id="titleMainColor"
                value={config.titleMainColor || ''}
                onChange={(e) => handleConfigChange('titleMainColor', e.target.value)}
                placeholder={t('blockEditor.fields.mainTitlePlaceholder')}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="titlePrimaryColor">{t('blockEditor.fields.titlePrimaryColor')}</Label>
              <ColorPicker 
                value={config.titlePrimaryColor || 'primary'} 
                onChange={(value) => handleConfigChange('titlePrimaryColor', value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleColorPart">{t('blockEditor.fields.titleColorPart')}</Label>
              <Input
                id="titleColorPart"
                value={config.titleColorPart || ''}
                onChange={(e) => handleConfigChange('titleColorPart', e.target.value)}
                placeholder={t('blockEditor.fields.titleColorPartPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="titleAccentColor">{t('blockEditor.fields.accentColor')}</Label>
              <ColorPicker 
                value={config.titleAccentColor || 'secondary'} 
                onChange={(value) => handleConfigChange('titleAccentColor', value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subtitleColor">{t('blockEditor.fields.subtitleColor')}</Label>
            <ColorPicker 
              value={config.subtitleColor || 'white'} 
              onChange={(value) => handleConfigChange('subtitleColor', value)}
            />
          </div>

          <div>
            <Label htmlFor="heroCountry">{t('blockEditor.fields.heroCountry')}</Label>
            <Input
              id="heroCountry"
              value={config.heroCountry || ''}
              onChange={(e) => handleConfigChange('heroCountry', e.target.value)}
              placeholder={t('blockEditor.fields.heroCountryPlaceholder')}
            />
          </div>
        </div>
      );

    case 'advantages':
      return (
        <div>
          <Label>{t('blockEditor.fields.features')}</Label>
          <div className="space-y-2">
            {(config.features || []).map((feature: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <Input
                      value={feature.icon || ''}
                      onChange={(e) => handleArrayUpdate('features', index, { ...feature, icon: e.target.value })}
                      placeholder={t('blockEditor.fields.iconName')}
                    />
                    <Input
                      value={feature.title || ''}
                      onChange={(e) => handleArrayUpdate('features', index, { ...feature, title: e.target.value })}
                      placeholder={t('blockEditor.fields.featureTitle')}
                    />
                    <Input
                      value={feature.description || ''}
                      onChange={(e) => handleArrayUpdate('features', index, { ...feature, description: e.target.value })}
                      placeholder={t('blockEditor.fields.featureDescription')}
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
              onClick={() => handleArrayAdd('features', { icon: 'Users', title: t('blockEditor.fields.newFeature'), description: t('blockEditor.fields.featureDescription') })}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('blockEditor.fields.addFeature')}
            </Button>
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="formType">{t('blockEditor.fields.formType')}</Label>
            <Select 
              value={config.formType || 'contact'} 
              onValueChange={(value) => handleConfigChange('formType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">{t('blockEditor.fields.formTypes.contact')}</SelectItem>
                <SelectItem value="custom_tour">{t('blockEditor.fields.formTypes.customTour')}</SelectItem>
                <SelectItem value="newsletter">{t('blockEditor.fields.formTypes.newsletter')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="submitText">{t('blockEditor.fields.submitText')}</Label>
            <Input
              id="submitText"
              value={config.submitText || ''}
              onChange={(e) => handleConfigChange('submitText', e.target.value)}
              placeholder={t('blockEditor.fields.submitTextPlaceholder')}
            />
          </div>
        </div>
      );

    case 'card_grid':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayCount">{t('blockEditor.fields.numberOfCards')}</Label>
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
            <Label htmlFor="showTourNinja">{t('blockEditor.fields.showTourNinja')}</Label>
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">{t('blockEditor.fields.rating')}</Label>
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
              <Label htmlFor="reviewCount">{t('blockEditor.fields.reviewCount')}</Label>
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
            <Label htmlFor="googleReviewsWidget">{t('blockEditor.fields.showGoogleReviews')}</Label>
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactTitle">{t('blockEditor.fields.title')}</Label>
              <Input
                id="contactTitle"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder={t('blockEditor.fields.contactTitlePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="contactSubtitle">{t('blockEditor.fields.subtitle')}</Label>
              <Textarea
                id="contactSubtitle"
                value={config.subtitle || ''}
                onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                placeholder={t('blockEditor.fields.contactSubtitlePlaceholder')}
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="titleColor">{t('blockEditor.fields.titleColor')}</Label>
              <ColorPicker 
                value={config.titleColor || 'primary'} 
                onChange={(value) => handleConfigChange('titleColor', value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitleColor">{t('blockEditor.fields.subtitleColor')}</Label>
              <ColorPicker 
                value={config.subtitleColor || '#666666'} 
                onChange={(value) => handleConfigChange('subtitleColor', value)}
              />
            </div>
            <div>
              <Label htmlFor="dividerColor">{t('blockEditor.fields.dividerColor')}</Label>
              <ColorPicker 
                value={config.dividerColor || 'secondary'} 
                onChange={(value) => handleConfigChange('dividerColor', value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="backgroundColor">{t('blockEditor.fields.backgroundColor')}</Label>
            <ColorPicker 
              value={config.backgroundColor || '#ffffff'} 
              onChange={(value) => handleConfigChange('backgroundColor', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emailLabel">{t('blockEditor.fields.emailLabel')}</Label>
              <Input
                id="emailLabel"
                value={config.emailLabel || ''}
                onChange={(e) => handleConfigChange('emailLabel', e.target.value)}
                placeholder={t('blockEditor.fields.emailPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="email">{t('blockEditor.fields.emailAddress')}</Label>
              <Input
                id="email"
                type="email"
                value={config.email || ''}
                onChange={(e) => handleConfigChange('email', e.target.value)}
                placeholder={t('blockEditor.fields.emailAddressPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneLabel">{t('blockEditor.fields.phoneLabel')}</Label>
              <Input
                id="phoneLabel"
                value={config.phoneLabel || ''}
                onChange={(e) => handleConfigChange('phoneLabel', e.target.value)}
                placeholder={t('blockEditor.fields.phonePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="phone">{t('blockEditor.fields.phoneNumber')}</Label>
              <Input
                id="phone"
                type="tel"
                value={config.phone || ''}
                onChange={(e) => handleConfigChange('phone', e.target.value)}
                placeholder={t('blockEditor.fields.phoneNumberPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsappLabel">{t('blockEditor.fields.whatsappLabel')}</Label>
              <Input
                id="whatsappLabel"
                value={config.whatsappLabel || ''}
                onChange={(e) => handleConfigChange('whatsappLabel', e.target.value)}
                placeholder={t('blockEditor.fields.whatsappPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">{t('blockEditor.fields.whatsappNumber')}</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={config.whatsapp || ''}
                onChange={(e) => handleConfigChange('whatsapp', e.target.value)}
                placeholder={t('blockEditor.fields.whatsappNumberPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lineIdLabel">{t('blockEditor.fields.lineIdLabel')}</Label>
              <Input
                id="lineIdLabel"
                value={config.lineIdLabel || ''}
                onChange={(e) => handleConfigChange('lineIdLabel', e.target.value)}
                placeholder={t('blockEditor.fields.lineIdPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="lineId">{t('blockEditor.fields.lineId')}</Label>
              <Input
                id="lineId"
                value={config.lineId || ''}
                onChange={(e) => handleConfigChange('lineId', e.target.value)}
                placeholder={t('blockEditor.fields.lineIdValuePlaceholder')}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showAboutCompany"
              checked={config.showAboutCompany ?? true}
              onCheckedChange={(checked) => handleConfigChange('showAboutCompany', checked)}
            />
            <Label htmlFor="showAboutCompany">{t('blockEditor.fields.showAboutCompany')}</Label>
          </div>

          {(config.showAboutCompany ?? true) && (
            <div className="space-y-4 border-l-4 border-secondary pl-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyBrand">{t('blockEditor.fields.companyBrand')}</Label>
                  <Input
                    id="companyBrand"
                    value={config.companyBrand || ''}
                    onChange={(e) => handleConfigChange('companyBrand', e.target.value)}
                    placeholder={t('blockEditor.fields.companyBrandPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">{t('blockEditor.fields.companyName')}</Label>
                  <Input
                    id="companyName"
                    value={config.companyName || ''}
                    onChange={(e) => handleConfigChange('companyName', e.target.value)}
                    placeholder={t('blockEditor.fields.companyNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tatLicense">{t('blockEditor.fields.tatLicense')}</Label>
                <Input
                  id="tatLicense"
                  value={config.tatLicense || ''}
                  onChange={(e) => handleConfigChange('tatLicense', e.target.value)}
                  placeholder={t('blockEditor.fields.tatLicensePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="companyDescription">{t('blockEditor.fields.companyDescription')}</Label>
                <Textarea
                  id="companyDescription"
                  value={config.companyDescription || ''}
                  onChange={(e) => handleConfigChange('companyDescription', e.target.value)}
                  placeholder={t('blockEditor.fields.companyDescriptionPlaceholder')}
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