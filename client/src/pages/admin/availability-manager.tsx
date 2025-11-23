import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, isAfter, parseISO, addDays, addMonths, eachDayOfInterval, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { LogOut, ChevronLeft, Plus, Calendar, Edit, Trash2, AlertTriangle, CalendarRange } from "lucide-react";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUITranslation } from "@/hooks/useUITranslation";
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
import { Switch } from "@/components/ui/switch";
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

const getAvailabilitySchema = (t: (key: string) => string) => z.object({
  tourId: z.number().min(1, t('availabilityManager.validation.tourRequired')),
  date: z.date({
    required_error: t('availabilityManager.validation.dateRequired'),
    invalid_type_error: t('availabilityManager.validation.dateInvalid'),
  }),
  maxCapacity: z.number().min(1, t('availabilityManager.validation.capacityMin')).max(100, t('availabilityManager.validation.capacityMax')),
  price: z.number().min(0, t('availabilityManager.validation.priceMin')).optional(),
});

const getBulkAvailabilitySchema = (t: (key: string) => string) => z.object({
  tourId: z.number().min(1, t('availabilityManager.validation.tourRequired')),
  numberOfMonths: z.number().min(1, t('availabilityManager.validation.monthsMin')).max(12, t('availabilityManager.validation.monthsMax')).default(3),
  maxCapacity: z.number().min(1, t('availabilityManager.validation.capacityMin')).max(100, t('availabilityManager.validation.capacityMax')),
  price: z.number().min(0, t('availabilityManager.validation.priceMin')).optional(),
  enableAllDays: z.boolean().default(true),
});

type AvailabilityFormValues = {
  tourId: number;
  date: Date;
  maxCapacity: number;
  price?: number;
};
type BulkAvailabilityFormValues = {
  tourId: number;
  numberOfMonths: number;
  maxCapacity: number;
  price?: number;
  enableAllDays: boolean;
};

