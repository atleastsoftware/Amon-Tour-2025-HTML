import { useTranslation } from 'react-i18next';
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
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour, TourAvailability } from "@shared/schema";
import { formatTHB } from "@/lib/utils";

// Schéma pour les disponibilités individuelles
const availabilitySchema = z.object({
  tourId: z.number().min(1, "Un tour est requis"),
  date: z.date({
    required_error: "Une date est requise",
    invalid_type_error: "Format de date invalide"
  }),
  maxCapacity: z.number().min(1, "Capacité minimum: 1").max(100, "Capacité maximum: 100"),
  price: z.number().min(0, "Prix minimum: 0").optional()
});

// Schéma pour la création en masse de disponibilités
const bulkAvailabilitySchema = z.object({
  tourId: z.number().min(1, "Un tour est requis"),
  numberOfMonths: z.number().min(1, "Minimum 1 mois").max(12, "Maximum 12 mois").default(3),
  maxCapacity: z.number().min(1, "Capacité minimum: 1").max(100, "Capacité maximum: 100"),
  price: z.number().min(0, "Prix minimum: 0").optional(),
  enableAllDays: z.boolean().default(true)
});
type AvailabilityFormValues = z.infer<typeof availabilitySchema>;
type BulkAvailabilityFormValues = z.infer<typeof bulkAvailabilitySchema>;
export default function AvailabilityManager() {
  const {
    t
  } = useTranslation();
  const {
    isAuthenticated
  } = useIsAuthenticated();
  const logout = useLogout();
  const [, navigate] = useLocation();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<TourAvailability | null>(null);
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);

  // Formulaire pour créer/modifier une disponibilité
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      tourId: 0,
      date: new Date(),
      maxCapacity: 10,
      price: undefined
    }
  });

  // Formulaire pour créer des disponibilités en masse
  const bulkForm = useForm<BulkAvailabilityFormValues>({
    resolver: zodResolver(bulkAvailabilitySchema),
    defaultValues: {
      tourId: 0,
      numberOfMonths: 3,
      maxCapacity: 10,
      price: undefined,
      enableAllDays: true
    }
  });

  // Récupérer la liste des tours
  const {
    data: tours,
    isLoading: isToursLoading
  } = useQuery<Tour[]>({
    queryKey: ["/api/tours"]
  });

  // Récupérer les disponibilités pour le tour sélectionné
  const {
    data: availabilities,
    isLoading: isAvailabilitiesLoading
  } = useQuery<TourAvailability[]>({
    queryKey: [`/api/tours/${selectedTourId}/availabilities`],
    enabled: !!selectedTourId
  });

  // Mutation pour créer une disponibilité
  const createAvailability = useMutation({
    mutationFn: (data: AvailabilityFormValues) => {
      return apiRequest("POST", `/api/tours/${data.tourId}/availabilities`, {
        date: format(data.date, 'yyyy-MM-dd'),
        maxCapacity: data.maxCapacity,
        price: data.price
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/tours/${selectedTourId}/availabilities`]
      });
      toast({
        title: t("Disponibilitxe9crxe9", {
          defaultValue: "Disponibilitxe9crxe9"
        }),
        description: t("Ladisponibilitxe9axe", {
          defaultValue: "Ladisponibilitxe9axe"
        })
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: error.message || "Une erreur est survenue lors de la création de la disponibilité."
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
            price: data.price
          });
          const result = await response.json();
          results.push(result);
        } catch (error) {
          console.error(`Erreur lors de la création pour ${format(date, 'yyyy-MM-dd')}:`, error);
        }
      }
      setIsCreatingBulk(false);
      return results;
    },
    onSuccess: results => {
      queryClient.invalidateQueries({
        queryKey: [`/api/tours/${selectedTourId}/availabilities`]
      });
      toast({
        title: t("Disponibilitxe9scrxe", {
          defaultValue: "Disponibilitxe9scrxe"
        }),
        description: `${results.length} disponibilités ont été ajoutées avec succès.`
      });
      setIsBulkCreateDialogOpen(false);
      bulkForm.reset();
    },
    onError: (error: any) => {
      setIsCreatingBulk(false);
      toast({
        variant: "destructive",
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: error.message || "Une erreur est survenue lors de la création des disponibilités."
      });
    }
  });

  // Mutation pour modifier une disponibilité
  const updateAvailability = useMutation({
    mutationFn: (data: {
      id: number;
      values: Partial<AvailabilityFormValues>;
    }) => {
      return apiRequest("PUT", `/api/availabilities/${data.id}`, {
        ...(data.values.date && {
          date: format(data.values.date, 'yyyy-MM-dd')
        }),
        ...(data.values.maxCapacity && {
          maxCapacity: data.values.maxCapacity
        }),
        ...(data.values.price !== undefined && {
          price: data.values.price
        })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/tours/${selectedTourId}/availabilities`]
      });
      toast({
        title: t("Disponibilitxe9misex", {
          defaultValue: "Disponibilitxe9misex"
        }),
        description: t("Ladisponibilitxe9axe", {
          defaultValue: "Ladisponibilitxe9axe"
        })
      });
      setIsEditDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
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
      queryClient.invalidateQueries({
        queryKey: [`/api/tours/${selectedTourId}/availabilities`]
      });
      toast({
        title: t("Disponibilitxe9suppr", {
          defaultValue: "Disponibilitxe9suppr"
        }),
        description: t("Ladisponibilitxe9axe", {
          defaultValue: "Ladisponibilitxe9axe"
        })
      });
      setIsDeleteDialogOpen(false);
      setSelectedAvailability(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
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
        price: selectedAvailability.price || undefined
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
        price: undefined
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
        enableAllDays: true
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
  return <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-white font-heading font-bold text-xl">{t("Senthang", {
                  defaultValue: "Senthang"
                })}</span>
                <span className="text-secondary font-accent text-xl ml-1">{t("Siam", {
                  defaultValue: "Siam"
                })}</span>
                <span className="text-white font-heading font-bold text-xl ml-1">{t("Tour", {
                  defaultValue: "Tour"
                })}</span>
              </div>
            </Link>
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded">{t("Gestiondesdisponibil", {
              defaultValue: "Gestiondesdisponibil"
            })}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-primary-dark" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />{t("Dxe9connexion", {
              defaultValue: "Dxe9connexion"
            })}</Button>
            <Link href="/admin/dashboard">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />{t("Retourautableaudebor", {
                defaultValue: "Retourautableaudebor"
              })}</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">{t("Gestiondesdisponibil", {
            defaultValue: "Gestiondesdisponibil"
          })}</h1>
          <p className="text-gray-600">{t("Gxe9rezlesdatesdispo", {
            defaultValue: "Gxe9rezlesdatesdispo"
          })}</p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("Sxe9lectionnezuntour", {
              defaultValue: "Sxe9lectionnezuntour"
            })}</CardTitle>
            <CardDescription>{t("Choisissezuntourpour", {
              defaultValue: "Choisissezuntourpour"
            })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedTourId.toString()} onValueChange={value => setSelectedTourId(parseInt(value))}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder={t("Sxe9lectionnezuntour", {
                  defaultValue: "Sxe9lectionnezuntour"
                })} />
                </SelectTrigger>
                <SelectContent>
                  {isToursLoading ? <SelectItem value="loading" disabled>{t("Chargementdestours", {
                    defaultValue: "Chargementdestours"
                  })}</SelectItem> : tours && tours.length > 0 ? tours.map(tour => <SelectItem key={tour.id} value={tour.id.toString()}>
                        {tour.title}
                      </SelectItem>) : <SelectItem value="empty" disabled>{t("Aucuntourdisponible", {
                    defaultValue: "Aucuntourdisponible"
                  })}</SelectItem>}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={openBulkCreateDialog} disabled={!selectedTourId}>
                  <CalendarRange className="h-4 w-4 mr-2" />{t("Ajouterenmasse", {
                  defaultValue: "Ajouterenmasse"
                })}</Button>
                
                <Button variant="default" onClick={() => setIsCreateDialogOpen(true)} disabled={!selectedTourId}>
                  <Plus className="h-4 w-4 mr-2" />{t("Ajouterunedisponibil", {
                  defaultValue: "Ajouterunedisponibil"
                })}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {selectedTourId ? <Card>
            <CardHeader>
              <CardTitle>{t("Disponibilitxe9s", {
              defaultValue: "Disponibilitxe9s"
            })}{tours?.find(t => t.id === selectedTourId) && <span className="text-gray-600 font-normal">
                    {" "}pour {tours.find(t => t.id === selectedTourId)?.title}
                  </span>}
              </CardTitle>
              <CardDescription>{t("Listedesdatesdisponi", {
              defaultValue: "Listedesdatesdisponi"
            })}</CardDescription>
            </CardHeader>
            <CardContent>
              {isAvailabilitiesLoading ? <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div> : availabilities && availabilities.length > 0 ? <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("Date", {
                      defaultValue: "Date"
                    })}</TableHead>
                        <TableHead>{t("Capacitxe9", {
                      defaultValue: "Capacitxe9"
                    })}</TableHead>
                        <TableHead>{t("Rxe9servationsactuel", {
                      defaultValue: "Rxe9servationsactuel"
                    })}</TableHead>
                        <TableHead>{t("Placesrestantes", {
                      defaultValue: "Placesrestantes"
                    })}</TableHead>
                        <TableHead>{t("Prixspxe9cifique", {
                      defaultValue: "Prixspxe9cifique"
                    })}</TableHead>
                        <TableHead className="text-right">{t("Actions", {
                      defaultValue: "Actions"
                    })}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availabilities.map(availability => {
                  const isInPast = !isAfter(new Date(availability.date), new Date());
                  const remainingSpots = availability.maxCapacity - availability.currentBookings;
                  return <TableRow key={availability.id} className={isInPast ? "bg-gray-100" : ""}>
                            <TableCell className={isInPast ? "text-gray-500" : ""}>
                              {format(new Date(availability.date), 'dd MMMM yyyy', {
                        locale: fr
                      })}
                              {isInPast && <span className="ml-2 text-xs text-gray-400">(passé)</span>}
                            </TableCell>
                            <TableCell>{availability.maxCapacity}</TableCell>
                            <TableCell>{availability.currentBookings}</TableCell>
                            <TableCell>
                              {remainingSpots <= 0 ? <span className="text-[hsl(var(--destructive))] font-semibold flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" />{t("Complet", {
                          defaultValue: "Complet"
                        })}</span> : remainingSpots <= 3 ? <span className="text-[hsl(var(--warning))] font-semibold">
                                  {remainingSpots}
                                </span> : <span>{remainingSpots}</span>}
                            </TableCell>
                            <TableCell>
                              {availability.price ? formatTHB(availability.price) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" disabled={isInPast} onClick={() => openEditDialog(availability)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" disabled={isInPast && availability.currentBookings > 0} onClick={() => openDeleteDialog(availability)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>;
                })}
                    </TableBody>
                  </Table>
                </div> : <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">{t("Aucunedisponibilitxe", {
                defaultValue: "Aucunedisponibilitxe"
              })}</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />{t("Ajouterlapremixe8red", {
                defaultValue: "Ajouterlapremixe8red"
              })}</Button>
                </div>}
            </CardContent>
          </Card> : <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="font-heading font-semibold text-xl mb-2">{t("Sxe9lectionnezuntour", {
            defaultValue: "Sxe9lectionnezuntour"
          })}</h3>
            <p className="text-gray-500">{t("Veuillezsxe9lectionn", {
            defaultValue: "Veuillezsxe9lectionn"
          })}</p>
          </div>}
      </main>
      
      {/* Modal de création de disponibilité */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("Ajouterunenouvelledi", {
              defaultValue: "Ajouterunenouvelledi"
            })}</DialogTitle>
            <DialogDescription>{t("Crxe9ezunenouvelleda", {
              defaultValue: "Crxe9ezunenouvelleda"
            })}</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
              <FormField control={form.control} name="date" render={({
              field
            }) => <FormItem className="flex flex-col">
                    <FormLabel>{t("Date", {
                  defaultValue: "Date"
                })}</FormLabel>
                    <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date <= new Date()} className="rounded-md border" locale={fr} />
                    <FormDescription>{t("Sxe9lectionnezladate", {
                  defaultValue: "Sxe9lectionnezladate"
                })}</FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="maxCapacity" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Capacitxe9maximale", {
                  defaultValue: "Capacitxe9maximale"
                })}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>{t("Nombremaximumdeperso", {
                  defaultValue: "Nombremaximumdeperso"
                })}</FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="price" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Prixspxe9cifiqueopti", {
                  defaultValue: "Prixspxe9cifiqueopti"
                })}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder={t("Laisservidepourutili", {
                  defaultValue: "Laisservidepourutili"
                })} value={field.value === undefined ? "" : field.value} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                    </FormControl>
                    <FormDescription>{t("Dxe9finissezunprixsp", {
                  defaultValue: "Dxe9finissezunprixsp"
                })}</FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t("Cancel", {
                  defaultValue: "Cancel"
                })}</Button>
                <Button type="submit" disabled={createAvailability.isPending}>
                  {createAvailability.isPending ? "Creating..." : "Create availability"}
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
            <DialogTitle>{t("Modifierladisponibil", {
              defaultValue: "Modifierladisponibil"
            })}</DialogTitle>
            <DialogDescription>{t("Modifiezlesdxe9tails", {
              defaultValue: "Modifiezlesdxe9tails"
            })}</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4 pt-4">
              <FormField control={form.control} name="date" render={({
              field
            }) => <FormItem className="flex flex-col">
                    <FormLabel>{t("Date", {
                  defaultValue: "Date"
                })}</FormLabel>
                    <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date <= new Date()} className="rounded-md border" locale={fr} />
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="maxCapacity" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Capacitxe9maximale", {
                  defaultValue: "Capacitxe9maximale"
                })}</FormLabel>
                    <FormControl>
                      <Input type="number" min={selectedAvailability?.currentBookings || 1} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      {selectedAvailability?.currentBookings ? `Minimum: ${selectedAvailability.currentBookings} (nombre de réservations actuelles)` : "Nombre maximum de personnes pouvant participer à ce tour"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="price" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Prixspxe9cifiqueopti", {
                  defaultValue: "Prixspxe9cifiqueopti"
                })}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder={t("Laisservidepourutili", {
                  defaultValue: "Laisservidepourutili"
                })} value={field.value === undefined ? "" : field.value} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                    </FormControl>
                    <FormDescription>{t("Dxe9finissezunprixsp", {
                  defaultValue: "Dxe9finissezunprixsp"
                })}</FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t("Cancel", {
                  defaultValue: "Cancel"
                })}</Button>
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
            <DialogTitle>{t("Confirmdeletion", {
              defaultValue: "Confirmdeletion"
            })}</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette disponibilité ?
              {selectedAvailability?.currentBookings !== undefined && selectedAvailability.currentBookings > 0 && <div className="mt-2 p-3 bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-[hsl(var(--warning))]" />
                  <span>{t("Attentioncettedispon", {
                  defaultValue: "Attentioncettedispon"
                })}<strong>{selectedAvailability.currentBookings} réservation(s)</strong>{t("Nlasuppressionaffect", {
                  defaultValue: "Nlasuppressionaffect"
                })}</span>
                </div>}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAvailability && <div className="py-4 px-2">
              <p className="mb-2"><strong>{t("Date", {
                defaultValue: "Date"
              })}</strong> {format(new Date(selectedAvailability.date), 'dd MMMM yyyy', {
              locale: fr
            })}</p>
              <p><strong>{t("Capacitxe9", {
                defaultValue: "Capacitxe9"
              })}</strong> {selectedAvailability.maxCapacity} personnes</p>
            </div>}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>{t("Cancel", {
              defaultValue: "Cancel"
            })}</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteAvailability.isPending}>
              {deleteAvailability.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal pour créer des disponibilités en masse */}
      <Dialog open={isBulkCreateDialogOpen} onOpenChange={setIsBulkCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Createbulkavailabili", {
              defaultValue: "Createbulkavailabili"
            })}</DialogTitle>
            <DialogDescription>{t("Activeztouslesjoursp", {
              defaultValue: "Activeztouslesjoursp"
            })}</DialogDescription>
          </DialogHeader>
          
          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit(onSubmitBulkCreate)} className="space-y-4">
              <FormField control={bulkForm.control} name="tourId" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Tour", {
                  defaultValue: "Tour"
                })}</FormLabel>
                    <Select disabled={true} value={selectedTourId.toString()} onValueChange={value => {
                field.onChange(parseInt(value));
              }}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Sxe9lectionneruntour", {
                    defaultValue: "Sxe9lectionneruntour"
                  })} />
                      </SelectTrigger>
                      <SelectContent>
                        {tours?.map(tour => <SelectItem key={tour.id} value={tour.id.toString()}>
                            {tour.title}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={bulkForm.control} name="numberOfMonths" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Durxe9enombredemois", {
                  defaultValue: "Durxe9enombredemois"
                })}</FormLabel>
                    <div className="flex items-center">
                      <Select value={field.value.toString()} onValueChange={value => field.onChange(parseInt(value))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("Sxe9lectionnerunedur", {
                      defaultValue: "Sxe9lectionnerunedur"
                    })} />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => <SelectItem key={month} value={month.toString()}>
                              {month} {month === 1 ? 'mois' : 'mois'}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>{t('Disponibilit\xE9s cr\xE9\xE9es \xE0 partir d\'aujourd\'hui pour le nombre de mois s\xE9lectionn\xE9', {
                  defaultValue: 'Disponibilit\xE9s cr\xE9\xE9es \xE0 partir d\'aujourd\'hui pour le nombre de mois s\xE9lectionn\xE9'
                })}</FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={bulkForm.control} name="enableAllDays" render={({
              field
            }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t("Activertouslesjours", {
                    defaultValue: "Activertouslesjours"
                  })}</FormLabel>
                      <FormDescription>{t("Touslesjoursserontdi", {
                    defaultValue: "Touslesjoursserontdi"
                  })}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={bulkForm.control} name="maxCapacity" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Capacitxe9maximale", {
                  defaultValue: "Capacitxe9maximale"
                })}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={100} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={bulkForm.control} name="price" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Prixspxe9cifiqueopti", {
                  defaultValue: "Prixspxe9cifiqueopti"
                })}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder={t("Laisservidepourutili", {
                  defaultValue: "Laisservidepourutili"
                })} {...field} value={field.value || ""} onChange={e => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  field.onChange(value);
                }} />
                    </FormControl>
                    <FormDescription>{t("Silaissxe9videleprix", {
                  defaultValue: "Silaissxe9videleprix"
                })}</FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsBulkCreateDialogOpen(false)}>{t("Cancel", {
                  defaultValue: "Cancel"
                })}</Button>
                <Button type="submit" disabled={createBulkAvailabilities.isPending || isCreatingBulk}>
                  {createBulkAvailabilities.isPending || isCreatingBulk ? "Creating..." : "Create availabilities"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>;
}