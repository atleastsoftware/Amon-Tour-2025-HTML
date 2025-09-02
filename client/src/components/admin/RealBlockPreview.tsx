import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, Edit, Save, Undo2, History, Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Clock, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';

// Import real components for miniaturized preview  
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import About from '@/components/home/About';
import CustomTourCta from '@/components/home/CustomTourCta';
import Testimonials from '@/components/home/Testimonials';
import Contact from '@/components/home/Contact';
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
  iconName?: string;
  backgroundColor?: string;
  configuration: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RealBlockPreviewProps {
  block: PageBlock;
  onUpdate: (id: number, data: Partial<PageBlock>) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onToggleVisibility: (id: number) => void;
}

// Composant de prévisualisation miniaturisé des vrais composants
function MiniaturizedComponent({ block }: { block: PageBlock }) {
  const renderVisualPreview = () => {
    const config = block.configuration || {};
    
    switch (block.blockType) {
      case 'hero_main_v2':
        // COPIE EXACTE du HTML Hero mais tailles optimisées pour 300px
        return (
          <section className="relative h-full flex items-center overflow-hidden">
            {/* Background exact du Hero.tsx */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <img
                src="/attached_assets/DJI_20241115104455_0160_D-min.jpeg"
                alt="Beautiful Krabi landscape"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ minWidth: '100%', minHeight: '100%' }}
              >
                <source src="/attached_assets/hero-video-optimized.mp4" type="video/mp4" />
                <source src="/attached_assets/Catamaran%20cruise%20around%20Ao%20Nang%20local%20islands_1750216800850.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
            </div>
            
            {/* Content exact mais compact */}
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full">
                  <div className="max-w-xl">
                    <h1 className="font-heading text-sm md:text-base mb-2 leading-tight tracking-tight text-white drop-shadow-lg">
                      Your exclusive experiences <br/>
                      <span className="text-primary drop-shadow-lg">in Krabi – </span>THAILAND
                    </h1>
                    
                    <p className="text-white/90 mb-3 text-xs drop-shadow-md">
                      Discover amazing places away from mass tourism in Krabi.<br/>
                      And also Khao Sok, Koh Mook and many more destinations.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg text-xs">
                        See our offers
                      </span>
                      <span className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block shadow-lg text-xs">
                        Custom your trip
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
        
      case 'hero_main':
      case 'hero':
      case 'video_hero':
        return (
          <div className="w-full" style={{ height: '800px' }}>
            <iframe 
              src={`/preview/hero?t=${Date.now()}`} 
              className="w-full h-full border-0 rounded-lg overflow-hidden"
              title="Hero Section Preview"
              key={Date.now()}
            />
          </div>
        );
        
      case 'why_choose_us':
      case 'features':
        return (
          <div className="h-full bg-gray-50 p-2">
            <div className="text-center mb-2">
              <div className="text-[10px] font-bold">{block.title || "Why Choose Us"}</div>
              <div className="w-4 h-0.5 bg-yellow-500 mx-auto mt-1"></div>
            </div>
            <div className="grid grid-cols-3 gap-1 h-16">
              <div className="bg-white rounded p-1 text-center shadow-sm">
                <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto mb-1"></div>
                <div className="text-[8px] font-semibold">Private Tours</div>
              </div>
              <div className="bg-white rounded p-1 text-center shadow-sm">
                <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto mb-1"></div>
                <div className="text-[8px] font-semibold">Custom Routes</div>
              </div>
              <div className="bg-white rounded p-1 text-center shadow-sm">
                <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto mb-1"></div>
                <div className="text-[8px] font-semibold">Authentic</div>
              </div>
            </div>
          </div>
        );
        
      case 'about':
      case 'who_we_are':
        return (
          <iframe 
            src="/preview/about" 
            className="w-full border-0 rounded-lg overflow-hidden"
            style={{ height: '500px' }}
            title="About Section Preview"
          />
        );
        
      case 'featured_tours':
        return (
          <div className="h-full bg-gray-50 p-2">
            <div className="text-center mb-2">
              <div className="text-[10px] font-bold">{block.title || "Some Ideas For Your Next Trip"}</div>
              <div className="w-4 h-0.5 bg-yellow-500 mx-auto mt-1"></div>
            </div>
            <div className="grid grid-cols-3 gap-1 h-16">
              <div className="bg-white rounded shadow-sm overflow-hidden">
                <div className="h-6 bg-gradient-to-br from-blue-300 to-blue-500"></div>
                <div className="p-1">
                  <div className="text-[7px] font-semibold">Phi Phi</div>
                  <div className="text-[6px] text-gray-600">$85</div>
                </div>
              </div>
              <div className="bg-white rounded shadow-sm overflow-hidden">
                <div className="h-6 bg-gradient-to-br from-green-300 to-green-500"></div>
                <div className="p-1">
                  <div className="text-[7px] font-semibold">Phang Nga</div>
                  <div className="text-[6px] text-gray-600">$75</div>
                </div>
              </div>
              <div className="bg-white rounded shadow-sm overflow-hidden">
                <div className="h-6 bg-gradient-to-br from-orange-300 to-orange-500"></div>
                <div className="p-1">
                  <div className="text-[7px] font-semibold">Railay</div>
                  <div className="text-[6px] text-gray-600">$60</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'custom_tour_cta':
      case 'cta_section':
        return (
          <div className="h-full bg-gradient-to-r from-gray-800 to-gray-900 p-2 text-center flex flex-col justify-center">
            <div className="text-[10px] font-bold text-white mb-1">{block.title || "Create Your Custom Journey"}</div>
            <div className="text-[8px] text-white opacity-90 mb-2">Whether you're looking for adventure, relaxation, or cultural immersion</div>
            <div className="flex gap-1 justify-center">
              <div className="bg-blue-600 text-white text-[7px] px-1 py-0.5 rounded font-semibold">About us</div>
              <div className="bg-transparent border border-white text-white text-[7px] px-1 py-0.5 rounded font-semibold">Contact us</div>
            </div>
          </div>
        );
        
      case 'text_image':
      case 'when_expats':
      case 'about_amon_tour':
        return (
          <iframe 
            src="/preview/when-expats" 
            className="w-full border-0 rounded-lg overflow-hidden"
            style={{ height: '200px' }}
            title="When Expats Section Preview"
          />
        );

      case 'customer_reviews':
      case 'testimonials':
        return (
          <div className="h-full bg-blue-600 p-2">
            <div className="text-center mb-2">
              <div className="text-[10px] font-bold text-white">{block.title || "Our Travelers' Reviews"}</div>
              <div className="w-4 h-0.5 bg-yellow-500 mx-auto mt-1"></div>
            </div>
            <div className="bg-white rounded p-1 mb-1">
              <div className="flex justify-center mb-1">
                <div className="text-[8px] text-yellow-500">★★★★★</div>
              </div>
              <div className="text-[8px] text-blue-600 font-bold">5.0 on Google</div>
              <div className="text-[6px] text-gray-600">Based on 80 reviews</div>
            </div>
            <div className="grid grid-cols-2 gap-1 h-10">
              <div className="bg-gray-50 rounded p-1">
                <div className="text-[6px] text-gray-600">"Amazing experience!"</div>
                <div className="text-[5px] text-gray-500 mt-1">- Sarah M.</div>
              </div>
              <div className="bg-gray-50 rounded p-1">
                <div className="text-[6px] text-gray-600">"Perfect trip!"</div>
                <div className="text-[5px] text-gray-500 mt-1">- John D.</div>
              </div>
            </div>
          </div>
        );
        
      case 'contact_hero':
        return (
          <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800 p-2 text-white text-center flex flex-col justify-center">
            <div className="text-[10px] font-bold mb-1">{block.title || "Contact Us"}</div>
            <div className="text-[8px] opacity-90">{block.description || "Get in touch for your perfect trip"}</div>
          </div>
        );
        
      case 'contact_methods':
        return (
          <div className="h-full bg-gray-50 p-2">
            <div className="grid grid-cols-3 gap-1 h-full">
              <div className="bg-white rounded p-1 text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <div className="text-[7px] font-semibold">WhatsApp</div>
              </div>
              <div className="bg-white rounded p-1 text-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                <div className="text-[7px] font-semibold">Email</div>
              </div>
              <div className="bg-white rounded p-1 text-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                <div className="text-[7px] font-semibold">Office</div>
              </div>
            </div>
          </div>
        );
        
      case 'contact_form':
        return (
          <div className="h-full bg-white p-2">
            <div className="text-[9px] font-bold mb-2 text-center">{block.title || "Send Message"}</div>
            <div className="space-y-1">
              <div className="h-2 bg-gray-100 rounded"></div>
              <div className="h-2 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-3 bg-blue-600 rounded text-center">
                <div className="text-[7px] text-white pt-1">Send Message</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="h-full bg-gray-100 p-2 text-center flex flex-col justify-center">
            <div className="text-[10px] font-semibold mb-1">{block.title || block.blockType.replace('_', ' ')}</div>
            <div className="text-[8px] text-gray-600 mb-2">{block.description?.substring(0, 50) || "Aperçu du contenu..."}</div>
            <div className="bg-gray-200 px-2 py-1 rounded text-[7px] mx-auto">
              {block.blockType}
            </div>
          </div>
        );
    }
  };

  // Blocs héros avec proportions EXACTES du vrai site - rectangle horizontal
  const isHeroBlock = ['hero_main', 'hero', 'video_hero'].includes(block.blockType);
  const previewHeight = isHeroBlock ? '400px' : '200px'; // Hauteur optimisée pour proportions
  
  return (
    <div 
      className={`relative overflow-hidden rounded-lg border bg-white ${
        isHeroBlock ? 'w-full' : ''
      }`} 
      style={{ 
        height: previewHeight, 
        minHeight: previewHeight,
        // Proportions rectangle horizontal comme sur le vrai site (16:9 landscape)
        ...(isHeroBlock ? { width: '100%', aspectRatio: '16/9' } : { aspectRatio: '16/9' })
      }}
    >
      {renderVisualPreview()}
      <div className="absolute inset-0 bg-transparent pointer-events-none" />
    </div>
  );
}

// Modal d'historique des versions
function BlockHistoryModal({ block, onRestore }: {
  block: PageBlock;
  onRestore: (version: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: history, isLoading } = useQuery({
    queryKey: ['/api/admin/page-blocks', block.id, 'history'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/page-blocks/${block.id}/history`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    },
    enabled: isOpen,
  });

  const restoreMutation = useMutation({
    mutationFn: async (version: number) => {
      const response = await fetch(`/api/admin/page-blocks/${block.id}/restore/${version}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to restore version');
      return response.json();
    },
    onSuccess: () => {
      setIsOpen(false);
      onRestore(0); // Trigger refresh
      toast({
        title: "Version restaurée",
        description: "La version antérieure a été appliquée avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de restaurer cette version.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Historique
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique des versions - {block.title || 'Bloc sans titre'}</DialogTitle>
          <DialogDescription>
            Cliquez sur "Restaurer" pour revenir à une version antérieure
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {history?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun historique disponible</p>
            ) : (
              history?.map((version: any) => (
                <Card key={version.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Version {version.version}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(version.createdAt)}
                        </span>
                      </div>
                      
                      {version.changeDescription && (
                        <p className="text-sm text-gray-600 mb-2">
                          {version.changeDescription}
                        </p>
                      )}
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        {version.title && <div>Titre: {version.title}</div>}
                        {version.subtitle && <div>Sous-titre: {version.subtitle}</div>}
                        {version.description && (
                          <div>Description: {version.description.substring(0, 100)}...</div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate(version.version)}
                      disabled={restoreMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restaurer
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Formulaire d'édition en dropdown
function BlockEditForm({ 
  block, 
  onSave, 
  onPreviewUpdate, 
  isOpen, 
  onToggle, 
  hasUnsavedChanges, 
  onCancel 
}: {
  block: PageBlock;
  onSave: (data: Partial<PageBlock>) => void;
  onPreviewUpdate?: (data: Partial<PageBlock>) => void;
  isOpen: boolean;
  onToggle: () => void;
  hasUnsavedChanges?: boolean;
  onCancel?: () => void;
}) {
  const queryClient = useQueryClient();

  // Sauvegarde automatique de la version avant modification
  const saveVersionMutation = useMutation({
    mutationFn: async (changeDescription: string) => {
      const response = await fetch(`/api/admin/page-blocks/${block.id}/save-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeDescription }),
      });
      if (!response.ok) throw new Error('Failed to save version');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', block.id, 'history'] });
    },
  });
  const [formData, setFormData] = useState({
    title: block.title || '',
    subtitle: block.subtitle || '',
    description: block.description || '',
    content: block.content || '',
    imageUrl: block.imageUrl || '',
    ctaText: block.ctaText || '',
    ctaUrl: block.ctaUrl || '',
    backgroundColor: block.backgroundColor || '',
    configuration: { ...block.configuration }
  });

  const handleSave = async () => {
    // Sauvegarder l'état actuel dans l'historique avant modification
    try {
      await saveVersionMutation.mutateAsync("Modification manuelle");
    } catch (error) {
      console.warn("Impossible de sauvegarder la version dans l'historique:", error);
    }
    
    // Appliquer les modifications
    onSave(formData);
    toast({
      title: "Bloc sauvegardé",
      description: "Les modifications ont été appliquées au site.",
    });
  };

  const updateFormData = (newData: Partial<typeof formData>) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    // Déclencher le preview en temps réel
    if (onPreviewUpdate) {
      onPreviewUpdate(updatedData);
    }
  };

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...formData.configuration, [key]: value };
    const updatedData = {
      ...formData,
      configuration: newConfig
    };
    setFormData(updatedData);
    // Déclencher le preview en temps réel
    if (onPreviewUpdate) {
      onPreviewUpdate(updatedData);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Champs de base */}
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="Titre du bloc"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subtitle">Sous-titre</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => updateFormData({ subtitle: e.target.value })}
                    placeholder="Sous-titre"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Description du bloc"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => updateFormData({ imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="backgroundColor">Couleur de fond</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => updateFormData({ backgroundColor: e.target.value })}
                  />
                </div>
                
                {/* Champs spécifiques pour video_hero - Correspondance parfaite avec la vraie section */}
                {block.blockType === 'video_hero' && (
                  <>
                    <div>
                      <Label htmlFor="heroSubtitle">Sous-titre du lieu</Label>
                      <Input
                        id="heroSubtitle"
                        value={formData.configuration.heroSubtitle || ''}
                        onChange={(e) => updateConfig('heroSubtitle', e.target.value)}
                        placeholder="in Krabi –"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="heroCountry">Pays</Label>
                      <Input
                        id="heroCountry"
                        value={formData.configuration.heroCountry || ''}
                        onChange={(e) => updateConfig('heroCountry', e.target.value)}
                        placeholder="THAILAND"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="secondDescription">Description complémentaire</Label>
                      <Textarea
                        id="secondDescription"
                        value={formData.configuration.secondDescription || ''}
                        onChange={(e) => updateConfig('secondDescription', e.target.value)}
                        placeholder="And also Khao Sok, Koh Mook and many more destinations."
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="button1Text">Texte du bouton 1</Label>
                      <Input
                        id="button1Text"
                        value={formData.configuration.button1Text || ''}
                        onChange={(e) => updateConfig('button1Text', e.target.value)}
                        placeholder="See our offers"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="button1Url">URL du bouton 1</Label>
                      <Input
                        id="button1Url"
                        value={formData.configuration.button1Url || ''}
                        onChange={(e) => updateConfig('button1Url', e.target.value)}
                        placeholder="/tours"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="button2Text">Texte du bouton 2</Label>
                      <Input
                        id="button2Text"
                        value={formData.configuration.button2Text || ''}
                        onChange={(e) => updateConfig('button2Text', e.target.value)}
                        placeholder="Custom your trip"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="button2Url">URL du bouton 2</Label>
                      <Input
                        id="button2Url"
                        value={formData.configuration.button2Url || ''}
                        onChange={(e) => updateConfig('button2Url', e.target.value)}
                        placeholder="/custom-tour"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="videoUrl">URL de la vidéo principale</Label>
                      <Input
                        id="videoUrl"
                        value={formData.configuration.videoUrl || ''}
                        onChange={(e) => updateConfig('videoUrl', e.target.value)}
                        placeholder="/attached_assets/hero-video-optimized.mp4"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fallbackVideoUrl">URL de la vidéo de fallback</Label>
                      <Input
                        id="fallbackVideoUrl"
                        value={formData.configuration.fallbackVideoUrl || ''}
                        onChange={(e) => updateConfig('fallbackVideoUrl', e.target.value)}
                        placeholder="/attached_assets/Catamaran..."
                      />
                    </div>
                  </>
                )}

                {/* CTA pour les autres types de blocs */}
                {['hero', 'cta_section', 'custom_tour_cta'].includes(block.blockType) && (
                  <>
                    <div>
                      <Label htmlFor="ctaText">Texte du bouton</Label>
                      <Input
                        id="ctaText"
                        value={formData.ctaText}
                        onChange={(e) => updateFormData({ ctaText: e.target.value })}
                        placeholder="Texte du bouton"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ctaUrl">Lien du bouton</Label>
                      <Input
                        id="ctaUrl"
                        value={formData.ctaUrl}
                        onChange={(e) => updateFormData({ ctaUrl: e.target.value })}
                        placeholder="/lien-vers-page"
                      />
                    </div>
                  </>
                )}
                
                {/* Configuration spécifique au type de bloc */}
                {block.blockType === 'featured_tours' && (
                  <div>
                    <Label htmlFor="maxItems">Nombre maximum d'éléments</Label>
                    <Select
                      value={formData.configuration.maxItems?.toString() || '6'}
                      onValueChange={(value) => updateConfig('maxItems', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 éléments</SelectItem>
                        <SelectItem value="6">6 éléments</SelectItem>
                        <SelectItem value="9">9 éléments</SelectItem>
                        <SelectItem value="12">12 éléments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Boutons d'action avec indicateur de modifications */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                <div className="flex items-center gap-3">
                  <BlockHistoryModal 
                    block={block} 
                    onRestore={() => window.location.reload()} 
                  />
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Modifications non sauvegardées</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {hasUnsavedChanges && onCancel && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onCancel}
                    >
                      <Undo2 className="w-4 h-4 mr-2" />
                      Annuler les modifications
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleSave} 
                    className={`${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    disabled={saveVersionMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveVersionMutation.isPending ? 'Sauvegarde...' : 
                     hasUnsavedChanges ? 'Sauvegarder les modifications' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function RealBlockPreview({ 
  block, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  onToggleVisibility 
}: RealBlockPreviewProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [previewData, setPreviewData] = useState(block);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getBlockDisplayName = (blockType: string) => {
    const displayNames: Record<string, string> = {
      'hero': 'Hero Section',
      'video_hero': 'Hero avec Vidéo',
      'hero_main': 'Hero Principal',
      'features': 'Section Fonctionnalités',
      'why_choose_us': 'Pourquoi Nous Choisir',
      'about': 'Section À Propos',
      'about_amon_tour': 'À Propos de l\'Entreprise',
      'featured_tours': 'Tours Populaires',
      'custom_tour_cta': 'Appel à Action Personnalisé',
      'cta_section': 'Appel à Action',
      'testimonials': 'Témoignages',
      'customer_reviews': 'Avis Clients',
      'contact_hero': 'Hero Contact',
      'contact_methods': 'Méthodes de Contact',
      'contact_form': 'Formulaire de Contact',
      'text_image': 'Texte & Image',
      'card_grid': 'Grille de Cartes'
    };
    return displayNames[blockType] || blockType.replace('_', ' ');
  };

  const handlePreviewUpdate = (updatedData: Partial<PageBlock>) => {
    setPreviewData(prev => ({ ...prev, ...updatedData }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    onUpdate(block.id, previewData);
    setHasUnsavedChanges(false);
    setShowEditForm(false);
    toast({ 
      title: "Bloc mis à jour", 
      description: "Les modifications ont été sauvegardées avec succès."
    });
  };

  const handleCancelChanges = () => {
    setPreviewData(block);
    setHasUnsavedChanges(false);
    setShowEditForm(false);
  };

  return (
    <motion.div 
      layout
      className="group relative border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white"
    >
      {/* Header avec titre et boutons d'action toujours visibles */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/60 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <div className="text-sm font-semibold">{getBlockDisplayName(block.blockType)}</div>
            <div className="text-xs opacity-75">{block.title || 'Sans titre'}</div>
          </div>
          
          {/* Boutons d'action toujours visibles */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={block.isActive ? "secondary" : "default"}
              onClick={() => onToggleVisibility(block.id)}
              title={block.isActive ? "Masquer du site web" : "Afficher sur le site web"}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 border-0"
            >
              {block.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onMoveUp(block.id)}
              title="Déplacer vers le haut"
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 border-0"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onMoveDown(block.id)}
              title="Déplacer vers le bas"
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 border-0"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowEditForm(!showEditForm)}
              title="Modifier le bloc"
              className="h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white border-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
                  onDelete(block.id);
                }
              }}
              title="Supprimer le bloc"
              className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Prévisualisation visuelle miniaturisée et fidèle */}
      <div className="relative overflow-hidden bg-white" style={{ 
        height: block.identifier === 'hero_main_v2' ? '300px' : 
                block.blockType.includes('hero') ? '800px' : '300px' 
      }}>
        <div className={block.blockType.includes('hero') ? "w-full h-full" : "transform scale-90 origin-top-left w-[111.11%] h-[111.11%]"}>
          <MiniaturizedComponent block={showEditForm ? previewData : block} />
        </div>
        
        {/* Overlay si bloc masqué */}
        {!block.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
            <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-lg">
              Masqué du site web
            </div>
          </div>
        )}

        {/* Indicateur de modifications non sauvegardées */}
        {hasUnsavedChanges && (
          <div className="absolute bottom-3 left-3 z-20">
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Modifications non sauvegardées
            </div>
          </div>
        )}
      </div>

      {/* Formulaire d'édition déroulant avec preview en temps réel */}
      <BlockEditForm
        block={block}
        onSave={handleSaveChanges}
        onPreviewUpdate={handlePreviewUpdate}
        isOpen={showEditForm}
        onToggle={() => setShowEditForm(!showEditForm)}
        hasUnsavedChanges={hasUnsavedChanges}
        onCancel={handleCancelChanges}
      />
    </motion.div>
  );
}