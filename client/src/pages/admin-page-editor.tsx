import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RealBlockPreview from '@/components/admin/RealBlockPreview';
import { ArrowLeft, Edit, Eye, Plus, Trash2, Move } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

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

export default function AdminPageEditor() {
  const [, setLocation] = useLocation();
  const [newBlockType, setNewBlockType] = useState('');
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
  });

  const currentPageConfig = pageConfigs.find(p => p.pageSlug === pageSlug);

  // Add new block mutation
  const addBlockMutation = useMutation({
    mutationFn: async (blockData: any) => {
      const response = await fetch('/api/admin/page-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData),
      });
      if (!response.ok) throw new Error('Failed to add block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', pageSlug] });
      toast({ title: "Success", description: "Block added successfully" });
      setNewBlockType('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add block", variant: "destructive" });
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
      toast({ title: "Success", description: "Block deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete block", variant: "destructive" });
    },
  });

  const handleAddBlock = () => {
    if (!newBlockType || !currentPageConfig) return;
    
    addBlockMutation.mutate({
      pageSlug: pageSlug,
      blockType: newBlockType,
      blockOrder: (pageBlocks?.length || 0) + 1,
      identifier: `${newBlockType}_${Date.now()}`,
      title: `New ${newBlockType} Block`,
      isActive: true
    });
  };

  const handleDeleteBlock = (blockId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
      deleteBlockMutation.mutate(blockId);
    }
  };

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
              Retour à la gestion des pages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={goBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Éditeur de page: {currentPageConfig.pageName}
              </h1>
              <p className="text-sm text-gray-600">
                Page {currentPageConfig.pageType === 'main' ? 'principale' : 'secondaire'} • /{pageSlug}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const pageUrl = pageSlug === 'home' ? '/' : `/${pageSlug}`;
                window.open(pageUrl, '_blank');
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Prévisualiser
            </Button>
          </div>
        </div>

        {/* Add Block Dialog */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Éditeur de blocs
              </CardTitle>
              <CardDescription>
                Modifiez les blocs de contenu de votre page. Ajoutez, supprimez ou réorganisez les sections.
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un bloc
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau bloc</DialogTitle>
                  <DialogDescription>
                    Choisissez le type de bloc à ajouter à cette page
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="blockType">Type de bloc</Label>
                  <Select value={newBlockType} onValueChange={setNewBlockType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type de bloc" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Hero Sections */}
                      <SelectItem value="hero_video">Hero avec Vidéo</SelectItem>
                      <SelectItem value="hero_banner">Hero avec Image</SelectItem>
                      <SelectItem value="hero">Hero Simple</SelectItem>
                      
                      {/* Content Sections */}
                      <SelectItem value="text_section">Section Texte</SelectItem>
                      <SelectItem value="text_image">Texte & Image</SelectItem>
                      <SelectItem value="about_2col">À Propos (2 Colonnes)</SelectItem>
                      
                      {/* Interactive Sections */}
                      <SelectItem value="tour_grid">Grille de Tours</SelectItem>
                      <SelectItem value="cards_grid">Grille de Cartes</SelectItem>
                      <SelectItem value="search_bar">Barre de Recherche</SelectItem>
                      
                      {/* Features & Layout */}
                      <SelectItem value="features_3col">Fonctionnalités (3 Colonnes)</SelectItem>
                      <SelectItem value="testimonials">Témoignages</SelectItem>
                      
                      {/* Contact & Forms */}
                      <SelectItem value="contact_cards">Cartes de Contact</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="cta_section">Call to Action</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2 pt-4">
                    <DialogTrigger asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogTrigger>
                    <Button 
                      onClick={handleAddBlock}
                      disabled={!newBlockType || addBlockMutation.isPending}
                    >
                      {addBlockMutation.isPending ? 'Ajout...' : 'Ajouter le bloc'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>

        {/* Blocks List */}
        <Card>
          <CardHeader>
            <CardTitle>Blocs de contenu</CardTitle>
            <CardDescription>
              {pageBlocks?.length || 0} bloc{(pageBlocks?.length || 0) > 1 ? 's' : ''} sur cette page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBlocks ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement des blocs...</p>
              </div>
            ) : pageBlocks?.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Edit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucun bloc sur cette page</h3>
                <p className="text-sm mb-4">Commencez par ajouter votre premier bloc de contenu</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter le premier bloc
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un premier bloc</DialogTitle>
                      <DialogDescription>
                        Choisissez le type de bloc pour commencer à construire votre page
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Label htmlFor="blockType">Type de bloc</Label>
                      <Select value={newBlockType} onValueChange={setNewBlockType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de bloc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero Section (Recommandé pour commencer)</SelectItem>
                          <SelectItem value="text_section">Section Texte</SelectItem>
                          <SelectItem value="tour_grid">Grille de Tours</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2 pt-4">
                        <DialogTrigger asChild>
                          <Button variant="outline">Annuler</Button>
                        </DialogTrigger>
                        <Button 
                          onClick={handleAddBlock}
                          disabled={!newBlockType || addBlockMutation.isPending}
                        >
                          {addBlockMutation.isPending ? 'Ajout...' : 'Créer le bloc'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {pageBlocks?.sort((a, b) => a.blockOrder - b.blockOrder).map((block) => (
                  <div key={block.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Move className="w-4 h-4 text-gray-400 cursor-grab" />
                          <span className="text-sm font-medium text-gray-600">#{block.blockOrder}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{block.title || `Bloc ${block.blockType}`}</h3>
                          <p className="text-sm text-gray-500">Type: {block.blockType}</p>
                        </div>
                        {!block.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Inactif</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteBlock(block.id)}
                          disabled={deleteBlockMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Block Preview */}
                    <div className="border rounded p-4 bg-gray-50">
                      <RealBlockPreview 
                        block={block} 
                        pageSlug={pageSlug}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}