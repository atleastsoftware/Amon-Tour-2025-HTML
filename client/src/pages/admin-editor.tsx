import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, FormInput, ArrowLeft, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
export default function AdminEditor() {
  const {
    t
  } = useTranslation();
  const [, setLocation] = useLocation();

  // Query to get forms count
  const {
    data: formsData
  } = useQuery({
    queryKey: ['/api/admin/custom-forms'],
    queryFn: () => fetch('/api/admin/custom-forms').then(res => res.json())
  });

  // Query to get pages count
  const {
    data: pagesData
  } = useQuery({
    queryKey: ['/api/admin/page-configurations'],
    queryFn: () => fetch('/api/admin/page-configurations').then(res => res.json())
  });
  const activeFormsCount = formsData ? formsData.filter((form: any) => form.isActive).length : 0;
  const pagesCount = pagesData ? pagesData.length : 0;
  const editorItems = [{
    id: 'pages',
    title: 'Éditeur de page',
    description: t("Crxe9ermodifiersuppr", {
      defaultValue: "Crxe9ermodifiersuppr"
    }),
    icon: FileText,
    route: '/admin-editor-page',
    color: 'bg-primary/5 border-primary/20 hover:bg-primary/10',
    iconColor: 'text-primary'
  }, {
    id: 'articles',
    title: 'Éditeur d\'articles',
    description: t("Crxe9eretgxe9rerdesa", {
      defaultValue: "Crxe9eretgxe9rerdesa"
    }),
    icon: Users,
    route: '/admin-editor-article',
    color: 'bg-[hsl(var(--success)/0.05)] border-[hsl(var(--success)/0.2)] hover:bg-[hsl(var(--success)/0.1)]',
    iconColor: 'text-[hsl(var(--success))]'
  }, {
    id: 'forms',
    title: 'Éditeur de formulaires',
    description: t("Crxe9eretgxe9rerdesf", {
      defaultValue: "Crxe9eretgxe9rerdesf"
    }),
    icon: FormInput,
    route: '/admin-editor-form',
    color: 'bg-[hsl(var(--warning)/0.05)] border-[hsl(var(--warning)/0.2)] hover:bg-[hsl(var(--warning)/0.1)]',
    iconColor: 'text-[hsl(var(--warning))]'
  }];
  return <div className="min-h-screen bg-muted/30 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
                <Edit className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                <span className="truncate">{t("Gestiondecontenu", {
                  defaultValue: "Gestiondecontenu"
                })}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">{t('G\xE9rez facilement le contenu de votre site web avec nos outils d\'\xE9dition professionnels', {
                defaultValue: 'G\xE9rez facilement le contenu de votre site web avec nos outils d\'\xE9dition professionnels'
              })}</p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/admin-appearance')} className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>{t("Retourxe0siteappeara", {
                defaultValue: "Retourxe0siteappeara"
              })}</span>
            </Button>
          </div>
        </div>

        {/* Editor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {editorItems.map(item => {
          const Icon = item.icon;
          return <Card key={item.id} className={`${item.color} border-2 transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-1`} onClick={() => setLocation(item.route)}>
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 ${item.iconColor} bg-white rounded-full flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground leading-relaxed">
                    {item.description}
                  </CardDescription>
                  <Button className="w-full mt-6 bg-background text-foreground hover:bg-muted/50 border border-border" onClick={e => {
                e.stopPropagation();
                setLocation(item.route);
              }}>{t('Acc\xE9der \xE0 l\'\xE9diteur', {
                  defaultValue: 'Acc\xE9der \xE0 l\'\xE9diteur'
                })}</Button>
                </CardContent>
              </Card>;
        })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-sm border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{pagesCount}</div>
              <div className="text-muted-foreground text-sm">{t("Pages", {
                defaultValue: "Pages"
              })}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[hsl(var(--success))] mb-1">0</div>
              <div className="text-muted-foreground text-sm">{t("Articles", {
                defaultValue: "Articles"
              })}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[hsl(var(--warning))] mb-1">{activeFormsCount}</div>
              <div className="text-muted-foreground text-sm">{t("Formulaires", {
                defaultValue: "Formulaires"
              })}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}