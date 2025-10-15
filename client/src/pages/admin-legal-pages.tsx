import { useState, useRef } from 'react';
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
  const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all pages and filter for legal pages
  const { data: allPages = [], isLoading } = useQuery<LegalPage[]>({
    queryKey: ['/api/admin/page-configurations'],
  });

  // Sort legal pages alphabetically by pageName
  const legalPages = allPages
    .filter(page => page.pageType === 'legal')
    .sort((a, b) => a.pageName.localeCompare(b.pageName));

  // Fetch page blocks for selected page
  const { data: pageBlocks = [] } = useQuery<PageBlock[]>({
    queryKey: ['/api/admin/page-blocks', selectedPage?.pageSlug],
    enabled: !!selectedPage?.pageSlug,
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
        await apiRequest('POST', '/api/admin/page-blocks', {
          pageId: pageConfig.id,
          blockType: 'text_section',
          blockOrder: 1,
          identifier: `legal_content_${Date.now()}`,
          title: data.title,
          content: data.content,
          configuration: {
            title: data.title,
            content: data.content,
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
      // Update page configuration
      await apiRequest('PUT', `/api/admin/page-configurations/${selectedPage?.id}`, {
        pageName: data.title,
        pageSlug: generateSlug(data.title),
      });

      // Update or create content block
      const textBlock = pageBlocks.find(b => b.blockType === 'text_section');
      if (textBlock) {
        await apiRequest('PUT', `/api/admin/page-blocks/${textBlock.id}`, {
          title: data.title,
          content: data.content,
          configuration: {
            ...textBlock.configuration,
            title: data.title,
            content: data.content
          }
        });
      } else if (data.content) {
        await apiRequest('POST', '/api/admin/page-blocks', {
          pageId: selectedPage?.id,
          blockType: 'text_section',
          blockOrder: 1,
          identifier: `legal_content_${Date.now()}`,
          title: data.title,
          content: data.content,
          configuration: {
            title: data.title,
            content: data.content,
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
    onError: () => {
      toast({ title: 'Erreur lors de la mise à jour', variant: 'destructive' });
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

  const handleEditClick = (page: LegalPage) => {
    setSelectedPage(page);
    const textBlock = pageBlocks.find(b => b.blockType === 'text_section');
    setFormData({
      title: textBlock?.configuration?.title || page.pageName,
      content: textBlock?.content || textBlock?.configuration?.content || '',
    });
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

  // Rich text editor functions
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const beforeText = formData.content.substring(0, start);
    const afterText = formData.content.substring(end);

    const newContent = beforeText + before + selectedText + after + afterText;
    setFormData({ ...formData, content: newContent });

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const tag = `h${level}`;
    insertFormatting(`<${tag}>`, `</${tag}>`);
  };

  const insertBold = () => insertFormatting('<strong>', '</strong>');
  const insertItalic = () => insertFormatting('<em>', '</em>');
  const insertHighlight = () => insertFormatting('<mark>', '</mark>');
  const insertAlignLeft = () => insertFormatting('<div style="text-align: left;">', '</div>');
  const insertAlignCenter = () => insertFormatting('<div style="text-align: center;">', '</div>');
  const insertAlignRight = () => insertFormatting('<div style="text-align: right;">', '</div>');
  const insertBulletList = () => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    if (selectedText) {
      const lines = selectedText.split('\n');
      const listItems = lines.map(line => `  <li>${line}</li>`).join('\n');
      insertFormatting('<ul>\n', `\n</ul>`);
    } else {
      insertFormatting('<ul>\n  <li>', '</li>\n</ul>');
    }
  };
  const insertLineBreak = () => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = formData.content.substring(0, start);
    const afterText = formData.content.substring(start);

    const newContent = beforeText + '<br>\n' + afterText;
    setFormData({ ...formData, content: newContent });

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + 5; // Length of '<br>\n'
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

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

        {/* Create Button */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer une page légale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle page légale</DialogTitle>
                <DialogDescription>
                  Ajoutez le contenu de votre page légale avec mise en forme
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    placeholder="ex: Legal Notice"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Ce titre apparaîtra en haut de la page
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  
                  {/* Rich Text Toolbar */}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={insertLineBreak}
                      title="Saut de ligne"
                      className="text-xs px-2"
                    >
                      BR
                    </Button>
                  </div>

                  <Textarea
                    ref={contentTextareaRef}
                    id="content"
                    rows={15}
                    placeholder="Entrez le contenu de la page légale..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Utilisez les boutons de formatage pour ajouter des styles HTML
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
                  {createPageMutation.isPending ? 'Création...' : 'Créer la page'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier : {selectedPage?.pageName}</DialogTitle>
              <DialogDescription>
                Modifiez le contenu de la page légale
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Ce titre apparaîtra en haut de la page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Contenu</Label>
                
                {/* Rich Text Toolbar */}
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertLineBreak}
                    title="Saut de ligne"
                    className="text-xs px-2"
                  >
                    BR
                  </Button>
                </div>

                <Textarea
                  ref={contentTextareaRef}
                  id="edit-content"
                  rows={15}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Utilisez les boutons de formatage pour ajouter des styles HTML
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
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
