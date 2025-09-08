import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
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

export default function AdminEditorPage() {
  const [, setLocation] = useLocation();

  // Pages existantes (on peut étendre cela plus tard avec une vraie DB)
  const [pages] = useState([
    {
      id: 'home',
      title: 'Accueil',
      slug: '/',
      status: 'Publié',
      lastModified: '2025-01-08',
      type: 'Page principale'
    },
    {
      id: 'tours',
      title: 'Tours',
      slug: '/tours',
      status: 'Publié',
      lastModified: '2025-01-05',
      type: 'Page secondaire'
    },
    {
      id: 'experiences',
      title: 'Expériences',
      slug: '/experiences',
      status: 'Publié',
      lastModified: '2025-01-05',
      type: 'Page secondaire'
    },
    {
      id: 'contact',
      title: 'Contact',
      slug: '/contact',
      status: 'Publié',
      lastModified: '2025-01-03',
      type: 'Page secondaire'
    },
    {
      id: 'blog',
      title: 'Blog',
      slug: '/blog',
      status: 'Publié',
      lastModified: '2024-12-20',
      type: 'Page secondaire'
    }
  ]);

  const handleEditPage = (pageId: string) => {
    if (pageId === 'home') {
      // Pour la page d'accueil, rediriger vers l'éditeur existant
      setLocation('/admin-page-editor');
    } else {
      // Pour les autres pages, on peut implémenter plus tard
      alert(`Édition de la page ${pageId} - À implémenter`);
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (pageId === 'home') {
      alert('Impossible de supprimer la page d\'accueil');
      return;
    }
    // Logique de suppression à implémenter
    alert(`Suppression de la page ${pageId} - À implémenter`);
  };

  const handleAddPage = () => {
    // Logique d'ajout de page à implémenter
    alert('Création d\'une nouvelle page - À implémenter');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin-editor')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Éditeur de Pages
          </h1>
          <p className="text-gray-600">
            Gérez le contenu et la structure de vos pages web
          </p>
        </div>

        {/* Add Page Button */}
        <div className="mb-6">
          <Button 
            onClick={handleAddPage}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter une page
          </Button>
        </div>

        {/* Pages List */}
        <div className="space-y-4">
          {pages.map((page) => (
            <Card key={page.id} className="bg-white border border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {page.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        page.status === 'Publié' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>URL: {page.slug}</span>
                      <span>Type: {page.type}</span>
                      <span>Modifié le: {page.lastModified}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(page.slug, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPage(page.id)}
                      className="flex items-center gap-1 bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                    
                    {page.id !== 'home' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
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
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state if no pages */}
        {pages.length === 0 && (
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
    </div>
  );
}