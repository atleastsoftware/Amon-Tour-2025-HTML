import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, FileText, Eye, Scale, Bold, Italic, AlignLeft, AlignCenter, AlignRight, List, Heading1, Heading2, Highlighter } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useIsAuthenticated } from '@/lib/auth';

interface LegalPage {
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

interface PageBlock {
  id: number;
  pageId: number;
  blockType: string;
  content?: string;
  configuration: Record<string, any>;
}

export default function AdminLegalPages() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch all pages and filter for legal pages
  const { data: allPages = [], isLoading } = useQuery<LegalPage[]>({
    queryKey: ['/api/admin/page-configurations'],
    enabled: isAuthenticated
  });

  // Sort legal pages alphabetically by pageName
  const legalPages = allPages
    .filter(page => page.pageType === 'legal')
    .sort((a, b) => a.pageName.localeCompare(b.pageName));

  // Fetch page blocks for selected page
  const { data: pageBlocks = [] } = useQuery<PageBlock[]>({
    queryKey: ['/api/admin/page-blocks', selectedPage?.pageSlug],
    enabled: !!selectedPage?.pageSlug && isAuthenticated,
  });

  // Create legal page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create page configuration with title as pageName
      const pageConfigResponse = await apiRequest('POST', '/api/admin/page-configurations', {
        pageName: data.title,
        pageSlug: generateSlug(data.title),
        pageType: 'legal',
        isActive: true
      });

      const pageConfig = await pageConfigResponse.json();

      // Create a text block with the content
      if (data.content) {
        const cleanedContent = cleanHTML(data.content);
        await apiRequest('POST', '/api/admin/page-blocks', {
          pageId: pageConfig.id,
          blockType: 'text_section',
          blockOrder: 1,
          identifier: `legal_content_${Date.now()}`,
          title: data.title,
          content: cleanedContent,
          configuration: {
            title: data.title,
            content: cleanedContent,
            textAlign: 'left',
            maxWidth: '4xl',
            backgroundColor: '#ffffff'
          },
          isActive: true
        });
      }

