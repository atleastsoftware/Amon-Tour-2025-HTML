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
import { Globe, Save, FileText } from "lucide-react";

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

interface BlockTranslations {
  en: Record<string, string>;
  fr: Record<string, string>;
  es: Record<string, string>;
}

interface Block {
  id: number;
  blockType: string;
  blockOrder: number;
  title: string | null;
  isActive: boolean;
  translations: BlockTranslations;
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
          <ScrollArea className="h-[calc(100vh-16rem)]">
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
          </ScrollArea>
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
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="space-y-4 pr-4">
                      {Object.keys(editedTranslations.en).length > 0 ? (
                        Object.entries(editedTranslations.en).map(([key, enValue]) => {
                          const translatedValue = editedTranslations[lang][key] || '';
                          const isLongText = enValue.length > 100;

                          return (
                            <div key={key} className="space-y-2 p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-foreground">
                                  {key}
                                </label>
                                <Badge variant="outline" className="text-xs">
                                  {lang.toUpperCase()}
                                </Badge>
                              </div>
                              
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
  );
}
