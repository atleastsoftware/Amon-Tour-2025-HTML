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
import { useTranslationSection } from '@/contexts/TranslationContext';
import { queryClient } from "@/lib/queryClient";
import { FileText, Save, Lock, Sparkles, AlertCircle, EyeOff } from "lucide-react";
import { BLOCK_TYPE_LABELS } from "./BlockSelectionPopup";

function getBlockDisplayName(blockType: string): string {
  return BLOCK_TYPE_LABELS[blockType] || blockType;
}

function getSortedFieldKeys(keys: string[]): string[] {
  // Define preferred order for common fields
  const fieldOrder = [
    'title',
    'title_accent',  // Mot du titre en seconde couleur - right after title
    'subtitle',
    'description',
    'content',
    'introduction',
    'cta_text',
    'button_text',
    'placeholder',
    'search_placeholder',
  ];

  // Separate keys into ordered and unordered
  const orderedKeys: string[] = [];
  const unorderedKeys: string[] = [];

  for (const key of keys) {
    const orderIndex = fieldOrder.indexOf(key);
    if (orderIndex !== -1) {
      orderedKeys.push(key);
    } else {
      unorderedKeys.push(key);
    }
  }

  // Sort ordered keys by their position in fieldOrder
  orderedKeys.sort((a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b));

  // Return ordered keys first, then unordered keys
  return [...orderedKeys, ...unorderedKeys];
}

