import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Eye, EyeOff, ChevronUp, ChevronDown, Settings, Save, Undo } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

// Block Preview Components
const BlockPreview = ({ block, isFullscreen }: { block: PageBlock; isFullscreen: boolean }) => {
  const getPreviewContent = () => {
    switch (block.blockType) {
      case 'hero':
        return (
          <div className={`relative ${isFullscreen ? 'h-screen' : 'h-64'} bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center justify-center`}>
            <div className="text-center px-4">
              <h1 className={`font-bold ${isFullscreen ? 'text-5xl md:text-7xl' : 'text-2xl md:text-4xl'} mb-4`}>
                {block.configuration?.title || block.title || 'Hero Title'}
              </h1>
              {block.configuration?.subtitle && (
                <p className={`${isFullscreen ? 'text-xl md:text-2xl' : 'text-lg'} mb-6 opacity-90`}>
                  {block.configuration.subtitle}
                </p>
              )}
              {block.configuration?.ctaText && (
                <button className={`bg-yellow-500 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors ${isFullscreen ? 'text-lg' : ''}`}>
                  {block.configuration.ctaText}
                </button>
              )}
            </div>
          </div>
        );

      case 'text_image':
        return (
          <div className={`py-12 ${isFullscreen ? 'py-20' : 'py-8'} bg-white`}>
            <div className="container mx-auto px-4">
              <div className={`max-w-4xl mx-auto ${block.configuration?.textAlign === 'center' ? 'text-center' : ''}`}>
                <h2 className={`font-bold ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} mb-4 text-gray-900`}>
                  {block.configuration?.title || block.title || 'Section Title'}
                </h2>
                {block.configuration?.subtitle && (
                  <div className="w-20 h-1 bg-yellow-500 mx-auto mb-6"></div>
                )}
                <p className={`text-gray-700 leading-relaxed ${isFullscreen ? 'text-lg' : 'text-base'}`}>
                  {block.configuration?.content || block.content || 'Section content goes here...'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'card_grid':
        const gridCols = block.configuration?.gridCols || '3';
        return (
          <div className={`py-12 ${isFullscreen ? 'py-20' : 'py-8'} bg-white`}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className={`font-bold ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} mb-4 text-gray-900`}>
                  {block.configuration?.title || block.title || 'Grid Section'}
                </h2>
                {block.configuration?.subtitle && (
                  <>
                    <div className="w-20 h-1 bg-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      {block.configuration.subtitle}
                    </p>
                  </>
                )}
              </div>
              <div className={`grid grid-cols-1 ${gridCols === '3' ? 'md:grid-cols-2 lg:grid-cols-3' : gridCols === '4' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'} gap-6`}>
                {Array.from({ length: Math.min(block.configuration?.displayCount || 6, isFullscreen ? 12 : 3) }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tour Exemple {i + 1}</h3>
                    <p className="text-gray-600 text-sm">Description de l'expérience...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className={`py-12 ${isFullscreen ? 'py-20' : 'py-8'} bg-gray-50`}>
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className={`font-bold ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} mb-4 text-gray-900`}>
                    {block.configuration?.title || block.title || 'Form Section'}
                  </h2>
                  {block.configuration?.subtitle && (
                    <p className="text-gray-600">
                      {block.configuration.subtitle}
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Votre nom..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="votre@email.com" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea rows={4} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Décrivez votre voyage idéal..."></textarea>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Envoyer la demande
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advantages':
        const features = block.configuration?.features || [
          { icon: 'heart', title: 'Feature 1', description: 'Description...' },
          { icon: 'users', title: 'Feature 2', description: 'Description...' },
          { icon: 'map', title: 'Feature 3', description: 'Description...' }
        ];
        return (
          <div className={`py-12 ${isFullscreen ? 'py-20' : 'py-8'} bg-white`}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className={`font-bold ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} mb-4 text-gray-900`}>
                  {block.configuration?.title || block.title || 'Our Advantages'}
                </h2>
                <div className="w-20 h-1 bg-yellow-500 mx-auto"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {features.map((feature: any, i: number) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded"></div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className={`py-12 ${isFullscreen ? 'py-20' : 'py-8'} bg-gray-50`}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className={`font-bold ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} mb-4 text-gray-900`}>
                  {block.configuration?.title || block.title || 'Gallery'}
                </h2>
                <div className="w-20 h-1 bg-yellow-500 mx-auto"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {Array.from({ length: isFullscreen ? 6 : 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                      <div>
                        <div className="font-semibold">Client {i + 1}</div>
                        <div className="text-yellow-500">★★★★★</div>
                      </div>
                    </div>
                    <p className="text-gray-600">"Témoignage client exemple..."</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

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

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'w-full'}`}>
      {getPreviewContent()}
    </div>
  );
};

// Edit Form Component for each block type
const BlockEditForm = ({ block, onSave, onCancel }: { block: PageBlock; onSave: (data: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState(block.configuration || {});

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({
      ...block,
      configuration: formData,
      title: formData.title || block.title,
      subtitle: formData.subtitle || block.subtitle
    });
  };

  const renderFields = () => {
    switch (block.blockType) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre principal</Label>
              <Input 
                id="title"
                value={formData.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Votre titre hero..."
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Sous-titre optionnel..."
              />
            </div>
            <div>
              <Label htmlFor="ctaText">Texte du bouton</Label>
              <Input 
                id="ctaText"
                value={formData.ctaText || ''} 
                onChange={e => updateField('ctaText', e.target.value)}
                placeholder="Découvrir nos tours"
              />
            </div>
            <div>
              <Label htmlFor="ctaUrl">URL du bouton</Label>
              <Input 
                id="ctaUrl"
                value={formData.ctaUrl || ''} 
                onChange={e => updateField('ctaUrl', e.target.value)}
                placeholder="#tours"
              />
            </div>
            <div>
              <Label htmlFor="backgroundImage">Image/Vidéo de fond (URL)</Label>
              <Input 
                id="backgroundImage"
                value={formData.backgroundImage || formData.videoUrl || ''} 
                onChange={e => updateField('backgroundImage', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        );

      case 'text_image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Titre de la section..."
              />
            </div>
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea 
                id="content"
                value={formData.content || ''} 
                onChange={e => updateField('content', e.target.value)}
                placeholder="Contenu de la section..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="textAlign">Alignement du texte</Label>
              <Select value={formData.textAlign || 'left'} onValueChange={value => updateField('textAlign', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.hasImage !== false && (
              <div>
                <Label htmlFor="imageUrl">Image (URL)</Label>
                <Input 
                  id="imageUrl"
                  value={formData.imageUrl || ''} 
                  onChange={e => updateField('imageUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        );

      case 'card_grid':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Titre de la section..."
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Sous-titre..."
              />
            </div>
            <div>
              <Label htmlFor="displayCount">Nombre d'éléments à afficher</Label>
              <Input 
                type="number"
                id="displayCount"
                value={formData.displayCount || 6} 
                onChange={e => updateField('displayCount', parseInt(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            <div>
              <Label htmlFor="gridCols">Colonnes</Label>
              <Select value={formData.gridCols || '3'} onValueChange={value => updateField('gridCols', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 colonnes</SelectItem>
                  <SelectItem value="3">3 colonnes</SelectItem>
                  <SelectItem value="4">4 colonnes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.showViewAllButton || false}
                onCheckedChange={checked => updateField('showViewAllButton', checked)}
              />
              <Label>Afficher le bouton "Voir tout"</Label>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Titre du formulaire..."
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Description du formulaire..."
              />
            </div>
            <div>
              <Label htmlFor="formType">Type de formulaire</Label>
              <Select value={formData.formType || 'custom_tour'} onValueChange={value => updateField('formType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom_tour">Voyage sur mesure</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'advantages':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Titre de la section..."
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Sous-titre..."
              />
            </div>
            <div>
              <Label>Avantages (3 éléments)</Label>
              {(formData.features || []).map((feature: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Input 
                      value={feature.icon || ''} 
                      onChange={e => {
                        const newFeatures = [...(formData.features || [])];
                        newFeatures[i] = { ...feature, icon: e.target.value };
                        updateField('features', newFeatures);
                      }}
                      placeholder="Icône"
                    />
                    <Input 
                      value={feature.title || ''} 
                      onChange={e => {
                        const newFeatures = [...(formData.features || [])];
                        newFeatures[i] = { ...feature, title: e.target.value };
                        updateField('features', newFeatures);
                      }}
                      placeholder="Titre"
                    />
                    <Input 
                      value={feature.description || ''} 
                      onChange={e => {
                        const newFeatures = [...(formData.features || [])];
                        newFeatures[i] = { ...feature, description: e.target.value };
                        updateField('features', newFeatures);
                      }}
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Titre de la galerie..."
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Sous-titre..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.autoplay || false}
                onCheckedChange={checked => updateField('autoplay', checked)}
              />
              <Label>Lecture automatique</Label>
            </div>
            <div>
              <Label htmlFor="slidesToShow">Éléments visibles</Label>
              <Select value={String(formData.slidesToShow || 3)} onValueChange={value => updateField('slidesToShow', parseInt(value))}>
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
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Titre..."
              />
            </div>
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea 
                id="content"
                value={formData.content || ''} 
                onChange={e => updateField('content', e.target.value)}
                placeholder="Contenu..."
                rows={3}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-h-96 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Modifier le bloc: {block.title}</h3>
        <p className="text-sm text-gray-600">Type: {block.blockType}</p>
      </div>
      
      {renderFields()}
      
      <div className="flex gap-3 mt-6 pt-4 border-t">
        <Button onClick={handleSave} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <Undo className="w-4 h-4 mr-2" />
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default function AdminPageEditor() {
  const [, setLocation] = useLocation();
  const [previewMode, setPreviewMode] = useState<'normal' | 'fullscreen'>('normal');
  const [selectedBlockForEdit, setSelectedBlockForEdit] = useState<PageBlock | null>(null);
  const [previewBlock, setPreviewBlock] = useState<PageBlock | null>(null);
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
      toast({ title: "Success", description: "Bloc mis à jour avec succès" });
      setSelectedBlockForEdit(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le bloc", variant: "destructive" });
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
              <div>
                <h1 className="text-2xl font-bold">Éditeur de page: {currentPageConfig.pageName}</h1>
                <p className="text-sm text-gray-600">Page principale • /{pageSlug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setPreviewMode(previewMode === 'normal' ? 'fullscreen' : 'normal')}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode === 'normal' ? 'Mode Plein Écran' : 'Mode Normal'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Edit className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Éditeur de blocs</h2>
          </div>
          <p className="text-gray-600">
            Modifiez les blocs de contenu de votre page. Ajoutez, supprimez ou réorganisez les sections.
          </p>
        </div>

        {/* Blocks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Blocs de contenu</h3>
            <div className="text-sm text-gray-500">
              {pageBlocks.length} bloc{pageBlocks.length > 1 ? 's' : ''} sur cette page
            </div>
          </div>

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
              <div className="text-gray-500 mb-4">Aucun bloc sur cette page</div>
              <p className="text-gray-400 text-sm mb-6">
                Commencez par ajouter votre premier bloc de contenu
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Ajouter le premier bloc
              </Button>
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
                              >
                                <ChevronUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBlock(block, 'down')}
                                disabled={index === sortedBlocks.length - 1}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div>
                              <CardTitle className="text-lg">
                                {block.title || `Section ${block.blockOrder}`}
                              </CardTitle>
                              <CardDescription>
                                Type: {block.blockType} • Ordre: {block.blockOrder}
                              </CardDescription>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Visibility Toggle */}
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={block.isActive}
                                onCheckedChange={() => toggleBlockVisibility(block)}
                              />
                              <span className="text-sm text-gray-600">
                                {block.isActive ? 'Visible' : 'Masqué'}
                              </span>
                            </div>

                            {/* Preview Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewBlock(block)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Aperçu
                            </Button>

                            {/* Edit Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBlockForEdit(block)}
                              className="flex items-center gap-1"
                            >
                              <Settings className="w-4 h-4" />
                              Modifier
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <BlockPreview block={block} isFullscreen={false} />
                        </div>
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
            <DialogTitle>Aperçu: {previewBlock?.title}</DialogTitle>
            <DialogDescription>
              Prévisualisation en plein écran de votre bloc
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {previewBlock && (
              <BlockPreview block={previewBlock} isFullscreen={true} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={selectedBlockForEdit !== null} onOpenChange={() => setSelectedBlockForEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le bloc</DialogTitle>
            <DialogDescription>
              Personnalisez le contenu et l'apparence de votre bloc
            </DialogDescription>
          </DialogHeader>
          {selectedBlockForEdit && (
            <BlockEditForm
              block={selectedBlockForEdit}
              onSave={(updatedBlock) => updateBlockMutation.mutate(updatedBlock)}
              onCancel={() => setSelectedBlockForEdit(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}