import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, FormInput, ArrowLeft, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function AdminEditor() {
  const [, setLocation] = useLocation();

  // Query to get forms count
  const { data: formsData } = useQuery({
    queryKey: ['/api/admin/custom-forms'],
    queryFn: () => fetch('/api/admin/custom-forms').then(res => res.json())
  });

  // Query to get pages count
  const { data: pagesData } = useQuery({
    queryKey: ['/api/admin/page-configurations'],
    queryFn: () => fetch('/api/admin/page-configurations').then(res => res.json())
  });

  const activeFormsCount = formsData ? formsData.filter((form: any) => form.isActive).length : 0;
  const pagesCount = pagesData ? pagesData.length : 0;

  const editorItems = [
    {
      id: 'pages',
      title: 'Éditeur de page',
      description: 'Créer, modifier, supprimer le contenu des blocs de chaque page',
      icon: FileText,
      route: '/admin-editor-page',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'articles',
      title: 'Éditeur d\'articles',
      description: 'Créer et gérer des articles avec des titres, texte, images personnalisés',
      icon: Users,
      route: '/admin-editor-article',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'forms',
      title: 'Éditeur de formulaires',
      description: 'Créer et gérer des formulaires personnalisés avec champs dynamiques',
      icon: FormInput,
      route: '/admin-editor-form',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <Edit className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 flex-shrink-0" />
                <span className="truncate">Gestion de Contenu</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Gérez facilement le contenu de votre site web avec nos outils d'édition professionnels</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin-appearance')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à Site Appearance</span>
            </Button>
          </div>
        </div>

        {/* Editor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {editorItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className={`${item.color} border-2 transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-1`}
                onClick={() => setLocation(item.route)}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 ${item.iconColor} bg-white rounded-full flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-700 leading-relaxed">
                    {item.description}
                  </CardDescription>
                  <Button 
                    className="w-full mt-6 bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(item.route);
                    }}
                  >
                    Accéder à l'éditeur
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{pagesCount}</div>
              <div className="text-gray-600 text-sm">Pages</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">0</div>
              <div className="text-gray-600 text-sm">Articles</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{activeFormsCount}</div>
              <div className="text-gray-600 text-sm">Formulaires</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}