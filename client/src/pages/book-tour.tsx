import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tour, TourAvailability } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, User, Clock, Euro, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { format, addMonths, isAfter, isSameDay, startOfMonth, isBefore, parseISO, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatTHB } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Charger le client Stripe avec la clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Schéma de validation pour le formulaire de réservation
const bookingSchema = z.object({
  customerName: z.string().min(3, "Le nom est requis (minimum 3 caractères)"),
  customerEmail: z.string().email("Email invalide"),
  customerPhone: z.string().min(5, "Numéro de téléphone invalide"),
  numberOfPeople: z.number().min(1, "Minimum 1 personne").max(20, "Maximum 20 personnes"),
  numberOfChildren: z.number().min(0, "Ne peut pas être négatif").max(15, "Maximum 15 enfants").default(0),
  specialRequests: z.string().optional(),
  totalAmount: z.number().optional() // Ce champ sera calculé lors de la soumission
});
type BookingFormData = z.infer<typeof bookingSchema>;

// Composant pour la sélection de date
const DateSelector = ({
  tourId,
  onSelectDate,
  selectedDate
}: {
  tourId: number;
  onSelectDate: (date: Date | undefined, availability: TourAvailability | undefined) => void;
  selectedDate?: Date;
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availabilities, setAvailabilities] = useState<TourAvailability[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Requête pour récupérer les disponibilités pour ce tour
  const {
    data,
    isLoading
  } = useQuery<TourAvailability[]>({
    queryKey: [`/api/tours/${tourId}/availabilities`],
    enabled: !!tourId
  });
  useEffect(() => {
    if (data) {
      // Filtrer les disponibilités qui ont encore de la place
      const validAvailabilities = data.filter(a => a.currentBookings < a.maxCapacity && isAfter(new Date(a.date), new Date()));
      setAvailabilities(validAvailabilities);

      // Créer la liste des dates disponibles
      const dates = validAvailabilities.map(a => new Date(a.date));
      setAvailableDates(dates);

      // Si nous avons des dates disponibles et qu'aucune date n'est sélectionnée,
      // aller au premier mois avec des disponibilités
      if (dates.length > 0 && !selectedDate) {
        dates.sort((a, b) => a.getTime() - b.getTime());
        setSelectedMonth(startOfMonth(dates[0]));
      }
    }
  }, [data, selectedDate]);

  // Fonction pour vérifier si une date est disponible
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => isSameDay(availableDate, date));
  };

  // Obtenir l'information sur la disponibilité pour une date spécifique
  const getAvailabilityInfo = (date: Date) => {
    const availability = availabilities.find(a => isSameDay(new Date(a.date), date));
    if (!availability) return null;
    const spotsAvailable = availability.maxCapacity - availability.currentBookings;
    return {
      price: availability.price || null,
      spotsAvailable
    };
  };
  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onSelectDate(undefined, undefined);
      return;
    }

    // Trouver la disponibilité correspondante
    const selectedAvailability = availabilities.find(a => isSameDay(new Date(a.date), date));
    onSelectDate(date, selectedAvailability);
  };
  const goToPreviousMonth = () => {
    setSelectedMonth(prevMonth => addMonths(prevMonth, -1));
  };
  const goToNextMonth = () => {
    setSelectedMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Déterminer les classes CSS pour une date spécifique
  const getDayClass = (day: Date) => {
    const isAvailable = isDateAvailable(day);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    if (!isAvailable) return "";
    if (isSelected) {
      return "bg-primary text-white rounded-full";
    }
    return "bg-primary-light text-primary hover:bg-primary-200 rounded-full";
  };
  return <div className="flex flex-col gap-4">
      <h3 className="font-heading font-semibold text-xl">{t("Sxe9lectionnezunedat", {
        defaultValue: "Sxe9lectionnezunedat"
      })}</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {isLoading ? <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-primary">{t("Chargementducalendri", {
            defaultValue: "Chargementducalendri"
          })}</span>
          </div> : <>
            <div className="flex items-center justify-between mb-8">
              <Button variant="outline" size="default" onClick={goToPreviousMonth} disabled={isBefore(selectedMonth, startOfMonth(new Date()))} className="flex items-center gap-2 h-10">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Moisprxe9cxe9dent", {
                defaultValue: "Moisprxe9cxe9dent"
              })}</span>
              </Button>
              
              <h3 className="font-medium text-xl capitalize">
                {format(selectedMonth, 'MMMM yyyy', {
              locale: fr
            })}
              </h3>
              
              <Button variant="outline" size="default" onClick={goToNextMonth} disabled={isAfter(selectedMonth, addMonths(new Date(), 11))} className="flex items-center gap-2 h-10">
                <span className="hidden sm:inline">{t("Moissuivant", {
                defaultValue: "Moissuivant"
              })}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-full max-w-md mx-auto">
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} disabled={date => !isDateAvailable(date) || date < new Date()} className="rounded-md border-none" locale={fr} month={selectedMonth} fromDate={new Date()} toDate={addMonths(new Date(), 12)} modifiers={{
            available: date => isDateAvailable(date)
          }} modifiersClassNames={{
            available: "bg-primary-light text-primary rounded-full"
          }} hideHead={false} disableNavigation={true} /* Désactive les boutons de navigation intégrés */ classNames={{
            root: "w-full",
            table: "w-full border-spacing-2 table-fixed",
            head_row: "flex justify-between mb-2",
            head_cell: "w-10 h-10 text-base font-medium",
            row: "flex w-full justify-between my-1",
            cell: "w-10 h-10 p-0 relative",
            day: "h-10 w-10 p-0 font-normal text-lg",
            day_today: "font-bold border border-primary",
            day_selected: "bg-primary text-white hover:bg-primary",
            day_disabled: "opacity-40",
            day_outside: "opacity-20",
            nav_button: "hidden" /* Cache les boutons de navigation */
          }} />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                {selectedDate && <div className="flex flex-col">
                    <h4 className="font-medium text-md flex items-center">
                      <Check className="text-[hsl(var(--success))] mr-2 h-4 w-4" />
                      {format(selectedDate, 'dd MMMM yyyy', {
                  locale: fr
                })}
                    </h4>
                    
                    {getAvailabilityInfo(selectedDate) && <div className="pl-6 text-sm text-gray-600 flex flex-col gap-1">
                        <div>
                          <Badge variant="outline" className="text-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.2)]">
                            {getAvailabilityInfo(selectedDate)?.spotsAvailable} places disponibles
                          </Badge>
                        </div>
                        {getAvailabilityInfo(selectedDate)?.price && <div className="text-primary font-medium">{t("Prix", {
                    defaultValue: "Prix"
                  })}{formatTHB(getAvailabilityInfo(selectedDate)?.price || 0)}/personne
                          </div>}
                      </div>}
                  </div>}
                
                <div className="flex items-center justify-start gap-6 text-sm text-gray-600 pt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-light mr-2"></div>
                    <span>{t("Disponible", {
                    defaultValue: "Disponible"
                  })}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span>{t("Sxe9lectionnxe9", {
                    defaultValue: "Sxe9lectionnxe9"
                  })}</span>
                  </div>
                </div>
              </div>
            </div>
          </>}
      </div>
      {availableDates.length === 0 && !isLoading && <div className="bg-[hsl(var(--destructive)/0.1)] p-4 rounded-lg border border-[hsl(var(--destructive)/0.2)] text-[hsl(var(--destructive))] text-center">{t("Aucunedatedisponible", {
        defaultValue: "Aucunedatedisponible"
      })}</div>}
    </div>;
};

