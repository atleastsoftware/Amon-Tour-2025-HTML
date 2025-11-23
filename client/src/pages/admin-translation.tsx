import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated } from "@/lib/auth";
import BlockTranslationEditor from "@/components/admin/BlockTranslationEditor";
import GlobalElementTranslationEditor from "@/components/admin/GlobalElementTranslationEditor";
import FormTranslationEditor from "@/components/admin/FormTranslationEditor";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminTranslation() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("blocks");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Simple header without translation context */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </div>
          <h2 className="text-lg font-semibold">Gestion des Traductions</h2>
          <div className="w-24"></div>
        </div>
      </header>

      <div className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => setLocation('/admin')}
                className="flex items-center gap-2"
                data-testid="button-back-to-admin"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  Gestion des Traductions
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gérez les traductions pour les blocs de contenu, les éléments globaux et les formulaires
                </p>
              </div>
            </div>

            {/* Translation Editor Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="blocks" data-testid="tab-page-blocks">
                    📄 Blocs de Pages
                  </TabsTrigger>
                  <TabsTrigger value="global" data-testid="tab-global-elements">
                    🌍 Éléments Globaux
                  </TabsTrigger>
                  <TabsTrigger value="forms" data-testid="tab-forms">
                    📝 Formulaires
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="blocks">
                  <BlockTranslationEditor />
                </TabsContent>

                <TabsContent value="global">
                  <GlobalElementTranslationEditor />
                </TabsContent>

                <TabsContent value="forms">
                  <FormTranslationEditor />
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}