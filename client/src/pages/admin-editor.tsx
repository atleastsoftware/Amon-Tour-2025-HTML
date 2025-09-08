import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, FormInput, ArrowLeft } from 'lucide-react';

export default function AdminEditor() {
  const [, setLocation] = useLocation();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin-appearance')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'administration
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Système de Gestion de Contenu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gérez facilement le contenu de votre site web avec nos outils d'édition professionnels
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600">Pages</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-green-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">Articles</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
              <div className="text-gray-600">Formulaires</div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* Footer info */}
        <div className="text-center mt-12 text-gray-500">
          <p>Système de gestion de contenu Amon Tour - Version 1.0</p>
        </div>
      </div>
    </div>
  );
}