// Composant pour le résumé de la réservation
const BookingSummary = ({
  tour,
  selectedDate,
  numberOfPeople,
  numberOfChildren = 0,
  availability
}: {
  tour?: Tour;
  selectedDate?: Date;
  numberOfPeople: number;
  numberOfChildren?: number;
  availability?: TourAvailability;
}) => {
  const adultPrice = availability?.price || tour?.price || 0;
  // Utiliser le prix enfant de la disponibilité, ou celui du tour, ou 75% du prix adulte par défaut
  const childPrice = availability?.childPrice || tour?.childPrice || Math.round(adultPrice * 0.75);
  const adultTotal = adultPrice * numberOfPeople;
  const childrenTotal = childPrice * numberOfChildren;
  const totalPrice = adultTotal + childrenTotal;
  return <Card>
      <CardContent className="p-6">
        <h3 className="font-heading font-semibold text-xl mb-4">{t("Rxe9sumxe9delarxe9se", {
          defaultValue: "Rxe9sumxe9delarxe9se"
        })}</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>{t("Tour", {
              defaultValue: "Tour"
            })}</span>
            <span className="font-semibold">{tour?.title || "Chargement..."}</span>
          </div>
          
          <div className="flex justify-between">
            <span>{t("Date", {
              defaultValue: "Date"
            })}</span>
            <span className="font-semibold">
              {selectedDate ? format(selectedDate, 'dd MMMM yyyy', {
              locale: fr
            }) : "Non sélectionnée"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>{t('Nombre d\'adultes:', {
              defaultValue: 'Nombre d\'adultes:'
            })}</span>
            <span className="font-semibold">{numberOfPeople}</span>
          </div>
          
          {numberOfChildren > 0 && <div className="flex justify-between">
              <span>{t('Nombre d\'enfants:', {
              defaultValue: 'Nombre d\'enfants:'
            })}</span>
              <span className="font-semibold">{numberOfChildren}</span>
            </div>}
          
          <div className="flex justify-between">
            <span>{t("Prixparadulte", {
              defaultValue: "Prixparadulte"
            })}</span>
            <span className="font-semibold">{formatTHB(adultPrice)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>{t("Soustotaladultes", {
              defaultValue: "Soustotaladultes"
            })}</span>
            <span className="font-semibold">{formatTHB(adultTotal)}</span>
          </div>
          
          {numberOfChildren > 0 && <>
              <div className="flex justify-between">
                <span>{t("Prixparenfant", {
                defaultValue: "Prixparenfant"
              })}</span>
                <span className="font-semibold">
                  {formatTHB(childPrice)} 
                  {childPrice < adultPrice && <span className="text-[hsl(var(--success))] text-xs ml-1">
                      (-{Math.round((1 - childPrice / adultPrice) * 100)}%)
                    </span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("Soustotalenfants", {
                defaultValue: "Soustotalenfants"
              })}</span>
                <span className="font-semibold">{formatTHB(childrenTotal)}</span>
              </div>
            </>}
          
          <div className="border-t pt-4 flex justify-between">
            <span className="font-bold">{t("Total", {
              defaultValue: "Total"
            })}</span>
            <span className="font-bold text-primary">{formatTHB(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>;
};

// Composant pour le formulaire de paiement
const PaymentForm = ({
  clientSecret
}: {
  clientSecret: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const {
    toast
  } = useToast();
  const [, navigate] = useLocation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsProcessing(true);
    const {
      error
    } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-complete"
      },
      redirect: "if_required"
    });
    if (error) {
      setPaymentError(error.message || "Une erreur est survenue lors du paiement.");
      toast({
        variant: "destructive",
        title: t("Erreurdepaiement", {
          defaultValue: "Erreurdepaiement"
        }),
        description: error.message || "Une erreur est survenue lors du paiement."
      });
      setIsProcessing(false);
    } else {
      toast({
        title: t("Paiementrxe9ussi", {
          defaultValue: "Paiementrxe9ussi"
        }),
        description: t("Votrerxe9servationax", {
          defaultValue: "Votrerxe9servationax"
        })
      });

      // Rediriger vers la page de confirmation
      navigate("/payment-complete");
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="font-heading font-semibold text-xl">{t("Dxe9tailsdupaiement", {
        defaultValue: "Dxe9tailsdupaiement"
      })}</h3>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <PaymentElement />
      </div>
      
      {paymentError && <div className="text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] p-3 rounded-md">
          {paymentError}
        </div>}
      
      <Button disabled={!stripe || isProcessing} type="submit" className="w-full bg-secondary" size="lg">
        {isProcessing ? "Traitement..." : "Payer maintenant"}
      </Button>
    </form>;
};

// Composant principal pour la page de réservation
export default function BookTour() {
  const {
    t
  } = useTranslation();
  const {
    id
  } = useParams();
  const tourId = parseInt(id || '0');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedAvailability, setSelectedAvailability] = useState<TourAvailability>();
  const [clientSecret, setClientSecret] = useState("");
  const [displayStripe, setDisplayStripe] = useState(false);
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      numberOfPeople: 1,
      numberOfChildren: 0,
      specialRequests: ""
    }
  });
  const {
    toast
  } = useToast();
  const [, navigate] = useLocation();

  // Requête pour récupérer les détails du tour
  const {
    data: tour,
    isLoading: tourLoading
  } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
    enabled: !isNaN(tourId)
  });

  // Mutation pour créer une réservation
  const createReservation = useMutation({
    mutationFn: (data: BookingFormData & {
      tourId: number;
      availabilityId: number;
    }) => {
      return apiRequest("POST", "/api/reservations", data).then(res => res.json());
    },
    onSuccess: data => {
      toast({
        title: t("Rxe9servationcrxe9xe", {
          defaultValue: "Rxe9servationcrxe9xe"
        }),
        description: t("Finalisonsvotrerxe9s", {
          defaultValue: "Finalisonsvotrerxe9s"
        })
      });

      // Stocke le client secret pour Stripe
      setClientSecret(data.paymentIntent.clientSecret);

      // Affiche l'interface de paiement Stripe
      setDisplayStripe(true);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: error.message || "Une erreur est survenue lors de la création de la réservation."
      });
    }
  });

  // Fonction pour gérer le choix d'une date
  const handleDateSelect = (date: Date | undefined, availability: TourAvailability | undefined) => {
    setSelectedDate(date);
    setSelectedAvailability(availability);
  };

  // Fonction pour soumettre le formulaire
  const onSubmit = (data: BookingFormData) => {
    if (!selectedAvailability) {
      toast({
        variant: "destructive",
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Veuillezsxe9lectionn", {
          defaultValue: "Veuillezsxe9lectionn"
        })
      });
      return;
    }

    // Calcule le montant total de la réservation
    const adultPrice = selectedAvailability?.price || tour?.price || 0;
    const childPrice = selectedAvailability?.childPrice || tour?.childPrice || Math.round(adultPrice * 0.75);

    // Calcul du montant total
    const adultTotal = adultPrice * data.numberOfPeople;
    const childrenTotal = childPrice * (data.numberOfChildren || 0);
    const totalAmount = adultTotal + childrenTotal;
    createReservation.mutate({
      ...data,
      tourId,
      availabilityId: selectedAvailability.id,
      totalAmount // Ajoute le totalAmount requis
    });
  };
  if (isNaN(tourId)) {
    return <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-heading font-bold text-2xl mb-4">{t("Erreur", {
            defaultValue: "Erreur"
          })}</h1>
          <p className="mb-6">{t("Iddetourinvalide", {
            defaultValue: "Iddetourinvalide"
          })}</p>
          <Button asChild>
            <a href="/tours">{t("Backtotours", {
              defaultValue: "Backtotours"
            })}</a>
          </Button>
        </div>
        <Footer />
      </>;
  }
  return <>
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Button variant="outline" className="mb-8 flex items-center" onClick={() => navigate(`/tours/${tourId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />{t("Backtotourdetails", {
          defaultValue: "Backtotourdetails"
        })}</Button>
        
        <h1 className="font-heading font-bold text-3xl mb-8">{t("Bookyourtour", {
          defaultValue: "Bookyourtour"
        })}{tourLoading ? "" : `: ${tour?.title}`}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {displayStripe && clientSecret ? <Elements stripe={stripePromise} options={{
            clientSecret
          }}>
                <PaymentForm clientSecret={clientSecret} />
              </Elements> : <>
                <DateSelector tourId={tourId} onSelectDate={handleDateSelect} selectedDate={selectedDate} />
                
                <div className="mt-8">
                  <h3 className="font-heading font-semibold text-xl mb-4">{t("Vosinformations", {
                  defaultValue: "Vosinformations"
                })}</h3>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                      <FormField control={form.control} name="customerName" render={({
                    field
                  }) => <FormItem>
                            <FormLabel>{t("Nomcomplet", {
                        defaultValue: "Nomcomplet"
                      })}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("Johndoe", {
                        defaultValue: "Johndoe"
                      })} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <FormField control={form.control} name="customerEmail" render={({
                    field
                  }) => <FormItem>
                            <FormLabel>{t("Email", {
                        defaultValue: "Email"
                      })}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="exemple@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <FormField control={form.control} name="customerPhone" render={({
                    field
                  }) => <FormItem>
                            <FormLabel>{t("Txe9lxe9phone", {
                        defaultValue: "Txe9lxe9phone"
                      })}</FormLabel>
                            <FormControl>
                              <Input placeholder="+66 12 345 6789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="numberOfPeople" render={({
                      field
                    }) => <FormItem>
                              <FormLabel>{t('Nombre d\'adultes', {
                          defaultValue: 'Nombre d\'adultes'
                        })}</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={20} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormDescription>{t("Personnesde12ansetpl", {
                          defaultValue: "Personnesde12ansetpl"
                        })}</FormDescription>
                              <FormMessage />
                            </FormItem>} />
                        
                        <FormField control={form.control} name="numberOfChildren" render={({
                      field
                    }) => <FormItem>
                              <FormLabel>{t('Nombre d\'enfants', {
                          defaultValue: 'Nombre d\'enfants'
                        })}</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} max={15} {...field} onChange={e => field.onChange(parseInt(e.target.value || "0"))} />
                              </FormControl>
                              <FormDescription>{t("Enfantsdemoinsde12an", {
                          defaultValue: "Enfantsdemoinsde12an"
                        })}</FormDescription>
                              <FormMessage />
                            </FormItem>} />
                      </div>
                      
                      <FormField control={form.control} name="specialRequests" render={({
                    field
                  }) => <FormItem>
                            <FormLabel>{t("Demandesspxe9cialeso", {
                        defaultValue: "Demandesspxe9cialeso"
                      })}</FormLabel>
                            <FormControl>
                              <Textarea placeholder={t("Sivousavezdesbesoins", {
                        defaultValue: "Sivousavezdesbesoins"
                      })} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <Button type="submit" className="w-full" disabled={createReservation.isPending || !selectedDate}>
                        {createReservation.isPending ? "En cours..." : "Continuer vers le paiement"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </>}
          </div>
          
          <div>
            <BookingSummary tour={tour} selectedDate={selectedDate} numberOfPeople={form.watch("numberOfPeople") || 1} numberOfChildren={form.watch("numberOfChildren") || 0} availability={selectedAvailability} />
            
            {!displayStripe && <div className="mt-6 bg-primary/10 p-6 rounded-lg shadow-md">
                <h3 className="font-heading font-semibold text-lg mb-2 text-primary">{t("Informationsimportan", {
                defaultValue: "Informationsimportan"
              })}</h3>
                <ul className="space-y-2 text-primary/90">
                  <li className="flex items-start">
                    <CalendarIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t("Seuleslesdatesdispon", {
                    defaultValue: "Seuleslesdatesdispon"
                  })}</span>
                  </li>
                  <li className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t("Leprixestcalculxe9pa", {
                    defaultValue: "Leprixestcalculxe9pa"
                  })}</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('Les d\xE9tails de l\'heure de d\xE9part vous seront communiqu\xE9s apr\xE8s la confirmation de votre r\xE9servation.', {
                    defaultValue: 'Les d\xE9tails de l\'heure de d\xE9part vous seront communiqu\xE9s apr\xE8s la confirmation de votre r\xE9servation.'
                  })}</span>
                  </li>
                  <li className="flex items-start">
                    <Euro className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('Le paiement est s\xE9curis\xE9 via Stripe. Aucune information bancaire n\'est stock\xE9e sur notre syst\xE8me.', {
                    defaultValue: 'Le paiement est s\xE9curis\xE9 via Stripe. Aucune information bancaire n\'est stock\xE9e sur notre syst\xE8me.'
                  })}</span>
                  </li>
                </ul>
              </div>}
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}