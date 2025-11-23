import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Globe, Save, Menu, MessageSquare, Bell, Lock, RefreshCw, Sparkles } from "lucide-react";

// Map translation keys to user-friendly names
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

export default function GlobalElementTranslationEditor() {
  const { toast } = useToast();
  const [selectedElement, setSelectedElement] = useState<{type: string; identifier: string} | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<ElementTranslations | null>(null);

  // Fetch all global element translations
  const { data: elements, isLoading } = useQuery<GlobalElements>({
    queryKey: ['/api/admin/global-element-translations'],
  });


  // Find selected element
  const getSelectedElementData = (): GlobalElement | null => {
    if (!selectedElement || !elements) return null;

    if (selectedElement.type === 'footer') {
      return elements.footer[selectedElement.identifier] || null;
    } else if (selectedElement.type === 'navigationMenu') {
      if (selectedElement.identifier === 'all') {
        // Combine all navigation menu items into one object
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
      } else {
        return elements.navigationMenu.find(item => item.id?.toString() === selectedElement.identifier) || null;
      }
    } else if (selectedElement.type === 'announcementBar') {
      return elements.announcementBar;
    } else if (selectedElement.type === 'popup') {
      return elements.popup;
    }
    return null;
  };

  const selectedElementData = getSelectedElementData();

  // Update edited translations when an element is selected
  useEffect(() => {
    if (selectedElementData) {
      setEditedTranslations(selectedElementData.translations);
    } else {
      setEditedTranslations(null);
    }
  }, [selectedElementData]);

  // Mutation to save translations
  const saveTranslationsMutation = useMutation({
    mutationFn: async (data: { type: string; identifier: string; translations: ElementTranslations }) => {
      const res = await fetch(`/api/admin/global-element-translations/${data.type}/${data.identifier}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ translations: data.translations })
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
    if (!selectedElement || !editedTranslations) return;
    saveTranslationsMutation.mutate({
      type: selectedElement.type,
      identifier: selectedElement.identifier,
      translations: editedTranslations
    });
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
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Chargement des traductions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!elements) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Impossible de charger les traductions des éléments globaux</p>
        </CardContent>
      </Card>
    );
  }

  // Get footer section label
  const getFooterSectionLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'contact_info': 'Informations de Contact',
      'useful_links': 'Liens Utiles',
      'newsletter_config': 'Configuration Newsletter',
      'copyright_config': 'Configuration Copyright'
    };
    return labels[key] || key;
  };

  // Filter out social_media section
  const visibleFooterSections = Object.keys(elements.footer).filter(key => key !== 'social_media');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Element Selection Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Éléments Globaux
            </CardTitle>
            <CardDescription>
              Sélectionnez un élément pour gérer ses traductions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {/* Footer Sections */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Menu className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">Footer</h3>
                  </div>
                  <div className="space-y-1 ml-6">
                    {visibleFooterSections.map((footerKey) => (
                      <Button
                        key={footerKey}
                        variant={selectedElement?.type === 'footer' && selectedElement?.identifier === footerKey ? "default" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => setSelectedElement({ type: 'footer', identifier: footerKey })}
                        data-testid={`button-select-footer-${footerKey}`}
                      >
                        {getFooterSectionLabel(footerKey)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Navigation Menu - Combined */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Menu className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold text-sm">Menu de Navigation</h3>
                  </div>
                  <div className="ml-6">
                    <Button
                      variant={selectedElement?.type === 'navigationMenu' ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedElement({ type: 'navigationMenu', identifier: 'all' })}
                      data-testid="button-select-navigation-menu"
                    >
                      Tous les éléments ({elements.navigationMenu.length})
                    </Button>
                  </div>
                </div>

                {/* Announcement Bar */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-yellow-600" />
                    <h3 className="font-semibold text-sm">Barre d'Annonces</h3>
                  </div>
                  <div className="ml-6">
                    <Button
                      variant={selectedElement?.type === 'announcementBar' ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedElement({ type: 'announcementBar', identifier: 'main' })}
                      data-testid="button-select-announcement-bar"
                    >
                      Configuration
                    </Button>
                  </div>
                </div>

                {/* Pop-up */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold text-sm">Pop-up</h3>
                  </div>
                  <div className="ml-6">
                    <Button
                      variant={selectedElement?.type === 'popup' ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedElement({ type: 'popup', identifier: 'main' })}
                      data-testid="button-select-popup"
                    >
                      Configuration
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Translation Editor */}
      <div className="lg:col-span-2">
        {!selectedElementData ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Sélectionnez un élément pour gérer ses traductions</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedElement?.type === 'footer' && getFooterSectionLabel(selectedElement.identifier)}
                    {selectedElement?.type === 'navigationMenu' && selectedElementData.name}
                    {selectedElement?.type === 'announcementBar' && "Barre d'Annonces"}
                    {selectedElement?.type === 'popup' && "Pop-up"}
                  </CardTitle>
                  <CardDescription>
                    Gérez les traductions pour cet élément
                  </CardDescription>
                </div>
                <Button
                  onClick={handleSaveTranslations}
                  disabled={saveTranslationsMutation.isPending}
                  className="gap-2"
                  data-testid="button-save-translations"
                >
                  <Save className="h-4 w-4" />
                  {saveTranslationsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr" data-testid="tab-french">
                    🇫🇷 Français
                  </TabsTrigger>
                  <TabsTrigger value="es" data-testid="tab-spanish">
                    🇪🇸 Español
                  </TabsTrigger>
                </TabsList>

                {['fr', 'es'].map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {Object.keys(selectedElementData.translations.en)
                          .filter((key) => {
                            // Filter out URL fields in useful_links section
                            if (selectedElement?.type === 'footer' && selectedElement?.identifier === 'useful_links') {
                              return !key.toLowerCase().includes('url');
                            }
                            return true;
                          })
                          .map((key) => {
                          const englishValue = selectedElementData.translations.en[key];
                          const translatedValue = editedTranslations?.[lang as 'fr' | 'es'][key] || '';
                          const isManuallyEdited = selectedElementData.translationsMeta?.[lang as 'fr' | 'es']?.[key]?.isManuallyEdited;

                          const isLongText = englishValue && englishValue.length > 100;

                          return (
                            <div key={key} className="space-y-2 p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">
                                  {getFieldDisplayName(key)}
                                </label>
                                {isManuallyEdited && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Édité manuellement
                                  </Badge>
                                )}
                                {!isManuallyEdited && translatedValue && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Auto-traduit
                                  </Badge>
                                )}
                              </div>

                              {/* English Source */}
                              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <span className="font-medium">EN:</span> {englishValue}
                              </div>

                              {/* Translation Input */}
                              {isLongText ? (
                                <Textarea
                                  value={translatedValue}
                                  onChange={(e) => handleUpdateTranslation(lang as 'fr' | 'es', key, e.target.value)}
                                  placeholder={`Traduction ${lang.toUpperCase()}`}
                                  rows={4}
                                  className="resize-none"
                                  data-testid={`textarea-${key}-${lang}`}
                                />
                              ) : (
                                <Input
                                  type="text"
                                  value={translatedValue}
                                  onChange={(e) => handleUpdateTranslation(lang as 'fr' | 'es', key, e.target.value)}
                                  placeholder={`Traduction ${lang.toUpperCase()}`}
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
