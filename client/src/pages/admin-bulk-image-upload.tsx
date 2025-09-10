import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Check, Upload, ImageIcon } from "lucide-react";

interface ImageMapping {
  filename: string;
  suggestedTourId: string;
  suggestedTourName: string;
  confirmed: boolean;
}

export default function AdminBulkImageUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageMappings, setImageMappings] = useState<ImageMapping[]>([]);
  const [processing, setProcessing] = useState(false);

  // Images disponibles dans public/tour-images
  const availableImages = [
    'semi-private-phi-phi-morning.jpeg',
    'catamaran-day-trip.jpeg', 
    'koh-mook-sunset.jpeg',
    'private-koh-hong.jpeg',
    'railay-aventure.jpeg'
  ];

  // Mapping suggéré basé sur les noms de fichiers
  const suggestedMappings: Record<string, { id: string; name: string }> = {
    'semi-private-phi-phi-morning.jpeg': { id: 'PIGyavyKH', name: 'Semi Private Day Trip to Koh Phi Phi on morning' },
    'catamaran-day-trip.jpeg': { id: 'Wmx1GcKCG', name: 'Catamaran Private Day Trip to Ao Nang\'s local islands' },
    'koh-mook-sunset.jpeg': { id: 's0fLpx3q_', name: 'Private Day Trip to Koh Mook with Sunset' },
    'private-koh-hong.jpeg': { id: '9Pw3V8MEX', name: 'Private Day Trip to Koh Hong Archipelago' },
    'railay-aventure.jpeg': { id: 'uSngHanqF', name: 'Private Day Trip: The Secrets of Railay - Adventure Course' }
  };

  // Fetch Tour Ninja tours
  const { data: tourNinjaData } = useQuery({
    queryKey: ["/api/proxy/tours"],
    retry: false,
  });

  const tours = (tourNinjaData as any)?.data || [];

  // Initialize mappings
  useEffect(() => {
    const mappings = availableImages.map(filename => ({
      filename,
      suggestedTourId: suggestedMappings[filename]?.id || '',
      suggestedTourName: suggestedMappings[filename]?.name || '',
      confirmed: false
    }));
    setImageMappings(mappings);
  }, []);

  // Mutation pour créer les overrides
  const createOverrideMutation = useMutation({
    mutationFn: async (data: { tourNinjaId: string; directImageUrl: string; description: string }) => {
      const formData = new FormData();
      formData.append('tourNinjaId', data.tourNinjaId);
      formData.append('imageSourceType', 'url');
      formData.append('directImageUrl', data.directImageUrl);
      formData.append('description', data.description);

      const response = await fetch("/api/admin/tour-ninja-images", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create override');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
    },
  });

  const handleBulkUpload = async () => {
    setProcessing(true);
    let successCount = 0;
    
    for (const mapping of imageMappings.filter(m => m.confirmed && m.suggestedTourId)) {
      try {
        const imageUrl = `${window.location.origin}/tour-images/${mapping.filename}`;
        await createOverrideMutation.mutateAsync({
          tourNinjaId: mapping.suggestedTourId,
          directImageUrl: imageUrl,
          description: `Image personnalisée - ${mapping.suggestedTourName}`
        });
        successCount++;
      } catch (error) {
        console.error(`Erreur pour ${mapping.filename}:`, error);
      }
    }
    
    setProcessing(false);
    toast({
      title: "Upload terminé",
      description: `${successCount} images ont été ajoutées avec succès`,
    });
  };

  const updateMapping = (index: number, tourId: string) => {
    const selectedTour = tours.find((t: any) => t.id === tourId);
    setImageMappings(prev => prev.map((mapping, i) => 
      i === index 
        ? { ...mapping, suggestedTourId: tourId, suggestedTourName: selectedTour?.name || '' }
        : mapping
    ));
  };

  const toggleConfirmed = (index: number) => {
    setImageMappings(prev => prev.map((mapping, i) => 
      i === index 
        ? { ...mapping, confirmed: !mapping.confirmed }
        : mapping
    ));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload d'images en lot</h1>
        <p className="text-gray-600">Mappez les images vers les tours correspondants et uploadez-les en une fois.</p>
      </div>

      <div className="space-y-4 mb-6">
        {imageMappings.map((mapping, index) => (
          <Card key={mapping.filename} className="border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Prévisualisation de l'image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={`/tour-images/${mapping.filename}`}
                    alt={mapping.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                </div>

                {/* Nom du fichier */}
                <div className="flex-1">
                  <div className="font-medium">{mapping.filename}</div>
                  <div className="text-sm text-gray-500">
                    URL: /tour-images/{mapping.filename}
                  </div>
                </div>

                {/* Sélection du tour */}
                <div className="flex-1">
                  <Select value={mapping.suggestedTourId} onValueChange={(value) => updateMapping(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un tour" />
                    </SelectTrigger>
                    <SelectContent>
                      {tours.map((tour: any) => (
                        <SelectItem key={tour.id} value={tour.id}>
                          {tour.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mapping.suggestedTourName && (
                    <div className="text-xs text-gray-500 mt-1">
                      {mapping.suggestedTourName}
                    </div>
                  )}
                </div>

                {/* Bouton de confirmation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={mapping.confirmed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleConfirmed(index)}
                    disabled={!mapping.suggestedTourId}
                  >
                    {mapping.confirmed ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Confirmé
                      </>
                    ) : (
                      'Confirmer'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé et action */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div>
                Images confirmées: <Badge variant="default">{imageMappings.filter(m => m.confirmed).length}</Badge>
              </div>
              <div>
                Total d'images: <Badge variant="outline">{imageMappings.length}</Badge>
              </div>
            </div>
            
            <Button
              onClick={handleBulkUpload}
              disabled={processing || imageMappings.filter(m => m.confirmed).length === 0}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Uploader {imageMappings.filter(m => m.confirmed).length} images
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}