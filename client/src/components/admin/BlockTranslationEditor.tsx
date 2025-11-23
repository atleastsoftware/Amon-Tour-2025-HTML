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
import { useUITranslation } from '@/hooks/useUITranslation';
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

function getFieldDisplayName(key: string, t: (key: string) => string): string {
  const simpleFields: Record<string, string> = {
    'title': t('translationEditor.fieldNames.title'),
    'subtitle': t('translationEditor.fieldNames.subtitle'),
    'description': t('translationEditor.fieldNames.description'),
    'content': t('translationEditor.fieldNames.content'),
    'cta_text': t('translationEditor.fieldNames.ctaText'),
    'title_accent': t('translationEditor.fieldNames.titleAccent'),
    'placeholder': t('translationEditor.fieldNames.placeholder'),
    'introduction': t('translationEditor.fieldNames.introduction'),
    'text': t('translationEditor.fieldNames.text'),
    'label': t('translationEditor.fieldNames.label'),
    'email_label': t('translationEditor.fieldNames.emailLabel'),
    'email': t('translationEditor.fieldNames.email'),
    'phone_label': t('translationEditor.fieldNames.phoneLabel'),
    'phone': t('translationEditor.fieldNames.phone'),
    'whatsapp_label': t('translationEditor.fieldNames.whatsappLabel'),
    'whatsapp': t('translationEditor.fieldNames.whatsapp'),
    'line_id_label': t('translationEditor.fieldNames.lineIdLabel'),
    'line_id': t('translationEditor.fieldNames.lineId'),
    'about_title': t('translationEditor.fieldNames.aboutTitle'),
    'company_brand': t('translationEditor.fieldNames.companyBrand'),
    'company_name': t('translationEditor.fieldNames.companyName'),
    'company_license': t('translationEditor.fieldNames.companyLicense'),
    'company_description': t('translationEditor.fieldNames.companyDescription'),
    'button_text': t('translationEditor.fieldNames.buttonText'),
    'privacy_text': t('translationEditor.fieldNames.privacyText'),
    'search_placeholder': t('translationEditor.fieldNames.searchPlaceholder'),
    'tags_title': t('translationEditor.fieldNames.tagsTitle'),
    'categories_title': t('translationEditor.fieldNames.categoriesTitle'),
    'all_tags_text': t('translationEditor.fieldNames.allTagsText'),
    'all_categories_text': t('translationEditor.fieldNames.allCategoriesText'),
    'pickup_title': t('translationEditor.fieldNames.pickupTitle'),
    'included_title': t('translationEditor.fieldNames.includedTitle'),
    'included_description': t('translationEditor.fieldNames.includedDescription'),
    'not_included_title': t('translationEditor.fieldNames.notIncludedTitle'),
    'not_included_description': t('translationEditor.fieldNames.notIncludedDescription'),
    'price': t('translationEditor.fieldNames.price'),
    'currency': t('translationEditor.fieldNames.currency'),
    'cycle': t('translationEditor.fieldNames.cycle'),
    'more_text': t('translationEditor.fieldNames.moreText'),
    'time': t('translationEditor.fieldNames.time'),
    'location': t('translationEditor.fieldNames.location')
  };

  if (simpleFields[key]) {
    return simpleFields[key];
  }

  const nestedIconMatch = key.match(/^icon_blocks_(\d+)_mini_icons_(\d+)_text$/);
  if (nestedIconMatch) {
    const blockIndex = parseInt(nestedIconMatch[1]) + 1;
    const iconIndex = parseInt(nestedIconMatch[2]) + 1;
    return `${t('translationEditor.fieldNames.block')} ${blockIndex} - ${t('translationEditor.fieldNames.miniIcon')} ${iconIndex}`;
  }

  const arrayMatch = key.match(/^(.+)_(\d+)_(.+)$/);
  if (arrayMatch) {
    const arrayName = arrayMatch[1];
    const index = parseInt(arrayMatch[2]) + 1;
    const fieldName = arrayMatch[3];

    const arrayNames: Record<string, string> = {
      'buttons': t('translationEditor.fieldNames.button'),
      'items': t('translationEditor.fieldNames.item'),
      'sections': t('translationEditor.fieldNames.section'),
      'icon_blocks': t('translationEditor.fieldNames.block'),
      'pricing_cards': t('translationEditor.fieldNames.pricingCard'),
      'pickup_times': t('translationEditor.fieldNames.pickupTime'),
      'mini_icons': t('translationEditor.fieldNames.miniIcon')
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
  const { t } = useUITranslation();
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
        title: t('translationEditor.saveSuccess.title'),
        description: t('translationEditor.saveSuccess.description'),
      });
    },
    onError: () => {
      toast({
        title: t('translationEditor.saveError.title'),
        description: t('translationEditor.saveError.description'),
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
            {t('translationEditor.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('translationEditor.loading')}</p>
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
            {t('translationEditor.title')}
          </CardTitle>
          <CardDescription>
            {t('translationEditor.subtitle')}
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
                  {t('translationEditor.pageBlocks', { pageName: selectedPage.pageName })}
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
                  <p className="text-sm text-muted-foreground">{t('translationEditor.noTextToTranslate')}</p>
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
                    {t('translationEditor.save')}
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fr' | 'es')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr" data-testid="tab-fr">
                      {t('translationEditor.tabs.french')}
                    </TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">
                      {t('translationEditor.tabs.spanish')}
                    </TabsTrigger>
                  </TabsList>

                  {(['fr', 'es'] as const).map(lang => (
                    <TabsContent key={lang} value={lang}>
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
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      {getFieldDisplayName(key, t)}
                                      {isManuallyEdited ? (
                                        <Badge variant="secondary" className="text-xs bg-amber-500 text-white flex items-center gap-1">
                                          <Lock className="w-3 h-3" />
                                          {t('translationEditor.badges.manuallyEdited')}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                          <Sparkles className="w-3 h-3" />
                                          {t('translationEditor.badges.auto')}
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded" style={{ whiteSpace: 'pre-line' }}>
                                    <strong>{t('translationEditor.originalText')}</strong> {enValue}
                                  </div>

                                  {isLongText ? (
                                    <Textarea
                                      value={translatedValue}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={t(`translationEditor.translationPlaceholder.${lang}`)}
                                      rows={Math.max(4, (translatedValue.match(/\n/g) || []).length + 2)}
                                      data-testid={`textarea-${lang}-${key}`}
                                    />
                                  ) : (
                                    <Input
                                      value={translatedValue}
                                      onChange={(e) => handleTranslationChange(lang, key, e.target.value)}
                                      placeholder={t(`translationEditor.translationPlaceholder.${lang}`)}
                                      data-testid={`input-${lang}-${key}`}
                                    />
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center py-12 text-muted-foreground">
                              {t('translationEditor.noTextInBlock')}
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
