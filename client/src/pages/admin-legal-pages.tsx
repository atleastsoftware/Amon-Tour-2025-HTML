import { useState } from 'react';
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
import { ArrowLeft, Plus, Edit, Trash2, FileText, Eye, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { Switch } from '@/components/ui/switch';

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
    pageName: '',
    pageSlug: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    content: '',
    isActive: true
  });

  // Fetch all pages and filter for legal pages
  const { data: allPages = [], isLoading } = useQuery<LegalPage[]>({
    queryKey: ['/api/admin/page-configurations'],
  });

  const legalPages = allPages.filter(page => page.pageType === 'legal');

  // Fetch page blocks for selected page
  const { data: pageBlocks = [] } = useQuery<PageBlock[]>({
    queryKey: ['/api/admin/page-blocks', selectedPage?.pageSlug],
    enabled: !!selectedPage?.pageSlug,
  });

  // Create legal page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create page configuration
      const pageConfig = await apiRequest('/api/admin/page-configurations', {
        method: 'POST',
        body: JSON.stringify({
          pageName: data.pageName,
          pageSlug: data.pageSlug,
          pageType: 'legal',
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
          isActive: data.isActive
        })
      });

      // Create a text block with the content
      if (data.content) {
        await apiRequest('/api/admin/page-blocks', {
          method: 'POST',
          body: JSON.stringify({
            pageId: pageConfig.id,
            blockType: 'text_section',
            blockOrder: 1,
            identifier: `legal_content_${Date.now()}`,
            title: data.pageName,
            content: data.content,
            configuration: {
              content: data.content,
              textAlign: 'left',
              maxWidth: '4xl',
              backgroundColor: '#ffffff'
            },
            isActive: true
          })
        });
      }

      return pageConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
      toast({ title: 'Page légale créée avec succès!' });
      setIsCreateDialogOpen(false);
      setFormData({
        pageName: '',
        pageSlug: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        content: '',
        isActive: true
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
      await apiRequest(`/api/admin/page-configurations/${selectedPage?.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          pageName: data.pageName,
          pageSlug: data.pageSlug,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
          isActive: data.isActive
        })
      });

      // Update or create content block
      const textBlock = pageBlocks.find(b => b.blockType === 'text_section');
      if (textBlock) {
        await apiRequest(`/api/admin/page-blocks/${textBlock.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            content: data.content,
            configuration: {
              ...textBlock.configuration,
              content: data.content
            }
          })
        });
      } else if (data.content) {
        await apiRequest('/api/admin/page-blocks', {
          method: 'POST',
          body: JSON.stringify({
            pageId: selectedPage?.id,
            blockType: 'text_section',
            blockOrder: 1,
            identifier: `legal_content_${Date.now()}`,
            title: data.pageName,
            content: data.content,
            configuration: {
              content: data.content,
              textAlign: 'left',
              maxWidth: '4xl',
              backgroundColor: '#ffffff'
            },
            isActive: true
          })
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
      await apiRequest(`/api/admin/page-configurations/${id}`, {
        method: 'DELETE'
      });
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
    if (!formData.pageName || !formData.pageSlug) {
      toast({ title: 'Nom et slug requis', variant: 'destructive' });
      return;
    }
    createPageMutation.mutate(formData);
  };

  const handleUpdatePage = () => {
    if (!formData.pageName || !formData.pageSlug) {
      toast({ title: 'Nom et slug requis', variant: 'destructive' });
      return;
    }
    updatePageMutation.mutate(formData);
  };

  const handleEditClick = (page: LegalPage) => {
    setSelectedPage(page);
    const textBlock = pageBlocks.find(b => b.blockType === 'text_section');
    setFormData({
      pageName: page.pageName,
      pageSlug: page.pageSlug,
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      seoKeywords: page.seoKeywords || '',
      content: textBlock?.content || textBlock?.configuration?.content || '',
      isActive: page.isActive
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle page légale</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle page légale (mentions légales, CGV, politique de confidentialité, etc.)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la page *</Label>
                  <Input
                    id="name"
                    placeholder="ex: Mentions légales"
                    value={formData.pageName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        pageName: name,
                        pageSlug: generateSlug(name)
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    placeholder="ex: mentions-legales"
                    value={formData.pageSlug}
                    onChange={(e) => setFormData({ ...formData, pageSlug: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    URL: /{formData.pageSlug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea
                    id="content"
                    rows={10}
                    placeholder="Entrez le contenu de la page légale..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez utiliser du HTML pour la mise en forme
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Titre SEO</Label>
                  <Input
                    id="seoTitle"
                    placeholder="ex: Mentions légales - Amon Tour"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Description SEO</Label>
                  <Textarea
                    id="seoDescription"
                    rows={3}
                    placeholder="Description pour les moteurs de recherche"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Mots-clés SEO</Label>
                  <Input
                    id="seoKeywords"
                    placeholder="ex: mentions légales, conditions, Amon Tour"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Page active (visible sur le site)</Label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalPages.map((page) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[hsl(var(--success))]" />
                          {page.pageName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          /{page.pageSlug}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        page.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {page.isActive ? 'Actif' : 'Inactif'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/${page.pageSlug}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditClick(page)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la page légale</DialogTitle>
              <DialogDescription>
                Modifiez le contenu et les paramètres de la page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom de la page *</Label>
                <Input
                  id="edit-name"
                  value={formData.pageName}
                  onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug (URL) *</Label>
                <Input
                  id="edit-slug"
                  value={formData.pageSlug}
                  onChange={(e) => setFormData({ ...formData, pageSlug: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  URL: /{formData.pageSlug}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Contenu</Label>
                <Textarea
                  id="edit-content"
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Vous pouvez utiliser du HTML pour la mise en forme
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-seoTitle">Titre SEO</Label>
                <Input
                  id="edit-seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-seoDescription">Description SEO</Label>
                <Textarea
                  id="edit-seoDescription"
                  rows={3}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-seoKeywords">Mots-clés SEO</Label>
                <Input
                  id="edit-seoKeywords"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Page active (visible sur le site)</Label>
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
