import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Globe, Save, Lock, Sparkles } from "lucide-react";
import { useUITranslation } from "@/hooks/useUITranslation";

function getFieldDisplayName(key: string, t: (key: string) => string): string {
  const simpleFieldKeys: Record<string, string> = {
    'title': 'globalElementTranslationEditor.fieldNames.title',
    'text': 'globalElementTranslationEditor.fieldNames.text',
    'message': 'globalElementTranslationEditor.fieldNames.message',
    'description': 'globalElementTranslationEditor.fieldNames.description',
    'link_text': 'globalElementTranslationEditor.fieldNames.linkText',
    'link_url': 'globalElementTranslationEditor.fieldNames.linkUrl',
    'cta_text': 'globalElementTranslationEditor.fieldNames.ctaText',
    'cta_url': 'globalElementTranslationEditor.fieldNames.ctaUrl',
    'email': 'globalElementTranslationEditor.fieldNames.email',
    'phone': 'globalElementTranslationEditor.fieldNames.phone',
    'whatsapp': 'globalElementTranslationEditor.fieldNames.whatsapp',
    'line_id': 'globalElementTranslationEditor.fieldNames.lineId',
    'address': 'globalElementTranslationEditor.fieldNames.address',
    'email_label': 'globalElementTranslationEditor.fieldNames.emailLabel',
    'phone_label': 'globalElementTranslationEditor.fieldNames.phoneLabel',
    'button_text': 'globalElementTranslationEditor.fieldNames.buttonText',
    'placeholder': 'globalElementTranslationEditor.fieldNames.placeholder',
    'success_message': 'globalElementTranslationEditor.fieldNames.successMessage',
    'error_message': 'globalElementTranslationEditor.fieldNames.errorMessage',
    'name': 'globalElementTranslationEditor.fieldNames.name'
  };

  if (simpleFieldKeys[key]) {
    return t(simpleFieldKeys[key]);
  }

  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getFooterSectionLabel(sectionKey: string, t: (key: string) => string): string {
  const labelKeys: Record<string, string> = {
    'contact_info': 'globalElementTranslationEditor.footerSections.contactInfo',
    'useful_links': 'globalElementTranslationEditor.footerSections.usefulLinks',
    'social_media': 'globalElementTranslationEditor.footerSections.socialMedia',
    'newsletter_config': 'globalElementTranslationEditor.footerSections.newsletterConfig',
    'copyright_config': 'globalElementTranslationEditor.footerSections.copyrightConfig'
  };
  return t(labelKeys[sectionKey]) || sectionKey;
}

interface ElementTranslations {
  en: Record<string, string>;
  fr: Record<string, string>;
  es: Record<string, string>;
}

interface TranslationMeta {
  [key: string]: {
    isManuallyEdited?: boolean;
  };
}

interface GlobalElement {
  section: string;
  translations: ElementTranslations;
  translationsMeta?: {
    fr?: TranslationMeta;
    es?: TranslationMeta;
  };
  id?: number;
  name?: string;
}

interface FooterSection {
  [key: string]: GlobalElement;
}

interface GlobalElements {
  footer: FooterSection;
  navigationMenu: GlobalElement[];
  announcementBar: GlobalElement;
  popup: GlobalElement;
}

type ElementType = 'footer' | 'navigation' | 'announcement' | 'popup';

export default function GlobalElementTranslationEditor() {
  const { t } = useUITranslation();
  const { toast } = useToast();
  const [selectedElementType, setSelectedElementType] = useState<ElementType | null>(null);
  const [selectedFooterSection, setSelectedFooterSection] = useState<string | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<ElementTranslations | null>(null);
  const [activeTab, setActiveTab] = useState<'fr' | 'es'>('fr');

  const { data: elements, isLoading } = useQuery<GlobalElements>({
    queryKey: ['/api/admin/global-element-translations'],
  });

  // Auto-select first footer section when footer is selected
  useEffect(() => {
    if (selectedElementType === 'footer' && elements?.footer && !selectedFooterSection) {
      const firstSection = Object.keys(elements.footer)[0];
      if (firstSection) {
        setSelectedFooterSection(firstSection);
      }
    }
  }, [selectedElementType, elements?.footer, selectedFooterSection]);

  // Find selected element data
  const selectedElementData = useMemo((): GlobalElement | null => {
    if (!elements) return null;

    if (selectedElementType === 'footer' && selectedFooterSection) {
      return elements.footer[selectedFooterSection] || null;
    } else if (selectedElementType === 'navigation') {
      const combined: GlobalElement = {
        section: 'navigation_menu',
        name: 'Menu de Navigation',
        translations: { en: {}, fr: {}, es: {} },
        translationsMeta: { fr: {}, es: {} }
      };
      
      elements.navigationMenu.forEach(item => {
        const prefix = `item_${item.id}_`;
        combined.translations.en[`${prefix}name`] = item.translations.en.name || '';
        combined.translations.fr[`${prefix}name`] = item.translations.fr.name || '';
        combined.translations.es[`${prefix}name`] = item.translations.es.name || '';
        
        if (item.translationsMeta?.fr?.name?.isManuallyEdited) {
          combined.translationsMeta!.fr![`${prefix}name`] = { isManuallyEdited: true };
        }
        if (item.translationsMeta?.es?.name?.isManuallyEdited) {
          combined.translationsMeta!.es![`${prefix}name`] = { isManuallyEdited: true };
        }
      });
      
      return combined;
    } else if (selectedElementType === 'announcement') {
      return elements.announcementBar;
    } else if (selectedElementType === 'popup') {
      return elements.popup;
    }
    return null;
  }, [selectedElementType, selectedFooterSection, elements]);

  // Update edited translations when element changes
  useEffect(() => {
    if (selectedElementData) {
      setEditedTranslations(selectedElementData.translations);
    } else {
      setEditedTranslations(null);
    }
  }, [selectedElementType, selectedFooterSection]);

  // Mutation to save translations
  const saveTranslationsMutation = useMutation({
    mutationFn: async () => {
      if (!editedTranslations) return;
      
      let type = '';
      let identifier = '';
      
      if (selectedElementType === 'footer' && selectedFooterSection) {
        type = 'footer';
        identifier = selectedFooterSection;
      } else if (selectedElementType === 'navigation') {
        type = 'navigationMenu';
        identifier = 'all';
      } else if (selectedElementType === 'announcement') {
        type = 'announcementBar';
        identifier = 'main';
      } else if (selectedElementType === 'popup') {
        type = 'popup';
        identifier = 'main';
      }
      
      const res = await fetch(`/api/admin/global-element-translations/${type}/${identifier}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ translations: editedTranslations })
      });
      if (!res.ok) throw new Error('Failed to save translations');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-element-translations'] });
      toast({
        title: t("globalElementTranslationEditor.toasts.saveSuccess.title"),
        description: t("globalElementTranslationEditor.toasts.saveSuccess.description"),
      });
    },
    onError: () => {
      toast({
        title: t("globalElementTranslationEditor.toasts.saveError.title"),
        description: t("globalElementTranslationEditor.toasts.saveError.description"),
        variant: "destructive",
      });
    },
  });

  const handleSaveTranslations = () => {
    saveTranslationsMutation.mutate();
  };

  const handleUpdateTranslation = (lang: 'fr' | 'es', key: string, value: string) => {
    if (!editedTranslations) return;
    setEditedTranslations({
      ...editedTranslations,
      [lang]: {
        ...editedTranslations[lang],
        [key]: value
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("globalElementTranslationEditor.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("globalElementTranslationEditor.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("globalElementTranslationEditor.title")}
          </CardTitle>
          <CardDescription>
            {t("globalElementTranslationEditor.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Element type selector */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedElementType === 'footer' ? "default" : "outline"}
                onClick={() => {
                  setSelectedElementType('footer');
                  setSelectedFooterSection(null);
                }}
                data-testid="button-select-footer"
              >
                {t("globalElementTranslationEditor.buttons.footer")}
              </Button>
              <Button
                variant={selectedElementType === 'navigation' ? "default" : "outline"}
                onClick={() => setSelectedElementType('navigation')}
                data-testid="button-select-navigation"
              >
                {t("globalElementTranslationEditor.buttons.navigation")}
              </Button>
              <Button
                variant={selectedElementType === 'announcement' ? "default" : "outline"}
                onClick={() => setSelectedElementType('announcement')}
                data-testid="button-select-announcement"
              >
                {t("globalElementTranslationEditor.buttons.announcement")}
              </Button>
              <Button
                variant={selectedElementType === 'popup' ? "default" : "outline"}
                onClick={() => setSelectedElementType('popup')}
                data-testid="button-select-popup"
              >
                {t("globalElementTranslationEditor.buttons.popup")}
              </Button>
            </div>

            {/* Footer subsection selector */}
            {selectedElementType === 'footer' && elements?.footer && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("globalElementTranslationEditor.footerSectionsTitle")}</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(elements.footer).map(footerKey => (
                    <Button
                      key={footerKey}
                      variant={selectedFooterSection === footerKey ? "default" : "outline"}
                      onClick={() => setSelectedFooterSection(footerKey)}
                      data-testid={`button-select-footer-${footerKey}`}
                    >
                      {getFooterSectionLabel(footerKey, t)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Translation Editor */}
            {selectedElementData && editedTranslations && Object.keys(selectedElementData.translations.en).length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {selectedElementType === 'footer' && selectedFooterSection && getFooterSectionLabel(selectedFooterSection, t)}
                    {selectedElementType === 'navigation' && t("globalElementTranslationEditor.buttons.navigation")}
                    {selectedElementType === 'announcement' && t("globalElementTranslationEditor.buttons.announcement")}
                    {selectedElementType === 'popup' && t("globalElementTranslationEditor.buttons.popup")}
                  </h3>
                  <Button
                    onClick={handleSaveTranslations}
                    disabled={saveTranslationsMutation.isPending}
                    data-testid="button-save-global-translations"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t("translation.save")}
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fr' | 'es')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr" data-testid="tab-fr">
                      {t("globalElementTranslationEditor.tabs.french")}
                    </TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">
                      {t("globalElementTranslationEditor.tabs.spanish")}
                    </TabsTrigger>
                  </TabsList>

                  {(['fr', 'es'] as const).map(lang => (
                    <TabsContent key={lang} value={lang}>
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {Object.keys(selectedElementData.translations.en)
                            .filter((key) => {
                              if (selectedFooterSection === 'useful_links') {
                                return !key.toLowerCase().includes('url');
                              }
                              return true;
                            })
                            .map((key) => {
                            const englishValue = selectedElementData.translations.en[key];
                            const translatedValue = editedTranslations?.[lang][key] || '';
                            const isManuallyEdited = selectedElementData.translationsMeta?.[lang]?.[key]?.isManuallyEdited;
                            const isLongText = (englishValue && englishValue.length > 100) || (englishValue && englishValue.includes('\n')) || translatedValue.includes('\n');

                            return (
                              <div key={key} className="space-y-2 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium flex items-center gap-2">
                                    {getFieldDisplayName(key, t)}
                                    {isManuallyEdited ? (
                                      <Badge variant="outline" className="text-xs">
                                        <Lock className="h-3 w-3 mr-1" />
                                        {t("globalElementTranslationEditor.badges.manuallyEdited")}
                                      </Badge>
                                    ) : (
                                      translatedValue && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Sparkles className="h-3 w-3 mr-1" />
                                          {t("globalElementTranslationEditor.badges.autoTranslated")}
                                        </Badge>
                                      )
                                    )}
                                  </label>
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded" style={{ whiteSpace: 'pre-line' }}>
                                  <strong>EN:</strong> {englishValue}
                                </div>

                                {isLongText ? (
                                  <Textarea
                                    value={translatedValue}
                                    onChange={(e) => handleUpdateTranslation(lang, key, e.target.value)}
                                    placeholder={t(`globalElementTranslationEditor.placeholders.${lang === 'fr' ? 'french' : 'spanish'}`)}
                                    rows={Math.max(4, (translatedValue.match(/\n/g) || []).length + 2)}
                                    data-testid={`textarea-${key}-${lang}`}
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    value={translatedValue}
                                    onChange={(e) => handleUpdateTranslation(lang, key, e.target.value)}
                                    placeholder={t(`globalElementTranslationEditor.placeholders.${lang === 'fr' ? 'french' : 'spanish'}`)}
                                    data-testid={`input-${key}-${lang}`}
                                  />
                                )}
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

            {/* Empty state for popup */}
            {selectedElementType === 'popup' && selectedElementData && Object.keys(selectedElementData.translations.en).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="font-medium">{t("globalElementTranslationEditor.emptyStates.popupNotConfigured")}</p>
                <p className="text-sm mt-2">{t("globalElementTranslationEditor.emptyStates.popupNotConfiguredDescription")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
