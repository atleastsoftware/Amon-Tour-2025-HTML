import { useEffect } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated } from "@/lib/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TranslationManager from "@/components/admin/TranslationManager";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminTranslation() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted/30 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
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
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  Gestion de la Traduction Automatique
                </h1>
                <p className="text-muted-foreground mt-2">
                  Configuration et contrôle de la traduction automatique basée sur la géolocalisation IP
                </p>
              </div>
            </div>

            {/* Translation Manager Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TranslationManager />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}