import { useEffect } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ImagePlus, FileText } from "lucide-react";

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const logout = useLogout();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleLogout = () => {
    logout.mutate();
    setLocation('/');
  };

  if (authLoading) return <div className="container mx-auto p-8 text-center">Chargement...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-20 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Administration</h1>
          <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
        </div>
        
        <div className="grid gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-semibold mb-2">Générateur de fiches de Tours</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Créez facilement des fiches de tours personnalisées avec images, descriptions et prix. 
              Ces fiches seront automatiquement affichées sur le site.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5" />
                  Créer des fiches de tour
                </CardTitle>
                <CardDescription>
                  Ajoutez de nouvelles fiches avec images et détails
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Créez des fiches de tour avec titre, description, prix, et jusqu'à 3 images par fiche. 
                  Les fiches apparaîtront automatiquement sur le site.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => setLocation('/tour-card-builder')}
                >
                  Accéder au générateur de fiches
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Guide d'utilisation
                </CardTitle>
                <CardDescription>
                  Comment utiliser le générateur de fiches
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-[25px_1fr] gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">1</div>
                    <p className="text-sm">Remplissez le formulaire avec le titre, la description et le prix</p>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">2</div>
                    <p className="text-sm">Téléchargez jusqu'à 3 images pour illustrer le tour</p>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">3</div>
                    <p className="text-sm">Ajoutez un lien personnalisé (optionnel) pour rediriger vers une page spécifique</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}