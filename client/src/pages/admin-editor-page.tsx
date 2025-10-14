import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { AdminGuard } from '@/components/AdminGuard';
import { AddPageModal } from '@/components/AddPageModal';
import AdminPageEditor from '@/pages/admin-page-editor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PageConfiguration {
  id: number;
  pageName: string;
  pageSlug: string;
  pageType: 'main' | 'secondary' | 'legal';
  isExternalUrl?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function AdminEditorPageContent() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);

  // Récupérer toutes les pages depuis la base de données
  const { data: pageConfigs = [], isLoading, error } = useQuery<PageConfiguration[]>({
    queryKey: ['/api/admin/page-configurations'],
    queryFn: () => fetch('/api/admin/page-configurations').then(res => {
      if (!res.ok) throw new Error('Failed to fetch pages');
      return res.json();
    })
  });
  
  // Détecter si on a un paramètre ?page= dans l'URL (après tous les hooks)
  const urlParams = new URLSearchParams(searchString);
  const pageParam = urlParams.get('page');
  
  // Si on a un paramètre ?page=, afficher l'éditeur au lieu du listing
  if (pageParam) {
    return <AdminPageEditor />;
  }

  // Transformer les données pour l'affichage et organiser par catégories
  const allPages = pageConfigs
    .map(page => ({
      id: page.pageSlug,
      title: page.pageName,
      slug: page.pageSlug === 'home' ? '/' : `/${page.pageSlug}`,
      status: page.isActive ? 'Active' : 'Inactive',
      pageType: page.pageType,
      type: page.pageType === 'main' ? 'Page principale' : 
            page.pageType === 'secondary' ? 'Page secondaire' : 'Mentions légales'
    }));
  
  // Organiser les pages par catégories (même logique que admin-appearance)
  const homePage = allPages.find(p => p.id === 'home');
  
  // Pages principales (sauf Home)
  const mainPages = allPages
    .filter(p => p.pageType === 'main' && p.id !== 'home')
    .sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  
  // Pages secondaires
  const secondaryPages = allPages
    .filter(p => p.pageType === 'secondary')
    .sort((a, b) => a.title.localeCompare(b.title, 'fr'));

  const handleEditPage = (pageId: string) => {
    // Rediriger vers l'éditeur de page avec le paramètre page pour toutes les pages
    setLocation(`/admin-editor-page?page=${pageId}`);
  };

  const handleDeletePage = async (pageId: string) => {
    if (pageId === 'home') {
      alert('Impossible de supprimer la page d\'accueil');
      return;
    }
    
    try {
      // Trouver la page pour obtenir son ID numérique
      const page = pageConfigs.find(p => p.pageSlug === pageId);
      if (!page) {
        alert('Page non trouvée');
        return;
      }
      
      const response = await fetch(`/api/admin/page-configurations/${page.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression');
      }
      
      // Rafraîchir la liste des pages
      window.location.reload();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert(`Erreur lors de la suppression : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleAddPage = () => {
    setIsAddPageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 flex-shrink-0" />
                <span className="truncate">Éditeur de Pages</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Gérez le contenu et la structure de vos pages web</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin-editor')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à Gestion de Contenu</span>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des pages...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Erreur lors du chargement des pages</p>
            </CardContent>
          </Card>
        )}

        {/* Pages List */}
        {!isLoading && !error && (
        <div className="space-y-6">
          {/* Page d'accueil (Home) - Non supprimable */}
          {homePage && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Page d'accueil</h2>
              <Card className="bg-white border border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {homePage.title || 'Page sans titre'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        homePage.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {homePage.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(homePage.slug, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPage(homePage.id)}
                        className="flex items-center gap-1 bg-blue-50 border-blue-200 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bouton Ajouter une page */}
          <div className="flex justify-end">
            <Button 
              onClick={handleAddPage}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une page
            </Button>
          </div>

          {/* Pages principales */}
          {mainPages.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pages principales</h2>
              <div className="space-y-4">
                {mainPages.map((page) => (
                  <Card key={page.id} className="bg-white border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {page.title || 'Page sans titre'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            page.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {page.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(page.slug, '_blank')}
                            className="flex items-center gap-1"
                            data-testid={`button-view-${page.id}`}
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPage(page.id)}
                            className="flex items-center gap-1 bg-blue-50 border-blue-200 hover:bg-blue-100"
                            data-testid={`button-edit-${page.id}`}
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                data-testid={`button-delete-${page.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de supprimer cette page ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La page "{page.title}" sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePage(page.id)}
                                  className="bg-red-600 hover:bg-red-700"
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
                ))}
              </div>
            </div>
          )}

          {/* Pages secondaires */}
          {secondaryPages.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pages secondaires</h2>
              <div className="space-y-4">
                {secondaryPages.map((page) => (
                  <Card key={page.id} className="bg-white border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {page.title || 'Page sans titre'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            page.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {page.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(page.slug, '_blank')}
                            className="flex items-center gap-1"
                            data-testid={`button-view-${page.id}`}
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPage(page.id)}
                            className="flex items-center gap-1 bg-blue-50 border-blue-200 hover:bg-blue-100"
                            data-testid={`button-edit-${page.id}`}
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                data-testid={`button-delete-${page.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de supprimer cette page ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La page "{page.title}" sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePage(page.id)}
                                  className="bg-red-600 hover:bg-red-700"
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
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Empty state if no pages */}
        {allPages.length === 0 && (
          <Card className="bg-white border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune page créée
              </h3>
              <p className="text-gray-500 mb-6">
                Commencez par créer votre première page
              </p>
              <Button onClick={handleAddPage} className="bg-blue-600 hover:bg-blue-700">
                Créer ma première page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal d'ajout de page */}
      <AddPageModal
        isOpen={isAddPageModalOpen}
        onClose={() => setIsAddPageModalOpen(false)}
        onSuccess={(pageSlug) => {
          // Attendre un moment pour que les données soient rafraîchies puis rediriger
          setTimeout(() => {
            setLocation(`/admin-editor-page?page=${pageSlug}`);
          }, 1500);
        }}
      />
    </div>
  );
}

export default function AdminEditorPage() {
  return (
    <AdminGuard>
      <AdminEditorPageContent />
    </AdminGuard>
  );
}