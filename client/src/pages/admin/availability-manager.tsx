import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, isAfter, parseISO, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { LogOut, ChevronLeft, Plus, Calendar, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour, TourAvailability } from "@shared/schema";
import { formatTHB } from "@/lib/utils";

// Schéma pour les disponibilités
const availabilitySchema = z.object({
  tourId: z.number().min(1, "Un tour est requis"),
  date: z.date({
    required_error: "Une date est requise",
    invalid_type_error: "Format de date invalide",
  }),
  maxCapacity: z.number().min(1, "Capacité minimum: 1").max(100, "Capacité maximum: 100"),
  price: z.number().min(0, "Prix minimum: 0").optional(),
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

export default function AvailabilityManager() {
  const { isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<TourAvailability | null>(null);
  
  // Formulaire pour créer/modifier une disponibilité
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      tourId: 0,
      date: new Date(),
      maxCapacity: 10,
      price: undefined,
    },
  });
  
  // Récupérer la liste des tours
  const { data: tours, isLoading: isToursLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });
  
  // Récupérer les disponibilités pour le tour sélectionné
  const { data: availabilities, isLoading: isAvailabilitiesLoading } = useQuery<TourAvailability[]>({
    queryKey: [`/api/tours/${selectedTourId}/availabilities`],
    enabled: !!selectedTourId,
  });
  
  // Mutation pour créer une disponibilité
  const createAvailability = useMutation({
    mutationFn: (data: AvailabilityFormValues) => {
      return apiRequest("POST", `/api/tours/${data.tourId}/availabilities`, {
        date: format(data.date, 'yyyy-MM-dd'),
        maxCapacity: data.maxCapacity,
        price: data.price,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${selectedTourId}/availabilities`] });
      toast({
        title: "Disponibilité créée",
        description: "La disponibilité a été ajoutée avec succès."
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la disponibilité."
      });
    }
  });
  
  // Mutation pour modifier une disponibilité
  const updateAvailability = useMutation({
    mutationFn: (data: { id: number, values: Partial<AvailabilityFormValues> }) => {
      return apiRequest("PUT", `/api/availabilities/${data.id}`, {
        ...(data.values.date && { date: format(data.values.date, 'yyyy-MM-dd') }),
        ...(data.values.maxCapacity && { maxCapacity: data.values.maxCapacity }),
        ...(data.values.price !== undefined && { price: data.values.price }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${selectedTourId}/availabilities`] });
      toast({
        title: "Disponibilité mise à jour",
        description: "La disponibilité a été modifiée avec succès."
      });
      setIsEditDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification de la disponibilité."
      });
    }
  });
  
  // Mutation pour supprimer une disponibilité
  const deleteAvailability = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/availabilities/${id}`).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${selectedTourId}/availabilities`] });
      toast({
        title: "Disponibilité supprimée",
        description: "La disponibilité a été supprimée avec succès."
      });
      setIsDeleteDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de la disponibilité."
      });
    }
  });
  
  // Effet pour initialiser le formulaire d'édition
  useEffect(() => {
    if (selectedAvailability && isEditDialogOpen) {
      form.reset({
        tourId: selectedAvailability.tourId,
        date: new Date(selectedAvailability.date),
        maxCapacity: selectedAvailability.maxCapacity,
        price: selectedAvailability.price || undefined,
      });
    }
  }, [selectedAvailability, isEditDialogOpen, form]);
  
  // Effet pour réinitialiser le formulaire lors de l'ouverture de la modal de création
  useEffect(() => {
    if (isCreateDialogOpen) {
      form.reset({
        tourId: selectedTourId,
        date: addDays(new Date(), 1),
        maxCapacity: 10,
        price: undefined,
      });
    }
  }, [isCreateDialogOpen, selectedTourId, form]);
  
  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout.mutate();
  };
  
  // Fonction pour ouvrir la modal d'édition
  const openEditDialog = (availability: TourAvailability) => {
    setSelectedAvailability(availability);
    setIsEditDialogOpen(true);
  };
  
  // Fonction pour ouvrir la modal de suppression
  const openDeleteDialog = (availability: TourAvailability) => {
    setSelectedAvailability(availability);
    setIsDeleteDialogOpen(true);
  };
  
  // Fonction pour soumettre le formulaire de création
  const onSubmitCreate = (values: AvailabilityFormValues) => {
    createAvailability.mutate(values);
  };
  
  // Fonction pour soumettre le formulaire d'édition
  const onSubmitEdit = (values: AvailabilityFormValues) => {
    if (!selectedAvailability) return;
    
    updateAvailability.mutate({
      id: selectedAvailability.id,
      values
    });
  };
  
  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (!selectedAvailability) return;
    
    deleteAvailability.mutate(selectedAvailability.id);
  };
  
  // Vérification de l'authentification
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-white font-heading font-bold text-xl">Senthang</span>
                <span className="text-secondary font-accent text-xl ml-1">Siam</span>
                <span className="text-white font-heading font-bold text-xl ml-1">Tour</span>
              </div>
            </Link>
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded">
              Gestion des disponibilités
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-primary-dark"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
            <Link href="/admin/dashboard">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />
                Retour au tableau de bord
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">Gestion des disponibilités</h1>
          <p className="text-gray-600">Gérez les dates disponibles pour chaque tour, ainsi que leurs prix et capacités.</p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sélectionnez un tour</CardTitle>
            <CardDescription>Choisissez un tour pour voir et gérer ses disponibilités</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedTourId.toString()}
                onValueChange={(value) => setSelectedTourId(parseInt(value))}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Sélectionnez un tour" />
                </SelectTrigger>
                <SelectContent>
                  {isToursLoading ? (
                    <SelectItem value="loading" disabled>Chargement des tours...</SelectItem>
                  ) : tours && tours.length > 0 ? (
                    tours.map(tour => (
                      <SelectItem key={tour.id} value={tour.id.toString()}>
                        {tour.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>Aucun tour disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <Button 
                variant="default" 
                onClick={() => setIsCreateDialogOpen(true)}
                disabled={!selectedTourId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une disponibilité
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {selectedTourId ? (
          <Card>
            <CardHeader>
              <CardTitle>
                Disponibilités
                {tours?.find(t => t.id === selectedTourId) && (
                  <span className="text-gray-600 font-normal">
                    {" "}pour {tours.find(t => t.id === selectedTourId)?.title}
                  </span>
                )}
              </CardTitle>
              <CardDescription>Liste des dates disponibles pour ce tour</CardDescription>
            </CardHeader>
            <CardContent>
              {isAvailabilitiesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : availabilities && availabilities.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Capacité</TableHead>
                        <TableHead>Réservations actuelles</TableHead>
                        <TableHead>Places restantes</TableHead>
                        <TableHead>Prix spécifique</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availabilities.map(availability => {
                        const isInPast = !isAfter(new Date(availability.date), new Date());
                        const remainingSpots = availability.maxCapacity - availability.currentBookings;
                        
                        return (
                          <TableRow key={availability.id} className={isInPast ? "bg-gray-100" : ""}>
                            <TableCell className={isInPast ? "text-gray-500" : ""}>
                              {format(new Date(availability.date), 'dd MMMM yyyy', { locale: fr })}
                              {isInPast && <span className="ml-2 text-xs text-gray-400">(passé)</span>}
                            </TableCell>
                            <TableCell>{availability.maxCapacity}</TableCell>
                            <TableCell>{availability.currentBookings}</TableCell>
                            <TableCell>
                              {remainingSpots <= 0 ? (
                                <span className="text-red-600 font-semibold flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Complet
                                </span>
                              ) : remainingSpots <= 3 ? (
                                <span className="text-amber-600 font-semibold">
                                  {remainingSpots}
                                </span>
                              ) : (
                                <span>{remainingSpots}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {availability.price ? formatTHB(availability.price) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isInPast}
                                  onClick={() => openEditDialog(availability)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isInPast && availability.currentBookings > 0}
                                  onClick={() => openDeleteDialog(availability)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">Aucune disponibilité pour ce tour.</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter la première disponibilité
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="font-heading font-semibold text-xl mb-2">Sélectionnez un tour</h3>
            <p className="text-gray-500">
              Veuillez sélectionner un tour dans la liste ci-dessus pour gérer ses disponibilités.
            </p>
          </div>
        )}
      </main>
      
      {/* Modal de création de disponibilité */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle disponibilité</DialogTitle>
            <DialogDescription>
              Créez une nouvelle date disponible pour ce tour. Les clients pourront réserver à cette date.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= new Date()}
                      className="rounded-md border"
                      locale={fr}
                    />
                    <FormDescription>
                      Sélectionnez la date à laquelle le tour sera disponible.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacité maximale</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre maximum de personnes pouvant participer à ce tour.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix spécifique (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder="Laisser vide pour utiliser le prix par défaut du tour"
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Définissez un prix spécifique pour cette date (si différent du prix par défaut).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createAvailability.isPending}>
                  {createAvailability.isPending ? "Création..." : "Créer la disponibilité"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal d'édition de disponibilité */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la disponibilité</DialogTitle>
            <DialogDescription>
              Modifiez les détails de cette disponibilité.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= new Date()}
                      className="rounded-md border"
                      locale={fr}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacité maximale</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={selectedAvailability?.currentBookings || 1} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedAvailability?.currentBookings
                        ? `Minimum: ${selectedAvailability.currentBookings} (nombre de réservations actuelles)`
                        : "Nombre maximum de personnes pouvant participer à ce tour"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix spécifique (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder="Laisser vide pour utiliser le prix par défaut du tour"
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Définissez un prix spécifique pour cette date (si différent du prix par défaut).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateAvailability.isPending}>
                  {updateAvailability.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette disponibilité ?
              {selectedAvailability?.currentBookings !== undefined && selectedAvailability.currentBookings > 0 && (
                <div className="mt-2 p-3 bg-amber-50 text-amber-900 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Attention : Cette disponibilité a déjà <strong>{selectedAvailability.currentBookings} réservation(s)</strong>.
                    La suppression affectera ces réservations existantes.
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAvailability && (
            <div className="py-4 px-2">
              <p className="mb-2"><strong>Date :</strong> {format(new Date(selectedAvailability.date), 'dd MMMM yyyy', { locale: fr })}</p>
              <p><strong>Capacité :</strong> {selectedAvailability.maxCapacity} personnes</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteAvailability.isPending}
            >
              {deleteAvailability.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}