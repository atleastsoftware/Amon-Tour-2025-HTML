import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, Share2, Trash, Edit } from "lucide-react";
import TourCardEditModal from "./TourCardEditModal";
import { useToast } from "@/hooks/use-toast";
import { formatTHB } from "@/lib/utils";
import type { TourCard } from "@shared/schema";
type TourCardData = TourCard;
interface TourCardDisplayProps {
  tourCard: TourCardData;
  onDelete?: (id: string) => void;
  onUpdate?: (updatedCard: TourCardData) => void;
}
export default function TourCardDisplay({
  tourCard,
  onDelete,
  onUpdate
}: TourCardDisplayProps) {
  const {
    t: t
  } = useTranslation();
  const {
    toast
  } = useToast();
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
      // In a real app, this would be the shareable link to the tour card page
      // For now, we'll just copy the custom link
      await navigator.clipboard.writeText(tourCard.customLink);
      setCopied(true);
      toast({
        title: t("Liencopixe9", {
          defaultValue: "Liencopixe9"
        }),
        description: t("Lelienaxe9txe9copixe", {
          defaultValue: "Lelienaxe9txe9copixe"
        })
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Impossibledecopierle", {
          defaultValue: "Impossibledecopierle"
        }),
        variant: "destructive"
      });
    }
  };
  const shareCard = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: tourCard.title,
          text: tourCard.description || `Découvrez ${tourCard.title}`,
          url: tourCard.customLink
        });
      } else {
        await copyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // If sharing fails, fallback to copying link
      await copyLink();
    }
  };
  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la fiche "${tourCard.title}" ?`)) {
      onDelete && onDelete(tourCard.id);
    }
  };
  const handleUpdateTourCard = (updatedCard: TourCardData) => {
    if (onUpdate) {
      onUpdate(updatedCard);
    }
  };
  return <>
      <Card className="overflow-hidden flex flex-col h-full">
        <div className="relative aspect-video">
        {tourCard.images.length > 0 ? <img src={tourCard.images[0]} alt={tourCard.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">{t("Aucuneimage", {
              defaultValue: "Aucuneimage"
            })}</span>
          </div>}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg line-clamp-1">{tourCard.title}</h3>
          <p className="text-white/90 font-medium">
            À partir de {formatPrice(tourCard.price, tourCard.currency)}/pers.
          </p>
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col flex-grow">
        {tourCard.description && <p className="text-gray-600 line-clamp-2 text-sm mb-4">{tourCard.description}</p>}
        
        <div className="mt-auto space-y-2">
          <Button className="w-full" onClick={() => window.open(tourCard.customLink, '_blank')}>{t("Booknow", {
              defaultValue: "Booknow"
            })}<ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={copyLink}>
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? "Copié" : "Copier le lien"}
            </Button>
            
            <Button variant="outline" onClick={shareCard}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">{t("Partager", {
                  defaultValue: "Partager"
                })}</span>
            </Button>
            
            {/* Bouton d'édition */}
            {onUpdate && <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="h-4 w-4 text-primary" />
                <span className="sr-only">{t("Modifier", {
                  defaultValue: "Modifier"
                })}</span>
              </Button>}
            
            {onDelete && <Button variant="outline" onClick={handleDelete}>
                <Trash className="h-4 w-4 text-[hsl(var(--destructive))]" />
                <span className="sr-only">{t("Supprimer", {
                  defaultValue: "Supprimer"
                })}</span>
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Modal d'édition */}
    {onUpdate && <TourCardEditModal tourCard={tourCard} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateTourCard} />}
    </>;
}