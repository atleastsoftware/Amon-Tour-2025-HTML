import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings, Eye, Trash2, GripVertical, Copy, Palette } from 'lucide-react';

import type { PageConfiguration, PageBlock, BlockTemplate } from '../../../shared/schema';

// Composants de prévisualisation pour chaque type de bloc
import { BlockPreview } from '@/components/admin/BlockPreview';
import { BlockConfigModal } from '@/components/admin/BlockConfigModal';

interface PageBuilderProps {}

export default function AdminPageBuilder({}: PageBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPageId] });
      toast({ title: 'Block added successfully' });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest('PATCH', `/api/admin/page-blocks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPageId] });
      toast({ title: 'Block updated successfully' });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: number) => apiRequest('DELETE', `/api/admin/page-blocks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPageId] });
      toast({ title: 'Block deleted successfully' });
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: async (blocks: Array<{ id: number; blockOrder: number }>) => 
      apiRequest('PATCH', '/api/admin/page-blocks/reorder', { blocks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPageId] });
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
      title: template.defaultConfiguration.title || 'New Block',
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

  const selectedPage = pages.find((p: PageConfiguration) => p.id === selectedPageId);
  const selectedBlock = pageBlocks.find((b: PageBlock) => b.id === selectedBlockId);

  if (pagesLoading || templatesLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Page Builder</h1>
        <p className="text-muted-foreground">Build and customize your website pages with drag & drop</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar - Page Selection & Block Templates */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Page Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Page</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => setSelectedPageId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a page to edit" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page: PageConfiguration) => (
                    <SelectItem key={page.id} value={page.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{page.pageName}</span>
                        <Badge variant="outline" className="text-xs">
                          main
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Block Templates */}
          {selectedPageId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Block Templates</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Tabs defaultValue="hero" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 text-xs">
                    <TabsTrigger value="hero">Hero</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="interactive">Interactive</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(templatesByCategory).map(([category, templates]) => (
                    <TabsContent key={category} value={category} className="space-y-2 mt-3">
                      {templates.map((template: BlockTemplate) => (
                        <Card 
                          key={template.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleAddBlock(template)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Plus className="h-4 w-4 text-primary mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-1">{template.templateName}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                                <Badge variant="secondary" className="text-xs mt-1">
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content - Page Builder */}
        <div className="lg:col-span-3">
          {!selectedPageId ? (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">Select a page to start editing</h3>
                <p className="text-muted-foreground">Choose a page from the sidebar to begin building</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              
              {/* Page Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedPage?.pageName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedPage?.pageSlug} • {pageBlocks.length} blocks
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {previewMode ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Page Blocks */}
              <Card>
                <CardContent className="p-0">
                  {blocksLoading ? (
                    <div className="p-6 text-center">Loading blocks...</div>
                  ) : pageBlocks.length === 0 ? (
                    <div className="p-12 text-center">
                      <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium">No blocks yet</h3>
                      <p className="text-muted-foreground text-sm">Add your first block from the templates on the left</p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="page-blocks">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 p-4"
                          >
                            {pageBlocks
                              .sort((a: PageBlock, b: PageBlock) => a.blockOrder - b.blockOrder)
                              .map((block: PageBlock, index: number) => (
                                <Draggable 
                                  key={block.id} 
                                  draggableId={block.id.toString()} 
                                  index={index}
                                  isDragDisabled={previewMode}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`border rounded-lg bg-white transition-all ${
                                        snapshot.isDragging ? 'shadow-lg scale-105' : 'shadow-sm'
                                      }`}
                                    >
                                      {!previewMode && (
                                        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                                          <div className="flex items-center gap-2">
                                            <div {...provided.dragHandleProps}>
                                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              {block.blockType}
                                            </Badge>
                                            <span className="font-medium text-sm">{block.title || block.identifier}</span>
                                          </div>
                                          <div className="flex gap-1">
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
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="p-4">
                                        <BlockPreview block={block} previewMode={previewMode} />
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
                </CardContent>
              </Card>
            </div>
          )}
        </div>
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