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

function getFieldDisplayName(key: string): string {
  const simpleFields: Record<string, string> = {
    'title': 'Titre',
    'text': 'Texte',
    'message': 'Message',
    'description': 'Description',
    'link_text': 'Texte du lien',
    'link_url': 'URL du lien',
    'cta_text': 'Texte du bouton',
    'cta_url': 'URL du bouton',
    'email': 'Email',
    'phone': 'Téléphone',
    'whatsapp': 'WhatsApp',
    'line_id': 'LINE ID',
    'address': 'Adresse',
    'email_label': 'Label email',
    'phone_label': 'Label téléphone',
    'button_text': 'Texte du bouton',
    'placeholder': 'Texte indicatif',
    'success_message': 'Message de succès',
    'error_message': "Message d'erreur",
    'name': 'Nom'
  };

  if (simpleFields[key]) {
    return simpleFields[key];
  }

  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getFooterSectionLabel(sectionKey: string): string {
  const labels: Record<string, string> = {
    'contact_info': 'Informations de contact',
    'useful_links': 'Liens utiles',
    'social_media': 'Réseaux sociaux',
    'newsletter_config': 'Configuration newsletter',
    'copyright_config': 'Configuration copyright'
  };
  return labels[sectionKey] || sectionKey;
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
        title: "Traductions sauvegardées !",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les traductions.",
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
            Traductions des éléments globaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
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
            Traductions des éléments globaux
          </CardTitle>
          <CardDescription>
            Gérez les traductions pour les éléments globaux de votre site
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
                Footer
              </Button>
              <Button
                variant={selectedElementType === 'navigation' ? "default" : "outline"}
                onClick={() => setSelectedElementType('navigation')}
                data-testid="button-select-navigation"
              >
                Menu de Navigation
              </Button>
              <Button
                variant={selectedElementType === 'announcement' ? "default" : "outline"}
                onClick={() => setSelectedElementType('announcement')}
                data-testid="button-select-announcement"
              >
                Barre d'Annonces
              </Button>
              <Button
                variant={selectedElementType === 'popup' ? "default" : "outline"}
                onClick={() => setSelectedElementType('popup')}
                data-testid="button-select-popup"
              >
                Pop-up
              </Button>
            </div>

            {/* Footer subsection selector */}
            {selectedElementType === 'footer' && elements?.footer && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Sections du Footer</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(elements.footer).map(footerKey => (
                    <Button
                      key={footerKey}
                      variant={selectedFooterSection === footerKey ? "default" : "outline"}
                      onClick={() => setSelectedFooterSection(footerKey)}
                      data-testid={`button-select-footer-${footerKey}`}
                    >
                      {getFooterSectionLabel(footerKey)}
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
                    {selectedElementType === 'footer' && selectedFooterSection && getFooterSectionLabel(selectedFooterSection)}
                    {selectedElementType === 'navigation' && "Menu de Navigation"}
                    {selectedElementType === 'announcement' && "Barre d'Annonces"}
                    {selectedElementType === 'popup' && "Pop-up"}
                  </h3>
                  <Button
                    onClick={handleSaveTranslations}
                    disabled={saveTranslationsMutation.isPending}
                    data-testid="button-save-global-translations"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fr' | 'es')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr" data-testid="tab-fr">
                      🇫🇷 Français
                    </TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">
                      🇪🇸 Español
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
                            const isLongText = englishValue && englishValue.length > 100;

                            return (
                              <div key={key} className="space-y-2 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium flex items-center gap-2">
                                    {getFieldDisplayName(key)}
                                    {isManuallyEdited ? (
                                      <Badge variant="outline" className="text-xs">
                                        <Lock className="h-3 w-3 mr-1" />
                                        Édité manuellement
                                      </Badge>
                                    ) : (
                                      translatedValue && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Sparkles className="h-3 w-3 mr-1" />
                                          Auto-traduit
                                        </Badge>
                                      )
                                    )}
                                  </label>
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                  <strong>EN:</strong> {englishValue}
                                </div>

                                {isLongText ? (
                                  <Textarea
                                    value={translatedValue}
                                    onChange={(e) => handleUpdateTranslation(lang, key, e.target.value)}
                                    placeholder={`Traduction ${lang === 'fr' ? 'française' : 'espagnole'}`}
                                    rows={4}
                                    data-testid={`textarea-${key}-${lang}`}
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    value={translatedValue}
                                    onChange={(e) => handleUpdateTranslation(lang, key, e.target.value)}
                                    placeholder={`Traduction ${lang === 'fr' ? 'française' : 'espagnole'}`}
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
                <p className="font-medium">Pop-up non configuré</p>
                <p className="text-sm mt-2">Activez le pop-up dans le dashboard pour gérer ses traductions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
