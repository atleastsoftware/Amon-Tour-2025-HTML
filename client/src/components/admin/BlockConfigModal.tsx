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

import type { PageBlock } from '../../../shared/schema';

interface BlockConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block?: PageBlock | null;
  onSave: (config: any) => void;
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
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
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
              <Select 
                value={config.titlePrimaryColor || 'primary'} 
                onValueChange={(value) => handleConfigChange('titlePrimaryColor', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Bleu principal</SelectItem>
                  <SelectItem value="secondary">Or secondaire</SelectItem>
                  <SelectItem value="white">Blanc</SelectItem>
                  <SelectItem value="gray">Gris</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                </SelectContent>
              </Select>
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
              <Select 
                value={config.titleAccentColor || 'secondary'} 
                onValueChange={(value) => handleConfigChange('titleAccentColor', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secondary">Or accent</SelectItem>
                  <SelectItem value="primary">Bleu principal</SelectItem>
                  <SelectItem value="white">Blanc</SelectItem>
                  <SelectItem value="gray">Gris</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subtitleColor">Couleur du sous-titre</Label>
            <Select 
              value={config.subtitleColor || 'white'} 
              onValueChange={(value) => handleConfigChange('subtitleColor', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">Blanc</SelectItem>
                <SelectItem value="gray">Gris clair</SelectItem>
                <SelectItem value="primary">Bleu principal</SelectItem>
                <SelectItem value="secondary">Or secondaire</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
              </SelectContent>
            </Select>
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

    default:
      return null;
  }
}