      return pageConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
      toast({ title: 'Page légale créée avec succès!' });
      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        content: '',
      });
    },
    onError: () => {
      toast({ title: 'Erreur lors de la création', variant: 'destructive' });
    }
  });

  // Update legal page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedPage?.id) {
        throw new Error('Aucune page sélectionnée');
      }

      // Update page configuration
      await apiRequest('PUT', `/api/admin/page-configurations/${selectedPage.id}`, {
        pageName: data.title,
        pageSlug: generateSlug(data.title),
      });

      // Fetch current blocks to get the latest data
      const blocksResponse = await fetch(`/api/admin/page-blocks/${selectedPage.pageSlug}`);
      if (!blocksResponse.ok) {
        throw new Error(`Erreur lors de la récupération des blocs: ${blocksResponse.statusText}`);
      }
      const currentBlocks = await blocksResponse.json();
      const textBlock = currentBlocks.find((b: PageBlock) => b.blockType === 'text_section');
      
      // Update or create content block
      const cleanedContent = cleanHTML(data.content);
      if (textBlock) {
        await apiRequest('PUT', `/api/admin/page-blocks/${textBlock.id}`, {
          title: data.title,
          content: cleanedContent,
          configuration: {
            ...textBlock.configuration,
            title: data.title,
            content: cleanedContent
          }
        });
      } else if (data.content) {
        await apiRequest('POST', '/api/admin/page-blocks', {
          pageId: selectedPage.id,
          blockType: 'text_section',
          blockOrder: 1,
          identifier: `legal_content_${Date.now()}`,
          title: data.title,
          content: cleanedContent,
          configuration: {
            title: data.title,
            content: cleanedContent,
            textAlign: 'left',
            maxWidth: '4xl',
            backgroundColor: '#ffffff'
          },
          isActive: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage?.pageSlug] });
      toast({ title: 'Page légale mise à jour avec succès!' });
      setIsEditDialogOpen(false);
      setSelectedPage(null);
    },
    onError: (error: any) => {
      console.error('Erreur de mise à jour:', error);
      const errorMessage = error?.message || 'Erreur lors de la mise à jour';
      toast({ title: errorMessage, variant: 'destructive' });
    }
  });

  // Delete legal page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/page-configurations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
      toast({ title: 'Page légale supprimée avec succès!' });
    },
    onError: () => {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  });

  const handleCreatePage = () => {
    if (!formData.title) {
      toast({ title: 'Le titre est requis', variant: 'destructive' });
      return;
    }
    createPageMutation.mutate(formData);
  };

  const handleUpdatePage = () => {
    if (!formData.title) {
      toast({ title: 'Le titre est requis', variant: 'destructive' });
      return;
    }
    updatePageMutation.mutate(formData);
  };

  const handleEditClick = async (page: LegalPage) => {
    setSelectedPage(page);
    
    // Fetch fresh blocks data directly from API BEFORE opening dialog
    try {
      const blocksResponse = await fetch(`/api/admin/page-blocks/${page.pageSlug}`);
      if (blocksResponse.ok) {
        const blocks = await blocksResponse.json();
        console.log('Blocs chargés:', blocks);
        const textBlock = blocks.find((b: PageBlock) => b.blockType === 'text_section');
        console.log('Bloc text_section trouvé:', textBlock);
        
        const title = textBlock?.title || textBlock?.configuration?.title || page.pageName;
        let content = textBlock?.content || textBlock?.configuration?.content || '';
        
        // CRUCIAL: Clean the HTML on LOAD to prevent CSS pollution propagation
        if (content) {
          content = cleanHTML(content);
          console.log('Content nettoyé:', content);
        }
        
        console.log('Title extrait:', title);
        
        setFormData({
          title,
          content,
        });
      } else {
        setFormData({
          title: page.pageName,
          content: '',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des blocs:', error);
      setFormData({
        title: page.pageName,
        content: '',
      });
    }
    
    // Open dialog AFTER data is loaded
    setIsEditDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Clean HTML to remove unnecessary styles and attributes
  const cleanHTML = (html: string): string => {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove all style and class attributes from ALL elements
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('style');
      el.removeAttribute('class');
      // Remove other unwanted attributes but keep semantic ones
      const attrsToRemove = ['data-lexical-decorator', 'data-lexical-text', 'dir'];
      attrsToRemove.forEach(attr => el.removeAttribute(attr));
    });
    
    // Only remove truly empty elements (no text, no children)
    // Do this in reverse to avoid issues with nested removals
    const emptyElements = Array.from(tempDiv.querySelectorAll('*')).reverse();
    emptyElements.forEach(el => {
      // Keep <br>, <hr>, <img> and other self-closing tags
      const selfClosing = ['BR', 'HR', 'IMG', 'INPUT'];
      if (selfClosing.includes(el.tagName)) return;
      
      // Remove only if completely empty (no text and no children)
      if (!el.textContent?.trim() && el.children.length === 0) {
        el.remove();
      }
    });
    
    return tempDiv.innerHTML.trim();
  };

  // Sync contentEditable content when dialog opens or formData changes
  useEffect(() => {
    if (contentEditableRef.current && (isEditDialogOpen || isCreateDialogOpen)) {
      // Always update the content when formData changes
      contentEditableRef.current.innerHTML = formData.content || '';
      console.log('ContentEditable mis à jour avec:', formData.content);
    }
  }, [formData.content, isEditDialogOpen, isCreateDialogOpen]);

  // ContentEditable formatting functions
  const formatText = (command: string, value?: string) => {
    const editor = contentEditableRef.current;
    if (!editor) return;
    
    editor.focus();
    document.execCommand(command, false, value);
    
    // Update formData with the new content
    setFormData({ ...formData, content: editor.innerHTML });
  };

  const insertHeading = (level: number) => {
    formatText('formatBlock', `h${level}`);
  };

  const insertBold = () => formatText('bold');
  const insertItalic = () => formatText('italic');
  const insertHighlight = () => formatText('hiliteColor', '#ffff00');
  const insertAlignLeft = () => formatText('justifyLeft');
  const insertAlignCenter = () => formatText('justifyCenter');
  const insertAlignRight = () => formatText('justifyRight');
  const insertBulletList = () => formatText('insertUnorderedList');
  const insertLineBreak = () => formatText('insertLineBreak');
  
  // Update formData when contentEditable changes
  const handleContentChange = () => {
    const editor = contentEditableRef.current;
    if (editor) {
      setFormData({ ...formData, content: editor.innerHTML });
    }
  };

  // Clean existing database content mutation
  const cleanDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/clean-html-blocks');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.cleanedCount} blocs nettoyés avec succès!` });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks'] });
    },
    onError: () => {
      toast({ title: 'Erreur lors du nettoyage', variant: 'destructive' });
    }
  });

  if (authLoading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
                <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-[hsl(var(--success))] flex-shrink-0" />
                <span className="truncate">Éditeur de mention légal</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gérez les pages légales de votre site (mentions légales, CGV, confidentialité)
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin-editor')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
          </div>
        </div>

        {/* Create Button and Clean Database Button */}
        <div className="mb-6 flex gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer une page légale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle page légale</DialogTitle>
                <DialogDescription>
                  Éditez directement le contenu avec mise en forme visuelle
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de la page *</Label>
                  <Input
                    id="title"
                    placeholder="ex: Legal Notice"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg font-semibold"
                  />
                </div>

                {/* Rich Text Toolbar */}
                <div className="space-y-2">
                  <Label>Barre d'outils de formatage</Label>
                  <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-md border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertHeading(2)}
                      title="Titre H2"
                    >
                      <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertHeading(3)}
                      title="Titre H3"
                    >
                      <Heading2 className="w-4 h-4" />
                    </Button>
                    <div className="w-px bg-border mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertBold}
                      title="Gras"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertItalic}
                      title="Italique"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertHighlight}
                      title="Surligné"
                    >
                      <Highlighter className="w-4 h-4" />
                    </Button>
                    <div className="w-px bg-border mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertAlignLeft}
                      title="Aligner à gauche"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertAlignCenter}
                      title="Centrer"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertAlignRight}
                      title="Aligner à droite"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                    <div className="w-px bg-border mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertBulletList}
                      title="Liste à puces"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* ContentEditable Editor */}
                <div className="space-y-2">
                  <Label>Contenu éditable</Label>
                  <div
                    ref={contentEditableRef}
                    contentEditable
                    onInput={handleContentChange}
                    className="border rounded-lg p-6 bg-white min-h-[400px] prose prose-headings:font-heading prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-p:mb-4 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ul:space-y-1 prose-strong:font-bold max-w-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-muted-foreground">
                    Cliquez dans la zone ci-dessus pour éditer directement. Sélectionnez du texte et utilisez les boutons de formatage.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
                  {createPageMutation.isPending ? 'Création...' : 'Créer la page'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={() => cleanDatabaseMutation.mutate()}
            disabled={cleanDatabaseMutation.isPending}
          >
            {cleanDatabaseMutation.isPending ? 'Nettoyage...' : 'Nettoyer les blocs (fix CSS)'}
          </Button>
        </div>

        {/* Legal Pages List */}
        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : legalPages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune page légale. Créez-en une pour commencer.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {legalPages.map((page) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="w-8 h-8 text-[hsl(var(--success))] flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{page.pageName}</h3>
                          <p className="text-sm text-muted-foreground">/{page.pageSlug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(`/${page.pageSlug}`, '_blank')}
                          data-testid={`button-view-${page.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleEditClick(page)}
                          data-testid={`button-edit-${page.id}`}
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-${page.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Voulez-vous vraiment supprimer "{page.pageName}" ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePageMutation.mutate(page.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier : {selectedPage?.pageName}</DialogTitle>
              <DialogDescription>
                Éditez directement le contenu avec mise en forme visuelle
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre de la page *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg font-semibold"
                />
              </div>

              {/* Rich Text Toolbar */}
              <div className="space-y-2">
                <Label>Barre d'outils de formatage</Label>
                <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-md border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(2)}
                    title="Titre H2"
                  >
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(3)}
                    title="Titre H3"
                  >
                    <Heading2 className="w-4 h-4" />
                  </Button>
                  <div className="w-px bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertBold}
                    title="Gras"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertItalic}
                    title="Italique"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertHighlight}
                    title="Surligné"
                  >
                    <Highlighter className="w-4 h-4" />
                  </Button>
                  <div className="w-px bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertAlignLeft}
                    title="Aligner à gauche"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertAlignCenter}
                    title="Centrer"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertAlignRight}
                    title="Aligner à droite"
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <div className="w-px bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertBulletList}
                    title="Liste à puces"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* ContentEditable Editor */}
              <div className="space-y-2">
                <Label>Contenu éditable</Label>
                <div
                  ref={contentEditableRef}
                  contentEditable
                  onInput={handleContentChange}
                  className="border rounded-lg p-6 bg-white min-h-[400px] prose prose-headings:font-heading prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-p:mb-4 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ul:space-y-1 prose-strong:font-bold max-w-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-sm text-muted-foreground">
                  Cliquez dans la zone ci-dessus pour éditer directement. Sélectionnez du texte et utilisez les boutons de formatage.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdatePage} disabled={updatePageMutation.isPending}>
                {updatePageMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
