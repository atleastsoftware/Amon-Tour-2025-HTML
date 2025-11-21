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
import { Globe, Save, Eye, EyeOff, Search } from "lucide-react";

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
  text_listing: "Text Listing",
  text_pricing: "Text Pricing",
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
  pageTitle: string;
  blocks: Block[];
}

export default function BlockTranslationEditor() {
  const { toast } = useToast();
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<BlockTranslations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(true);

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
    }
  });

  const handleSaveTranslations = () => {
    if (selectedBlockId && editedTranslations) {
      saveTranslationsMutation.mutate({
        blockId: selectedBlockId,
        translations: editedTranslations
      });
    }
  };

  const handleTranslationChange = (lang: 'en' | 'fr' | 'es', key: string, value: string) => {
    if (!editedTranslations) return;
    setEditedTranslations({
      ...editedTranslations,
      [lang]: {
        ...editedTranslations[lang],
        [key]: value
      }
    });
  };

  // Filter pages/blocks based on search
  const filteredPages = pages.map(page => ({
    ...page,
    blocks: page.blocks.filter(block => {
      if (!showInactive && !block.isActive) return false;
      if (!searchQuery) return true;
      
      const blockName = getBlockDisplayName(block.blockType).toLowerCase();
      const blockTitle = (block.title || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      return blockName.includes(query) || blockTitle.includes(query);
    })
  })).filter(page => page.blocks.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des traductions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Panel: Block List by Page */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Blocs par Page
          </CardTitle>
          <CardDescription>
            Sélectionne un bloc pour éditer ses traductions
          </CardDescription>
          
          {/* Search and Filter */}
          <div className="space-y-2 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un bloc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              className="w-full flex items-center gap-2"
            >
              {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showInactive ? "Masquer les blocs inactifs" : "Afficher les blocs inactifs"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-26rem)]">
            {filteredPages.map(page => (
              <div key={page.id} className="border-b">
                <div className="p-3 bg-muted/30 font-semibold text-sm sticky top-0">
                  {page.pageTitle}
                </div>
                <div className="divide-y">
                  {page.blocks.map(block => {
                    const isSelected = block.id === selectedBlockId;
                    const hasTranslations = Object.keys(block.translations.en).length > 0;
                    
                    return (
                      <button
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                          isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''
                        } ${!block.isActive ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {getBlockDisplayName(block.blockType)}
                            </div>
                            {block.title && (
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {block.title}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 items-end flex-shrink-0">
                            {!block.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Masqué
                              </Badge>
                            )}
                            {hasTranslations && (
                              <Badge variant="outline" className="text-xs">
                                {Object.keys(block.translations.en).length} textes
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel: Translation Editor */}
      <Card className="lg:col-span-2">
        {selectedBlock && editedTranslations ? (
          <>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getBlockDisplayName(selectedBlock.blockType)}
                    {!selectedBlock.isActive && (
                      <Badge variant="secondary">Masqué</Badge>
                    )}
                  </CardTitle>
                  {selectedBlock.title && (
                    <CardDescription className="mt-2">
                      {selectedBlock.title}
                    </CardDescription>
                  )}
                </div>
                <Button
                  onClick={handleSaveTranslations}
                  disabled={saveTranslationsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveTranslationsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(editedTranslations.en).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune traduction disponible pour ce bloc.</p>
                  <p className="text-sm mt-2">
                    Les traductions seront générées automatiquement lors de la modification du bloc.
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="fr" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="en">🇬🇧 Anglais</TabsTrigger>
                    <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                    <TabsTrigger value="es">🇪🇸 Espagnol</TabsTrigger>
                  </TabsList>

                  {(['en', 'fr', 'es'] as const).map(lang => (
                    <TabsContent key={lang} value={lang}>
                      <ScrollArea className="h-[calc(100vh-28rem)]">
                        <div className="space-y-4 pr-4">
                          {Object.entries(editedTranslations[lang]).map(([key, value]) => {
                            const isMultiline = typeof value === 'string' && (value.includes('\n') || value.length > 100);
                            
                            return (
                              <div key={key} className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </label>
                                {isMultiline ? (
                                  <Textarea
                                    value={value || ''}
                                    onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                    rows={4}
                                    className="font-mono text-sm"
                                    placeholder={`Traduction ${lang.toUpperCase()}...`}
                                  />
                                ) : (
                                  <Input
                                    value={value || ''}
                                    onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                    className="font-mono text-sm"
                                    placeholder={`Traduction ${lang.toUpperCase()}...`}
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
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground py-12">
              <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Sélectionne un bloc</p>
              <p className="text-sm mt-2">
                Choisis un bloc dans la liste de gauche pour éditer ses traductions
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
