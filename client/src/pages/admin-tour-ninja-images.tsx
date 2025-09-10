import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Eye, EyeOff, Edit, Trash2, Plus, Image as ImageIcon, Camera, Sparkles, Check, X, Search, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TourNinjaImageOverride } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export default function AdminTourNinjaImages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingOverride, setEditingOverride] = useState<TourNinjaImageOverride | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [newOverrideForm, setNewOverrideForm] = useState({
    tourNinjaId: "",
    tourName: "",
    originalImageUrl: "",
    imageSourceType: "upload" as "upload" | "url",
    image: null as File | null,
    directImageUrl: "",
    description: ""
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

  // Drag & Drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      setNewOverrideForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      toast({
        title: "Image sélectionnée",
        description: `${file.name} prête à être téléchargée`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Filter tours based on search and status
  const filteredOverrides = ((overrides as TourNinjaImageOverride[]) || []).filter((override: TourNinjaImageOverride) => {
    const matchesSearch = override.tourName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         override.tourNinjaId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && override.isActive) ||
                         (filterStatus === "inactive" && !override.isActive);
    return matchesSearch && matchesStatus;
  });

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
      // Invalider les données admin ET les données du frontend public
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tour-ninja-image-overrides"] });
      toast({
        title: "Succès",
        description: "Image personnalisée ajoutée avec succès",
      });
      setShowNewDialog(false);
      setNewOverrideForm({
        tourNinjaId: "",
        tourName: "",
        originalImageUrl: "",
        imageSourceType: "upload",
        image: null,
        directImageUrl: "",
        description: ""
      });
      setImagePreview(null);
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
      // Invalider les données admin ET les données du frontend public
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tour-ninja-image-overrides"] });
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
      return apiRequest(`/api/admin/tour-ninja-images/${id}/toggle`, "PATCH");
    },
    onSuccess: () => {
      // Invalider les données admin ET les données du frontend public
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tour-ninja-image-overrides"] });
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
      return apiRequest(`/api/admin/tour-ninja-images/${id}`, "DELETE");
    },
    onSuccess: () => {
      // Invalider les données admin ET les données du frontend public
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tour-ninja-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tour-ninja-image-overrides"] });
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
    // Validation selon le type de source
    if (!newOverrideForm.tourNinjaId || !newOverrideForm.tourName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    if (newOverrideForm.imageSourceType === "upload" && !newOverrideForm.image) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image à télécharger",
        variant: "destructive",
      });
      return;
    }

    if (newOverrideForm.imageSourceType === "url" && !newOverrideForm.directImageUrl) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une URL d'image valide",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("tourNinjaId", newOverrideForm.tourNinjaId);
    formData.append("tourName", newOverrideForm.tourName);
    formData.append("originalImageUrl", newOverrideForm.originalImageUrl);
    formData.append("imageSourceType", newOverrideForm.imageSourceType);
    
    if (newOverrideForm.imageSourceType === "upload" && newOverrideForm.image) {
      formData.append("image", newOverrideForm.image);
    } else if (newOverrideForm.imageSourceType === "url") {
      formData.append("directImageUrl", newOverrideForm.directImageUrl);
    }

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
    // Si overrides n'est pas encore chargé (erreur d'auth), montrer tous les tours
    if (!overrides || (overrides as any)?.message === "Authentication required") {
      return tours;
    }
    // Sinon, filtrer les tours qui ont déjà des overrides
    const overrideIds = new Set((overrides as TourNinjaImageOverride[])?.map((o: TourNinjaImageOverride) => o.tourNinjaId) || []);
    return tours.filter((tour: any) => !overrideIds.has(tour.id.toString()));
  };

  // Check authentication first
  if (overrides && (overrides as any)?.message === "Authentication required") {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-red-600">Authentification requise</div>
            <p className="text-gray-600">Vous devez vous connecter pour accéder à cette page.</p>
            <Button 
              onClick={() => window.location.href = '/admin-login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Ajouter Image Personnalisée
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Camera className="w-5 h-5 text-blue-600" />
                Personnaliser Image de Tour
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Tour Selection */}
              <div className="space-y-2">
                <Label htmlFor="tour-select" className="text-sm font-medium">Sélectionner le tour</Label>
                <Select
                  value={newOverrideForm.tourNinjaId}
                  onValueChange={(value) => {
                    const selectedTour = tours.find((t: any) => t.id.toString() === value);
                    setNewOverrideForm({
                      ...newOverrideForm,
                      tourNinjaId: value,
                      tourName: selectedTour?.name || "",
                      originalImageUrl: selectedTour?.primaryImage || ""
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un tour..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tours.length > 0 ? (
                      tours.filter((tour: any) => {
                        // Si overrides n'est pas encore chargé (erreur d'auth), montrer tous les tours
                        if (!overrides || (overrides as any)?.message === "Authentication required") {
                          return true;
                        }
                        // Sinon, filtrer les tours qui ont déjà des overrides
                        const overrideIds = new Set((overrides as TourNinjaImageOverride[])?.map((o: TourNinjaImageOverride) => o.tourNinjaId) || []);
                        return !overrideIds.has(tour.id.toString());
                      }).map((tour: any) => (
                        <SelectItem key={tour.id} value={tour.id.toString()}>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                            {tour.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-tours" disabled>
                        Aucun tour disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                {/* Debug info */}
                <div className="text-xs text-gray-500 mt-1">
                  Debug: {tours.length} tours chargés
                  {overrides && (overrides as any)?.message && (
                    <span className="text-orange-600 ml-2">
                      Auth: {(overrides as any).message}
                    </span>
                  )}
                </div>
              </div>

              {/* Image Source Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Type d'image</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={newOverrideForm.imageSourceType === "upload" ? "default" : "outline"}
                    onClick={() => {
                      setNewOverrideForm(prev => ({ 
                        ...prev, 
                        imageSourceType: "upload",
                        directImageUrl: "",
                        image: null
                      }));
                      setImagePreview(null);
                    }}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Télécharger un fichier
                  </Button>
                  <Button
                    type="button"
                    variant={newOverrideForm.imageSourceType === "url" ? "default" : "outline"}
                    onClick={() => {
                      setNewOverrideForm(prev => ({ 
                        ...prev, 
                        imageSourceType: "url",
                        image: null
                      }));
                      setImagePreview(null);
                    }}
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Lien URL
                  </Button>
                </div>
              </div>

              {/* Image Upload Zone - Only show for upload type */}
              {newOverrideForm.imageSourceType === "upload" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Télécharger votre image</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imagePreview}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            setNewOverrideForm(prev => ({ ...prev, image: null }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        <Check className="w-4 h-4 inline mr-1" />
                        Image prête à être téléchargée
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Upload className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          {dragActive ? 'Déposez votre image ici' : 'Glissez-déposez votre image ici'}
                        </p>
                        <p className="text-sm text-gray-500">ou</p>
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Parcourir les fichiers
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Formats supportés: JPG, PNG, WebP (max 10MB)
                      </p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              </div>
              )}

              {/* URL Input Zone - Only show for URL type */}
              {newOverrideForm.imageSourceType === "url" && (
              <div className="space-y-2">
                <Label htmlFor="directImageUrl" className="text-sm font-medium">URL de l'image</Label>
                <Input
                  id="directImageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newOverrideForm.directImageUrl}
                  onChange={(e) => setNewOverrideForm(prev => ({ ...prev, directImageUrl: e.target.value }))}
                  className="w-full"
                />
                {newOverrideForm.directImageUrl && (
                  <div className="mt-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={newOverrideForm.directImageUrl}
                        alt="Prévisualisation URL"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Image non accessible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Description Optional */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Ajoutez une description de votre image personnalisée..."
                  value={newOverrideForm.description}
                  onChange={(e) => setNewOverrideForm(prev => ({ ...prev, description: e.target.value }))}
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Upload Progress */}
              {createMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Téléchargement en cours...</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="w-full" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateOverride}
                  disabled={createMutation.isPending || !newOverrideForm.tourNinjaId || 
                    (newOverrideForm.imageSourceType === "upload" && !newOverrideForm.image) ||
                    (newOverrideForm.imageSourceType === "url" && !newOverrideForm.directImageUrl)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Ajouter l'image
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewDialog(false);
                    setImagePreview(null);
                    setNewOverrideForm({
                      tourNinjaId: "",
                      tourName: "",
                      originalImageUrl: "",
                      imageSourceType: "upload",
                      image: null,
                      directImageUrl: "",
                      description: ""
                    });
                  }}
                  className="px-6"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tour Selection List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Choisir un tour à personnaliser</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des tours...</p>
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tours.map((tour: any) => {
              // Trouve l'override existant pour ce tour
              const existingOverride = (overrides as TourNinjaImageOverride[])?.find(
                (o: TourNinjaImageOverride) => o.tourNinjaId === tour.id
              );
              
              return (
                <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    {existingOverride ? (
                      // Affiche l'image personnalisée si elle existe
                      <img
                        src={existingOverride.customImageUrl || existingOverride.directImageUrl}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      // Affiche l'image TourNinja par défaut
                      <img
                        src={`/api/image-proxy/${tour.id}/presentation`}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    {existingOverride && (
                      <div className="absolute top-2 right-2">
                        <Badge variant={existingOverride.isActive ? "default" : "secondary"}>
                          {existingOverride.isActive ? "Personnalisé" : "Inactif"}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{tour.name}</h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {tour.price} {tour.currency} • {tour.duration} jour(s)
                    </p>
                    
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Pré-remplir le formulaire avec les données du tour
                        setNewOverrideForm({
                          tourNinjaId: tour.id,
                          tourName: tour.name,
                          originalImageUrl: `/api/image-proxy/${tour.id}/presentation`,
                          imageSourceType: "upload",
                          image: null,
                          directImageUrl: "",
                          description: ""
                        });
                        setShowNewDialog(true);
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {existingOverride ? "Modifier l'image" : "Personnaliser l'image"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun tour disponible</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Impossible de charger les tours depuis Tour Ninja. Veuillez vérifier la connexion API.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOverride} onOpenChange={() => setEditingOverride(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              <ImageIcon className="w-5 h-5 inline mr-2 text-blue-600" />
              Modifier l'image du tour
            </DialogTitle>
          </DialogHeader>
          {editingOverride && (
            <div className="space-y-4">
              {/* Tour Info */}
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-900 mb-1">{editingOverride.tourName}</h3>
                <p className="text-sm text-gray-600">ID: {editingOverride.tourNinjaId}</p>
              </div>

              {/* Current Image */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Image actuelle</Label>
                <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden border">
                  {(editingOverride.customImageUrl || editingOverride.directImageUrl) ? (
                    <img
                      src={editingOverride.customImageUrl || editingOverride.directImageUrl}
                      alt={editingOverride.tourName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Aucune image personnalisée</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload New Image */}
              <div>
                <Label htmlFor="edit-image" className="text-sm font-medium text-gray-700 mb-2 block">
                  Remplacer par une nouvelle image
                </Label>
                <Input
                  ref={fileInputRef}
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  className="border-dashed"
                />
                <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPG, PNG, GIF (max 5MB)</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    const file = fileInputRef.current?.files?.[0];
                    handleUpdateOverride(editingOverride, file);
                  }}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mettre à jour l'image
                    </>
                  )}
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