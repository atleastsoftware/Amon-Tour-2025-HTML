import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Eye, EyeOff, Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TourNinjaImageOverride } from "@shared/schema";

export default function AdminTourNinjaImages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingOverride, setEditingOverride] = useState<TourNinjaImageOverride | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newOverrideForm, setNewOverrideForm] = useState({
    tourNinjaId: "",
    tourName: "",
    originalImageUrl: "",
    image: null as File | null
  });

  // Fetch image overrides
  const { data: overrides, isLoading } = useQuery({
    queryKey: ["/api/admin/tour-ninja-images"],
    retry: false,
  });

  // Fetch Tour Ninja tours for reference
  const { data: tourNinjaData } = useQuery({
    queryKey: ["/api/proxy/tours"],
    retry: false,
  });

  const tours = (tourNinjaData as any)?.data || [];

  // Create override mutation
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/tour-ninja-images", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create override');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      toast({
        title: "Succès",
        description: "Image personnalisée ajoutée avec succès",
      });
      setShowNewDialog(false);
      setNewOverrideForm({
        tourNinjaId: "",
        tourName: "",
        originalImageUrl: "",
        image: null
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'image personnalisée",
        variant: "destructive",
      });
    },
  });

  // Update override mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/admin/tour-ninja-images/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update override');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      toast({
        title: "Succès",
        description: "Image mise à jour avec succès",
      });
      setEditingOverride(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'image",
        variant: "destructive",
      });
    },
  });

  // Toggle override mutation
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/tour-ninja-images/${id}/toggle`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      toast({
        title: "Succès",
        description: "Statut de l'image modifié",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    },
  });

  // Delete override mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/tour-ninja-images/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      toast({
        title: "Succès",
        description: "Image supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      });
    },
  });

  const handleCreateOverride = () => {
    if (!newOverrideForm.tourNinjaId || !newOverrideForm.tourName || !newOverrideForm.image) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("tourNinjaId", newOverrideForm.tourNinjaId);
    formData.append("tourName", newOverrideForm.tourName);
    formData.append("originalImageUrl", newOverrideForm.originalImageUrl);
    formData.append("image", newOverrideForm.image);

    createMutation.mutate(formData);
  };

  const handleUpdateOverride = (override: TourNinjaImageOverride, newImage?: File) => {
    const formData = new FormData();
    formData.append("tourName", override.tourName);
    formData.append("originalImageUrl", override.originalImageUrl || "");
    if (newImage) {
      formData.append("image", newImage);
    }

    updateMutation.mutate({ id: override.id, formData });
  };

  const getToursWithoutOverrides = () => {
    const overrideIds = new Set((overrides as TourNinjaImageOverride[])?.map((o: TourNinjaImageOverride) => o.tourNinjaId) || []);
    return tours.filter((tour: any) => !overrideIds.has(tour.id.toString()));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Images Tour Ninja</h1>
          <p className="text-gray-600 mt-1">
            Remplacez les images Tour Ninja par vos propres images personnalisées
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter Image Personnalisée</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tour-select">Tour</Label>
                <select
                  id="tour-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newOverrideForm.tourNinjaId}
                  onChange={(e) => {
                    const selectedTour = tours.find((t: any) => t.id.toString() === e.target.value);
                    setNewOverrideForm({
                      ...newOverrideForm,
                      tourNinjaId: e.target.value,
                      tourName: selectedTour?.name || "",
                      originalImageUrl: selectedTour?.primaryImage || ""
                    });
                  }}
                >
                  <option value="">Sélectionner un tour...</option>
                  {getToursWithoutOverrides().map((tour: any) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="image-file">Image personnalisée *</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setNewOverrideForm({
                      ...newOverrideForm,
                      image: file || null
                    });
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateOverride}
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? "Ajout..." : "Ajouter"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{(overrides as TourNinjaImageOverride[])?.length || 0}</div>
            <div className="text-sm text-gray-600">Images personnalisées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {(overrides as TourNinjaImageOverride[])?.filter((o: TourNinjaImageOverride) => o.isActive).length || 0}
            </div>
            <div className="text-sm text-gray-600">Images actives</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{tours.length}</div>
            <div className="text-sm text-gray-600">Tours disponibles</div>
          </CardContent>
        </Card>
      </div>

      {/* Overrides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(overrides as TourNinjaImageOverride[])?.map((override: TourNinjaImageOverride) => (
          <Card key={override.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              <img
                src={override.customImageUrl}
                alt={override.tourName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder-image.svg";
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant={override.isActive ? "default" : "secondary"}>
                  {override.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{override.tourName}</h3>
              <p className="text-xs text-gray-600 mb-3">ID: {override.tourNinjaId}</p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleMutation.mutate(override.id)}
                  disabled={toggleMutation.isPending}
                >
                  {override.isActive ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingOverride(override)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(override.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(overrides as TourNinjaImageOverride[])?.length === 0 && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            Aucune image personnalisée configurée. Ajoutez des images pour remplacer celles de Tour Ninja.
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingOverride} onOpenChange={() => setEditingOverride(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier Image</DialogTitle>
          </DialogHeader>
          {editingOverride && (
            <div className="space-y-4">
              <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={editingOverride.customImageUrl}
                  alt={editingOverride.tourName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-image">Nouvelle image (optionnel)</Label>
                <Input
                  ref={fileInputRef}
                  id="edit-image"
                  type="file"
                  accept="image/*"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const file = fileInputRef.current?.files?.[0];
                    handleUpdateOverride(editingOverride, file);
                  }}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingOverride(null)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}