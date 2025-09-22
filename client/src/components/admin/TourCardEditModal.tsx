import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TourCard } from "@shared/schema";
type TourCardData = TourCard;
interface TourCardEditModalProps {
  tourCard: TourCardData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: TourCardData) => void;
}
export default function TourCardEditModal({
  tourCard,
  isOpen,
  onClose,
  onSave
}: TourCardEditModalProps) {
  const {
    t: t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<TourCardData>({
    id: "",
    title: "",
    description: null,
    price: 0,
    currency: "THB",
    customLink: "",
    type: "tour",
    images: [],
    tags: null,
    createdAt: null
  });
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour le formulaire quand le tourCard change
  useEffect(() => {
    if (tourCard) {
      setFormData({
        id: tourCard.id,
        title: tourCard.title,
        description: tourCard.description || "",
        price: tourCard.price,
        currency: tourCard.currency,
        customLink: tourCard.customLink,
        type: tourCard.type,
        images: [...tourCard.images],
        tags: tourCard.tags || [],
        createdAt: tourCard.createdAt
      });
    }
  }, [tourCard]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    });
  };

  // Gestion des tags
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  const addTag = () => {
    const currentTags = formData.tags || [];
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...currentTags, tagInput.trim()]
      });
      setTagInput("");
    }
  };
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    setFormData({
      ...formData,
      tags: currentTags.filter(tag => tag !== tagToRemove)
    });
  };
  const handleSave = async () => {
    if (!formData.title) {
      toast({
        title: t('Erreur', {
          defaultValue: 'Erreur'
        }),
        description: t('Le titre est obligatoire', {
          defaultValue: 'Le titre est obligatoire'
        }),
        variant: "destructive"
      });
      return;
    }
    if (!formData.customLink) {
      toast({
        title: t('Erreur', {
          defaultValue: 'Erreur'
        }),
        description: t('Le lien personnalis\xE9 est obligatoire', {
          defaultValue: 'Le lien personnalis\xE9 est obligatoire'
        }),
        variant: "destructive"
      });
      return;
    }
    try {
      setIsLoading(true);
      const updateResponse = await fetch(`/api/tour-cards/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!updateResponse.ok) {
        throw new Error(`Failed to update tour card: ${updateResponse.statusText}`);
      }
      const updatedCard = await updateResponse.json();
      toast({
        title: t('Succ\xE8s', {
          defaultValue: 'Succ\xE8s'
        }),
        description: t('Fiche de tour mise \xE0 jour avec succ\xE8s', {
          defaultValue: 'Fiche de tour mise \xE0 jour avec succ\xE8s'
        })
      });
      onSave(updatedCard);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la fiche:", error);
      toast({
        title: t('Erreur', {
          defaultValue: 'Erreur'
        }),
        description: t('Une erreur est survenue lors de la mise \xE0 jour', {
          defaultValue: 'Une erreur est survenue lors de la mise \xE0 jour'
        }),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('Modifier la fiche de tour', {
            defaultValue: 'Modifier la fiche de tour'
          })}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="title">{t('Nom du s\xE9jour / tour *', {
              defaultValue: 'Nom du s\xE9jour / tour *'
            })}</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder={t('Ex: Bangkok Food Tour', {
            defaultValue: 'Ex: Bangkok Food Tour'
          })} required />
          </div>
          
          <div>
            <Label htmlFor="description">{t('Description', {
              defaultValue: 'Description'
            })}</Label>
            <Textarea id="description" name="description" value={formData.description || ""} onChange={handleInputChange} placeholder={t('D\xE9crivez bri\xE8vement ce tour...', {
            defaultValue: 'D\xE9crivez bri\xE8vement ce tour...'
          })} rows={3} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t('Prix \xE0 partir de *', {
                defaultValue: 'Prix \xE0 partir de *'
              })}</Label>
              <Input id="price" name="price" type="number" min={0} value={formData.price || ""} onChange={handleInputChange} placeholder={t('Ex: 1500', {
              defaultValue: 'Ex: 1500'
            })} required />
            </div>
            
            <div>
              <Label htmlFor="currency">{t('Devise', {
                defaultValue: 'Devise'
              })}</Label>
              <select id="currency" name="currency" value={formData.currency} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="THB">{t('THB', {
                  defaultValue: 'THB'
                })}</option>
                <option value="EUR">{t('EUR', {
                  defaultValue: 'EUR'
                })}</option>
                <option value="USD">{t('USD', {
                  defaultValue: 'USD'
                })}</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="type">{t('Type de fiche *', {
              defaultValue: 'Type de fiche *'
            })}</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button type="button" onClick={() => setFormData({
              ...formData,
              type: "tour"
            })} className={`p-2 border rounded-md flex flex-col items-center justify-center gap-1 ${formData.type === "tour" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"}`}>
                <span className={`font-medium ${formData.type === "tour" ? "text-primary" : "text-gray-700"}`}>{t('Tour', {
                  defaultValue: 'Tour'
                })}</span>
              </button>
              
              <button type="button" onClick={() => setFormData({
              ...formData,
              type: "experience"
            })} className={`p-2 border rounded-md flex flex-col items-center justify-center gap-1 ${formData.type === "experience" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"}`}>
                <span className={`font-medium ${formData.type === "experience" ? "text-primary" : "text-gray-700"}`}>{t('Exp\xE9rience', {
                  defaultValue: 'Exp\xE9rience'
                })}</span>
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="customLink">{t('Lien personnalis\xE9 (Tour Ninja) *', {
              defaultValue: 'Lien personnalis\xE9 (Tour Ninja) *'
            })}</Label>
            <Input id="customLink" name="customLink" value={formData.customLink} onChange={handleInputChange} placeholder={t('Ex: https://tourninja.com/tour/xxx', {
            defaultValue: 'Ex: https://tourninja.com/tour/xxx'
          })} required />
          </div>
          
          <div>
            <Label htmlFor="tags">{t('Tags de localisation', {
              defaultValue: 'Tags de localisation'
            })}</Label>
            <div className="flex items-start gap-2">
              <div className="flex-grow">
                <Input id="tagInput" value={tagInput} onChange={handleTagInputChange} onKeyDown={handleTagKeyDown} placeholder={t('Ex: Bangkok, Phuket, Koh Samui', {
                defaultValue: 'Ex: Bangkok, Phuket, Koh Samui'
              })} />
              </div>
              <Button type="button" onClick={addTag} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags && formData.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>)}
              </div>}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('Cancel', {
            defaultValue: 'Cancel'
          })}</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}