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
  const renderVisualPreview = () => {
    const config = block.configuration || {};
    
    switch (block.blockType) {
      case 'hero_main':
      case 'hero':
      case 'video_hero':
        return (
          <div className="h-full w-full relative overflow-hidden">
            {/* Image de fond exact du vrai héro */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('/attached_assets/DJI_20241115104455_0160_D-min.jpeg')`,
                animation: 'backgroundShift 8s ease-in-out infinite alternate'
              }}
            ></div>
            
            {/* Simulation de la vidéo avec effet de mouvement subtil */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-600/20 to-blue-700/20 animate-pulse"
              style={{ animationDuration: '3s' }}
            ></div>
            
            {/* Overlays de dégradé EXACTEMENT comme sur le vrai site */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
            
            {/* Contenu EXACT du vrai site avec proportions vraiment réelles */}
            <div className="relative h-full flex items-center px-8 py-6">
              <div className="flex-1 max-w-[60%]">
                {/* Titre EXACT du vrai site avec vraie taille */}
                <h1 className="font-heading text-[22px] md:text-[26px] font-bold mb-4 leading-tight text-white drop-shadow-lg">
                  {block.title || "Your exclusive experiences"} <br/>
                  <span className="text-primary drop-shadow-lg">in Krabi –</span> THAILAND
                </h1>
                
                {/* Description EXACTE du vrai site avec vraie taille */}
                <p className="text-white/90 mb-6 text-[14px] drop-shadow-md leading-relaxed">
                  {block.description || "Discover amazing places away from mass tourism in Krabi."}<br/>
                  And also Khao Sok, Koh Mook and many more destinations.
                </p>
                
                {/* Boutons EXACTS du vrai site avec vraies tailles */}
                <div className="flex gap-3 mt-6">
                  <button className="bg-primary text-white text-[12px] px-6 py-3 rounded hover:bg-primary/90 transition-colors shadow-lg font-medium">
                    See our offers
                  </button>
                  <button className="bg-primary text-white text-[12px] px-6 py-3 rounded hover:bg-primary/90 transition-colors shadow-lg font-medium">
                    Custom your trip
                  </button>
                </div>
              </div>
            </div>
            
            {/* Indicateurs vidéo fidèles */}
            <div className="absolute top-1 right-1">
              <div className="bg-black/60 rounded px-1.5 py-0.5 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[6px] text-white font-medium">VIDEO</span>
              </div>
            </div>
            
            {/* Barre de progression vidéo */}
            <div className="absolute bottom-1 left-1 right-1">
              <div className="bg-black/40 rounded h-0.5 overflow-hidden">
                <div className="bg-primary h-full w-1/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        );
        
      case 'why_choose_us':
      case 'features':
        return (
          <div className="h-full bg-gray-50 p-2">
            <div className="text-center mb-2">
              <div className="text-[10px] font-bold">Why Choose Us</div>
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
        
      case 'about_amon_tour':
      case 'about':
        return (
          <div className="h-full bg-white p-2 flex gap-2">
            <div className="flex-1">
              <div className="text-[10px] font-bold mb-1">Who We Are</div>
              <div className="text-[8px] text-gray-600 mb-1">French family living in Krabi since 2013</div>
              <div className="text-[8px] text-gray-600 mb-2">Amon Tour - Independent travel agency</div>
              <div className="flex gap-1">
                <div className="bg-blue-600 text-[7px] text-white px-1 py-0.5 rounded">Contact</div>
                <div className="text-[7px] text-blue-600">Journey →</div>
              </div>
            </div>
            <div className="w-12 h-full bg-gray-200 rounded flex flex-col gap-1">
              <div className="flex-1 bg-gradient-to-br from-blue-200 to-blue-300 rounded"></div>
              <div className="flex-1 bg-gradient-to-br from-green-200 to-green-300 rounded"></div>
            </div>
          </div>
        );
        
      case 'featured_tours':
        return (
          <div className="h-full bg-gray-50 p-2">
            <div className="text-center mb-2">
              <div className="text-[10px] font-bold">Featured Tours</div>
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
          <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 text-center flex flex-col justify-center">
            <div className="text-[10px] font-bold text-white mb-1">Create Your Perfect Journey</div>
            <div className="text-[8px] text-white opacity-90 mb-2">Tell us your dreams, we'll make them reality</div>
            <div className="bg-white text-yellow-600 text-[8px] px-2 py-1 rounded mx-auto font-semibold">
              Start Planning
            </div>
          </div>
        );
        
      case 'customer_reviews':
      case 'testimonials':
        return (
          <div className="h-full bg-white p-2">
            <div className="text-center mb-2">
              <div className="text-[10px] font-bold">Customer Reviews</div>
              <div className="w-4 h-0.5 bg-yellow-500 mx-auto mt-1"></div>
            </div>
            <div className="grid grid-cols-2 gap-1 h-16">
              <div className="bg-gray-50 rounded p-1">
                <div className="flex justify-center mb-1">
                  <div className="text-[8px] text-yellow-500">★★★★★</div>
                </div>
                <div className="text-[7px] text-gray-600">"Amazing experience!"</div>
                <div className="text-[6px] text-gray-500 mt-1">- Sarah M.</div>
              </div>
              <div className="bg-gray-50 rounded p-1">
                <div className="flex justify-center mb-1">
                  <div className="text-[8px] text-yellow-500">★★★★★</div>
                </div>
                <div className="text-[7px] text-gray-600">"Perfect trip!"</div>
                <div className="text-[6px] text-gray-500 mt-1">- John D.</div>
              </div>
            </div>
          </div>
        );
        
      case 'contact_hero':
        return (
          <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800 p-2 text-white text-center flex flex-col justify-center">
            <div className="text-[10px] font-bold mb-1">Contact Us</div>
            <div className="text-[8px] opacity-90">Get in touch for your perfect trip</div>
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
            <div className="text-[9px] font-bold mb-2 text-center">Send Message</div>
            <div className="space-y-1">
              <div className="h-2 bg-gray-100 rounded"></div>
              <div className="h-2 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-3 bg-blue-600 rounded text-center">
                <div className="text-[7px] text-white pt-1">Send</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="h-full bg-gray-100 p-2 text-center flex flex-col justify-center">
            <div className="text-[10px] font-semibold mb-1">{block.title || `Bloc ${block.blockType}`}</div>
            <div className="text-[8px] text-gray-600 mb-2">{block.description?.substring(0, 50) || "Aperçu du contenu..."}</div>
            <div className="bg-gray-200 px-2 py-1 rounded text-[7px] mx-auto">
              {block.blockType}
            </div>
          </div>
        );
    }
  };

  // Blocs héros prennent toute la largeur comme sur le vrai site
  const isHeroBlock = ['hero_main', 'hero', 'video_hero'].includes(block.blockType);
  const previewHeight = isHeroBlock ? '300px' : '200px';
  
  return (
    <div 
      className={`relative overflow-hidden rounded-lg border bg-white ${
        isHeroBlock ? 'w-full' : ''
      }`} 
      style={{ 
        height: previewHeight, 
        minHeight: previewHeight,
        ...(isHeroBlock ? { aspectRatio: '21/9' } : { aspectRatio: '16/9' })
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