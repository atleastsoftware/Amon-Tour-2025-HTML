import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Eye, EyeOff, ChevronUp, ChevronDown, Settings, Save, Undo, Trash2, AlertTriangle } from 'lucide-react';
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

// Import real components for exact preview
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import About from '@/components/home/About';
import CustomTourForm from '@/components/home/CustomTourForm';
import Testimonials from '@/components/home/Testimonials';
import TourNinjaSection from '@/components/tour/TourNinjaSection';

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

// Real Component Previews - Using ACTUAL website components only
const RealBlockPreview = ({ block, isFullscreen }: { block: PageBlock; isFullscreen: boolean }) => {
  const getActualComponent = () => {
    switch (block.identifier) {
      case 'hero_main':
        return <Hero />;
      
      case 'expats_welcome':
        // Section d'accueil basée sur le style du vrai site
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">
                  {block.configuration?.title || "When expats welcome you in their host country"}
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {block.configuration?.content || "This is a family-run travel agency that combines the organization of exclusive activities with the creation of tailor-made trips throughout the country. Our goal is to offer an immersive experience, far from mass tourism, with personalized service for every traveler — as if we were welcoming our own family or friends."}
                </p>
              </motion.div>
            </div>
          </section>
        );

      case 'popular_experiences':
        return <Features />;

      case 'custom_tour_form':
        return <CustomTourForm />;

      case 'tour_ninja_section':
        return <TourNinjaSection />;

      case 'why_choose_us':
        return <Features />;

      case 'who_we_are':
        return <About />;

      case 'travelers_reviews':
        return <Testimonials />;

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
  onCancel 
}: { 
  block: PageBlock; 
  isOpen: boolean;
  onSave: (data: any) => void; 
  onCancel: () => void; 
}) => {
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

  const renderEditFields = () => {
    switch (block.identifier) {
      case 'hero_main':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre principal</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Your exclusive experiences in Krabi..."
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Discover amazing places..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="ctaText1">Bouton 1 - Texte</Label>
                <Input 
                  id="ctaText1"
                  value={formData.ctaText1 || 'See our offers'} 
                  onChange={e => updateField('ctaText1', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ctaUrl1">Bouton 1 - URL</Label>
                <Input 
                  id="ctaUrl1"
                  value={formData.ctaUrl1 || '/tours'} 
                  onChange={e => updateField('ctaUrl1', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="ctaText2">Bouton 2 - Texte</Label>
                <Input 
                  id="ctaText2"
                  value={formData.ctaText2 || 'Custom your trip'} 
                  onChange={e => updateField('ctaText2', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ctaUrl2">Bouton 2 - URL</Label>
                <Input 
                  id="ctaUrl2"
                  value={formData.ctaUrl2 || '/custom-tour'} 
                  onChange={e => updateField('ctaUrl2', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'expats_welcome':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="When expats welcome you..."
              />
            </div>
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea 
                id="content"
                value={formData.content || block.configuration?.content || ''} 
                onChange={e => updateField('content', e.target.value)}
                placeholder="Contenu de la section..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'popular_experiences':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || block.configuration?.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                placeholder="Our Popular Experiences"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || block.configuration?.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Step off the beaten path..."
              />
            </div>
            <div>
              <Label htmlFor="displayCount">Nombre de tours affichés</Label>
              <Select value={String(formData.displayCount || 6)} onValueChange={value => updateField('displayCount', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 tours</SelectItem>
                  <SelectItem value="6">6 tours</SelectItem>
                  <SelectItem value="9">9 tours</SelectItem>
                  <SelectItem value="12">12 tours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={formData.showViewAllButton !== false}
                onCheckedChange={checked => updateField('showViewAllButton', checked)}
              />
              <Label>Afficher le bouton "View All Our Tours"</Label>
            </div>
          </div>
        );

      case 'tour_ninja_section':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Some Ideas For Your Next Trip'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Get inspired by our custom-designed travel experiences.'} 
                onChange={e => updateField('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="displayCount">Nombre de tours affichés</Label>
              <Select value={String(formData.displayCount || 8)} onValueChange={value => updateField('displayCount', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 tours</SelectItem>
                  <SelectItem value="8">8 tours</SelectItem>
                  <SelectItem value="12">12 tours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'why_choose_us':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Why Choose Us'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Experience an exclusive private day trip...'} 
                onChange={e => updateField('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label>Les 3 avantages</Label>
              <div className="space-y-3 mt-2">
                <div className="border border-gray-200 rounded-lg p-3">
                  <Input 
                    placeholder="Private Tours" 
                    value={formData.feature1Title || 'Private Tours'} 
                    onChange={e => updateField('feature1Title', e.target.value)}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Experience an exclusive day trip..."
                    value={formData.feature1Desc || 'Experience an exclusive day trip with our professional guides and private vehicles.'} 
                    onChange={e => updateField('feature1Desc', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <Input 
                    placeholder="Customized Itineraries" 
                    value={formData.feature2Title || 'Customized Itineraries'} 
                    onChange={e => updateField('feature2Title', e.target.value)}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Create your own journey..."
                    value={formData.feature2Desc || 'Create your own journey based on your desires, your pace, and your interests.'} 
                    onChange={e => updateField('feature2Desc', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <Input 
                    placeholder="Authentic Experiences" 
                    value={formData.feature3Title || 'Authentic Experiences'} 
                    onChange={e => updateField('feature3Title', e.target.value)}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Discover destinations off the beaten path..."
                    value={formData.feature3Desc || 'Discover destinations off the beaten path and immerse yourself in the local culture.'} 
                    onChange={e => updateField('feature3Desc', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'who_we_are':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Who We Are'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mainText">Texte principal</Label>
              <Textarea 
                id="mainText"
                value={formData.mainText || 'We are Éric, Margaux, Gabriel, and Raphaël...'} 
                onChange={e => updateField('mainText', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="conceptTitle">Titre "Our Concept"</Label>
              <Input 
                id="conceptTitle"
                value={formData.conceptTitle || 'Our Concept'} 
                onChange={e => updateField('conceptTitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="conceptText">Texte concept</Label>
              <Textarea 
                id="conceptText"
                value={formData.conceptText || 'Combine the warmth and proximity...'} 
                onChange={e => updateField('conceptText', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'travelers_reviews':
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
          </div>
        );

      case 'custom_tour_form':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title"
                value={formData.title || 'Create Your Custom Trip'} 
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input 
                id="subtitle"
                value={formData.subtitle || 'Your travel story starts with your dreams...'} 
                onChange={e => updateField('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="formImage">Image du formulaire</Label>
              <Input 
                id="formImage"
                value={formData.formImage || '/catamaran-cruise.png'} 
                onChange={e => updateField('formImage', e.target.value)}
              />
            </div>
          </div>
        );

      default:
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
          <h4 className="font-semibold text-lg mb-1">Modifier: {block.title}</h4>
          <p className="text-sm text-gray-600">Type: {block.blockType} | Identifiant: {block.identifier}</p>
        </div>
        
        {renderEditFields()}
        
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
    </motion.div>
  );
};

export default function AdminPageEditor() {
  const [, setLocation] = useLocation();
  const [previewMode, setPreviewMode] = useState<'normal' | 'fullscreen'>('normal');
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
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
            Chaque bloc reproduit exactement la section correspondante de votre site web.
          </p>
        </div>

        {/* Blocks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sections du site web</h3>
            <div className="text-sm text-gray-500">
              {pageBlocks.length} section{pageBlocks.length > 1 ? 's' : ''} sur cette page
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
              <div className="text-gray-500 mb-4">Aucune section sur cette page</div>
              <p className="text-gray-400 text-sm mb-6">
                Les sections de votre site web s'afficheront ici
              </p>
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
                                {block.title || `Section ${block.blockOrder}`}
                              </CardTitle>
                              <CardDescription>
                                {block.identifier} • Ordre: {block.blockOrder}
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
                                {block.isActive ? (
                                  <><Eye className="w-4 h-4 inline mr-1" />Visible</>
                                ) : (
                                  <><EyeOff className="w-4 h-4 inline mr-1" />Masqué</>
                                )}
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

                            {/* Edit Dropdown Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingBlockId(editingBlockId === block.id ? null : block.id)}
                              className={`flex items-center gap-1 ${editingBlockId === block.id ? 'bg-blue-100' : ''}`}
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

                      <CardContent className="pb-0">
                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4" style={{ minHeight: 'auto' }}>
                          <RealBlockPreview block={block} isFullscreen={false} />
                        </div>
                        
                        {/* Edit Dropdown */}
                        <AnimatePresence>
                          <BlockEditDropdown
                            block={block}
                            isOpen={editingBlockId === block.id}
                            onSave={(updatedBlock) => updateBlockMutation.mutate(updatedBlock)}
                            onCancel={() => setEditingBlockId(null)}
                          />
                        </AnimatePresence>
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
    </div>
  );
}