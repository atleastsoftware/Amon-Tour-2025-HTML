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
import { Globe, Save, FileText, Lock, Sparkles, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";

// Block type name mapping for display
const BLOCK_TYPE_NAMES: Record<string, string> = {
  hero: "Hero Section",
  header_page: "Header Page",
  text: "Text",
  text_section: "Text Section",
  text_image: "Text + Image",
  about_2col: "About 2 Columns",
  search_bar_tours: "Search Bar Tours",
  features_3col: "Features 3 Columns",
  testimonials: "Testimonials",
  contact: "Contact",
  contact_cards: "Contact Cards",
  contact_info: "Contact Info",
  custom_form: "Custom Form",
  form: "Form",
  cta_banner: "CTA Banner",
  cta_section: "CTA Section",
  gallery: "Gallery",
  video_section: "Video Section",
  newsletter: "Newsletter",
  pdf_download: "PDF Download",
  interests: "Interests",
  popular_experiences: "Popular Experiences",
  custom_tour_form: "Custom Tour Form",
  tour_ninja_section: "Tour Ninja Section",
  why_choose_us: "Why Choose Us",
  who_we_are: "Who We Are",
  blog_search: "Blog Search",
  text_listing: "Text + Listing",
  text_pricing: "Text + Pricing",
  text_video: "Text + Video",
  text_gallery: "Text + Gallery",
  cards_grid: "Cards Grid",
  card_grid: "Card Grid",
  search_bar: "Search Bar",
  search_module: "Search Module"
};

function getBlockDisplayName(blockType: string): string {
  return BLOCK_TYPE_NAMES[blockType] || blockType;
}

// Map translation keys to user-friendly French field names
function getFieldDisplayName(key: string): string {
  // Handle simple fields first
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

  // Check if it's a simple field
  if (simpleFields[key]) {
    return simpleFields[key];
  }

  // Handle array fields with pattern: arrayName_index_fieldName
  // Examples: 
  // - buttons_0_text → Bouton 1 - Texte
  // - items_2_label → Élément 3 - Label
  // - icon_blocks_0_title → Bloc 1 - Titre
  // - icon_blocks_1_mini_icons_2_text → Bloc 2 - Mini icône 3
  
  // Pattern for nested mini icons: icon_blocks_N_mini_icons_M_text
  const nestedIconMatch = key.match(/^icon_blocks_(\d+)_mini_icons_(\d+)_text$/);
  if (nestedIconMatch) {
    const blockIndex = parseInt(nestedIconMatch[1]) + 1;
    const iconIndex = parseInt(nestedIconMatch[2]) + 1;
    return `Bloc ${blockIndex} - Mini icône ${iconIndex}`;
  }

  // Pattern for array fields: arrayName_index_fieldName
  const arrayMatch = key.match(/^(.+)_(\d+)_(.+)$/);
  if (arrayMatch) {
    const arrayName = arrayMatch[1];
    const index = parseInt(arrayMatch[2]) + 1; // Convert to 1-based
    const fieldName = arrayMatch[3];

    // Map array names to French
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

  // Fallback: return the key as-is but make it prettier
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
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<BlockTranslations | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Fetch all pages with their blocks and translations
  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ['/api/admin/blocks-with-translations'],
  });

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

  const handleAnalyzeTranslations = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/admin/translation-analysis', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysisData(data);
      toast({
        title: "Analyse terminée",
        description: `${data.summary.total} problèmes trouvés`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser les traductions",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegenerateTranslations = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/admin/regenerate-translations', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Regeneration failed');
      const data = await res.json();
      
      toast({
        title: "Régénération terminée !",
        description: `${data.summary.translated} traductions régénérées, ${data.summary.skipped} préservées (modifiées manuellement)`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blocks-with-translations'] });
      
      // Re-analyze
      await handleAnalyzeTranslations();
    } catch (error) {
      toast({
        title: "Erreur de régénération",
        description: "Impossible de régénérer les traductions",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
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
      {/* Analysis & Tools Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Analyse des Traductions
              </CardTitle>
              <CardDescription>
                Vérifier la qualité et régénérer les traductions manquantes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAnalyzeTranslations}
                disabled={isAnalyzing}
                variant="outline"
                data-testid="button-analyze-translations"
              >
                {isAnalyzing ? "Analyse..." : "Analyser"}
              </Button>
              <Button
                onClick={handleRegenerateTranslations}
                disabled={isRegenerating || !analysisData}
                data-testid="button-regenerate-translations"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? "Régénération..." : "Régénérer les traductions"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {analysisData && (
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{analysisData.summary.total}</div>
                <div className="text-xs text-muted-foreground">Total problèmes</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analysisData.summary.empty}</div>
                <div className="text-xs text-muted-foreground">Vides</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analysisData.summary.notTranslated}</div>
                <div className="text-xs text-muted-foreground">Non traduites</div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{analysisData.summary.manuallyEdited}</div>
                <div className="text-xs text-muted-foreground">Modifiées (préservées)</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysisData.summary.canAutoFix}</div>
                <div className="text-xs text-muted-foreground">Corrigibles auto</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Editor */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel: Pages with Blocks in Accordion */}
        <Card className="col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pages et Blocs
            </CardTitle>
            <CardDescription>
              {pages.length} page{pages.length > 1 ? 's' : ''} avec blocs d'édition
            </CardDescription>
          </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
            <Accordion type="single" collapsible className="w-full">
              {pages.map(page => (
                <AccordionItem key={page.id} value={`page-${page.id}`}>
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="font-semibold">{page.pageName}</span>
                      <Badge variant="outline" className="ml-2">
                        {page.blocks.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="divide-y">
                      {page.blocks.map(block => {
                        const isSelected = block.id === selectedBlockId;
                        const hasTranslations = Object.keys(block.translations.en).length > 0;
                        
                        return (
                          <button
                            key={block.id}
                            data-testid={`block-item-${block.id}`}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                              isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm mb-1">
                                  {getBlockDisplayName(block.blockType)}
                                </div>
                                {block.title && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {block.title}
                                  </div>
                                )}
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    #{block.blockOrder}
                                  </Badge>
                                  {hasTranslations ? (
                                    <Badge variant="default" className="text-xs bg-green-500">
                                      {Object.keys(block.translations.en).length} champs
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">
                                      Aucun texte
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel: Translation Editor - Full Height */}
      <Card className="col-span-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {selectedBlock ? getBlockDisplayName(selectedBlock.blockType) : 'Traductions'}
              </CardTitle>
              {selectedBlock && (
                <CardDescription>
                  Modifier les traductions pour ce bloc
                </CardDescription>
              )}
            </div>
            {selectedBlock && editedTranslations && (
              <Button
                data-testid="button-save-translations"
                onClick={handleSaveTranslations}
                disabled={saveTranslationsMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedBlock && editedTranslations ? (
            <Tabs defaultValue="fr" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="es">Espagnol</TabsTrigger>
              </TabsList>

              {(['fr', 'es'] as const).map(lang => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
                    <div className="space-y-4 pr-4">
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
                              
                              {/* Special handling for HTML content (description field) */}
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
                                      style={{ whiteSpace: 'pre-line' }}
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
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <Globe className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <div className="text-muted-foreground">
                Sélectionnez un bloc pour modifier ses traductions
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
