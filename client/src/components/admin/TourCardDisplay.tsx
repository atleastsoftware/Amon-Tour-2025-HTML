import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  Trash,
  Edit
} from "lucide-react";
import TourCardEditModal from "./TourCardEditModal";
import { useToast } from "@/hooks/use-toast";
import { formatTHB } from "@/lib/utils";
import { useTranslationSection } from "@/contexts/TranslationContext";

import type { TourCard } from "@shared/schema";

type TourCardData = TourCard;

interface TourCardDisplayProps {
  tourCard: TourCardData;
  onDelete?: (id: string) => void;
  onUpdate?: (updatedCard: TourCardData) => void;
}

export default function TourCardDisplay({ tourCard, onDelete, onUpdate }: TourCardDisplayProps) {
  const t = useTranslationSection<any>('admin');
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const formatPrice = (price: number, currency: string) => {
    switch (currency) {
      case "THB":
        return formatTHB(price);
      case "EUR":
        return `${price} €`;
      case "USD":
        return `$${price}`;
      default:
        return `${price} ${currency}`;
    }
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(tourCard.customLink);
      setCopied(true);
      toast({
        title: t.tourCard?.display?.linkCopied || "Link copied",
        description: t.tourCard?.display?.linkCopiedDescription || "The link has been copied to clipboard"
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: t.tourCard?.display?.copyFailed || "Copy failed",
        description: t.tourCard?.display?.copyFailedDescription || "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };
  
  const shareCard = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: tourCard.title,
          text: tourCard.description || (t.tourCard?.display?.discover?.replace('{{title}}', tourCard.title) || `Discover ${tourCard.title}`),
          url: tourCard.customLink
        });
      } else {
        await copyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      await copyLink();
    }
  };
  
  const handleDelete = () => {
    const confirmMessage = t.tourCard?.display?.deleteConfirm?.replace('{{title}}', tourCard.title) || `Are you sure you want to delete "${tourCard.title}"?`;
    if (window.confirm(confirmMessage)) {
      onDelete && onDelete(tourCard.id);
    }
  };

  const handleUpdateTourCard = (updatedCard: TourCardData) => {
    if (onUpdate) {
      onUpdate(updatedCard);
    }
  };

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full" data-testid={`card-tour-${tourCard.id}`}>
        <div className="relative aspect-video">
        {tourCard.images.length > 0 ? (
          <img 
            src={tourCard.images[0]} 
            alt={tourCard.title} 
            className="w-full h-full object-cover"
            data-testid={`img-tour-${tourCard.id}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center" data-testid="div-no-image">
            <span className="text-gray-400">{t.tourCard?.display?.noImage || "No image"}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg line-clamp-1" data-testid={`text-tour-title-${tourCard.id}`}>{tourCard.title}</h3>
          <p className="text-white/90 font-medium" data-testid={`text-tour-price-${tourCard.id}`}>
            {(t.tourCard?.display?.fromPrice?.replace('{{price}}', formatPrice(tourCard.price, tourCard.currency)) || `From ${formatPrice(tourCard.price, tourCard.currency)}`)}
          </p>
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col flex-grow">
        {tourCard.description && (
          <p className="text-gray-600 line-clamp-2 text-sm mb-4" data-testid={`text-tour-description-${tourCard.id}`}>{tourCard.description}</p>
        )}
        
        <div className="mt-auto space-y-2">
          <Button 
            className="w-full" 
            onClick={() => window.open(tourCard.customLink, '_blank')}
            data-testid={`button-book-${tourCard.id}`}
          >
            {t.tourCard?.display?.bookNow || "Book now"} <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={copyLink}
              data-testid={`button-copy-${tourCard.id}`}
            >
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? (t.tourCard?.display?.copied || "Copied") : (t.tourCard?.display?.copyLink || "Copy link")}
            </Button>
            
            <Button 
              variant="outline"
              onClick={shareCard}
              data-testid={`button-share-${tourCard.id}`}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">{t.tourCard?.display?.share || "Share"}</span>
            </Button>
            
            {onUpdate && (
              <Button 
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                data-testid={`button-edit-${tourCard.id}`}
              >
                <Edit className="h-4 w-4 text-primary" />
                <span className="sr-only">{t.tourCard?.display?.edit || "Edit"}</span>
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="outline"
                onClick={handleDelete}
                data-testid={`button-delete-${tourCard.id}`}
              >
                <Trash className="h-4 w-4 text-[hsl(var(--destructive))]" />
                <span className="sr-only">{t.tourCard?.display?.delete || "Delete"}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    
    {onUpdate && (
      <TourCardEditModal
        tourCard={tourCard}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTourCard}
      />
    )}
    </>
  );
}
