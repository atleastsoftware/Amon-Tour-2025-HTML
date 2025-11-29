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
import { useTranslationSection } from "@/contexts/TranslationContext";
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

// Zod schemas with static English validation messages
const availabilitySchema = z.object({
  tourId: z.number().min(1, "Please select a tour"),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date format",
  }),
  maxCapacity: z.number().min(1, "Capacity must be at least 1").max(100, "Capacity cannot exceed 100"),
  price: z.number().min(0, "Price must be 0 or greater").optional(),
});

const bulkAvailabilitySchema = z.object({
  tourId: z.number().min(1, "Please select a tour"),
  numberOfMonths: z.number().min(1, "Must be at least 1 month").max(12, "Cannot exceed 12 months").default(3),
  maxCapacity: z.number().min(1, "Capacity must be at least 1").max(100, "Capacity cannot exceed 100"),
  price: z.number().min(0, "Price must be 0 or greater").optional(),
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
  const admin = useTranslationSection('admin');
  const queryClient = useQueryClient();
  
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<TourAvailability | null>(null);
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);
  
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
  
  // Fetch tours list
  const { data: tours, isLoading: isToursLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });
  
  // Fetch availabilities for selected tour
  const { data: availabilities, isLoading: isAvailabilitiesLoading } = useQuery<TourAvailability[]>({
    queryKey: [`/api/tours/${selectedTourId}/availabilities`],
    enabled: !!selectedTourId,
  });
  
  // Mutation to create an availability
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
        title: admin.availabilityManager?.createSuccess || "Availability Created",
        description: admin.availabilityManager?.createSuccessDescription || "The availability has been successfully added"
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: admin.common?.error || "Error",
        description: error.message || admin.availabilityManager?.createError || "Failed to create availability"
      });
    }
  });
  
  // Mutation to create bulk availabilities
  const createBulkAvailabilities = useMutation({
    mutationFn: async (data: BulkAvailabilityFormValues) => {
      // Calculate start date (today) and end date (after X months)
      const startDate = new Date();
      const endDate = addMonths(startDate, data.numberOfMonths);
      
      // Generate all dates in the range
      const allDaysInRange = eachDayOfInterval({
        start: startDate,
        end: endDate
      });
      
      // If enableAllDays is true, use all dates
      const selectedDays = allDaysInRange;
      
      // Create availabilities for each date
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
        title: admin.availabilityManager?.bulkCreateSuccess || "Bulk Creation Successful",
        description: `${results.length} ${admin.availabilityManager?.bulkCreateSuccessDescription?.replace('{{count}}', results.length.toString()) || 'availabilities have been created'}`
      });
      setIsBulkCreateDialogOpen(false);
      bulkForm.reset();
    },
    onError: (error: any) => {
      setIsCreatingBulk(false);
      toast({
        variant: "destructive",
        title: admin.common?.error || "Error",
        description: error.message || admin.availabilityManager?.bulkCreateError || "Failed to create bulk availabilities"
      });
    }
  });
  
  // Mutation to update an availability
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
        title: admin.availabilityManager?.updateSuccess || "Availability Updated",
        description: admin.availabilityManager?.updateSuccessDescription || "The availability has been successfully updated"
      });
      setIsEditDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: admin.common?.error || "Error",
        description: error.message || admin.availabilityManager?.updateError || "Failed to update availability"
      });
    }
  });
  
  // Mutation to delete an availability
  const deleteAvailability = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/availabilities/${id}`).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${selectedTourId}/availabilities`] });
      toast({
        title: admin.availabilityManager?.deleteSuccess || "Availability Deleted",
        description: admin.availabilityManager?.deleteSuccessDescription || "The availability has been successfully removed"
      });
      setIsDeleteDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: admin.common?.error || "Error",
        description: error.message || admin.availabilityManager?.deleteError || "Failed to delete availability"
      });
    }
  });
  
  // Effect to initialize edit form
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
  
  // Effect to reset form when opening create modal
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
  
  // Effect to reset bulk creation form
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
  
  // Function to handle logout
  const handleLogout = () => {
    logout.mutate();
  };
  
  // Function to open edit dialog
  const openEditDialog = (availability: TourAvailability) => {
    setSelectedAvailability(availability);
    setIsEditDialogOpen(true);
  };
  
  // Function to open delete dialog
  const openDeleteDialog = (availability: TourAvailability) => {
    setSelectedAvailability(availability);
    setIsDeleteDialogOpen(true);
  };
  
  // Function to open bulk create dialog
  const openBulkCreateDialog = () => {
    setIsBulkCreateDialogOpen(true);
  };
  
  // Function to submit create form
  const onSubmitCreate = (values: AvailabilityFormValues) => {
    createAvailability.mutate(values);
  };
  
  // Function to submit edit form
  const onSubmitEdit = (values: AvailabilityFormValues) => {
    if (!selectedAvailability) return;
    
    updateAvailability.mutate({
      id: selectedAvailability.id,
      values
    });
  };
  
  // Function to submit bulk create form
  const onSubmitBulkCreate = (values: BulkAvailabilityFormValues) => {
    createBulkAvailabilities.mutate(values);
  };
  
  // Function to confirm deletion
  const confirmDelete = () => {
    if (!selectedAvailability) return;
    
    deleteAvailability.mutate(selectedAvailability.id);
  };
  
  // Check authentication
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-availability-manager">
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer" data-testid="link-home">
                <span className="text-white font-heading font-bold text-xl">Senthang</span>
                <span className="text-secondary font-accent text-xl ml-1">Siam</span>
                <span className="text-white font-heading font-bold text-xl ml-1">Tour</span>
              </div>
            </Link>
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded" data-testid="text-page-title">
              {admin.availabilityManager?.title || "Availability Manager"}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-primary-dark"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {admin.availabilityManager?.logout || "Logout"}
            </Button>
            <Link href="/admin/dashboard">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer" data-testid="link-back-to-dashboard">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />
                {admin.availabilityManager?.backToDashboard || "Back to Dashboard"}
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2" data-testid="text-title">{admin.availabilityManager?.title || "Availability Manager"}</h1>
          <p className="text-gray-600" data-testid="text-subtitle">{admin.availabilityManager?.subtitle || "Manage tour availabilities and capacities"}</p>
        </div>
        
        <Card className="mb-8" data-testid="card-tour-selection">
          <CardHeader>
            <CardTitle data-testid="text-select-tour-title">{admin.availabilityManager?.selectTour || "Select a Tour"}</CardTitle>
            <CardDescription data-testid="text-select-tour-description">{admin.availabilityManager?.selectTourDescription || "Choose a tour to manage its availabilities"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedTourId.toString()}
                onValueChange={(value) => setSelectedTourId(parseInt(value))}
                data-testid="select-tour"
              >
                <SelectTrigger className="w-full sm:w-[300px]" data-testid="select-tour-trigger">
                  <SelectValue placeholder={admin.availabilityManager?.selectTourPlaceholder || "Select a tour..."} />
                </SelectTrigger>
                <SelectContent>
                  {isToursLoading ? (
                    <SelectItem value="loading" disabled>{admin.availabilityManager?.loadingTours || "Loading tours..."}</SelectItem>
                  ) : tours && tours.length > 0 ? (
                    tours.map(tour => (
                      <SelectItem key={tour.id} value={tour.id.toString()} data-testid={`select-tour-option-${tour.id}`}>
                        {tour.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>{admin.availabilityManager?.noToursAvailable || "No tours available"}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={openBulkCreateDialog}
                  disabled={!selectedTourId}
                  data-testid="button-add-bulk"
                >
                  <CalendarRange className="h-4 w-4 mr-2" />
                  {admin.availabilityManager?.addInBulk || "Add in Bulk"}
                </Button>
                
                <Button 
                  variant="default" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={!selectedTourId}
                  data-testid="button-add-availability"
                >
                  <Plus data-testid="icon-plus" className="h-4 w-4 mr-2" />
                  {admin.availabilityManager?.addAvailability || "Add Availability"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {selectedTourId ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {admin.availabilityManager?.availabilities || "Availabilities"}
                {tours?.find(t => t.id === selectedTourId) && (
                  <span className="text-gray-600 font-normal">
                    {" "}{(`for ${tours.find(t => t.id === selectedTourId)?.title || ''}`)}
                  </span>
                )}
              </CardTitle>
              <CardDescription>{admin.availabilityManager?.availabilityList || "Manage dates, capacities, and specific prices"}</CardDescription>
            </CardHeader>
            <CardContent>
              {isAvailabilitiesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : availabilities && availabilities.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table data-testid="table-availabilities">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{admin.availabilityManager?.tableHeaders?.date || "Date"}</TableHead>
                        <TableHead>{admin.availabilityManager?.tableHeaders?.capacity || "Capacity"}</TableHead>
                        <TableHead>{admin.availabilityManager?.tableHeaders?.currentBookings || "Current Bookings"}</TableHead>
                        <TableHead>{admin.availabilityManager?.tableHeaders?.remainingSpots || "Remaining Spots"}</TableHead>
                        <TableHead>{admin.availabilityManager?.tableHeaders?.specificPrice || "Specific Price"}</TableHead>
                        <TableHead className="text-right">{admin.availabilityManager?.tableHeaders?.actions || "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availabilities.map(availability => {
                        const isInPast = !isAfter(new Date(availability.date), new Date());
                        const remainingSpots = availability.maxCapacity - availability.currentBookings;
                        
                        return (
                          <TableRow key={availability.id} data-testid={`row-availability-${availability.id}`} className={isInPast ? "bg-gray-100" : ""}>
                            <TableCell className={isInPast ? "text-gray-500" : ""}>
                              {format(new Date(availability.date), 'dd MMMM yyyy', { locale: fr })}
                              {isInPast && <span className="ml-2 text-xs text-gray-400">{admin.availabilityManager?.past || "Past"}</span>}
                            </TableCell>
                            <TableCell>{availability.maxCapacity}</TableCell>
                            <TableCell>{availability.currentBookings}</TableCell>
                            <TableCell>
                              {remainingSpots <= 0 ? (
                                <span className="text-[hsl(var(--destructive))] font-semibold flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {admin.availabilityManager?.full || "Full"}
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
                                <Button data-testid="button-edit"
                                  variant="outline"
                                  size="sm"
                                  disabled={isInPast}
                                  onClick={() => openEditDialog(availability)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button data-testid="button-edit"
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
                  <Calendar data-testid="icon-calendar" className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4" data-testid="text-no-availabilities">{admin.availabilityManager?.noAvailabilities || "No availabilities for this tour yet."}</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus data-testid="icon-plus" className="h-4 w-4 mr-2" />
                    {admin.availabilityManager?.addFirstAvailability || "Add First Availability"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="font-heading font-semibold text-xl mb-2">{admin.availabilityManager?.selectTourPrompt || "Select a tour to manage its availabilities"}</h3>
            <p className="text-gray-500">
              {admin.availabilityManager?.selectTourPromptDescription || "Use the dropdown above to choose a tour and view or add availabilities."}
            </p>
          </div>
        )}
      </main>
      
      {/* Modal de création de disponibilité */}
      <Dialog open={isCreateDialogOpen} data-testid="dialog-create-availability" onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{admin.availabilityManager?.createDialogTitle || "Add New Availability"}</DialogTitle>
            <DialogDescription>
              {admin.availabilityManager?.createDialogDescription || "Add a new availability date for the selected tour"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form data-testid="form-create-availability" onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{admin.availabilityManager?.fields?.date || "Date"}</FormLabel>
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= new Date()}
                      className="rounded-md border"
                      locale={fr}
                    />
                    <FormDescription>
                      {admin.availabilityManager?.fields?.selectDate || "Select a date"}
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
                    <FormLabel>{admin.availabilityManager?.fields?.maxCapacity || "Maximum Capacity"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        placeholder={"10"}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {admin.availabilityManager?.fields?.capacityDescription || "Maximum number of participants"}
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
                    <FormLabel>{admin.availabilityManager?.fields?.price || "Specific Price (optional)"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder={admin.availabilityManager?.fields?.priceDescription || "Leave blank to use the default tour price"}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {admin.availabilityManager?.fields?.priceDescription || "Leave blank to use the default tour price"}
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
                  {"Cancel"}
                </Button>
                <Button type="submit" disabled={createAvailability.isPending}>
                  {createAvailability.isPending ? "Creating..." : "Create Availability"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal d'édition de disponibilité */}
      <Dialog open={isEditDialogOpen} data-testid="dialog-edit-availability" onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{admin.availabilityManager?.editDialogTitle || "Edit Availability"}</DialogTitle>
            <DialogDescription>
              {admin.availabilityManager?.editDialogDescription || "Modify the availability settings"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form data-testid="form-edit-availability" onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{admin.availabilityManager?.fields?.date || "Date"}</FormLabel>
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
                    <FormLabel>{admin.availabilityManager?.fields?.maxCapacity || "Maximum Capacity"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={selectedAvailability?.currentBookings || 1}
                        placeholder={"10"}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedAvailability?.currentBookings
                        ? `Minimum: ${selectedAvailability.currentBookings} (current bookings)`
                        : admin.availabilityManager?.fields?.capacityDescription || "Maximum number of participants"}
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
                    <FormLabel>{admin.availabilityManager?.fields?.price || "Specific Price (optional)"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder={admin.availabilityManager?.fields?.priceDescription || "Leave blank to use the default tour price"}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {admin.availabilityManager?.fields?.priceDescription || "Leave blank to use the default tour price"}
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
                  {"Cancel"}
                </Button>
                <Button type="submit" disabled={updateAvailability.isPending}>
                  {updateAvailability.isPending ? "Saving..." : "Update Availability"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} data-testid="dialog-delete-availability" onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{admin.availabilityManager?.deleteDialogTitle || "Delete Availability"}</DialogTitle>
            <DialogDescription>
              {admin.availabilityManager?.deleteDialogDescription || "Are you sure you want to delete this availability?"}
              {selectedAvailability?.currentBookings !== undefined && selectedAvailability.currentBookings > 0 && (
                <div className="mt-2 p-3 bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-[hsl(var(--warning))]" />
                  <span>
                    {admin.availabilityManager?.deleteDialogWarning || "Warning: This availability has existing bookings."}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAvailability && (
            <div className="py-4 px-2">
              <p className="mb-2"><strong>{admin.availabilityManager?.fields?.date || "Date"}:</strong> {format(new Date(selectedAvailability.date), 'dd MMMM yyyy', { locale: fr })}</p>
              <p><strong>{admin.availabilityManager?.fields?.maxCapacity || "Maximum Capacity"}:</strong> {selectedAvailability.maxCapacity} {"people"}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {"Cancel"}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteAvailability.isPending}
            >
              {deleteAvailability.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Create Dialog */}
      <Dialog open={isBulkCreateDialogOpen} data-testid="dialog-bulk-create" onOpenChange={setIsBulkCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{admin.availabilityManager?.bulkCreateDialogTitle || "Add Availabilities in Bulk"}</DialogTitle>
            <DialogDescription>
              {admin.availabilityManager?.bulkCreateDialogDescription || "Create multiple availabilities at once for the coming months"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...bulkForm}>
            <form data-testid="form-bulk-create" onSubmit={bulkForm.handleSubmit(onSubmitBulkCreate)} className="space-y-4">
              <FormField
                control={bulkForm.control}
                name="tourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Tour"}</FormLabel>
                    <Select
                      disabled={true}
                      value={selectedTourId.toString()}
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={admin.availabilityManager?.selectTourPlaceholder || "Select a tour..."} />
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
                    <FormLabel>{admin.availabilityManager?.fields?.numberOfMonths || "Number of Months"}</FormLabel>
                    <div className="flex items-center">
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={"3 months"} />
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
                      {admin.availabilityManager?.fields?.monthsDescription || "How many months ahead to create availabilities"}
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
                      <FormLabel>{admin.availabilityManager?.fields?.enableAllDays || "Enable All Days"}</FormLabel>
                      <FormDescription>
                        {"Create availability for every day in the selected period"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch data-testid="switch-enable-all-days"
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
                    <FormLabel>{admin.availabilityManager?.fields?.maxCapacity || "Maximum Capacity"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder={"10"}
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
                    <FormLabel>{admin.availabilityManager?.fields?.price || "Specific Price (optional)"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder={admin.availabilityManager?.fields?.priceDescription || "Leave blank to use the default tour price"}
                        {...field}
                        value={field.value || ""}
                        onChange={e => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {admin.availabilityManager?.fields?.priceDescription || "Leave blank to use the default tour price"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button data-testid="button-edit"
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkCreateDialogOpen(false)}
                >
                  {"Cancel"}
                </Button>
                <Button 
                  type="submit"
                  disabled={createBulkAvailabilities.isPending || isCreatingBulk}
                >
                  {createBulkAvailabilities.isPending || isCreatingBulk ? "Creating..." : "Create Availability"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}