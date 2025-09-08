import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function AdminEditorArticle() {
  const [, setLocation] = useLocation();

  // Articles existants (placeholder - sera remplacé par de vraies données plus tard)
  const [articles] = useState([
    // Aucun article pour le moment
  ]);

  const handleEditArticle = (articleId: string) => {
    // Logique d'édition d'article à implémenter
    alert(`Édition de l'article ${articleId} - À implémenter`);
  };

  const handleDeleteArticle = (articleId: string) => {
    // Logique de suppression à implémenter
    alert(`Suppression de l'article ${articleId} - À implémenter`);
  };

  const handleAddArticle = () => {
    // Logique d'ajout d'article à implémenter
    alert('Création d\'un nouvel article - À implémenter');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
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
            Éditeur d'Articles
          </h1>
          <p className="text-gray-600">
            Créez et gérez des articles avec des titres, texte, images personnalisés
          </p>
        </div>

        {/* Add Article Button */}
        <div className="mb-6">
          <Button 
            onClick={handleAddArticle}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un article
          </Button>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((article: any) => (
            <Card key={article.id} className="bg-white border border-gray-200 hover:border-green-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {article.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === 'Publié' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Catégorie: {article.category}</span>
                      <span>Créé le: {article.createdAt}</span>
                      <span>Modifié le: {article.lastModified}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditArticle(article.id)}
                      className="flex items-center gap-1 bg-green-50 border-green-200 hover:bg-green-100"
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
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr de supprimer cet article ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. L'article "{article.title}" sera définitivement supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteArticle(article.id)}
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

        {/* Empty state when no articles */}
        {articles.length === 0 && (
          <Card className="bg-white border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun article créé
              </h3>
              <p className="text-gray-500 mb-6">
                Commencez par créer votre premier article avec du contenu personnalisé
              </p>
              <Button onClick={handleAddArticle} className="bg-green-600 hover:bg-green-700">
                Créer mon premier article
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}