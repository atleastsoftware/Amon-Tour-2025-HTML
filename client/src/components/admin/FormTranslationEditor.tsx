import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { FileText, Save, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

interface CustomForm {
  id: number;
  name: string;
  internalName: string;
  formFields: any[];
  translations?: {
    en?: Record<string, string>;
    fr?: Record<string, string>;
    es?: Record<string, string>;
  };
  translationsMeta?: {
    fr?: Record<string, { isManuallyEdited: boolean }>;
    es?: Record<string, { isManuallyEdited: boolean }>;
  };
}

// Get human-readable field name
function getFieldDisplayName(key: string): string {
  const fieldMap: Record<string, string> = {
    'name': 'Nom du formulaire',
    'description': 'Description',
    'submit_button': 'Bouton d\'envoi',
    'success_message': 'Message de succès',
    'error_message': 'Message d\'erreur'
  };

  if (fieldMap[key]) return fieldMap[key];

  // Handle field labels/placeholders
  if (key.startsWith('field_') && key.includes('_label')) {
    const fieldIndex = key.match(/field_(\d+)/)?.[1];
    return `Champ ${fieldIndex} - Label`;
  }
  if (key.startsWith('field_') && key.includes('_placeholder')) {
    const fieldIndex = key.match(/field_(\d+)/)?.[1];
    return `Champ ${fieldIndex} - Placeholder`;
  }

  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function FormTranslationEditor() {
  const { toast } = useToast();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fr' | 'es'>('fr');

  // Fetch all forms
  const { data: forms, isLoading } = useQuery<CustomForm[]>({
    queryKey: ['/api/admin/forms-with-translations'],
  });

  const selectedForm = forms?.find(f => f.id === selectedFormId) || null;

  // Initialize translations when form is selected
  useEffect(() => {
    if (selectedForm) {
      setEditedTranslations(selectedForm.translations || { en: {}, fr: {}, es: {} });
    }
  }, [selectedForm]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFormId || !editedTranslations) return;
      
      await apiRequest('PUT', `/api/admin/form-translations/${selectedFormId}`, {
        translations: editedTranslations
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Traductions sauvegardées",
        description: "Les traductions du formulaire ont été mises à jour."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/forms-with-translations'] });
    },
    onError: (error) => {
      toast({
        title: "❌ Erreur",
        description: `Impossible de sauvegarder: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleTranslationChange = (lang: 'fr' | 'es', key: string, value: string) => {
    setEditedTranslations((prev: any) => ({
      ...prev,
      [lang]: {
        ...prev?.[lang],
        [key]: value
      }
    }));
  };

  const isManuallyEdited = (lang: 'fr' | 'es', key: string): boolean => {
    return selectedForm?.translationsMeta?.[lang]?.[key]?.isManuallyEdited || false;
  };

  const hasTranslationIssue = (lang: 'fr' | 'es', key: string): boolean => {
    const translation = editedTranslations?.[lang]?.[key] || '';
    const english = editedTranslations?.en?.[key] || '';
    
    if (!translation || translation.trim() === '') return true;
    if (translation === english) return true;
    
    return false;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Traductions des formulaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Traductions des formulaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun formulaire disponible.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Traductions des formulaires
          </CardTitle>
          <CardDescription>
            Gérez les traductions de vos formulaires personnalisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Form selector */}
            <div className="flex flex-wrap gap-2">
              {forms.map(form => (
                <Button
                  key={form.id}
                  variant={selectedFormId === form.id ? "default" : "outline"}
                  onClick={() => setSelectedFormId(form.id)}
                  data-testid={`button-select-form-${form.id}`}
                >
                  {form.name}
                </Button>
              ))}
            </div>

            {selectedForm && editedTranslations && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedForm.name}</h3>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-form-translations"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'fr' | 'es')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr" data-testid="tab-fr">
                      🇫🇷 Français
                    </TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">
                      🇪🇸 Español
                    </TabsTrigger>
                  </TabsList>

                  {(['fr', 'es'] as const).map(lang => (
                    <TabsContent key={lang} value={lang} className="space-y-4">
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {Object.entries(editedTranslations.en || {}).map(([key, enValue]) => {
                            const translation = editedTranslations[lang]?.[key] || '';
                            const isManual = isManuallyEdited(lang, key);
                            const hasIssue = hasTranslationIssue(lang, key);

                            return (
                              <div key={key} className="space-y-2 p-4 border rounded-lg">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      {getFieldDisplayName(key)}
                                      {isManual && (
                                        <Badge variant="outline" className="text-xs">
                                          <Sparkles className="w-3 h-3 mr-1" />
                                          Traduit manuellement
                                        </Badge>
                                      )}
                                      {hasIssue && (
                                        <Badge variant="destructive" className="text-xs">
                                          <AlertCircle className="w-3 h-3 mr-1" />
                                          Problème
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                    <strong>EN:</strong> {enValue as string}
                                  </div>

                                  {key.includes('description') || key.includes('message') ? (
                                    <Textarea
                                      value={translation}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={`Traduction en ${lang === 'fr' ? 'français' : 'espagnol'}`}
                                      rows={3}
                                      data-testid={`textarea-${lang}-${key}`}
                                    />
                                  ) : (
                                    <Input
                                      value={translation}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={`Traduction en ${lang === 'fr' ? 'français' : 'espagnol'}`}
                                      data-testid={`input-${lang}-${key}`}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
