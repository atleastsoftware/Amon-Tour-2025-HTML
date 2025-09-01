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
  const scale = 0.3; // Échelle réduite pour l'aperçu
  
  const renderRealComponent = () => {
    const config = block.configuration || {};
    
    switch (block.blockType) {
      case 'hero_main':
      case 'hero':
        return (
          <div className="transform scale-30 origin-top-left w-[333%] h-[333%] overflow-hidden">
            <Hero />
          </div>
        );
        
      case 'featured_tours':
        return (
          <div className="transform scale-30 origin-top-left w-[333%] h-[333%] overflow-hidden">
            <TourNinjaSection />
          </div>
        );
        
      case 'about_amon_tour':
      case 'about':
        return (
          <div className="transform scale-30 origin-top-left w-[333%] h-[333%] overflow-hidden">
            <About />
          </div>
        );
        
      case 'why_choose_us':
      case 'features':
        return (
          <div className="transform scale-30 origin-top-left w-[333%] h-[333%] overflow-hidden">
            <Features />
          </div>
        );
        
      case 'custom_tour_cta':
      case 'cta_section':
        return (
          <div className="transform scale-30 origin-top-left w-[333%] h-[333%] overflow-hidden">
            <CustomTourCta />
          </div>
        );
        
      default:
        return (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h3 className="font-semibold mb-2">{block.title || `Bloc ${block.blockType}`}</h3>
            <p className="text-gray-600 text-sm">{block.description || "Preview of block content..."}</p>
            <span className="inline-block mt-2 bg-gray-200 px-3 py-1 rounded text-xs">
              Type: {block.blockType}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="relative h-32 overflow-hidden rounded-lg border bg-white">
      {renderRealComponent()}
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
function BlockEditForm({ block, onSave, isOpen, onToggle }: {
  block: PageBlock;
  onSave: (data: Partial<PageBlock>) => void;
  isOpen: boolean;
  onToggle: () => void;
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

  const updateConfig = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: { ...prev.configuration, [key]: value }
    }));
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
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre du bloc"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subtitle">Sous-titre</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Sous-titre"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du bloc"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="backgroundColor">Couleur de fond</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  />
                </div>
                
                {/* CTA pour les blocs qui en ont */}
                {['hero', 'cta_section', 'custom_tour_cta'].includes(block.blockType) && (
                  <>
                    <div>
                      <Label htmlFor="ctaText">Texte du bouton</Label>
                      <Input
                        id="ctaText"
                        value={formData.ctaText}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                        placeholder="Texte du bouton"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ctaUrl">Lien du bouton</Label>
                      <Input
                        id="ctaUrl"
                        value={formData.ctaUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
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
              
              {/* Boutons d'action */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  <BlockHistoryModal 
                    block={block} 
                    onRestore={() => window.location.reload()} 
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFormData({
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
                      toast({
                        title: "Modifications annulées",
                        description: "Les valeurs originales ont été restaurées.",
                      });
                    }}
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSave} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={saveVersionMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveVersionMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
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
  const [isEditing, setIsEditing] = useState(false);

  const getBlockDisplayName = (blockType: string) => {
    const displayNames: Record<string, string> = {
      'hero_main': 'Hero Principal',
      'hero': 'Hero Simple',
      'featured_tours': 'Tours Populaires',
      'about_amon_tour': 'À Propos',
      'why_choose_us': 'Pourquoi Nous Choisir',
      'custom_tour_cta': 'Appel à Action',
      'customer_reviews': 'Avis Clients',
      'text_image': 'Texte + Image',
      'card_grid': 'Grille de Cartes',
      'contact_info': 'Infos Contact'
    };
    return displayNames[blockType] || blockType.replace('_', ' ');
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* En-tête du bloc avec contrôles */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {getBlockDisplayName(block.blockType)}
            </span>
            {block.title && (
              <span className="text-sm text-gray-500">- {block.title}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Switch
              checked={block.isActive}
              onCheckedChange={() => onToggleVisibility(block.id)}
            />
            <span className="text-xs text-gray-500">
              {block.isActive ? 'Visible' : 'Masqué'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onMoveUp(block.id)}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onMoveDown(block.id)}>
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 'bg-blue-100 text-blue-700' : ''}
          >
            <Edit className="w-4 h-4 mr-1" />
            Modifier
            {isEditing ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(block.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Prévisualisation réelle du composant */}
      <div className="p-4">
        <MiniaturizedComponent block={block} />
      </div>
      
      {/* Formulaire d'édition en dropdown */}
      <BlockEditForm
        block={block}
        onSave={(data) => onUpdate(block.id, data)}
        isOpen={isEditing}
        onToggle={() => setIsEditing(!isEditing)}
      />
    </div>
  );
}