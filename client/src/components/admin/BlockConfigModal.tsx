import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Upload } from 'lucide-react';
import type { PageBlock } from '../../../../shared/schema';
interface BlockConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block?: PageBlock | null;
  onSave: (config: any) => void;
}

// Couleurs principales du système
const SYSTEM_COLORS = {
  primary: '#084F6E',
  secondary: '#3BA8AF',
  white: '#ffffff',
  gray: '#6b7280',
  dark: '#1f2937'
};

// Composant ColorPicker avec cases rapides + curseur personnalisé
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}
function ColorPicker({
  value,
  onChange
}: ColorPickerProps) {
  const getColorValue = (colorName: string) => {
    const {
      t
    } = useTranslation();
    return SYSTEM_COLORS[colorName as keyof typeof SYSTEM_COLORS] || colorName;
  };
  const handleQuickColorClick = (colorName: string) => {
    onChange(colorName);
  };
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexValue = e.target.value;
    // Valider que c'est un code hex valide
    if (/^#[0-9A-F]{6}$/i.test(hexValue) || hexValue === '') {
      onChange(hexValue);
    }
  };
  const currentColorValue = getColorValue(value);
  return <div className="space-y-4">
      {/* Champ de référence couleur */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("Rxe9fxe9rencecouleur", {
          defaultValue: "Rxe9fxe9rencecouleur"
        })}</Label>
        <Input type="text" value={currentColorValue} onChange={handleHexInputChange} placeholder="#ffffff" className="font-mono text-sm" title={t("Tapez le code couleur ou s\xE9lectionnez une couleur pr\xE9d\xE9finie", {
        defaultValue: "Tapez le code couleur ou s\xE9lectionnez une couleur pr\xE9d\xE9finie"
      })} />
      </div>
      
      {/* Couleurs prédéfinies du thème */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("Couleursduthxe8me", {
          defaultValue: "Couleursduthxe8me"
        })}</Label>
        <div className="flex gap-3">
          <button type="button" onClick={() => handleQuickColorClick('primary')} className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${value === 'primary' ? 'border-primary ring-2 ring-primary/30 bg-primary/10' : 'border-gray-200 hover:border-gray-300'}`} title={t("Couleur principale du th\xE8me", {
          defaultValue: "Couleur principale du th\xE8me"
        })}>
            <div className="w-6 h-6 rounded" style={{
            backgroundColor: SYSTEM_COLORS.primary
          }} />
            <span className="text-sm font-medium">{t("Couleur principale", {
              defaultValue: "Couleur principale"
            })}</span>
          </button>
          
          <button type="button" onClick={() => handleQuickColorClick('secondary')} className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all hover:scale-105 ${value === 'secondary' ? 'border-secondary ring-2 ring-secondary/30 bg-secondary/10' : 'border-gray-200 hover:border-gray-300'}`} title={t("Couleur secondaire du th\xE8me", {
          defaultValue: "Couleur secondaire du th\xE8me"
        })}>
            <div className="w-6 h-6 rounded" style={{
            backgroundColor: SYSTEM_COLORS.secondary
          }} />
            <span className="text-sm font-medium">{t("Couleur secondaire", {
              defaultValue: "Couleur secondaire"
            })}</span>
          </button>
        </div>
      </div>

      {/* Aperçu visuel avec color picker natif */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("Aperxe7u", {
          defaultValue: "Aperxe7u"
        })}</Label>
        <div className="flex items-center gap-2">
          <Input type="color" value={currentColorValue} onChange={handleCustomColorChange} className="w-12 h-8 p-0 border cursor-pointer" title={t("Sxe9lectionneurdecou", {
          defaultValue: "Sxe9lectionneurdecou"
        })} />
          <span className="text-sm text-gray-600">{t("Cliquez pour ouvrir le s\xE9lectionneur de couleur", {
            defaultValue: "Cliquez pour ouvrir le s\xE9lectionneur de couleur"
          })}</span>
        </div>
      </div>
    </div>;
}
export function BlockConfigModal({
  open,
  onOpenChange,
  block,
  onSave
}: BlockConfigModalProps) {
  const [config, setConfig] = useState<any>({});
  const [activeTab, setActiveTab] = useState('content');
  useEffect(() => {
    if (block) {
      setConfig({
        title: block.title || '',
        subtitle: block.subtitle || '',
        description: block.description || '',
        content: block.content || '',
        imageUrl: block.imageUrl || '',
        ctaText: block.ctaText || '',
        ctaUrl: block.ctaUrl || '',
        backgroundColor: block.backgroundColor || 'white',
        configuration: block.configuration || {},
        ...block.configuration
      });
    }
  }, [block]);
  const handleSave = () => {
    const {
      configuration,
      ...basicFields
    } = config;
    onSave({
      ...basicFields,
      configuration: {
        ...configuration,
        // Include all advanced configuration
        ...config
      }
    });
  };
  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleArrayAdd = (key: string, item: any) => {
    const array = config[key] || [];
    handleConfigChange(key, [...array, item]);
  };
  const handleArrayRemove = (key: string, index: number) => {
    const array = config[key] || [];
    handleConfigChange(key, array.filter((_: any, i: number) => i !== index));
  };
  const handleArrayUpdate = (key: string, index: number, item: any) => {
    const array = config[key] || [];
    const newArray = [...array];
    newArray[index] = item;
    handleConfigChange(key, newArray);
  };
  if (!block) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Configure Block:", {
            defaultValue: "Configure Block:"
          })}{block.blockType}</DialogTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{block.identifier}</Badge>
            <Badge>{block.blockType}</Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">{t("Content", {
              defaultValue: "Content"
            })}</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="actions">{t("Actions", {
              defaultValue: "Actions"
            })}</TabsTrigger>
            <TabsTrigger value="advanced">{t("Advanced", {
              defaultValue: "Advanced"
            })}</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">{t("Title", {
                  defaultValue: "Title"
                })}</Label>
                <Input id="title" value={config.title || ''} onChange={e => handleConfigChange('title', e.target.value)} placeholder={t("Blocktitle", {
                defaultValue: "Blocktitle"
              })} />
              </div>
              <div>
                <Label htmlFor="subtitle">{t("Subtitle", {
                  defaultValue: "Subtitle"
                })}</Label>
                <Input id="subtitle" value={config.subtitle || ''} onChange={e => handleConfigChange('subtitle', e.target.value)} placeholder={t("Block subtitle", {
                defaultValue: "Block subtitle"
              })} />
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t("Description:", {
                defaultValue: "Description:"
              })}</Label>
              <Textarea id="description" value={config.description || ''} onChange={e => handleConfigChange('description', e.target.value)} placeholder={t("Block description", {
              defaultValue: "Block description"
            })} rows={3} />
            </div>

            <div>
              <Label htmlFor="content">{t("Content", {
                defaultValue: "Content"
              })}</Label>
              <Textarea id="content" value={config.content || ''} onChange={e => handleConfigChange('content', e.target.value)} placeholder={t("Main content (supports HTML)", {
              defaultValue: "Main content (supports HTML)"
            })} rows={4} />
            </div>

            {/* Block-specific content fields */}
            {renderBlockSpecificContent(block.blockType, config, handleConfigChange, handleArrayAdd, handleArrayRemove, handleArrayUpdate)}
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">{t("Imageurl", {
                  defaultValue: "Imageurl"
                })}</Label>
                <div className="flex gap-2">
                  <Input id="imageUrl" value={config.imageUrl || ''} onChange={e => handleConfigChange('imageUrl', e.target.value)} placeholder="/path/to/image.jpg" />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="backgroundColor">{t("Background Color", {
                  defaultValue: "Background Color"
                })}</Label>
                <Select value={config.backgroundColor || 'white'} onValueChange={value => handleConfigChange('backgroundColor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">{t("White", {
                      defaultValue: "White"
                    })}</SelectItem>
                    <SelectItem value="gray">{t("Gray", {
                      defaultValue: "Gray"
                    })}</SelectItem>
                    <SelectItem value="primary">{t("Primary Blue", {
                      defaultValue: "Primary Blue"
                    })}</SelectItem>
                    <SelectItem value="secondary">{t("Secondary Gold", {
                      defaultValue: "Secondary Gold"
                    })}</SelectItem>
                    <SelectItem value="dark">{t("Dark", {
                      defaultValue: "Dark"
                    })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {block.blockType === 'text_image' && <div className="space-y-4">
                <div>
                  <Label>{t("Layout", {
                  defaultValue: "Layout"
                })}</Label>
                  <Select value={config.layout || 'text-left'} onValueChange={value => handleConfigChange('layout', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-left">{t("Text Left, Image Right", {
                      defaultValue: "Text Left, Image Right"
                    })}</SelectItem>
                      <SelectItem value="image-left">{t("Image Left, Text Right", {
                      defaultValue: "Image Left, Text Right"
                    })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("Couleur du texte", {
                  defaultValue: "Couleur du texte"
                })}</Label>
                  <ColorPicker value={config.textColor || 'dark'} onChange={value => handleConfigChange('textColor', value)} />
                </div>
              </div>}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctaText">{t("Call to action text", {
                  defaultValue: "Call to action text"
                })}</Label>
                <Input id="ctaText" value={config.ctaText || ''} onChange={e => handleConfigChange('ctaText', e.target.value)} placeholder={t("Learnmore", {
                defaultValue: "Learnmore"
              })} />
              </div>
              <div>
                <Label htmlFor="ctaUrl">{t("Call-to-Action URL", {
                  defaultValue: "Call-to-Action URL"
                })}</Label>
                <Input id="ctaUrl" value={config.ctaUrl || ''} onChange={e => handleConfigChange('ctaUrl', e.target.value)} placeholder="/contact" />
              </div>
            </div>

            {/* CTA Buttons for Hero blocks */}
            {(block.blockType === 'hero' || block.blockType === 'video_hero') && <div>
                <Label>{t("Ctabuttons", {
                defaultValue: "Ctabuttons"
              })}</Label>
                <div className="space-y-2">
                  {(config.ctaButtons || []).map((button: any, index: number) => <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Input value={button.text || ''} onChange={e => handleArrayUpdate('ctaButtons', index, {
                      ...button,
                      text: e.target.value
                    })} placeholder={t("Buttontext", {
                      defaultValue: "Buttontext"
                    })} />
                          <Select value={button.style || 'primary'} onValueChange={value => handleArrayUpdate('ctaButtons', index, {
                      ...button,
                      style: value
                    })}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">{t("Primary", {
                            defaultValue: "Primary"
                          })}</SelectItem>
                              <SelectItem value="secondary">{t("Secondary", {
                            defaultValue: "Secondary"
                          })}</SelectItem>
                              <SelectItem value="outline">{t("Outline", {
                            defaultValue: "Outline"
                          })}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => handleArrayRemove('ctaButtons', index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>)}
                  <Button variant="outline" onClick={() => handleArrayAdd('ctaButtons', {
                text: t("Newbutton", {
                  defaultValue: "Newbutton"
                }),
                style: 'primary',
                url: ''
              })}>
                    <Plus className="h-4 w-4 mr-2" />{t("Addbutton", {
                  defaultValue: "Addbutton"
                })}</Button>
                </div>
              </div>}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="identifier">{t("Block Identifier", {
                  defaultValue: "Block Identifier"
                })}</Label>
                <Input id="identifier" value={block.identifier} disabled className="bg-muted" />
              </div>
              <div>
                <Label htmlFor="blockOrder">{t("Blockorder", {
                  defaultValue: "Blockorder"
                })}</Label>
                <Input id="blockOrder" type="number" value={block.blockOrder} disabled className="bg-muted" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={block.isActive !== false} disabled />
              <Label htmlFor="isActive">{t("Block is active", {
                defaultValue: "Block is active"
              })}</Label>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("Raw Configuration (JSON)", {
                  defaultValue: "Raw Configuration (JSON)"
                })}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={JSON.stringify(config.configuration || {}, null, 2)} onChange={e => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleConfigChange('configuration', parsed);
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }} rows={8} className="font-mono text-xs" placeholder="{ }" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("Annuler", {
            defaultValue: "Annuler"
          })}</Button>
          <Button onClick={handleSave}>{t("Enregistrer", {
            defaultValue: "Enregistrer"
          })}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}

