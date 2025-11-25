import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Scale, FormInput, ArrowLeft, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/lib/auth';
import { useTranslation } from '@/contexts/TranslationContext';

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { translations } = useTranslation();
  
  const adminEditor = translations?.admin?.editor || {};
  const t = {
    title: adminEditor?.title || "Content Management",
    description: adminEditor?.description || "Easily manage your website content with our professional editing tools",
    backToAppearance: adminEditor?.backToAppearance || "Back to Site Appearance",
    accessEditor: adminEditor?.accessEditor || "Access Editor",
    pages: adminEditor?.pages || "Pages",
    legalPages: adminEditor?.legalPages || "Legal Pages",
    forms: adminEditor?.forms || "Forms",
    pageEditor: {
      title: adminEditor?.pageEditor?.title || "Page Editor",
      description: adminEditor?.pageEditor?.description || "Create, edit, delete block content for each page"
    },
    legalEditor: {
      title: adminEditor?.legalEditor?.title || "Legal Notice Editor",
      description: adminEditor?.legalEditor?.description || "Create and manage legal pages (notices, T&C, privacy)"
    },
    formEditor: {
      title: adminEditor?.formEditor?.title || "Form Editor",
      description: adminEditor?.formEditor?.description || "Create and manage custom forms with dynamic fields"
    },
    loading: translations?.admin?.common?.loading || "Loading..."
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: formsData } = useQuery({
    queryKey: ['/api/admin/custom-forms'],
    queryFn: () => fetch('/api/admin/custom-forms').then(res => res.json()),
    enabled: isAuthenticated
  });

  const { data: pagesData } = useQuery({
    queryKey: ['/api/admin/page-configurations'],
    queryFn: () => fetch('/api/admin/page-configurations').then(res => res.json()),
    enabled: isAuthenticated
  });

  const activeFormsCount = formsData ? formsData.filter((form: any) => form.isActive).length : 0;
  const pagesCount = pagesData ? pagesData.length : 0;
  const legalPagesCount = pagesData ? pagesData.filter((page: any) => page.pageType === 'legal').length : 0;

  if (authLoading) {
    return <div className="container mx-auto p-8 text-center">{t.loading}</div>;
  }

  const editorItems = [
    {
      id: 'pages',
      title: t.pageEditor.title,
      description: t.pageEditor.description,
      icon: FileText,
      route: '/admin-editor-page',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'legal',
      title: t.legalEditor.title,
      description: t.legalEditor.description,
      icon: Scale,
      route: '/admin-editor-legal',
      color: 'bg-[hsl(var(--success)/0.05)] border-[hsl(var(--success)/0.2)] hover:bg-[hsl(var(--success)/0.1)]',
      iconColor: 'text-[hsl(var(--success))]'
    },
    {
      id: 'forms',
      title: t.formEditor.title,
      description: t.formEditor.description,
      icon: FormInput,
      route: '/admin-editor-form',
      color: 'bg-[hsl(var(--warning)/0.05)] border-[hsl(var(--warning)/0.2)] hover:bg-[hsl(var(--warning)/0.1)]',
      iconColor: 'text-[hsl(var(--warning))]'
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
                <Edit className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                <span className="truncate">{t.title}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">{t.description}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin-appearance')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToAppearance}</span>
            </Button>
          </div>
        </div>

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
                  <CardTitle className="text-xl font-bold text-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground leading-relaxed">
                    {item.description}
                  </CardDescription>
                  <Button 
                    className="w-full mt-6 bg-background text-foreground hover:bg-muted/50 border border-border"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(item.route);
                    }}
                  >
                    {t.accessEditor}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-sm border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{pagesCount}</div>
              <div className="text-muted-foreground text-sm">{t.pages}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[hsl(var(--success))] mb-1">{legalPagesCount}</div>
              <div className="text-muted-foreground text-sm">{t.legalPages}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[hsl(var(--warning))] mb-1">{activeFormsCount}</div>
              <div className="text-muted-foreground text-sm">{t.forms}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
