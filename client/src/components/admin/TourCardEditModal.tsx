import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslationSection } from "@/contexts/TranslationContext";

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
  const t = useTranslationSection<any>('admin');
  const { toast } = useToast();
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    });
  };

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
        title: t.tourCard?.edit?.errors?.titleRequired || "Error",
        description: t.tourCard?.edit?.errors?.titleRequired || "Title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.customLink) {
      toast({
        title: t.tourCard?.edit?.errors?.linkRequired || "Error",
        description: t.tourCard?.edit?.errors?.linkRequired || "Custom link is required",
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
        title: t.tourCard?.edit?.success?.updated || "Success",
        description: t.tourCard?.edit?.success?.updatedDescription || "Tour card updated successfully"
      });
      
      onSave(updatedCard);
      onClose();
      
    } catch (error) {
      console.error("Error updating tour card:", error);
      toast({
        title: t.tourCard?.edit?.errors?.titleRequired || "Error",
        description: t.tourCard?.edit?.errors?.updateFailed || "An error occurred during update",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-tour-card">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">{t.tourCard?.edit?.title || "Edit Tour Card"}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="title" data-testid="label-title">{t.tourCard?.edit?.nameLabel || "Tour / stay name *"}</Label>
            <Input 
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t.tourCard?.edit?.namePlaceholder || "e.g. Bangkok Food Tour"}
              required
              data-testid="input-title"
            />
          </div>
          
          <div>
            <Label htmlFor="description" data-testid="label-description">{t.tourCard?.edit?.descriptionLabel || "Description"}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder={t.tourCard?.edit?.descriptionPlaceholder || "Briefly describe this tour..."}
              rows={3}
              data-testid="textarea-description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" data-testid="label-price">{t.tourCard?.edit?.priceLabel || "Price from *"}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                value={formData.price || ""}
                onChange={handleInputChange}
                placeholder={t.tourCard?.edit?.pricePlaceholder || "e.g. 1500"}
                required
                data-testid="input-price"
              />
            </div>
            
            <div>
              <Label htmlFor="currency" data-testid="label-currency">{t.tourCard?.edit?.currencyLabel || "Currency"}</Label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="select-currency"
              >
                <option value="THB">THB</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="type" data-testid="label-type">{t.tourCard?.edit?.typeLabel || "Card type *"}</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: "tour"})}
                className={`p-2 border rounded-md flex flex-col items-center justify-center gap-1 ${formData.type === "tour" 
                  ? "border-primary bg-primary/10" 
                  : "border-gray-200 hover:border-gray-300"}`}
                data-testid="button-type-tour"
              >
                <span className={`font-medium ${formData.type === "tour" ? "text-primary" : "text-gray-700"}`}>
                  {t.tourCard?.edit?.tour || "Tour"}
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({...formData, type: "experience"})}
                className={`p-2 border rounded-md flex flex-col items-center justify-center gap-1 ${formData.type === "experience" 
                  ? "border-primary bg-primary/10" 
                  : "border-gray-200 hover:border-gray-300"}`}
                data-testid="button-type-experience"
              >
                <span className={`font-medium ${formData.type === "experience" ? "text-primary" : "text-gray-700"}`}>
                  {t.tourCard?.edit?.experience || "Experience"}
                </span>
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="customLink" data-testid="label-custom-link">{t.tourCard?.edit?.customLinkLabel || "Custom link (Tour Ninja) *"}</Label>
            <Input
              id="customLink"
              name="customLink"
              value={formData.customLink}
              onChange={handleInputChange}
              placeholder={t.tourCard?.edit?.customLinkPlaceholder || "e.g. https://tourninja.com/tour/xxx"}
              required
              data-testid="input-custom-link"
            />
          </div>
          
          <div>
            <Label htmlFor="tags" data-testid="label-tags">{t.tourCard?.edit?.locationTagsLabel || "Location Tags"}</Label>
            <div className="flex items-start gap-2">
              <div className="flex-grow">
                <Input
                  id="tagInput"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  placeholder={t.tourCard?.edit?.locationTagsPlaceholder || "e.g. Bangkok, Phuket, Koh Samui"}
                  data-testid="input-tag"
                />
              </div>
              <Button 
                type="button" 
                onClick={addTag}
                variant="outline"
                size="icon"
                data-testid="button-add-tag"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2" data-testid="div-tags">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1" data-testid={`badge-tag-${index}`}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid={`button-remove-tag-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">{t.tourCard?.edit?.cancel || "Cancel"}</Button>
          <Button onClick={handleSave} disabled={isLoading} data-testid="button-save">
            {isLoading ? (t.tourCard?.edit?.saving || "Saving...") : (t.tourCard?.edit?.save || "Save Changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
