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
import { Globe, Save, Menu, MessageSquare, Bell, Lock, Sparkles } from "lucide-react";

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

type ElementCategory = 'footer' | 'navigation' | 'announcement' | 'popup';

export default function GlobalElementTranslationEditor() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory>('footer');
  const [selectedFooterSection, setSelectedFooterSection] = useState<string | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<ElementTranslations | null>(null);
  const [activeTab, setActiveTab] = useState<'fr' | 'es'>('fr');

  // Fetch all global element translations
  const { data: elements, isLoading } = useQuery<GlobalElements>({
    queryKey: ['/api/admin/global-element-translations'],
  });

  // Auto-select first footer section when footer category is selected
  useEffect(() => {
    if (selectedCategory === 'footer' && elements?.footer && !selectedFooterSection) {
      const firstSection = Object.keys(elements.footer)[0];
      if (firstSection) {
        setSelectedFooterSection(firstSection);
      }
    }
  }, [selectedCategory, elements?.footer, selectedFooterSection]);

  // Find selected element data
  const selectedElementData = useMemo((): GlobalElement | null => {
    if (!elements) return null;

    if (selectedCategory === 'footer' && selectedFooterSection) {
      return elements.footer[selectedFooterSection] || null;
    } else if (selectedCategory === 'navigation') {
      // Combine all navigation menu items
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
    } else if (selectedCategory === 'announcement') {
      return elements.announcementBar;
    } else if (selectedCategory === 'popup') {
      return elements.popup;
    }
    return null;
  }, [selectedCategory, selectedFooterSection, elements]);

  // Update edited translations when element changes
  useEffect(() => {
    if (selectedElementData) {
      setEditedTranslations(selectedElementData.translations);
    } else {
      setEditedTranslations(null);
    }
  }, [selectedCategory, selectedFooterSection]);

  // Mutation to save translations
  const saveTranslationsMutation = useMutation({
    mutationFn: async () => {
      if (!editedTranslations) return;
      
      let type = '';
      let identifier = '';
      
      if (selectedCategory === 'footer' && selectedFooterSection) {
        type = 'footer';
        identifier = selectedFooterSection;
      } else if (selectedCategory === 'navigation') {
        type = 'navigationMenu';
        identifier = 'all';
      } else if (selectedCategory === 'announcement') {
        type = 'announcementBar';
        identifier = 'main';
      } else if (selectedCategory === 'popup') {
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
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Chargement des traductions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(value) => {
        setSelectedCategory(value as ElementCategory);
        setSelectedFooterSection(null);
      }}>
        <TabsList className="w-full justify-start h-auto flex-wrap">
          <TabsTrigger value="footer" data-testid="tab-footer" className="gap-2">
            <Globe className="w-4 h-4" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="navigation" data-testid="tab-navigation" className="gap-2">
            <Menu className="w-4 h-4" />
            Menu de Navigation
          </TabsTrigger>
          <TabsTrigger value="announcement" data-testid="tab-announcement" className="gap-2">
            <Bell className="w-4 h-4" />
            Barre d'Annonces
          </TabsTrigger>
          <TabsTrigger value="popup" data-testid="tab-popup" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Pop-up
          </TabsTrigger>
        </TabsList>

        {/* Footer Category Content */}
        <TabsContent value="footer" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sections du Footer</CardTitle>
              <CardDescription>
                Sélectionnez une section pour modifier ses traductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {elements?.footer && Object.keys(elements.footer).map(footerKey => (
                  <button
                    key={footerKey}
                    onClick={() => setSelectedFooterSection(footerKey)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedFooterSection === footerKey
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:shadow'
                    }`}
                    data-testid={`button-select-footer-${footerKey}`}
                  >
                    <div className="font-semibold">
                      {getFooterSectionLabel(footerKey)}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedFooterSection && selectedElementData && editedTranslations && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getFooterSectionLabel(selectedFooterSection)}
                    </CardTitle>
                    <CardDescription>
                      Gérez les traductions pour cette section
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleSaveTranslations}
                    disabled={saveTranslationsMutation.isPending}
                    data-testid="button-save-translations"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveTranslationsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fr' | 'es')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr" data-testid="tab-french">
                      🇫🇷 Français
                    </TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-spanish">
                      🇪🇸 Español
                    </TabsTrigger>
                  </TabsList>

                  {['fr', 'es'].map((lang) => (
                    <TabsContent key={lang} value={lang} className="mt-4">
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {Object.keys(selectedElementData.translations.en)
                            .filter((key) => {
                              // Filter out URL fields in useful_links section
                              if (selectedFooterSection === 'useful_links') {
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

                                <div className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                  <span className="font-medium">EN:</span> {englishValue}
                                </div>

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
        </TabsContent>

        {/* Other Categories Content */}
        {['navigation', 'announcement', 'popup'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4 mt-4">
            {selectedElementData && Object.keys(selectedElementData.translations.en).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  {category === 'popup' ? (
                    <>
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Pop-up non configuré</p>
                      <p className="text-sm text-gray-400 mt-2">Activez le pop-up dans le dashboard pour gérer ses traductions</p>
                    </>
                  ) : (
                    <>
                      <Globe className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Aucune traduction disponible</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : selectedElementData && editedTranslations ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {category === 'navigation' && "Menu de Navigation"}
                        {category === 'announcement' && "Barre d'Annonces"}
                        {category === 'popup' && "Pop-up"}
                      </CardTitle>
                      <CardDescription>
                        Gérez les traductions pour cet élément
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSaveTranslations}
                      disabled={saveTranslationsMutation.isPending}
                      data-testid="button-save-translations"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveTranslationsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fr' | 'es')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="fr" data-testid="tab-french">
                        🇫🇷 Français
                      </TabsTrigger>
                      <TabsTrigger value="es" data-testid="tab-spanish">
                        🇪🇸 Español
                      </TabsTrigger>
                    </TabsList>

                    {['fr', 'es'].map((lang) => (
                      <TabsContent key={lang} value={lang} className="mt-4">
                        <ScrollArea className="h-[600px] pr-4">
                          <div className="space-y-4">
                            {Object.keys(selectedElementData.translations.en).map((key) => {
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

                                  <div className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                    <span className="font-medium">EN:</span> {englishValue}
                                  </div>

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
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
