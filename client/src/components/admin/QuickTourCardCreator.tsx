import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  onSuccess: (tourCard: TourCardData & {
    id: string;
  }) => void;
}
export default function QuickTourCardCreator({
  onSuccess
}: QuickTourCardCreatorProps) {
  const {
    t: t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<TourCardData | null>(null);

  // Fonction pour extraire les informations de l'URL
  const extractTourInfo = async () => {
    if (!url.trim()) {
      toast({
        title: t('Erreur', {
          defaultValue: 'Erreur'
        }),
        description: t('Veuillez entrer une URL valide', {
          defaultValue: 'Veuillez entrer une URL valide'
        }),
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
          title = lastSegment.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        // Analyse simpliste pour déterminer le type et les tags
        const lowerUrl = url.toLowerCase();

        // Déterminer le type
        if (lowerUrl.includes('experience') || lowerUrl.includes('activity')) {
          type = "experience";
        }

        // Extraire des potentiels tags de localisation
        const locations = ["bangkok", "phuket", "chiang mai", "pattaya", "krabi", "koh samui", "koh phangan", "ayutthaya", "hua hin"];
        locations.forEach(location => {
          if (lowerUrl.includes(location)) {
            tags.push(location.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
          }
        });

        // Créer un objet avec les données extraites
        const extractedData: TourCardData = {
          title: title || "Nouveau Tour",
          description: t('Description automatiquement extraite depuis l\'URL. Veuillez modifier pour ajouter les d\xE9tails appropri\xE9s.', {
            defaultValue: 'Description automatiquement extraite depuis l\'URL. Veuillez modifier pour ajouter les d\xE9tails appropri\xE9s.'
          }),
          price: 1500,
          // Prix par défaut
          currency: "THB",
          customLink: url,
          type,
          images: [],
          tags
        };
        setExtractedData(extractedData);
        setIsExtracting(false);
        toast({
          title: t('Extraction r\xE9ussie', {
            defaultValue: 'Extraction r\xE9ussie'
          }),
          description: t('Les informations ont \xE9t\xE9 extraites avec succ\xE8s.', {
            defaultValue: 'Les informations ont \xE9t\xE9 extraites avec succ\xE8s.'
          })
        });
      }, 1500); // Simuler un délai d'extraction
    } catch (error) {
      console.error("Erreur lors de l'extraction des informations:", error);
      toast({
        title: t('Erreur d\'extraction', {
          defaultValue: 'Erreur d\'extraction'
        }),
        description: t('Impossible d\'extraire les informations du lien fourni.', {
          defaultValue: 'Impossible d\'extraire les informations du lien fourni.'
        }),
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
        title: t('Succ\xE8s', {
          defaultValue: 'Succ\xE8s'
        }),
        description: t('Fiche de tour cr\xE9\xE9e avec succ\xE8s', {
          defaultValue: 'Fiche de tour cr\xE9\xE9e avec succ\xE8s'
        })
      });

      // Réinitialiser le formulaire
      setUrl("");
      setExtractedData(null);

      // Appeler la fonction de callback de succès
      onSuccess(createdCard);
    } catch (error) {
      console.error("Erreur lors de la création de la fiche de tour:", error);
      toast({
        title: t('Erreur', {
          defaultValue: 'Erreur'
        }),
        description: t('Une erreur est survenue lors de la cr\xE9ation de la fiche', {
          defaultValue: 'Une erreur est survenue lors de la cr\xE9ation de la fiche'
        }),
        variant: "destructive"
      });
    }
  };
  return <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t('Cr\xE9ation rapide de fiche de tour', {
          defaultValue: 'Cr\xE9ation rapide de fiche de tour'
        })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">{t('Lien de r\xE9servation (URL)', {
              defaultValue: 'Lien de r\xE9servation (URL)'
            })}</Label>
            <div className="flex mt-1.5">
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder={t('Ex: https://www.tourninja.io/tours/bangkok-food-tour', {
              defaultValue: 'Ex: https://www.tourninja.io/tours/bangkok-food-tour'
            })} className="flex-grow" />
              <Button onClick={extractTourInfo} disabled={isExtracting || !url.trim()} className="ml-2 whitespace-nowrap">
                {isExtracting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('Extraction...', {
                  defaultValue: 'Extraction...'
                })}</> : "Extraire les infos"}
              </Button>
            </div>
          </div>
          
          {extractedData && <div className="mt-6 space-y-4 border p-4 rounded-lg bg-gray-50">
              <h3 className="font-semibold">{t('Informations extraites', {
              defaultValue: 'Informations extraites'
            })}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">{t('Titre', {
                  defaultValue: 'Titre'
                })}</Label>
                  <div className="font-medium">{extractedData.title}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t('Type', {
                  defaultValue: 'Type'
                })}</Label>
                  <div className="font-medium capitalize">{extractedData.type}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">{t('Description', {
                defaultValue: 'Description'
              })}</Label>
                <div className="text-sm text-gray-700">{extractedData.description}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">{t('Prix', {
                  defaultValue: 'Prix'
                })}</Label>
                  <div className="font-medium">{extractedData.price} {extractedData.currency}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t('Tags', {
                  defaultValue: 'Tags'
                })}</Label>
                  <div>
                    {extractedData.tags.length > 0 ? extractedData.tags.map((tag, i) => <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                            {tag}
                          </span>) : <span className="text-sm text-gray-500">{t('Aucun tag extrait', {
                    defaultValue: 'Aucun tag extrait'
                  })}</span>}
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button onClick={createTourCard} className="w-full">{t('Create tour card', {
                defaultValue: 'Create tour card'
              })}</Button>
                <div className="text-xs text-center mt-2 text-gray-500">{t('Note: Vous pourrez modifier tous les d\xE9tails apr\xE8s la cr\xE9ation', {
                defaultValue: 'Note: Vous pourrez modifier tous les d\xE9tails apr\xE8s la cr\xE9ation'
              })}</div>
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
}