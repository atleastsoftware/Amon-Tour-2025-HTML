import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ExternalLink, 
  Edit, 
  Globe, 
  Users, 
  Clock, 
  FileText,
  BarChart3,
  Calendar,
  ChevronLeft
} from 'lucide-react';

import type { PageConfiguration, PageBlock } from '../../../shared/schema';

interface PageInfoProps {}

export default function AdminPageBuilder({}: PageInfoProps) {
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Fetch pages
  const { data: pages = [], isLoading: pagesLoading } = useQuery<PageConfiguration[]>({
    queryKey: ['/api/admin/page-configurations'],
  });

  // Fetch blocks for selected page to show statistics
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

  const selectedPage = pages.find((p: PageConfiguration) => p.id === selectedPageId);

  // Helper functions for page information
  const getPageUrl = (pageSlug: string) => {
    return pageSlug === 'home' ? '/' : `/${pageSlug}`;
  };

  const getPageUsage = (pageSlug: string) => {
    const usages = [];
    
    // Check if page is in main menu
    if (['home', 'experiences', 'contact', 'blog'].includes(pageSlug)) {
      usages.push('Menu principal');
    }
    
    // Check if page is in footer
    if (['home', 'legal-notice', 'privacy-policy', 'terms-conditions'].includes(pageSlug)) {
      usages.push('Footer');
    }
    
    // Special cases
    if (pageSlug === 'home') {
      usages.push('Bouton accueil', 'Page par défaut');
    }
    
    return usages;
  };

  const handleEditPage = () => {
    if (!selectedPageId) return;
    setLocation(`/admin-page-editor?pageId=${selectedPageId}`);
  };

  const handleViewPage = () => {
    if (!selectedPage) return;
    const url = getPageUrl(selectedPage.pageSlug);
    window.open(url, '_blank');
  };

  if (pagesLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/admin')}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour au Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold mt-4">Gestion des Pages</h1>
        <p className="text-muted-foreground">Visualisez et modifiez les pages de votre site web</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar - Page Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sélectionner une Page</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => setSelectedPageId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une page" />
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
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Page Information */}
        <div className="lg:col-span-3">
          {!selectedPageId ? (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">Sélectionnez une page</h3>
                <p className="text-muted-foreground">Choisissez une page dans la barre latérale pour voir ses informations</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              
              {/* Page Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{selectedPage?.pageName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <code>{getPageUrl(selectedPage?.pageSlug || '')}</code>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{pageBlocks.length} blocs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleViewPage}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Voir le site
                      </Button>
                      <Button 
                        onClick={handleEditPage}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier la page
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Page Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{pageBlocks.length}</div>
                        <div className="text-sm text-muted-foreground">Blocs actifs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {selectedPage?.updatedAt 
                            ? new Date(selectedPage.updatedAt).toLocaleDateString('fr-FR')
                            : 'Jamais'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Dernière modification</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {selectedPage?.isActive ? 'Actif' : 'Inactif'}
                        </div>
                        <div className="text-sm text-muted-foreground">Statut</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Page Usage Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Utilisation de la Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Cette page est utilisée dans :
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {getPageUsage(selectedPage?.pageSlug || '').map((usage, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {usage}
                          </Badge>
                        ))}
                        {getPageUsage(selectedPage?.pageSlug || '').length === 0 && (
                          <span className="text-sm text-muted-foreground">Aucune utilisation détectée</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Informations techniques :
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Slug :</span>
                          <code className="ml-2 bg-muted px-2 py-1 rounded">{selectedPage?.pageSlug}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type :</span>
                          <span className="ml-2 font-medium">{selectedPage?.pageType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">URL complète :</span>
                          <code className="ml-2 bg-muted px-2 py-1 rounded">
                            {window.location.origin}{getPageUrl(selectedPage?.pageSlug || '')}
                          </code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ID :</span>
                          <span className="ml-2 font-medium">{selectedPage?.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 justify-start"
                      onClick={handleViewPage}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <ExternalLink className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Voir sur le site</div>
                          <div className="text-sm text-muted-foreground">Ouvrir la page dans un nouvel onglet</div>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="h-auto p-4 justify-start"
                      onClick={handleEditPage}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-foreground rounded">
                          <Edit className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Modifier la page</div>
                          <div className="text-sm opacity-90">Édition plein écran des blocs</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}