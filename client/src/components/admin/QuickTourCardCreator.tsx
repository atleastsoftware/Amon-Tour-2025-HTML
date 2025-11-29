import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

interface TourCardData {
  title: string;
  description: string;
  price: number;
  currency: string;
  customLink: string;
  type: "tour" | "experience";
  images: string[];
  tags: string[];
}

interface QuickTourCardCreatorProps {
  onSuccess: (tourCard: TourCardData & { id: string }) => void;
}

export default function QuickTourCardCreator({ onSuccess }: QuickTourCardCreatorProps) {
  const { toast } = useToast();
  const { translations } = useTranslation();
  const t = translations?.admin?.tourCardBuilder || {};
  const common = translations?.admin?.common || {};
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<TourCardData | null>(null);

  // Fonction pour extraire les informations de l'URL
  const extractTourInfo = async () => {
    if (!url.trim()) {
      toast({
        title: common?.error || "Error",
        description: t?.pleaseEnterValidUrl || "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);

    try {
      // Simuler une extraction de données
      // Dans une implémentation réelle, vous feriez une requête à votre API
      // qui extrairait les données de l'URL
      
      // Exemple de simulation d'extraction (pour démonstration)
      setTimeout(() => {
        // Analyser l'URL
        let title = "";
        let type: "tour" | "experience" = "tour";
        let tags: string[] = [];
        
        // Exemple d'extraction basique du titre depuis le dernier segment de l'URL
        const urlSegments = url.split('/');
        const lastSegment = urlSegments[urlSegments.length - 1];
        
        // Convertir des slugs (avec tirets) en mots avec majuscules
        if (lastSegment) {
          title = lastSegment
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        // Analyse simpliste pour déterminer le type et les tags
        const lowerUrl = url.toLowerCase();
        
        // Déterminer le type
        if (lowerUrl.includes('experience') || lowerUrl.includes('activity')) {
          type = "experience";
        }
        
        // Extraire des potentiels tags de localisation
        const locations = [
          "bangkok", "phuket", "chiang mai", "pattaya", "krabi", 
          "koh samui", "koh phangan", "ayutthaya", "hua hin"
        ];
        
        locations.forEach(location => {
          if (lowerUrl.includes(location)) {
            tags.push(location.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '));
          }
        });
        
        // Create object with extracted data
        const extractedData: TourCardData = {
          title: title || t?.newTour || "New Tour",
          description: t?.autoExtractedDescription || "Description automatically extracted from URL. Please modify to add appropriate details.",
          price: 1500, // Default price
          currency: "THB",
          customLink: url,
          type,
          images: [],
          tags
        };
        
        setExtractedData(extractedData);
        setIsExtracting(false);
        
        toast({
          title: t?.extractionSuccess || "Extraction successful",
          description: t?.infoExtractedSuccess || "Information has been extracted successfully."
        });
      }, 1500); // Simulate extraction delay
      
    } catch (error) {
      console.error("Error during extraction:", error);
      toast({
        title: t?.extractionError || "Extraction error",
        description: t?.unableToExtractInfo || "Unable to extract information from the provided link.",
        variant: "destructive"
      });
      setIsExtracting(false);
    }
  };

  // Fonction pour créer la TourCard avec les données extraites
  const createTourCard = async () => {
    if (!extractedData) return;
    
    try {
      const createResponse = await fetch('/api/tour-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(extractedData)
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create tour card: ${createResponse.statusText}`);
      }
      
      const createdCard = await createResponse.json();
      
      if (!createdCard || !createdCard.id) {
        throw new Error("Invalid response from server when creating tour card");
      }
      
      toast({
        title: common?.success || "Success",
        description: t?.cardCreated || "Tour card created successfully"
      });
      
      // Reset form
      setUrl("");
      setExtractedData(null);
      
      // Appeler la fonction de callback de succès
      onSuccess(createdCard);
      
    } catch (error) {
      console.error("Error during tour card creation:", error);
      toast({
        title: common?.error || "Error",
        description: t?.cardCreationError || "An error occurred while creating the card",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t?.quickCreate || "Quick Tour Card Creation"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">{t?.bookingLink || "Booking Link (URL)"}</Label>
            <div className="flex mt-1.5">
              <Input 
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t?.bookingLinkPlaceholder || "Ex: https://www.tourninja.io/tours/bangkok-food-tour"}
                className="flex-grow"
              />
              <Button 
                onClick={extractTourInfo}
                disabled={isExtracting || !url.trim()}
                className="ml-2 whitespace-nowrap"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t?.extracting || "Extracting..."}
                  </>
                ) : (t?.extractInfo || "Extract info")}
              </Button>
            </div>
          </div>
          
          {extractedData && (
            <div className="mt-6 space-y-4 border p-4 rounded-lg bg-gray-50">
              <h3 className="font-semibold">{t?.extractedInfo || "Extracted Information"}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">{t?.titleLabel || "Title"}</Label>
                  <div className="font-medium">{extractedData.title}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t?.typeLabel || "Type"}</Label>
                  <div className="font-medium capitalize">{extractedData.type}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">{t?.descriptionLabel || "Description"}</Label>
                <div className="text-sm text-gray-700">{extractedData.description}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">{t?.priceLabel || "Price"}</Label>
                  <div className="font-medium">{extractedData.price} {extractedData.currency}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t?.tagsLabel || "Tags"}</Label>
                  <div>
                    {extractedData.tags.length > 0 
                      ? extractedData.tags.map((tag, i) => (
                          <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                            {tag}
                          </span>
                        ))
                      : <span className="text-sm text-gray-500">{t?.noTagsExtracted || "No tags extracted"}</span>
                    }
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button onClick={createTourCard} className="w-full">
                  {t?.createCard || "Create tour card"}
                </Button>
                <div className="text-xs text-center mt-2 text-gray-500">
                  {t?.noteAfterCreation || "Note: You can modify all details after creation"}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}