// Block-specific configuration components
function renderBlockSpecificContent(blockType: string, config: any, handleConfigChange: (key: string, value: any) => void, handleArrayAdd: (key: string, item: any) => void, handleArrayRemove: (key: string, index: number) => void, handleArrayUpdate: (key: string, index: number, item: any) => void) {
  switch (blockType) {
    case 'video_hero':
      return <div className="space-y-4">
          <div>
            <Label htmlFor="videoUrl">{t("Videourl", {
              defaultValue: "Videourl"
            })}</Label>
            <Input id="videoUrl" value={config.videoUrl || ''} onChange={e => handleConfigChange('videoUrl', e.target.value)} placeholder="/path/to/video.mp4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleMainColor">{t("Titre Principal", {
                defaultValue: "Titre Principal"
              })}</Label>
              <Textarea id="titleMainColor" value={config.titleMainColor || ''} onChange={e => handleConfigChange('titleMainColor', e.target.value)} placeholder={t("Titreprincipalduhxe9", {
              defaultValue: "Titreprincipalduhxe9"
            })} rows={2} />
            </div>
            <div>
              <Label htmlFor="titlePrimaryColor">{t("Couleur principale du th\xE8me", {
                defaultValue: "Couleur principale du th\xE8me"
              })}</Label>
              <ColorPicker value={config.titlePrimaryColor || 'primary'} onChange={value => handleConfigChange('titlePrimaryColor', value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleColorPart">{t("Mot du titre en seconde couleur", {
                defaultValue: "Mot du titre en seconde couleur"
              })}</Label>
              <Input id="titleColorPart" value={config.titleColorPart || ''} onChange={e => handleConfigChange('titleColorPart', e.target.value)} placeholder={t("Motxe0colorierdiffxe", {
              defaultValue: "Motxe0colorierdiffxe"
            })} />
            </div>
            <div>
              <Label htmlFor="titleAccentColor">{t("Couleur accent", {
                defaultValue: "Couleur accent"
              })}</Label>
              <ColorPicker value={config.titleAccentColor || 'secondary'} onChange={value => handleConfigChange('titleAccentColor', value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="subtitleColor">{t("Couleur du sous-titre", {
              defaultValue: "Couleur du sous-titre"
            })}</Label>
            <ColorPicker value={config.subtitleColor || 'white'} onChange={value => handleConfigChange('subtitleColor', value)} />
          </div>

          <div>
            <Label htmlFor="heroCountry">{t("Paysrxe9gion", {
              defaultValue: "Paysrxe9gion"
            })}</Label>
            <Input id="heroCountry" value={config.heroCountry || ''} onChange={e => handleConfigChange('heroCountry', e.target.value)} placeholder={t("Exinkrabi", {
            defaultValue: "Exinkrabi"
          })} />
          </div>
        </div>;
    case 'advantages':
      return <div>
          <Label>{t("Features", {
            defaultValue: "Features"
          })}</Label>
          <div className="space-y-2">
            {(config.features || []).map((feature: any, index: number) => <Card key={index}>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <Input value={feature.icon || ''} onChange={e => handleArrayUpdate('features', index, {
                  ...feature,
                  icon: e.target.value
                })} placeholder={t("Iconname", {
                  defaultValue: "Iconname"
                })} />
                    <Input value={feature.title || ''} onChange={e => handleArrayUpdate('features', index, {
                  ...feature,
                  title: e.target.value
                })} placeholder={t("Feature title", {
                  defaultValue: "Feature title"
                })} />
                    <Input value={feature.description || ''} onChange={e => handleArrayUpdate('features', index, {
                  ...feature,
                  description: e.target.value
                })} placeholder={t("Feature description", {
                  defaultValue: "Feature description"
                })} />
                    <Button variant="ghost" size="icon" onClick={() => handleArrayRemove('features', index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
            <Button variant="outline" onClick={() => handleArrayAdd('features', {
            icon: 'Users',
            title: t("Newfeature", {
              defaultValue: "Newfeature"
            }),
            description: t("Feature description", {
              defaultValue: "Feature description"
            })
          })}>
              <Plus className="h-4 w-4 mr-2" />{t("Addfeature", {
              defaultValue: "Addfeature"
            })}</Button>
          </div>
        </div>;
    case 'form':
      return <div className="space-y-4">
          <div>
            <Label htmlFor="formType">{t("Formtype", {
              defaultValue: "Formtype"
            })}</Label>
            <Select value={config.formType || 'contact'} onValueChange={value => handleConfigChange('formType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">{t("Contact Form", {
                  defaultValue: "Contact Form"
                })}</SelectItem>
                <SelectItem value="custom_tour">{t("Custom Tour Form", {
                  defaultValue: "Custom Tour Form"
                })}</SelectItem>
                <SelectItem value="newsletter">{t("Newsletter Signup", {
                  defaultValue: "Newsletter Signup"
                })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="submitText">{t("Submit Button Text", {
              defaultValue: "Submit Button Text"
            })}</Label>
            <Input id="submitText" value={config.submitText || ''} onChange={e => handleConfigChange('submitText', e.target.value)} placeholder={t("Send Message", {
            defaultValue: "Send Message"
          })} />
          </div>
        </div>;
    case 'card_grid':
      return <div className="space-y-4">
          <div>
            <Label htmlFor="displayCount">{t("Number of Cards", {
              defaultValue: "Number of Cards"
            })}</Label>
            <Input id="displayCount" type="number" value={config.displayCount || 6} onChange={e => handleConfigChange('displayCount', parseInt(e.target.value))} min="1" max="12" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="showTourNinja" checked={config.showTourNinja || false} onCheckedChange={checked => handleConfigChange('showTourNinja', checked)} />
            <Label htmlFor="showTourNinja">{t("Show Tour Ninja integration", {
              defaultValue: "Show Tour Ninja integration"
            })}</Label>
          </div>
        </div>;
    case 'testimonials':
      return <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">{t("Rating", {
                defaultValue: "Rating"
              })}</Label>
              <Input id="rating" type="number" step="0.1" min="0" max="5" value={config.rating || 5.0} onChange={e => handleConfigChange('rating', parseFloat(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="reviewCount">{t("Review Count", {
                defaultValue: "Review Count"
              })}</Label>
              <Input id="reviewCount" type="number" value={config.reviewCount || 80} onChange={e => handleConfigChange('reviewCount', parseInt(e.target.value))} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="googleReviewsWidget" checked={config.googleReviewsWidget || false} onCheckedChange={checked => handleConfigChange('googleReviewsWidget', checked)} />
            <Label htmlFor="googleReviewsWidget">{t("Show Google Reviews widget", {
              defaultValue: "Show Google Reviews widget"
            })}</Label>
          </div>
        </div>;
    default:
      return null;
  }
}