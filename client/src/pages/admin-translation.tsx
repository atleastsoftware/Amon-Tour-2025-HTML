import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated } from "@/lib/auth";
import BlockTranslationEditor from "@/components/admin/BlockTranslationEditor";
import GlobalElementTranslationEditor from "@/components/admin/GlobalElementTranslationEditor";
import FormTranslationEditor from "@/components/admin/FormTranslationEditor";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";

export interface TranslationEditorRef {
  save: () => Promise<{ success: number; error: number }>;
  getPendingCount: () => number;
}

export default function AdminTranslation() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("blocks");
  const { translations } = useTranslation();
  const { toast } = useToast();
  const t = translations?.admin?.translation || {};
  const common = translations?.admin?.common || {};

  // Track pending changes from each editor
  const [blocksPending, setBlocksPending] = useState(0);
  const [globalPending, setGlobalPending] = useState(0);
  const [formsPending, setFormsPending] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for triggering saves
  const blocksEditorRef = useRef<TranslationEditorRef>(null);
  const globalEditorRef = useRef<TranslationEditorRef>(null);
  const formsEditorRef = useRef<TranslationEditorRef>(null);

  const totalPending = blocksPending + globalPending + formsPending;
  const hasPendingChanges = totalPending > 0;

  const handleGlobalSave = useCallback(async () => {
    if (!hasPendingChanges) return;
    
    setIsSaving(true);
    let totalSuccess = 0;
    let totalError = 0;

    try {
      // Save from all editors that have pending changes
      if (blocksPending > 0 && blocksEditorRef.current) {
        const result = await blocksEditorRef.current.save();
        totalSuccess += result.success;
        totalError += result.error;
      }

      if (globalPending > 0 && globalEditorRef.current) {
        const result = await globalEditorRef.current.save();
        totalSuccess += result.success;
        totalError += result.error;
      }

      if (formsPending > 0 && formsEditorRef.current) {
        const result = await formsEditorRef.current.save();
        totalSuccess += result.success;
        totalError += result.error;
      }

      if (totalSuccess > 0) {
        toast({
          title: t?.saveSuccess || "Saved",
          description: `${totalSuccess} ${t?.itemsSaved || "item(s) saved successfully"}`,
        });
      }

      if (totalError > 0) {
        toast({
          title: t?.saveError || "Error",
          description: `${totalError} ${t?.itemsFailed || "item(s) failed to save"}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [hasPendingChanges, blocksPending, globalPending, formsPending, toast, t]);

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
          <p className="mt-4 text-muted-foreground">{common?.loading || "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header with back button and global save */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="flex items-center gap-2 w-fit"
                  data-testid="button-back-to-admin"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {common?.back || "Back"}
                </Button>
                <div>
                  <h1 className="text-xl sm:text-3xl font-heading font-bold text-foreground">
                    {t?.title || "Translation Management"}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                    {t?.description || "Manage translations for content blocks, global elements and forms"}
                  </p>
                </div>
              </div>

              {/* Global Save Button - Always visible in header */}
              <Button
                onClick={handleGlobalSave}
                disabled={!hasPendingChanges || isSaving}
                size="lg"
                className={`flex items-center gap-2 w-full sm:w-auto ${hasPendingChanges ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
                data-testid="button-global-save-all"
              >
                <Save className="h-5 w-5" />
                {isSaving 
                  ? (t?.saving || "Saving...") 
                  : (t?.saveAll || "Save all")}
                {hasPendingChanges && (
                  <Badge variant="secondary" className="ml-2 bg-white text-primary">
                    {totalPending}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Translation Editor Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="blocks" data-testid="tab-page-blocks" className="relative">
                    {t?.pageBlocks || "Page Blocks"}
                    {blocksPending > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
                        {blocksPending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="global" data-testid="tab-global-elements" className="relative">
                    {t?.globalElements || "Global Elements"}
                    {globalPending > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
                        {globalPending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="forms" data-testid="tab-forms" className="relative">
                    {t?.forms || "Forms"}
                    {formsPending > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
                        {formsPending}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="blocks">
                  <BlockTranslationEditor 
                    ref={blocksEditorRef}
                    onPendingCountChange={setBlocksPending}
                  />
                </TabsContent>

                <TabsContent value="global">
                  <GlobalElementTranslationEditor 
                    ref={globalEditorRef}
                    onPendingCountChange={setGlobalPending}
                  />
                </TabsContent>

                <TabsContent value="forms">
                  <FormTranslationEditor 
                    ref={formsEditorRef}
                    onPendingCountChange={setFormsPending}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
