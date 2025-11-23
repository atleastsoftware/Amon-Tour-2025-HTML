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
import { useUITranslation } from "@/hooks/useUITranslation";

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
function getFieldDisplayName(key: string, t: (key: string, params?: any) => string): string {
  const fieldMapKeys: Record<string, string> = {
    'name': 'formTranslationEditor.fieldNames.formName',
    'description': 'formTranslationEditor.fieldNames.description',
    'submit_button': 'formTranslationEditor.fieldNames.submitButton',
    'success_message': 'formTranslationEditor.fieldNames.successMessage',
    'error_message': 'formTranslationEditor.fieldNames.errorMessage'
  };

  if (fieldMapKeys[key]) return t(fieldMapKeys[key]);

  // Handle field labels/placeholders
  if (key.startsWith('field_') && key.includes('_label')) {
    const fieldIndex = key.match(/field_(\d+)/)?.[1];
    return t('formTranslationEditor.fieldNames.fieldLabel', { number: fieldIndex });
  }
  if (key.startsWith('field_') && key.includes('_placeholder')) {
    const fieldIndex = key.match(/field_(\d+)/)?.[1];
    return t('formTranslationEditor.fieldNames.fieldPlaceholder', { number: fieldIndex });
  }

  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function FormTranslationEditor() {
  const { t } = useUITranslation();
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
        title: t("formTranslationEditor.toasts.saveSuccess.title"),
        description: t("formTranslationEditor.toasts.saveSuccess.description")
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/forms-with-translations'] });
    },
    onError: (error) => {
      toast({
        title: t("formTranslationEditor.toasts.saveError.title"),
        description: t("formTranslationEditor.toasts.saveError.description", { error }),
        variant: "destructive"
      });
    }
  });

  // Regenerate mutation
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFormId) return;
      
      await apiRequest('POST', `/api/admin/form-translations/${selectedFormId}/regenerate`, {});
    },
    onSuccess: () => {
      toast({
        title: t("formTranslationEditor.toasts.regenerateSuccess.title"),
        description: t("formTranslationEditor.toasts.regenerateSuccess.description")
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/forms-with-translations'] });
    },
    onError: (error) => {
      toast({
        title: t("formTranslationEditor.toasts.regenerateError.title"),
        description: t("formTranslationEditor.toasts.regenerateError.description", { error }),
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
            {t("formTranslationEditor.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("formTranslationEditor.loading")}</p>
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
            {t("formTranslationEditor.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("formTranslationEditor.noForms")}</p>
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
            {t("formTranslationEditor.title")}
          </CardTitle>
          <CardDescription>
            {t("formTranslationEditor.description")}
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => regenerateMutation.mutate()}
                      disabled={regenerateMutation.isPending}
                      data-testid="button-regenerate-translations"
                    >
                      {regenerateMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t("formTranslationEditor.buttons.translating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t("formTranslationEditor.buttons.regenerate")}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                      data-testid="button-save-form-translations"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t("formTranslationEditor.buttons.saving")}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t("formTranslationEditor.buttons.save")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'fr' | 'es')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr" data-testid="tab-fr">
                      {t("formTranslationEditor.tabs.french")}
                    </TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">
                      {t("formTranslationEditor.tabs.spanish")}
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
                                      {getFieldDisplayName(key, t)}
                                      {isManual && (
                                        <Badge variant="outline" className="text-xs">
                                          <Sparkles className="w-3 h-3 mr-1" />
                                          {t("formTranslationEditor.badges.manuallyTranslated")}
                                        </Badge>
                                      )}
                                      {hasIssue && (
                                        <Badge variant="destructive" className="text-xs">
                                          <AlertCircle className="w-3 h-3 mr-1" />
                                          {t("formTranslationEditor.badges.issue")}
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
                                      placeholder={t(`formTranslationEditor.placeholders.${lang === 'fr' ? 'french' : 'spanish'}`)}
                                      rows={3}
                                      data-testid={`textarea-${lang}-${key}`}
                                    />
                                  ) : (
                                    <Input
                                      value={translation}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={t(`formTranslationEditor.placeholders.${lang === 'fr' ? 'french' : 'spanish'}`)}
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
