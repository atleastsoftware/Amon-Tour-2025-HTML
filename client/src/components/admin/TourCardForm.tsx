import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TourCardData {
  title: string;
  description: string;
  price: number;
  currency: string;
  customLink: string;
  images: string[];
}

interface TourCardFormProps {
  onSuccess: (tourCard: TourCardData & { id: string }) => void;
}

export default function TourCardForm({ onSuccess }: TourCardFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TourCardData>({
    title: "",
    description: "",
    price: 0,
    currency: "THB",
    customLink: "",
    images: []
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    // Limit to 3 images total
    files.forEach((file, index) => {
      if (newFiles.length < 3) {
        newFiles.push(file);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      }
    });
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Erreur",
        description: "Le titre est obligatoire",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.customLink) {
      toast({
        title: "Erreur",
        description: "Le lien personnalisé est obligatoire",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins une image",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload images first
      const imageUrls: string[] = [];
      
      for (const file of selectedFiles) {
        const fileFormData = new FormData();
        fileFormData.append('image', file);
        
        try {
          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            body: fileFormData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
          }
          
          const uploadData = await uploadResponse.json();
          if (uploadData && uploadData.file && uploadData.file.url) {
            imageUrls.push(uploadData.file.url);
          } else {
            throw new Error("Invalid response from image upload");
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Erreur d'upload",
            description: "Une erreur est survenue lors de l'upload de l'image",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Then create the tour card
      const tourCardData = {
        ...formData,
        images: imageUrls
      };
      
      try {
        const createResponse = await fetch('/api/tour-cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tourCardData)
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create tour card: ${createResponse.statusText}`);
        }
        
        const createdCard = await createResponse.json();
        
        // Ensure the card has the necessary properties before proceeding
        if (!createdCard || !createdCard.id) {
          throw new Error("Invalid response from server when creating tour card");
        }
        
        toast({
          title: "Succès",
          description: "Fiche de tour créée avec succès"
        });
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          price: 0,
          currency: "THB",
          customLink: "",
          images: []
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        // Call success callback with properly typed card
        const typedCard: TourCardData & { id: string } = {
          id: createdCard.id,
          title: createdCard.title || "",
          description: createdCard.description || "",
          price: typeof createdCard.price === 'number' ? createdCard.price : 0,
          currency: createdCard.currency || "THB",
          customLink: createdCard.customLink || "",
          images: Array.isArray(createdCard.images) ? createdCard.images : []
        };
        
        onSuccess(typedCard);
      } catch (createError) {
        console.error("Error creating tour card:", createError);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la création de la fiche",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Error creating tour card:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la fiche",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer une fiche de tour</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Nom du séjour / tour *</Label>
            <Input 
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Bangkok Food Tour"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez brièvement ce tour..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix à partir de *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                value={formData.price || ""}
                onChange={handleInputChange}
                placeholder="Ex: 1500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Devise</Label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="THB">THB</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="customLink">Lien personnalisé (Tour Ninja) *</Label>
            <Input
              id="customLink"
              name="customLink"
              value={formData.customLink}
              onChange={handleInputChange}
              placeholder="Ex: https://tourninja.com/tour/xxx"
              required
            />
          </div>
          
          <div>
            <Label>Photos (1 à 3) *</Label>
            <div className="mt-2 space-y-4">
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                      <img src={url} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition-all"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          Photo principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {previewUrls.length < 3 && (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour ajouter</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500">
                        {previewUrls.length === 0 
                          ? "Ajoutez jusqu'à 3 photos" 
                          : `Ajoutez encore ${3 - previewUrls.length} photo${3 - previewUrls.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      name="images"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple={previewUrls.length < 2}
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Génération en cours...' : 'Générer la fiche'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}