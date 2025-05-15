import { useEffect, useState } from "react";
import { useNavigate } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Trash2, Edit, Plus, Save, X, ExternalLink,
  Image as ImageIcon, Check, ChevronDown, ChevronUp
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const navigate = useNavigate();
  const logout = useLogout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingTour, setEditingTour] = useState<Partial<Tour> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const { data: tours = [], isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });

  const createTourMutation = useMutation({
    mutationFn: async (newTour: Partial<Tour>) => {
      return apiRequest<Tour>('/api/tours', {
        method: 'POST',
        body: JSON.stringify(newTour),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Tour créé",
        description: "Le tour a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: \`Erreur lors de la création du tour: \${error}\`,
        variant: "destructive",
      });
    },
  });

  const updateTourMutation = useMutation({
    mutationFn: async (tour: Partial<Tour>) => {
      return apiRequest<Tour>(\`/api/tours/\${tour.id}\`, {
        method: 'PUT',
        body: JSON.stringify(tour),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      setIsEditing(false);
      setEditingTour(null);
      toast({
        title: "Tour mis à jour",
        description: "Le tour a été mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: \`Erreur lors de la mise à jour du tour: \${error}\`,
        variant: "destructive",
      });
    },
  });

  const deleteTourMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(\`/api/tours/\${id}\`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      toast({
        title: "Tour supprimé",
        description: "Le tour a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: \`Erreur lors de la suppression du tour: \${error}\`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin-login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogout = () => {
    logout.mutate();
    navigate('/');
  };

  const resetForm = () => {
    setEditingTour({
      title: '',
      description: '',
      shortDescription: '',
      duration: '',
      price: 0,
      childPrice: 0,
      imageUrl: '',
      tourNinjaUrl: '',
      featured: false,
    });
  };

  const handleCreateTour = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour({ ...tour });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveTour = () => {
    if (!editingTour) return;
    
    // Validation basique
    if (!editingTour.title || !editingTour.description || !editingTour.shortDescription || 
        !editingTour.duration || !editingTour.price || !editingTour.imageUrl || !editingTour.tourNinjaUrl) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing && editingTour.id) {
      updateTourMutation.mutate(editingTour);
    } else {
      createTourMutation.mutate(editingTour);
    }
  };

  const handleDeleteTour = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tour ?")) {
      deleteTourMutation.mutate(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  if (authLoading) return <div className="container mx-auto p-8 text-center">Chargement...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-20 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Administration</h1>
          <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tours</CardTitle>
              <Button onClick={handleCreateTour}>
                <Plus className="mr-2 h-4 w-4" /> Nouveau tour
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {toursLoading ? (
              <div className="text-center py-4">Chargement des tours...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Mis en avant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Aucun tour trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      tours.map((tour) => (
                        <>
                          <TableRow key={tour.id} className="cursor-pointer" onClick={() => toggleExpand(tour.id)}>
                            <TableCell>{tour.id}</TableCell>
                            <TableCell className="font-medium">{tour.title}</TableCell>
                            <TableCell>{tour.duration}</TableCell>
                            <TableCell>{tour.price}€</TableCell>
                            <TableCell>
                              {tour.featured ? 
                                <Check className="h-5 w-5 text-green-500" /> : 
                                <X className="h-5 w-5 text-gray-300" />
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTour(tour);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTour(tour.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(tour.id);
                                  }}
                                >
                                  {expandedRowId === tour.id ? 
                                    <ChevronUp className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />
                                  }
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRowId === tour.id && (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <div className="py-4 px-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="text-sm font-semibold mb-1">Description courte</h3>
                                      <p className="text-sm">{tour.shortDescription}</p>
                                      
                                      <h3 className="text-sm font-semibold mt-3 mb-1">Description complète</h3>
                                      <p className="text-sm">{tour.description}</p>
                                      
                                      <h3 className="text-sm font-semibold mt-3 mb-1">URL Tour Ninja</h3>
                                      <a 
                                        href={tour.tourNinjaUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-500 hover:underline flex items-center text-sm"
                                      >
                                        {tour.tourNinjaUrl} <ExternalLink className="ml-1 h-3 w-3" />
                                      </a>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold mb-2">Image</h3>
                                      <div className="relative aspect-video rounded-md overflow-hidden border">
                                        <img 
                                          src={tour.imageUrl} 
                                          alt={tour.title} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Modifier le tour: ${editingTour?.title}` : 'Créer un nouveau tour'}
            </DialogTitle>
            <DialogDescription>
              Remplissez tous les champs requis pour {isEditing ? 'modifier' : 'créer'} ce tour.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={editingTour?.title || ''}
                  onChange={(e) => setEditingTour({ ...editingTour!, title: e.target.value })}
                  placeholder="Titre du tour"
                />
              </div>
              
              <div>
                <Label htmlFor="shortDescription">Description courte</Label>
                <Textarea
                  id="shortDescription"
                  value={editingTour?.shortDescription || ''}
                  onChange={(e) => setEditingTour({ ...editingTour!, shortDescription: e.target.value })}
                  placeholder="Brève description du tour"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description complète</Label>
                <Textarea
                  id="description"
                  value={editingTour?.description || ''}
                  onChange={(e) => setEditingTour({ ...editingTour!, description: e.target.value })}
                  placeholder="Description détaillée du tour"
                  rows={5}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Durée</Label>
                  <Input
                    id="duration"
                    value={editingTour?.duration || ''}
                    onChange={(e) => setEditingTour({ ...editingTour!, duration: e.target.value })}
                    placeholder="ex: 3 jours"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Prix</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingTour?.price || 0}
                    onChange={(e) => setEditingTour({ ...editingTour!, price: parseInt(e.target.value) })}
                    placeholder="Prix en euros"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="childPrice">Prix enfant (optionnel)</Label>
                <Input
                  id="childPrice"
                  type="number"
                  value={editingTour?.childPrice || 0}
                  onChange={(e) => setEditingTour({ ...editingTour!, childPrice: parseInt(e.target.value) })}
                  placeholder="Prix pour les enfants"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input
                  id="imageUrl"
                  value={editingTour?.imageUrl || ''}
                  onChange={(e) => setEditingTour({ ...editingTour!, imageUrl: e.target.value })}
                  placeholder="URL de l'image"
                />
                {editingTour?.imageUrl && (
                  <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                    <img 
                      src={editingTour.imageUrl} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+non+disponible';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="tourNinjaUrl">URL Tour Ninja</Label>
                <Input
                  id="tourNinjaUrl"
                  value={editingTour?.tourNinjaUrl || ''}
                  onChange={(e) => setEditingTour({ ...editingTour!, tourNinjaUrl: e.target.value })}
                  placeholder="URL vers Tour Ninja"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={editingTour?.featured || false}
                  onCheckedChange={(checked) => setEditingTour({ ...editingTour!, featured: checked })}
                  id="featured"
                />
                <Label htmlFor="featured">Mettre en avant sur la page d'accueil</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTour} disabled={createTourMutation.isPending || updateTourMutation.isPending}>
              {createTourMutation.isPending || updateTourMutation.isPending ? 
                'Enregistrement...' : 
                <><Save className="mr-2 h-4 w-4" /> Enregistrer</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
}