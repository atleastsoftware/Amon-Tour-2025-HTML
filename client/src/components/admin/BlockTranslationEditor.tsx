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
import { Globe, Save, FileText, Lock, Sparkles, AlertCircle, EyeOff } from "lucide-react";
import { BLOCK_TYPE_LABELS } from "./BlockSelectionPopup";

function getBlockDisplayName(blockType: string): string {
  return BLOCK_TYPE_LABELS[blockType] || blockType;
}

// Map translation keys to user-friendly French field names
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

  // Handle array fields
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

  // Fetch all pages with their blocks and translations
  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ['/api/admin/blocks-with-translations'],
  });

  // Auto-select first page if none selected
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  // Find selected block
  const selectedBlock = pages
    .flatMap(page => page.blocks)
    .find(block => block.id === selectedBlockId);

  // Update edited translations when a block is selected
  useEffect(() => {
    if (selectedBlock) {
      setEditedTranslations(selectedBlock.translations);
    } else {
      setEditedTranslations(null);
    }
  }, [selectedBlock]);

  // Mutation to save translations
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
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Chargement des traductions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Tabs */}
      <Tabs 
        value={selectedPageId?.toString() || ''} 
        onValueChange={(value) => {
          setSelectedPageId(parseInt(value));
          setSelectedBlockId(null);
        }}
      >
        <TabsList className="w-full justify-start h-auto flex-wrap">
          {pages.map(page => (
            <TabsTrigger 
              key={page.id} 
              value={page.id.toString()}
              data-testid={`tab-page-${page.pageSlug}`}
              className="gap-2"
            >
              {page.pageName}
              <Badge variant="secondary" className="text-xs">
                {page.blocks.filter(block => Object.keys(block.translations.en).length > 0).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {pages.map(page => (
          <TabsContent key={page.id} value={page.id.toString()} className="space-y-4 mt-4">
            {/* Blocks Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Blocs de la page {page.pageName}
                </CardTitle>
                <CardDescription>
                  Sélectionnez un bloc pour modifier ses traductions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {page.blocks
                    .filter(block => Object.keys(block.translations.en).length > 0)
                    .map(block => {
                      const isSelected = block.id === selectedBlockId;
                      const isHidden = !block.isActive;
                      
                      return (
                        <button
                          key={block.id}
                          data-testid={`block-item-${block.id}`}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/10 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:shadow'
                          } ${isHidden ? 'opacity-50' : ''}`}
                        >
                          <div className="space-y-2">
                            <div className="font-semibold text-sm">
                              {getBlockDisplayName(block.blockType)}
                            </div>
                            {block.title && (
                              <div className="text-xs text-muted-foreground truncate">
                                {block.title}
                              </div>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                #{block.blockOrder}
                              </Badge>
                              {isHidden && (
                                <Badge variant="secondary" className="text-xs bg-gray-400 text-white flex items-center gap-1">
                                  <EyeOff className="w-3 h-3" />
                                  Masqué
                                </Badge>
                              )}
                              <Badge variant="default" className="text-xs bg-green-500">
                                {Object.keys(block.translations.en).length} champs
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
                {page.blocks.filter(block => Object.keys(block.translations.en).length > 0).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun bloc avec du texte à traduire sur cette page
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Translation Editor */}
            {selectedBlockId && selectedBlock && editedTranslations && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {getBlockDisplayName(selectedBlock.blockType)}
                      </CardTitle>
                      <CardDescription>
                        Modifier les traductions pour ce bloc
                      </CardDescription>
                    </div>
                    <Button
                      data-testid="button-save-translations"
                      onClick={handleSaveTranslations}
                      disabled={saveTranslationsMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fr' | 'es')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                      <TabsTrigger value="es">🇪🇸 Espagnol</TabsTrigger>
                    </TabsList>

                    {(['fr', 'es'] as const).map(lang => (
                      <TabsContent key={lang} value={lang}>
                        <ScrollArea className="h-[600px] pr-4">
                          <div className="space-y-4">
                            {Object.keys(editedTranslations.en).length > 0 ? (
                              Object.entries(editedTranslations.en).map(([key, enValue]) => {
                                const translatedValue = editedTranslations[lang][key] || '';
                                const isLongText = enValue.length > 100;
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
                                      <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-foreground">
                                          {getFieldDisplayName(key)}
                                        </label>
                                        {isManuallyEdited ? (
                                          <Badge variant="secondary" className="text-xs bg-amber-500 text-white flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            Modifiée manuellement
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            Auto
                                          </Badge>
                                        )}
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {lang.toUpperCase()}
                                      </Badge>
                                    </div>
                                    
                                    {key === 'description' && enValue.includes('<') ? (
                                      <>
                                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border">
                                          <strong>Anglais (source) - Aperçu HTML:</strong>
                                          <div 
                                            className="mt-2 prose prose-sm max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: enValue }}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>Modifiez le code HTML ci-dessous</span>
                                          </div>
                                          <Textarea
                                            data-testid={`input-translation-${lang}-${key}`}
                                            value={translatedValue}
                                            onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                            placeholder={`Code HTML en ${lang === 'fr' ? 'français' : 'espagnol'}...`}
                                            className="min-h-[200px] font-mono text-xs"
                                          />
                                        </div>
                                        
                                        {translatedValue && translatedValue.includes('<') && (
                                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border">
                                            <strong>Aperçu de votre traduction:</strong>
                                            <div 
                                              className="mt-2 prose prose-sm max-w-none dark:prose-invert"
                                              dangerouslySetInnerHTML={{ __html: translatedValue }}
                                            />
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border">
                                          <strong>Anglais (source):</strong>
                                          <div className="mt-1 whitespace-pre-line">{enValue}</div>
                                        </div>

                                        {isLongText ? (
                                          <Textarea
                                            data-testid={`input-translation-${lang}-${key}`}
                                            value={translatedValue}
                                            onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                            placeholder={`Traduction en ${lang === 'fr' ? 'français' : 'espagnol'}...`}
                                            className="min-h-[100px] font-mono text-sm"
                                          />
                                        ) : (
                                          <Input
                                            data-testid={`input-translation-${lang}-${key}`}
                                            value={translatedValue}
                                            onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                            placeholder={`Traduction en ${lang === 'fr' ? 'français' : 'espagnol'}...`}
                                            className="font-mono text-sm"
                                          />
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                Aucun texte à traduire dans ce bloc
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
