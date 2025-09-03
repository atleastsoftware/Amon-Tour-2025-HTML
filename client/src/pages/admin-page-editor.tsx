import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Settings, 
  Trash2, 
  GripVertical, 
  ChevronLeft,
  ExternalLink,
  Save
} from 'lucide-react';

import type { PageConfiguration, PageBlock, BlockTemplate } from '../../../shared/schema';

// Composants de prévisualisation en taille réelle
import RealBlockPreview from '@/components/admin/RealBlockPreview';
import { BlockConfigModal } from '@/components/admin/BlockConfigModal';

export default function AdminPageEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Récupérer l'ID de page depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const pageIdFromUrl = urlParams.get('pageId');
    if (pageIdFromUrl) {
      setSelectedPageId(parseInt(pageIdFromUrl));
    }
  }, [location]);

  // Fetch pages
  const { data: pages = [], isLoading: pagesLoading } = useQuery<PageConfiguration[]>({
    queryKey: ['/api/admin/page-configurations'],
  });

  // Fetch block templates
  const { data: blockTemplates = [], isLoading: templatesLoading } = useQuery<BlockTemplate[]>({
    queryKey: ['/api/admin/block-templates'],
  });

  // Fetch blocks for selected page
  const { data: pageBlocks = [], isLoading: blocksLoading } = useQuery<PageBlock[]>({
    queryKey: ['/api/admin/page-blocks-by-page', selectedPageId],
    queryFn: async () => {
      if (!selectedPageId) return [];
      const response = await fetch(`/api/admin/page-blocks-by-page/${selectedPageId}`);
      if (!response.ok) throw new Error('Failed to fetch page blocks');
      return response.json();
    },
    enabled: !!selectedPageId,
  });

  // Grouper les templates par catégorie
  const templatesByCategory = blockTemplates.reduce((acc: Record<string, BlockTemplate[]>, template: BlockTemplate) => {
    const category = getTemplateCategory(template.blockType);
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {});

  // Mutations
  const addBlockMutation = useMutation({
    mutationFn: async (data: any) => apiRequest('POST', '/api/admin/page-blocks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks-by-page', selectedPageId] });
      toast({ title: 'Bloc ajouté avec succès' });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest('PATCH', `/api/admin/page-blocks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks-by-page', selectedPageId] });
      toast({ title: 'Bloc mis à jour avec succès' });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: number) => apiRequest('DELETE', `/api/admin/page-blocks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks-by-page', selectedPageId] });
      toast({ title: 'Bloc supprimé avec succès' });
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: async (blocks: Array<{ id: number; blockOrder: number }>) => 
      apiRequest('PATCH', '/api/admin/page-blocks/reorder', { blocks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks-by-page', selectedPageId] });
      toast({ title: 'Ordre des blocs mis à jour' });
    },
  });

  // Handlers
  const handleAddBlock = useCallback(async (template: BlockTemplate) => {
    if (!selectedPageId) return;
    
    const newBlock = {
      pageId: selectedPageId,
      blockType: template.blockType,
      blockOrder: pageBlocks.length,
      identifier: `${template.blockType}-${Date.now()}`,
      title: template.defaultConfiguration?.title || 'Nouveau Bloc',
      configuration: template.defaultConfiguration || {},
    };
    
    addBlockMutation.mutate(newBlock);
  }, [selectedPageId, pageBlocks.length, addBlockMutation]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !selectedPageId) return;

    const items = Array.from(pageBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedBlocks = items.map((block, index) => ({
      id: block.id,
      blockOrder: index,
    }));

    reorderBlocksMutation.mutate(reorderedBlocks);
  }, [pageBlocks, selectedPageId, reorderBlocksMutation]);

  const handleConfigureBlock = useCallback((blockId: number) => {
    setSelectedBlockId(blockId);
    setConfigModalOpen(true);
  }, []);

  const handleSaveBlockConfig = useCallback((config: any) => {
    if (!selectedBlockId) return;
    
    updateBlockMutation.mutate({
      id: selectedBlockId,
      ...config,
    });
    setConfigModalOpen(false);
    setSelectedBlockId(null);
  }, [selectedBlockId, updateBlockMutation]);

  const handlePageChange = (pageId: string) => {
    const newPageId = parseInt(pageId);
    setSelectedPageId(newPageId);
    setLocation(`/admin-page-editor?pageId=${newPageId}`);
  };

  const handleBackToPageInfo = () => {
    setLocation('/admin-page-builder');
  };

  const handleViewPage = () => {
    const selectedPage = pages.find((p: PageConfiguration) => p.id === selectedPageId);
    if (!selectedPage) return;
    
    const url = selectedPage.pageSlug === 'home' ? '/' : `/${selectedPage.pageSlug}`;
    window.open(url, '_blank');
  };

  const selectedPage = pages.find((p: PageConfiguration) => p.id === selectedPageId);
  const selectedBlock = pageBlocks.find((b: PageBlock) => b.id === selectedBlockId);

  if (pagesLoading || templatesLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToPageInfo}
                className="text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour aux informations
              </Button>
              
              {/* Sélecteur de page */}
              <Select value={selectedPageId?.toString()} onValueChange={handlePageChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Sélectionner une page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page: PageConfiguration) => (
                    <SelectItem key={page.id} value={page.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{page.pageName}</span>
                        <Badge variant="outline" className="text-xs">
                          {page.pageType}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              {selectedPage && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewPage}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Voir le site
                </Button>
              )}
              <Button size="sm" onClick={() => toast({ title: 'Modifications sauvegardées automatiquement' })}>
                <Save className="h-4 w-4 mr-1" />
                Auto-sauvegarde
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar avec les templates de blocs */}
        <aside className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Modèles de Blocs</h2>
            
            {selectedPageId ? (
              <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-3 text-xs mb-4">
                  <TabsTrigger value="hero">Hero</TabsTrigger>
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="interactive">Interactif</TabsTrigger>
                </TabsList>
                
                {Object.entries(templatesByCategory).map(([category, templates]) => (
                  <TabsContent key={category} value={category} className="space-y-3">
                    {templates.map((template: BlockTemplate) => (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleAddBlock(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Plus className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1">{template.templateName}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                              <Badge variant="secondary" className="text-xs">
                                {template.blockType}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Sélectionnez une page pour voir les modèles de blocs</p>
              </div>
            )}
          </div>
        </aside>

        {/* Zone d'édition principale */}
        <main className="flex-1">
          {!selectedPageId ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">Aucune page sélectionnée</h3>
                <p className="text-muted-foreground">Utilisez le sélecteur en haut pour choisir une page à éditer</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Page Info */}
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedPage?.pageName}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedPage?.pageSlug} • {pageBlocks.length} blocs
                      </p>
                    </div>
                    <Badge variant={selectedPage?.isActive ? 'default' : 'secondary'}>
                      {selectedPage?.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>

                {/* Blocs en taille réelle */}
                <div className="space-y-8">
                  {blocksLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-4">Chargement des blocs...</p>
                    </div>
                  ) : pageBlocks.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun bloc sur cette page</h3>
                      <p className="text-muted-foreground mb-6">Ajoutez votre premier bloc à partir des modèles dans la barre latérale</p>
                      <p className="text-sm text-muted-foreground">Les blocs apparaîtront ici en taille réelle, exactement comme sur votre site</p>
                    </Card>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="page-blocks">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-6"
                          >
                            {pageBlocks
                              .sort((a: PageBlock, b: PageBlock) => a.blockOrder - b.blockOrder)
                              .map((block: PageBlock, index: number) => (
                                <Draggable 
                                  key={block.id} 
                                  draggableId={block.id.toString()} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`group relative transition-all ${
                                        snapshot.isDragging ? 'scale-105 shadow-xl' : ''
                                      }`}
                                    >
                                      {/* Toolbar flottant pour chaque bloc */}
                                      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center p-2 gap-1">
                                          <div {...provided.dragHandleProps}>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="cursor-grab hover:cursor-grabbing"
                                            >
                                              <GripVertical className="h-4 w-4" />
                                            </Button>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleConfigureBlock(block.id)}
                                          >
                                            <Settings className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteBlockMutation.mutate(block.id)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Badge d'identification du bloc */}
                                      <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Badge variant="outline" className="bg-white shadow-sm">
                                          {block.blockType} • {block.title || block.identifier}
                                        </Badge>
                                      </div>
                                      
                                      {/* Bloc en taille réelle */}
                                      <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="w-full" style={{ minHeight: '400px' }}>
                                          <RealBlockPreview 
                                            block={block as any} 
                                            onUpdate={(id, config) => updateBlockMutation.mutate({ id, ...config })}
                                            onDelete={(id) => deleteBlockMutation.mutate(id)}
                                            onMoveUp={() => {}}
                                            onMoveDown={() => {}}
                                            onToggleVisibility={() => {}}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Block Configuration Modal */}
      <BlockConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        block={selectedBlock}
        onSave={handleSaveBlockConfig}
      />
    </div>
  );
}

// Utility function to categorize templates
function getTemplateCategory(blockType: string): string {
  const heroTypes = ['hero', 'video_hero'];
  const contentTypes = ['text_image', 'advantages', 'about'];
  const interactiveTypes = ['form', 'card_grid', 'gallery', 'contact_info', 'interests'];
  
  if (heroTypes.includes(blockType)) return 'hero';
  if (contentTypes.includes(blockType)) return 'content';
  if (interactiveTypes.includes(blockType)) return 'interactive';
  return 'content';
}