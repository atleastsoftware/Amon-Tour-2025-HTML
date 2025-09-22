import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
export default function AdminEditorArticle() {
  const { t } = useTranslation();
  const {
    t: t
  } = useTranslation();
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
  return <div className="min-h-screen bg-muted/30 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                <span className="truncate">{t('\xC9diteur d\'Articles', {
                  defaultValue: '\xC9diteur d\'Articles'
                })}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">{t('Cr\xE9ez et g\xE9rez des articles avec des titres, texte, images personnalis\xE9s', {
                defaultValue: 'Cr\xE9ez et g\xE9rez des articles avec des titres, texte, images personnalis\xE9s'
              })}</p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/admin-editor')} className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Retour \xE0 Gestion de Contenu', {
                defaultValue: 'Retour \xE0 Gestion de Contenu'
              })}</span>
            </Button>
          </div>
        </div>

        {/* Add Article Button */}
        <div className="mb-6">
          <Button onClick={handleAddArticle} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" />{t('Ajouter un article', {
            defaultValue: 'Ajouter un article'
          })}</Button>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((article: any) => <Card key={article.id} className="bg-background border border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {article.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${article.status === 'Publié' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {article.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{t('Cat\xE9gorie:', {
                      defaultValue: 'Cat\xE9gorie:'
                    })}{article.category}</span>
                      <span>{t('Cr\xE9\xE9 le:', {
                      defaultValue: 'Cr\xE9\xE9 le:'
                    })}{article.createdAt}</span>
                      <span>{t('Modifi\xE9 le:', {
                      defaultValue: 'Modifi\xE9 le:'
                    })}{article.lastModified}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`/blog/${article.slug}`, '_blank')} className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />{t('Voir', {
                    defaultValue: 'Voir'
                  })}</Button>
                    
                    <Button variant="outline" size="sm" onClick={() => handleEditArticle(article.id)} className="flex items-center gap-1 bg-primary/5 border-primary/20 hover:bg-primary/10">
                      <Edit className="h-4 w-4" />{t('Modifier', {
                    defaultValue: 'Modifier'
                  })}</Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />{t('Supprimer', {
                        defaultValue: 'Supprimer'
                      })}</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr de supprimer cet article ?</AlertDialogTitle>
                          <AlertDialogDescription>{t('Cette action est irr\xE9versible. L\'article "', {
                          defaultValue: 'Cette action est irr\xE9versible. L\'article "'
                        })}{article.title}" sera définitivement supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('Annuler', {
                          defaultValue: 'Annuler'
                        })}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteArticle(article.id)} className="bg-red-600 hover:bg-red-700">{t('Supprimer', {
                          defaultValue: 'Supprimer'
                        })}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Empty state when no articles */}
        {articles.length === 0 && <Card className="bg-white border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('Aucun article cr\xE9\xE9', {
              defaultValue: 'Aucun article cr\xE9\xE9'
            })}</h3>
              <p className="text-gray-500 mb-6">{t('Commencez par cr\xE9er votre premier article avec du contenu personnalis\xE9', {
              defaultValue: 'Commencez par cr\xE9er votre premier article avec du contenu personnalis\xE9'
            })}</p>
              <Button onClick={handleAddArticle} className="bg-green-600 hover:bg-green-700">{t('Cr\xE9er mon premier article', {
              defaultValue: 'Cr\xE9er mon premier article'
            })}</Button>
            </CardContent>
          </Card>}
      </div>
    </div>;
}