export default function AvailabilityManager() {
  const { isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useUITranslation();
  const queryClient = useQueryClient();
  
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<TourAvailability | null>(null);
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);
  
  const availabilitySchema = getAvailabilitySchema(t);
  const bulkAvailabilitySchema = getBulkAvailabilitySchema(t);
  
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      tourId: 0,
      date: new Date(),
      maxCapacity: 10,
      price: undefined,
    },
  });
  
  const bulkForm = useForm<BulkAvailabilityFormValues>({
    resolver: zodResolver(bulkAvailabilitySchema),
    defaultValues: {
      tourId: 0,
      numberOfMonths: 3,
      maxCapacity: 10,
      price: undefined,
      enableAllDays: true,
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
        title: t('availabilityManager.createSuccess'),
        description: t('availabilityManager.createSuccessDescription')
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message || t('availabilityManager.createError')
      });
    }
  });
  
  // Mutation pour créer des disponibilités en masse
  const createBulkAvailabilities = useMutation({
    mutationFn: async (data: BulkAvailabilityFormValues) => {
      // Calculer la date de début (aujourd'hui) et la date de fin (après X mois)
      const startDate = new Date();
      const endDate = addMonths(startDate, data.numberOfMonths);
      
      // Générer toutes les dates dans la plage
      const allDaysInRange = eachDayOfInterval({
        start: startDate,
        end: endDate
      });
      
      // Si enableAllDays est true, utiliser toutes les dates
      // Sinon, on pourrait filtrer certains jours, mais on met tout par défaut
      const selectedDays = allDaysInRange;
      
      // Créer les disponibilités pour chaque date
      const results = [];
      setIsCreatingBulk(true);
      
      for (const date of selectedDays) {
        try {
          const response = await apiRequest("POST", `/api/tours/${data.tourId}/availabilities`, {
            date: format(date, 'yyyy-MM-dd'),
            maxCapacity: data.maxCapacity,
            price: data.price,
          });
          
          const result = await response.json();
          results.push(result);
        } catch (error) {
          console.error(`Error creating availability for ${format(date, 'yyyy-MM-dd')}:`, error);
        }
      }
      
      setIsCreatingBulk(false);
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${selectedTourId}/availabilities`] });
      toast({
        title: t('availabilityManager.bulkCreateSuccess'),
        description: t('availabilityManager.bulkCreateSuccessDescription', { count: results.length })
      });
      setIsBulkCreateDialogOpen(false);
      bulkForm.reset();
    },
    onError: (error: any) => {
      setIsCreatingBulk(false);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message || t('availabilityManager.bulkCreateError')
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
        title: t('availabilityManager.updateSuccess'),
        description: t('availabilityManager.updateSuccessDescription')
      });
      setIsEditDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message || t('availabilityManager.updateError')
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
        title: t('availabilityManager.deleteSuccess'),
        description: t('availabilityManager.deleteSuccessDescription')
      });
      setIsDeleteDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message || t('availabilityManager.deleteError')
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
  
  // Effet pour réinitialiser le formulaire de création en masse
  useEffect(() => {
    if (isBulkCreateDialogOpen) {
      bulkForm.reset({
        tourId: selectedTourId,
        numberOfMonths: 3,
        maxCapacity: 10,
        price: undefined,
        enableAllDays: true,
      });
    }
  }, [isBulkCreateDialogOpen, selectedTourId, bulkForm]);
  
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
  
  // Fonction pour ouvrir la modal de création en masse
  const openBulkCreateDialog = () => {
    setIsBulkCreateDialogOpen(true);
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
  
  // Fonction pour soumettre le formulaire de création en masse
  const onSubmitBulkCreate = (values: BulkAvailabilityFormValues) => {
    createBulkAvailabilities.mutate(values);
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
              {t('availabilityManager.title')}
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
              {t('availabilityManager.logout')}
            </Button>
            <Link href="/admin/dashboard">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />
                {t('availabilityManager.backToDashboard')}
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">{t('availabilityManager.title')}</h1>
          <p className="text-gray-600">{t('availabilityManager.subtitle')}</p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('availabilityManager.selectTour')}</CardTitle>
            <CardDescription>{t('availabilityManager.selectTourDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedTourId.toString()}
                onValueChange={(value) => setSelectedTourId(parseInt(value))}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder={t('availabilityManager.selectTourPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {isToursLoading ? (
                    <SelectItem value="loading" disabled>{t('availabilityManager.loadingTours')}</SelectItem>
                  ) : tours && tours.length > 0 ? (
                    tours.map(tour => (
                      <SelectItem key={tour.id} value={tour.id.toString()}>
                        {tour.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>{t('availabilityManager.noToursAvailable')}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={openBulkCreateDialog}
                  disabled={!selectedTourId}
                >
                  <CalendarRange className="h-4 w-4 mr-2" />
                  {t('availabilityManager.addInBulk')}
                </Button>
                
                <Button 
                  variant="default" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={!selectedTourId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('availabilityManager.addAvailability')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {selectedTourId ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {t('availabilityManager.availabilities')}
                {tours?.find(t => t.id === selectedTourId) && (
                  <span className="text-gray-600 font-normal">
                    {" "}{t('availabilityManager.availabilitiesFor', { title: tours.find(t => t.id === selectedTourId)?.title })}
                  </span>
                )}
              </CardTitle>
              <CardDescription>{t('availabilityManager.availabilityList')}</CardDescription>
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
                        <TableHead>{t('availabilityManager.tableHeaders.date')}</TableHead>
                        <TableHead>{t('availabilityManager.tableHeaders.capacity')}</TableHead>
                        <TableHead>{t('availabilityManager.tableHeaders.currentBookings')}</TableHead>
                        <TableHead>{t('availabilityManager.tableHeaders.remainingSpots')}</TableHead>
                        <TableHead>{t('availabilityManager.tableHeaders.specificPrice')}</TableHead>
                        <TableHead className="text-right">{t('availabilityManager.tableHeaders.actions')}</TableHead>
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
                              {isInPast && <span className="ml-2 text-xs text-gray-400">{t('availabilityManager.past')}</span>}
                            </TableCell>
                            <TableCell>{availability.maxCapacity}</TableCell>
                            <TableCell>{availability.currentBookings}</TableCell>
                            <TableCell>
                              {remainingSpots <= 0 ? (
                                <span className="text-[hsl(var(--destructive))] font-semibold flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {t('availabilityManager.full')}
                                </span>
                              ) : remainingSpots <= 3 ? (
                                <span className="text-[hsl(var(--warning))] font-semibold">
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
                  <p className="text-gray-500 mb-4">{t('availabilityManager.noAvailabilities')}</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('availabilityManager.addFirstAvailability')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="font-heading font-semibold text-xl mb-2">{t('availabilityManager.selectTourPrompt')}</h3>
            <p className="text-gray-500">
              {t('availabilityManager.selectTourPromptDescription')}
            </p>
          </div>
        )}
      </main>
      
      {/* Modal de création de disponibilité */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('availabilityManager.createDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('availabilityManager.createDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('availabilityManager.fields.date')}</FormLabel>
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= new Date()}
                      className="rounded-md border"
                      locale={fr}
                    />
                    <FormDescription>
                      {t('availabilityManager.fields.dateDescription')}
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
                    <FormLabel>{t('availabilityManager.fields.capacity')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        placeholder={t('availabilityManager.fields.capacityPlaceholder')}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('availabilityManager.fields.capacityDescription')}
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
                    <FormLabel>{t('availabilityManager.fields.price')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder={t('availabilityManager.fields.priceDescription')}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('availabilityManager.fields.priceDescription')}
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
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createAvailability.isPending}>
                  {createAvailability.isPending ? t('availabilityManager.creating') : t('availabilityManager.create')}
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
            <DialogTitle>{t('availabilityManager.editDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('availabilityManager.editDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('availabilityManager.fields.date')}</FormLabel>
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
                    <FormLabel>{t('availabilityManager.fields.capacity')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={selectedAvailability?.currentBookings || 1}
                        placeholder={t('availabilityManager.fields.capacityPlaceholder')}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedAvailability?.currentBookings
                        ? `Minimum: ${selectedAvailability.currentBookings} (current bookings)`
                        : t('availabilityManager.fields.capacityDescription')}
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
                    <FormLabel>{t('availabilityManager.fields.price')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder={t('availabilityManager.fields.priceDescription')}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('availabilityManager.fields.priceDescription')}
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
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={updateAvailability.isPending}>
                  {updateAvailability.isPending ? t('common.saving') : t('availabilityManager.update')}
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
            <DialogTitle>{t('availabilityManager.deleteDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('availabilityManager.deleteDialogDescription')}
              {selectedAvailability?.currentBookings !== undefined && selectedAvailability.currentBookings > 0 && (
                <div className="mt-2 p-3 bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-[hsl(var(--warning))]" />
                  <span>
                    {t('availabilityManager.deleteDialogWarning')}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAvailability && (
            <div className="py-4 px-2">
              <p className="mb-2"><strong>{t('availabilityManager.fields.date')}:</strong> {format(new Date(selectedAvailability.date), 'dd MMMM yyyy', { locale: fr })}</p>
              <p><strong>{t('availabilityManager.fields.capacity')}:</strong> {selectedAvailability.maxCapacity} {t('common.people', { defaultValue: 'people' })}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteAvailability.isPending}
            >
              {deleteAvailability.isPending ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal pour créer des disponibilités en masse */}
      <Dialog open={isBulkCreateDialogOpen} onOpenChange={setIsBulkCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('availabilityManager.bulkCreateDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('availabilityManager.bulkCreateDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit(onSubmitBulkCreate)} className="space-y-4">
              <FormField
                control={bulkForm.control}
                name="tourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.tour', { defaultValue: 'Tour' })}</FormLabel>
                    <Select
                      disabled={true}
                      value={selectedTourId.toString()}
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('availabilityManager.selectTourPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {tours?.map(tour => (
                          <SelectItem key={tour.id} value={tour.id.toString()}>
                            {tour.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bulkForm.control}
                name="numberOfMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('availabilityManager.fields.numberOfMonths')}</FormLabel>
                    <div className="flex items-center">
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('availabilityManager.fields.numberOfMonthsPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {month} {month === 1 ? 'month' : 'months'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>
                      {t('availabilityManager.fields.numberOfMonthsDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bulkForm.control}
                name="enableAllDays"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('availabilityManager.fields.enableAllDays')}</FormLabel>
                      <FormDescription>
                        {t('availabilityManager.fields.enableAllDaysDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bulkForm.control}
                name="maxCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('availabilityManager.fields.capacity')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder={t('availabilityManager.fields.capacityPlaceholder')}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bulkForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('availabilityManager.fields.price')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder={t('availabilityManager.fields.priceDescription')}
                        {...field}
                        value={field.value || ""}
                        onChange={e => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('availabilityManager.fields.priceDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkCreateDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit"
                  disabled={createBulkAvailabilities.isPending || isCreatingBulk}
                >
                  {createBulkAvailabilities.isPending || isCreatingBulk ? t('availabilityManager.creating') : t('availabilityManager.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}