import { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { FileText, Sparkles, AlertCircle } from "lucide-react";
import { useTranslationSection } from "@/hooks/useTranslationSection";
import type { TranslationEditorRef } from "@/pages/admin-translation";

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

interface FormTranslationEditorProps {
  onPendingCountChange?: (count: number) => void;
}

const FormTranslationEditor = forwardRef<TranslationEditorRef, FormTranslationEditorProps>(
  function FormTranslationEditor({ onPendingCountChange }, ref) {
  const { t } = useTranslationSection('admin');
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<any>(null);
  const [originalTranslations, setOriginalTranslations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fr' | 'es'>('fr');

  // Fetch all forms
  const { data: forms, isLoading } = useQuery<CustomForm[]>({
    queryKey: ['/api/admin/forms-with-translations'],
  });

  const selectedForm = forms?.find(f => f.id === selectedFormId) || null;

  // Initialize translations when form is selected
  useEffect(() => {
    if (selectedForm) {
      const translations = selectedForm.translations || { en: {}, fr: {}, es: {} };
      setEditedTranslations(translations);
      setOriginalTranslations(JSON.parse(JSON.stringify(translations)));
    }
  }, [selectedForm]);

  // Check if there are pending changes
  const hasChanges = useMemo(() => {
    if (!editedTranslations || !originalTranslations) return false;
    return JSON.stringify(editedTranslations) !== JSON.stringify(originalTranslations);
  }, [editedTranslations, originalTranslations]);

  // Notify parent of pending changes
  useEffect(() => {
    onPendingCountChange?.(hasChanges ? 1 : 0);
  }, [hasChanges, onPendingCountChange]);

  // Save function
  const saveTranslations = useCallback(async (): Promise<{ success: number; error: number }> => {
    if (!selectedFormId || !editedTranslations || !hasChanges) return { success: 0, error: 0 };
    
    try {
      await apiRequest('PUT', `/api/admin/form-translations/${selectedFormId}`, {
        translations: editedTranslations
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/forms-with-translations'] });
      setOriginalTranslations(JSON.parse(JSON.stringify(editedTranslations)));
      return { success: 1, error: 0 };
    } catch {
      return { success: 0, error: 1 };
    }
  }, [selectedFormId, editedTranslations, hasChanges]);

  // Expose save function to parent via ref
  useImperativeHandle(ref, () => ({
    save: saveTranslations,
    getPendingCount: () => hasChanges ? 1 : 0
  }), [saveTranslations, hasChanges]);

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
});

export default FormTranslationEditor;
