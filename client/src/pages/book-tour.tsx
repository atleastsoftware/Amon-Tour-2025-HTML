import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tour, TourAvailability } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  User, 
  Clock, 
  Euro, 
  ChevronLeft, 
  ChevronRight, 
  Check 
} from "lucide-react";
import { 
  format, 
  addMonths, 
  isAfter, 
  isSameDay, 
  startOfMonth, 
  isBefore,
  parseISO,
  eachDayOfInterval
} from "date-fns";
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
  specialRequests: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Composant pour la sélection de date
const DateSelector = ({ 
  tourId, 
  onSelectDate,
  selectedDate
}: { 
  tourId: number, 
  onSelectDate: (date: Date | undefined, availability: TourAvailability | undefined) => void,
  selectedDate?: Date 
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availabilities, setAvailabilities] = useState<TourAvailability[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Requête pour récupérer les disponibilités pour ce tour
  const { data, isLoading } = useQuery<TourAvailability[]>({
    queryKey: [`/api/tours/${tourId}/availabilities`],
    enabled: !!tourId
  });
  
  useEffect(() => {
    if (data) {
      // Filtrer les disponibilités qui ont encore de la place
      const validAvailabilities = data.filter(a => 
        a.currentBookings < a.maxCapacity && 
        isAfter(new Date(a.date), new Date())
      );
      
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
    const availability = availabilities.find(a => 
      isSameDay(new Date(a.date), date)
    );
    
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
    const selectedAvailability = availabilities.find(a => 
      isSameDay(new Date(a.date), date)
    );
    
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
  
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading font-semibold text-xl">Sélectionnez une date</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousMonth}
                disabled={isBefore(selectedMonth, startOfMonth(new Date()))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="font-medium text-lg capitalize">
                {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
              </h3>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextMonth}
                disabled={isAfter(selectedMonth, addMonths(new Date(), 11))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              disabled={(date) => !isDateAvailable(date) || date < new Date()}
              className="rounded-md border-none"
              locale={fr}
              month={selectedMonth}
              fromDate={new Date()}
              toDate={addMonths(new Date(), 12)}
              modifiers={{
                available: (date) => isDateAvailable(date)
              }}
              modifiersClassNames={{
                available: "bg-primary-light text-primary rounded-full"
              }}
              styles={{
                day: {
                  "&[data-selected]": {
                    backgroundColor: "var(--primary)",
                    color: "white"
                  }
                },
                caption_label: { fontSize: "16px", marginBottom: "8px" },
                day_today: { fontWeight: "bold", borderWidth: "1px", borderColor: "var(--primary)" },
                day_disabled: { opacity: 0.4 }
              }}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                {selectedDate && (
                  <div className="flex flex-col">
                    <h4 className="font-medium text-md flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                    </h4>
                    
                    {getAvailabilityInfo(selectedDate) && (
                      <div className="pl-6 text-sm text-gray-600 flex flex-col gap-1">
                        <div>
                          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                            {getAvailabilityInfo(selectedDate)?.spotsAvailable} places disponibles
                          </Badge>
                        </div>
                        {getAvailabilityInfo(selectedDate)?.price && (
                          <div className="text-primary font-medium">
                            Prix: {formatTHB(getAvailabilityInfo(selectedDate)?.price || 0)}/personne
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-start gap-6 text-sm text-gray-600 pt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-light mr-2"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span>Sélectionné</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {availableDates.length === 0 && !isLoading && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600 text-center">
          Aucune date disponible pour ce tour. Veuillez nous contacter pour des arrangements personnalisés.
        </div>
      )}
    </div>
  );
};

// Composant pour le résumé de la réservation
const BookingSummary = ({ 
  tour, 
  selectedDate,
  numberOfPeople,
  availability
}: { 
  tour?: Tour, 
  selectedDate?: Date,
  numberOfPeople: number,
  availability?: TourAvailability
}) => {
  const price = availability?.price || tour?.price || 0;
  const totalPrice = price * numberOfPeople;
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-heading font-semibold text-xl mb-4">Résumé de la réservation</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Tour:</span>
            <span className="font-semibold">{tour?.title || "Chargement..."}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-semibold">
              {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : "Non sélectionnée"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Nombre de personnes:</span>
            <span className="font-semibold">{numberOfPeople}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Prix par personne:</span>
            <span className="font-semibold">{formatTHB(price)}</span>
          </div>
          
          <div className="border-t pt-4 flex justify-between">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-primary">{formatTHB(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour le formulaire de paiement
const PaymentForm = ({ 
  clientSecret 
}: { 
  clientSecret: string 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-complete",
      },
      redirect: "if_required"
    });
    
    if (error) {
      setPaymentError(error.message || "Une erreur est survenue lors du paiement.");
      toast({
        variant: "destructive",
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du paiement."
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Paiement réussi",
        description: "Votre réservation a été confirmée. Vous allez recevoir un email de confirmation."
      });
      
      // Rediriger vers la page de confirmation
      navigate("/payment-complete");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="font-heading font-semibold text-xl">Détails du paiement</h3>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <PaymentElement />
      </div>
      
      {paymentError && (
        <div className="text-red-500 bg-red-50 p-3 rounded-md">
          {paymentError}
        </div>
      )}
      
      <Button 
        disabled={!stripe || isProcessing} 
        type="submit" 
        className="w-full bg-secondary"
        size="lg"
      >
        {isProcessing ? "Traitement..." : "Payer maintenant"}
      </Button>
    </form>
  );
};

// Composant principal pour la page de réservation
export default function BookTour() {
  const { id } = useParams();
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
      specialRequests: ""
    }
  });
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Requête pour récupérer les détails du tour
  const { data: tour, isLoading: tourLoading } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
    enabled: !isNaN(tourId)
  });
  
  // Mutation pour créer une réservation
  const createReservation = useMutation({
    mutationFn: (data: BookingFormData & { tourId: number, availabilityId: number }) => {
      return apiRequest("POST", "/api/reservations", data)
        .then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Réservation créée",
        description: "Finalisons votre réservation avec le paiement."
      });
      
      // Stocke le client secret pour Stripe
      setClientSecret(data.paymentIntent.clientSecret);
      
      // Affiche l'interface de paiement Stripe
      setDisplayStripe(true);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
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
        title: "Erreur",
        description: "Veuillez sélectionner une date pour votre réservation."
      });
      return;
    }
    
    createReservation.mutate({
      ...data,
      tourId,
      availabilityId: selectedAvailability.id
    });
  };
  
  if (isNaN(tourId)) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-heading font-bold text-2xl mb-4">Erreur</h1>
          <p className="mb-6">ID de tour invalide.</p>
          <Button asChild>
            <a href="/tours">Retour aux tours</a>
          </Button>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Button
          variant="outline"
          className="mb-8 flex items-center"
          onClick={() => navigate(`/tours/${tourId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux détails du tour
        </Button>
        
        <h1 className="font-heading font-bold text-3xl mb-8">
          Réserver votre tour{tourLoading ? "" : `: ${tour?.title}`}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {displayStripe && clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm clientSecret={clientSecret} />
              </Elements>
            ) : (
              <>
                <DateSelector 
                  tourId={tourId} 
                  onSelectDate={handleDateSelect}
                  selectedDate={selectedDate}
                />
                
                <div className="mt-8">
                  <h3 className="font-heading font-semibold text-xl mb-4">Vos informations</h3>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="exemple@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="+66 12 345 6789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="numberOfPeople"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de personnes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                max={20} 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Demandes spéciales (optionnel)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Si vous avez des besoins particuliers, veuillez les indiquer ici..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={createReservation.isPending || !selectedDate}
                      >
                        {createReservation.isPending ? "En cours..." : "Continuer vers le paiement"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </>
            )}
          </div>
          
          <div>
            <BookingSummary 
              tour={tour} 
              selectedDate={selectedDate}
              numberOfPeople={form.watch("numberOfPeople") || 1}
              availability={selectedAvailability}
            />
            
            {!displayStripe && (
              <div className="mt-6 bg-blue-50 p-6 rounded-lg shadow-md">
                <h3 className="font-heading font-semibold text-lg mb-2 text-blue-900">Informations importantes</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Seules les dates disponibles peuvent être sélectionnées dans le calendrier.</span>
                  </li>
                  <li className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Le prix est calculé par personne. Veuillez indiquer le nombre exact de participants.</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Les détails de l'heure de départ vous seront communiqués après la confirmation de votre réservation.</span>
                  </li>
                  <li className="flex items-start">
                    <Euro className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Le paiement est sécurisé via Stripe. Aucune information bancaire n'est stockée sur notre système.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}