import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Eye, FormInput } from 'lucide-react';
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

export default function AdminEditorForm() {
  const [, setLocation] = useLocation();

  // Formulaires existants (placeholder - sera remplacé par de vraies données plus tard)
  const [forms] = useState([
    // Aucun formulaire pour le moment
  ]);

  const handleEditForm = (formId: string) => {
    // Logique d'édition de formulaire à implémenter
    alert(`Édition du formulaire ${formId} - À implémenter`);
  };

  const handleDeleteForm = (formId: string) => {
    // Logique de suppression à implémenter
    alert(`Suppression du formulaire ${formId} - À implémenter`);
  };

  const handleAddForm = () => {
    // Logique d'ajout de formulaire à implémenter
    alert('Création d\'un nouveau formulaire - À implémenter');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <FormInput className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600 flex-shrink-0" />
                <span className="truncate">Éditeur de Formulaires</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Créez et gérez des formulaires personnalisés avec champs dynamiques</p>
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

        {/* Add Form Button */}
        <div className="mb-6">
          <Button 
            onClick={handleAddForm}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un formulaire
          </Button>
        </div>

        {/* Forms List */}
        <div className="space-y-4">
          {forms.map((form: any) => (
            <Card key={form.id} className="bg-white border border-gray-200 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {form.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        form.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Champs: {form.fieldsCount}</span>
                      <span>Soumissions: {form.submissionsCount}</span>
                      <span>Créé le: {form.createdAt}</span>
                      <span>Modifié le: {form.lastModified}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Aperçu du formulaire ${form.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Aperçu
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditForm(form.id)}
                      className="flex items-center gap-1 bg-orange-50 border-orange-200 hover:bg-orange-100"
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
                          <AlertDialogTitle>Êtes-vous sûr de supprimer ce formulaire ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le formulaire "{form.title}" et toutes ses soumissions seront définitivement supprimés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteForm(form.id)}
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

        {/* Empty state when no forms */}
        {forms.length === 0 && (
          <Card className="bg-white border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun formulaire créé
              </h3>
              <p className="text-gray-500 mb-6">
                Commencez par créer votre premier formulaire personnalisé avec des champs dynamiques
              </p>
              <Button onClick={handleAddForm} className="bg-orange-600 hover:bg-orange-700">
                Créer mon premier formulaire
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}