function getFieldDisplayName(key: string, t: any): string {
  const simpleFields: Record<string, string> = {
    'title': t?.fieldNames?.title || 'Title',
    'subtitle': t?.fieldNames?.subtitle || 'Subtitle',
    'description': t?.fieldNames?.description || 'Description',
    'content': t?.fieldNames?.content || 'Content',
    'cta_text': t?.fieldNames?.ctaText || 'CTA Text',
    'title_accent': t?.fieldNames?.titleAccent || 'Title Accent',
    'placeholder': t?.fieldNames?.placeholder || 'Placeholder',
    'introduction': t?.fieldNames?.introduction || 'Introduction',
    'text': t?.fieldNames?.text || 'Text',
    'label': t?.fieldNames?.label || 'Label',
    'email_label': t?.fieldNames?.emailLabel || 'Email Label',
    'email': t?.fieldNames?.email || 'Email',
    'phone_label': t?.fieldNames?.phoneLabel || 'Phone Label',
    'phone': t?.fieldNames?.phone || 'Phone',
    'whatsapp_label': t?.fieldNames?.whatsappLabel || 'WhatsApp Label',
    'whatsapp': t?.fieldNames?.whatsapp || 'WhatsApp',
    'line_id_label': t?.fieldNames?.lineIdLabel || 'Line ID Label',
    'line_id': t?.fieldNames?.lineId || 'Line ID',
    'about_title': t?.fieldNames?.aboutTitle || 'About Title',
    'company_brand': t?.fieldNames?.companyBrand || 'Company Brand',
    'company_name': t?.fieldNames?.companyName || 'Company Name',
    'company_license': t?.fieldNames?.companyLicense || 'Company License',
    'company_description': t?.fieldNames?.companyDescription || 'Company Description',
    'button_text': t?.fieldNames?.buttonText || 'Button Text',
    'privacy_text': t?.fieldNames?.privacyText || 'Privacy Text',
    'search_placeholder': t?.fieldNames?.searchPlaceholder || 'Search Placeholder',
    'tags_title': t?.fieldNames?.tagsTitle || 'Tags Title',
    'categories_title': t?.fieldNames?.categoriesTitle || 'Categories Title',
    'all_tags_text': t?.fieldNames?.allTagsText || 'All Tags Text',
    'all_categories_text': t?.fieldNames?.allCategoriesText || 'All Categories Text',
    'pickup_title': t?.fieldNames?.pickupTitle || 'Pickup Title',
    'included_title': t?.fieldNames?.includedTitle || 'Included Title',
    'included_description': t?.fieldNames?.includedDescription || 'Included Description',
    'not_included_title': t?.fieldNames?.notIncludedTitle || 'Not Included Title',
    'not_included_description': t?.fieldNames?.notIncludedDescription || 'Not Included Description',
    'price': t?.fieldNames?.price || 'Price',
    'currency': t?.fieldNames?.currency || 'Currency',
    'cycle': t?.fieldNames?.cycle || 'Cycle',
    'more_text': t?.fieldNames?.moreText || 'More Text',
    'time': t?.fieldNames?.time || 'Time',
    'location': t?.fieldNames?.location || 'Location'
  };

  if (simpleFields[key]) {
    return simpleFields[key];
  }

  const nestedIconMatch = key.match(/^icon_blocks_(\d+)_mini_icons_(\d+)_text$/);
  if (nestedIconMatch) {
    const blockIndex = parseInt(nestedIconMatch[1]) + 1;
    const iconIndex = parseInt(nestedIconMatch[2]) + 1;
    return `${t?.fieldNames?.block || 'Block'} ${blockIndex} - ${t?.fieldNames?.miniIcon || 'Mini Icon'} ${iconIndex}`;
  }

  const arrayMatch = key.match(/^(.+)_(\d+)_(.+)$/);
  if (arrayMatch) {
    const arrayName = arrayMatch[1];
    const index = parseInt(arrayMatch[2]) + 1;
    const fieldName = arrayMatch[3];

    const arrayNames: Record<string, string> = {
      'buttons': t?.fieldNames?.button || 'Button',
      'items': t?.fieldNames?.item || 'Item',
      'sections': t?.fieldNames?.section || 'Section',
      'icon_blocks': t?.fieldNames?.block || 'Block',
      'pricing_cards': t?.fieldNames?.pricingCard || 'Pricing Card',
      'pickup_times': t?.fieldNames?.pickupTime || 'Pickup Time',
      'mini_icons': t?.fieldNames?.miniIcon || 'Mini Icon'
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
  const t = useTranslationSection('admin');
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
        title: t?.translationEditor?.saveSuccess?.title || 'Saved',
        description: t?.translationEditor?.saveSuccess?.description || 'Translations saved successfully',
      });
    },
    onError: () => {
      toast({
        title: t?.translationEditor?.saveError?.title || 'Error',
        description: t?.translationEditor?.saveError?.description || 'Failed to save translations',
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
          <CardTitle className="flex items-center gap-2" data-testid="card-title-translation-editor">
            <FileText className="w-5 h-5" />
            {t?.translationEditor?.title || 'Block Translations Editor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-loading">{t?.translationEditor?.loading || 'Loading translations...'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="card-title-translation-editor">
            <FileText className="w-5 h-5" />
            {t?.translationEditor?.title || 'Block Translations Editor'}
          </CardTitle>
          <CardDescription data-testid="card-description-translation-editor">
            {t?.translationEditor?.subtitle || 'Manage French and Spanish translations for all page blocks'}
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
                <h3 className="text-sm font-semibold text-muted-foreground" data-testid="heading-page-blocks">
                  {(t?.translationEditor?.pageBlocks?.replace('{pageName}', selectedPage.pageName)) || `${selectedPage.pageName} - Blocks`}
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
                          {isHidden && <EyeOff className="w-3 h-3 ml-2" data-testid="icon-hidden-block" />}
                        </Button>
                      );
                    })}
                </div>
                {selectedPage.blocks.filter(block => Object.keys(block.translations.en).length > 0).length === 0 && (
                  <p className="text-sm text-muted-foreground" data-testid="text-no-translatable-text">{t?.translationEditor?.noTextToTranslate || 'No translatable text in this page'}</p>
                )}
              </div>
            )}

            {/* Translation Editor */}
            {selectedBlockId && selectedBlock && editedTranslations && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold" data-testid="heading-selected-block">{getBlockDisplayName(selectedBlock.blockType)}</h3>
                  <Button
                    onClick={handleSaveTranslations}
                    disabled={saveTranslationsMutation.isPending}
                    data-testid="button-save-block-translations"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t?.translationEditor?.save || 'Save translations'}
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fr' | 'es')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr" data-testid="tab-fr">
                      {t?.translationEditor?.tabs?.french || 'French'}
                    </TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">
                      {t?.translationEditor?.tabs?.spanish || 'Spanish'}
                    </TabsTrigger>
                  </TabsList>

                  {(['fr', 'es'] as const).map(lang => (
                    <TabsContent key={lang} value={lang} data-testid={`tab-content-${lang}`}>
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {Object.keys(editedTranslations.en).length > 0 ? (
                            getSortedFieldKeys(Object.keys(editedTranslations.en)).map((key) => {
                              const enValue = editedTranslations.en[key];
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
                                  data-testid={`field-container-${lang}-${key}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2" data-testid={`label-${lang}-${key}`}>
                                      {getFieldDisplayName(key, t)}
                                      {isManuallyEdited ? (
                                        <Badge variant="secondary" className="text-xs bg-amber-500 text-white flex items-center gap-1" data-testid={`badge-manually-edited-${lang}-${key}`}>
                                          <Lock className="w-3 h-3" />
                                          {t?.translationEditor?.badges?.manuallyEdited || 'Manually Edited'}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs flex items-center gap-1" data-testid={`badge-auto-${lang}-${key}`}>
                                          <Sparkles className="w-3 h-3" />
                                          {t?.translationEditor?.badges?.auto || 'Auto'}
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded" style={{ whiteSpace: 'pre-line' }} data-testid={`original-text-${lang}-${key}`}>
                                    <strong>{t?.translationEditor?.originalText || 'Original (English):'}</strong> {enValue}
                                  </div>

                                  {isLongText ? (
                                    <Textarea
                                      value={translatedValue}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={t?.translationEditor?.translationPlaceholder?.[lang] || (lang === 'fr' ? 'French translation...' : 'Spanish translation...')}
                                      rows={Math.max(4, (translatedValue.match(/\n/g) || []).length + 2)}
                                      data-testid={`textarea-${lang}-${key}`}
                                    />
                                  ) : (
                                    <Input
                                      value={translatedValue}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={t?.translationEditor?.translationPlaceholder?.[lang] || (lang === 'fr' ? 'French translation...' : 'Spanish translation...')}
                                      data-testid={`input-${lang}-${key}`}
                                    />
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center py-12 text-muted-foreground" data-testid="text-no-text-in-block">
                              {t?.translationEditor?.noTextInBlock || 'This block contains no translatable text'}
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
