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
import { queryClient } from "@/lib/queryClient";
import { FileText, Save, Lock, Sparkles, AlertCircle, EyeOff } from "lucide-react";
import { BLOCK_TYPE_LABELS } from "./BlockSelectionPopup";

function getBlockDisplayName(blockType: string): string {
  return BLOCK_TYPE_LABELS[blockType] || blockType;
}

function getFieldDisplayName(key: string): string {
  const simpleFields: Record<string, string> = {
    'title': 'Titre',
    'subtitle': 'Sous-titre',
    'description': 'Description',
    'content': 'Contenu',
    'cta_text': 'Texte du bouton',
    'title_accent': 'Texte en accent',
    'placeholder': 'Texte indicatif',
    'introduction': 'Introduction',
    'text': 'Texte',
    'label': 'Label',
    'email_label': 'Label email',
    'email': 'Email',
    'phone_label': 'Label téléphone',
    'phone': 'Téléphone',
    'whatsapp_label': 'Label WhatsApp',
    'whatsapp': 'WhatsApp',
    'line_id_label': 'Label LINE ID',
    'line_id': 'LINE ID',
    'about_title': 'Titre à propos',
    'company_brand': 'Marque',
    'company_name': 'Nom de société',
    'company_license': 'Licence',
    'company_description': 'Description société',
    'button_text': 'Texte du bouton',
    'privacy_text': 'Texte de confidentialité',
    'search_placeholder': 'Texte indicatif de recherche',
    'tags_title': 'Titre tags',
    'categories_title': 'Titre catégories',
    'all_tags_text': 'Texte tous les tags',
    'all_categories_text': 'Texte toutes catégories',
    'pickup_title': 'Titre ramassage',
    'included_title': 'Titre inclus',
    'included_description': 'Description inclus',
    'not_included_title': 'Titre non inclus',
    'not_included_description': 'Description non inclus',
    'price': 'Prix',
    'currency': 'Devise',
    'cycle': 'Période',
    'more_text': 'Texte plus',
    'time': 'Heure',
    'location': 'Lieu'
  };

  if (simpleFields[key]) {
    return simpleFields[key];
  }

  const nestedIconMatch = key.match(/^icon_blocks_(\d+)_mini_icons_(\d+)_text$/);
  if (nestedIconMatch) {
    const blockIndex = parseInt(nestedIconMatch[1]) + 1;
    const iconIndex = parseInt(nestedIconMatch[2]) + 1;
    return `Bloc ${blockIndex} - Mini icône ${iconIndex}`;
  }

  const arrayMatch = key.match(/^(.+)_(\d+)_(.+)$/);
  if (arrayMatch) {
    const arrayName = arrayMatch[1];
    const index = parseInt(arrayMatch[2]) + 1;
    const fieldName = arrayMatch[3];

    const arrayNames: Record<string, string> = {
      'buttons': 'Bouton',
      'items': 'Élément',
      'sections': 'Section',
      'icon_blocks': 'Bloc',
      'pricing_cards': 'Carte',
      'pickup_times': 'Horaire',
      'mini_icons': 'Mini icône'
    };

    const displayArrayName = arrayNames[arrayName] || arrayName;
    const displayFieldName = simpleFields[fieldName] || fieldName;

    return `${displayArrayName} ${index} - ${displayFieldName}`;
  }

  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface BlockTranslations {
  en: Record<string, string>;
  fr: Record<string, string>;
  es: Record<string, string>;
}

interface TranslationMeta {
  [key: string]: {
    isManuallyEdited?: boolean;
  };
}

interface Block {
  id: number;
  blockType: string;
  blockOrder: number;
  title: string | null;
  isActive: boolean;
  translations: BlockTranslations;
  translationsMeta?: {
    fr?: TranslationMeta;
    es?: TranslationMeta;
  };
}

interface Page {
  id: number;
  pageSlug: string;
  pageName: string;
  blocks: Block[];
}

export default function BlockTranslationEditor() {
  const { toast } = useToast();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<BlockTranslations | null>(null);
  const [activeTab, setActiveTab] = useState<'fr' | 'es'>('fr');

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ['/api/admin/blocks-with-translations'],
  });

  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const selectedBlock = pages
    .flatMap(page => page.blocks)
    .find(block => block.id === selectedBlockId);

  const selectedPage = pages.find(p => p.id === selectedPageId);

  useEffect(() => {
    if (selectedBlock) {
      setEditedTranslations(selectedBlock.translations);
    } else {
      setEditedTranslations(null);
    }
  }, [selectedBlock]);

  const saveTranslationsMutation = useMutation({
    mutationFn: async (data: { blockId: number; translations: BlockTranslations }) => {
      const res = await fetch(`/api/admin/block-translations/${data.blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ translations: data.translations })
      });
      if (!res.ok) throw new Error('Failed to save translations');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blocks-with-translations'] });
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
    if (!selectedBlockId || !editedTranslations) return;
    saveTranslationsMutation.mutate({
      blockId: selectedBlockId,
      translations: editedTranslations
    });
  };

  const handleTranslationChange = (lang: 'fr' | 'es', key: string, value: string) => {
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
            <FileText className="w-5 h-5" />
            Traductions des blocs de pages
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
            <FileText className="w-5 h-5" />
            Traductions des blocs de pages
          </CardTitle>
          <CardDescription>
            Sélectionnez une page puis un bloc pour modifier ses traductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Page selector */}
            <div className="flex flex-wrap gap-2">
              {pages.map(page => (
                <Button
                  key={page.id}
                  variant={selectedPageId === page.id ? "default" : "outline"}
                  onClick={() => {
                    setSelectedPageId(page.id);
                    setSelectedBlockId(null);
                  }}
                  data-testid={`button-select-page-${page.pageSlug}`}
                >
                  {page.pageName}
                </Button>
              ))}
            </div>

            {/* Block selector for selected page */}
            {selectedPage && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Blocs de la page {selectedPage.pageName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPage.blocks
                    .filter(block => Object.keys(block.translations.en).length > 0)
                    .map(block => {
                      const isSelected = block.id === selectedBlockId;
                      const isHidden = !block.isActive;
                      
                      return (
                        <Button
                          key={block.id}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setSelectedBlockId(block.id)}
                          data-testid={`button-select-block-${block.id}`}
                          className={isHidden ? 'opacity-50' : ''}
                        >
                          {getBlockDisplayName(block.blockType)}
                          {block.title && ` - ${block.title.substring(0, 20)}`}
                          {isHidden && <EyeOff className="w-3 h-3 ml-2" />}
                        </Button>
                      );
                    })}
                </div>
                {selectedPage.blocks.filter(block => Object.keys(block.translations.en).length > 0).length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun bloc avec du texte à traduire</p>
                )}
              </div>
            )}

            {/* Translation Editor */}
            {selectedBlockId && selectedBlock && editedTranslations && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{getBlockDisplayName(selectedBlock.blockType)}</h3>
                  <Button
                    onClick={handleSaveTranslations}
                    disabled={saveTranslationsMutation.isPending}
                    data-testid="button-save-block-translations"
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
                          {Object.keys(editedTranslations.en).length > 0 ? (
                            Object.entries(editedTranslations.en).map(([key, enValue]) => {
                              const translatedValue = editedTranslations[lang][key] || '';
                              const isLongText = enValue.length > 100 || enValue.includes('\n') || translatedValue.includes('\n');
                              const isManuallyEdited = selectedBlock?.translationsMeta?.[lang]?.[key]?.isManuallyEdited === true;

                              return (
                                <div 
                                  key={key} 
                                  className={`space-y-2 p-4 border rounded-lg ${
                                    isManuallyEdited 
                                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' 
                                      : 'border-border'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      {getFieldDisplayName(key)}
                                      {isManuallyEdited ? (
                                        <Badge variant="secondary" className="text-xs bg-amber-500 text-white flex items-center gap-1">
                                          <Lock className="w-3 h-3" />
                                          Édité manuellement
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                          <Sparkles className="w-3 h-3" />
                                          Auto
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded" style={{ whiteSpace: 'pre-line' }}>
                                    <strong>EN:</strong> {enValue}
                                  </div>

                                  {isLongText ? (
                                    <Textarea
                                      value={translatedValue}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={`Traduction ${lang === 'fr' ? 'française' : 'espagnole'}`}
                                      rows={Math.max(4, (translatedValue.match(/\n/g) || []).length + 2)}
                                      data-testid={`textarea-${lang}-${key}`}
                                    />
                                  ) : (
                                    <Input
                                      value={translatedValue}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={`Traduction ${lang === 'fr' ? 'française' : 'espagnole'}`}
                                      data-testid={`input-${lang}-${key}`}
                                    />
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center py-12 text-muted-foreground">
                              Aucun texte à traduire dans ce bloc
                            </p>
                          )}
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
