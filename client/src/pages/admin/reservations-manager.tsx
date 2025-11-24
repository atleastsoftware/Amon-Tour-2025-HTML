import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LogOut, ChevronLeft, Check, X, Info, AlertTriangle, Eye, Download } from "lucide-react";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslationSection } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Reservation, Tour, TourAvailability } from "@shared/schema";
import { formatTHB } from "@/lib/utils";

export default function ReservationsManager() {
  const { isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const admin = useTranslationSection('admin');
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "confirmed" | "cancelled" | "completed">("confirmed");
  
  // Fonction pour récupérer le titre du tour à partir de son ID
  const getTourTitle = (tourId: number): string => {
    return tours?.find(tour => tour.id === tourId)?.title || `Tour #${tourId}`;
  };
  
  // Récupérer la liste des réservations
  const { data: reservations, isLoading: isReservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
  });
  
  // Récupérer la liste des tours
  const { data: tours, isLoading: isToursLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });
  
  // Mutation pour mettre à jour le statut d'une réservation
  const updateReservationStatus = useMutation({
    mutationFn: (data: { id: number, status: "pending" | "confirmed" | "cancelled" | "completed" }) => {
      return apiRequest("PUT", `/api/reservations/${data.id}/status`, {
        status: data.status
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({
        title: admin.reservationsManager?.statusUpdateSuccess || "Status Updated",
        description: admin.reservationsManager?.statusUpdateDescription || "The reservation status has been updated successfully"
      });
      setIsStatusDialogOpen(false);
      setSelectedReservation(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: admin.common?.error || "Error",
        description: error.message || admin.reservationsManager?.statusUpdateError || "Failed to update reservation status"
      });
    }
  });
  
  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout.mutate();
  };
  
  // Fonction pour ouvrir la modal de détails
  const openDetailsDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsDialogOpen(true);
  };
  
  // Fonction pour ouvrir la modal de changement de statut
  const openStatusDialog = (reservation: Reservation, initialStatus: "pending" | "confirmed" | "cancelled" | "completed") => {
    setSelectedReservation(reservation);
    setSelectedStatus(initialStatus);
    setIsStatusDialogOpen(true);
  };
  
  // Fonction pour confirmer le changement de statut
  const confirmStatusChange = () => {
    if (!selectedReservation) return;
    
    updateReservationStatus.mutate({
      id: selectedReservation.id,
      status: selectedStatus
    });
  };
  
  // Fonction pour obtenir les réservations filtrées selon l'onglet actif
  const getFilteredReservations = () => {
    if (!reservations) return [];
    
    switch (selectedTab) {
      case "pending":
        return reservations.filter(r => r.status === "pending");
      case "confirmed":
        return reservations.filter(r => r.status === "confirmed");
      case "cancelled":
        return reservations.filter(r => r.status === "cancelled");
      case "completed":
        return reservations.filter(r => r.status === "completed");
      default:
        return reservations;
    }
  };
  
  // Obtenir le badge de statut pour une réservation
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge data-testid="badge-status-pending" variant="outline" className="bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.2)]">{admin.reservationsManager?.statusPending || "Pending"}</Badge>;
      case "confirmed":
        return <Badge data-testid="badge-status-confirmed" variant="outline" className="bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.2)]">{admin.reservationsManager?.statusConfirmed || "Confirmed"}</Badge>;
      case "cancelled":
        return <Badge data-testid="badge-status-cancelled" variant="outline" className="bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]">{admin.reservationsManager?.statusCancelled || "Cancelled"}</Badge>;
      case "completed":
        return <Badge data-testid="badge-status-completed" variant="outline" className="bg-primary/10 text-primary border-primary/20">{admin.reservationsManager?.statusCompleted || "Completed"}</Badge>;
      default:
        return <Badge data-testid="badge-status-unknown" variant="outline">{admin.reservationsManager?.statusUnknown || "Unknown"}</Badge>;
    }
  };
  
  // Vérification de l'authentification
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }
  
  // Obtenir les réservations filtrées
  const filteredReservations = getFilteredReservations();
  
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
            <div data-testid="badge-section-title" className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded">
              {admin.reservationsManager?.title || "Reservations Manager"}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              data-testid="button-logout"
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-primary-dark"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {admin.reservationsManager?.logout || "Logout"}
            </Button>
            <Link href="/admin/dashboard">
              <span data-testid="link-back-to-dashboard" className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />
                {admin.reservationsManager?.backToDashboard || "Back to Dashboard"}
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 data-testid="text-page-title" className="font-heading font-bold text-3xl mb-2">{admin.reservationsManager?.title || "Reservations Manager"}</h1>
          <p data-testid="text-page-subtitle" className="text-gray-600">{admin.reservationsManager?.subtitle || "View and manage tour reservations"}</p>
        </div>
        
        <Card data-testid="card-reservations">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <CardTitle data-testid="text-card-title">{admin.reservationsManager?.title || "Reservations Manager"}</CardTitle>
                <CardDescription data-testid="text-card-description">{admin.reservationsManager?.subtitle || "View and manage tour reservations"}</CardDescription>
              </div>
              <div className="mt-4 md:mt-0">
                <Button data-testid="button-export" variant="outline" className="mr-2" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  {admin.reservationsManager?.export || "Export CSV"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs data-testid="tabs-reservations" defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger data-testid="tab-all" value="all">{admin.reservationsManager?.tabs?.all || "All"}</TabsTrigger>
                <TabsTrigger data-testid="tab-pending" value="pending">{admin.reservationsManager?.tabs?.pending || "Pending"}</TabsTrigger>
                <TabsTrigger data-testid="tab-confirmed" value="confirmed">{admin.reservationsManager?.tabs?.confirmed || "Confirmed"}</TabsTrigger>
                <TabsTrigger data-testid="tab-completed" value="completed">{admin.reservationsManager?.tabs?.completed || "Completed"}</TabsTrigger>
                <TabsTrigger data-testid="tab-cancelled" value="cancelled">{admin.reservationsManager?.tabs?.cancelled || "Cancelled"}</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab}>
                {isReservationsLoading || isToursLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredReservations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table data-testid="table-reservations">
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-id">{admin.reservationsManager?.tableHeaders?.id || "ID"}</TableHead>
                          <TableHead data-testid="header-tour">{admin.reservationsManager?.tableHeaders?.tour || "Tour"}</TableHead>
                          <TableHead data-testid="header-customer">{admin.reservationsManager?.tableHeaders?.customer || "Customer"}</TableHead>
                          <TableHead data-testid="header-date">{admin.reservationsManager?.tableHeaders?.date || "Date"}</TableHead>
                          <TableHead data-testid="header-people">{admin.reservationsManager?.tableHeaders?.people || "People"}</TableHead>
                          <TableHead data-testid="header-amount">{admin.reservationsManager?.tableHeaders?.amount || "Amount"}</TableHead>
                          <TableHead data-testid="header-status">{admin.reservationsManager?.tableHeaders?.status || "Status"}</TableHead>
                          <TableHead data-testid="header-actions" className="text-right">{admin.reservationsManager?.tableHeaders?.actions || "Actions"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReservations.map(reservation => (
                          <TableRow key={reservation.id}>
                            <TableCell className="font-mono">#{reservation.id}</TableCell>
                            <TableCell className="font-medium">{getTourTitle(reservation.tourId)}</TableCell>
                            <TableCell>{reservation.customerName}</TableCell>
                            <TableCell>
                              {reservation.createdAt && format(new Date(reservation.createdAt), 'dd/MM/yyyy', { locale: fr })}
                            </TableCell>
                            <TableCell>{reservation.numberOfPeople}</TableCell>
                            <TableCell>{formatTHB(reservation.totalAmount)}</TableCell>
                            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button data-testid={`button-actions-${reservation.id}`} variant="outline" size="sm">{admin.reservationsManager?.tableHeaders?.actions || "Actions"}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem data-testid={`menu-view-${reservation.id}`} onClick={() => openDetailsDialog(reservation)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {admin.reservationsManager?.viewDetails || "View Details"}
                                  </DropdownMenuItem>
                                  
                                  {reservation.status === "pending" && (
                                    <DropdownMenuItem data-testid={`menu-confirm-${reservation.id}`} onClick={() => openStatusDialog(reservation, "confirmed")}>
                                      <Check className="h-4 w-4 mr-2 text-green-600" />
                                      {admin.reservationsManager?.confirm || "Confirm"}
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {reservation.status === "confirmed" && (
                                    <DropdownMenuItem data-testid={`menu-complete-${reservation.id}`} onClick={() => openStatusDialog(reservation, "completed")}>
                                      <Check className="h-4 w-4 mr-2 text-blue-600" />
                                      {admin.reservationsManager?.markAsCompleted || "Mark as Completed"}
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {(reservation.status === "pending" || reservation.status === "confirmed") && (
                                    <DropdownMenuItem data-testid={`menu-cancel-${reservation.id}`} onClick={() => openStatusDialog(reservation, "cancelled")}>
                                      <X className="h-4 w-4 mr-2 text-destructive" />
                                      {admin.reservationsManager?.cancel || "Cancel"}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div data-testid="text-no-reservations" className="text-center py-8">
                    <p className="text-gray-500">
                      {selectedTab === "all"
                        ? admin.reservationsManager?.noReservations || "No reservations found."
                        : (admin.reservationsManager?.noReservationsWithStatus || "No {{status}} reservations found.").replace('{{status}}', selectedTab)}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      {/* Modal de détails de réservation */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent data-testid="dialog-reservation-details" className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle data-testid="text-details-title">{admin.reservationsManager?.detailsDialogTitle || "Reservation Details"}</DialogTitle>
            <DialogDescription data-testid="text-details-description">
              {admin.reservationsManager?.detailsDialogDescription || "Complete information about this reservation"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.reservationNumber || "Reservation Number"}</h4>
                  <p data-testid="text-reservation-number" className="font-mono">#{selectedReservation.id}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.status || "Status"}</h4>
                  <p>{getStatusBadge(selectedReservation.status)}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.tour || "Tour"}</h4>
                <p data-testid="text-tour-title" className="font-medium">{getTourTitle(selectedReservation.tourId)}</p>
              </div>
              
              <div className="pt-2">
                <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.customerInfo || "Customer Information"}</h4>
                <div className="space-y-1">
                  <p data-testid="text-customer-name"><span className="font-medium">{admin.reservationsManager?.fields?.name || "Name"} :</span> {selectedReservation.customerName}</p>
                  <p data-testid="text-customer-email"><span className="font-medium">{admin.reservationsManager?.fields?.email || "Email"} :</span> {selectedReservation.customerEmail}</p>
                  <p data-testid="text-customer-phone"><span className="font-medium">{admin.reservationsManager?.fields?.phone || "Phone"} :</span> {selectedReservation.customerPhone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.numberOfPeople || "Number of People"}</h4>
                  <p data-testid="text-number-of-people">{selectedReservation.numberOfPeople}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.totalAmount || "Total Amount"}</h4>
                  <p data-testid="text-total-amount" className="font-semibold">{formatTHB(selectedReservation.totalAmount)}</p>
                </div>
              </div>
              
              {selectedReservation.specialRequests && (
                <div className="pt-2">
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.specialRequests || "Special Requests"}</h4>
                  <p data-testid="text-special-requests" className="p-3 bg-gray-50 rounded-md">{selectedReservation.specialRequests}</p>
                </div>
              )}
              
              {selectedReservation.stripePaymentIntentId && (
                <div className="pt-2">
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.paymentInfo || "Payment Information"}</h4>
                  <div className="space-y-1">
                    <p data-testid="text-stripe-payment-id"><span className="font-medium">{admin.reservationsManager?.fields?.stripeId || "Stripe Payment ID"} :</span> {selectedReservation.stripePaymentIntentId}</p>
                    <p data-testid="text-stripe-customer-id"><span className="font-medium">{admin.reservationsManager?.fields?.stripeCustomer || "Stripe Customer ID"} :</span> {selectedReservation.stripeCustomerId}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.createdOn || "Created On"}</h4>
                  <p data-testid="text-created-on">
                    {selectedReservation.createdAt && 
                      format(new Date(selectedReservation.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{admin.reservationsManager?.fields?.lastUpdated || "Last Updated"}</h4>
                  <p data-testid="text-last-updated">
                    {selectedReservation.updatedAt && 
                      format(new Date(selectedReservation.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
              <div>
                {selectedReservation && 
                 selectedReservation.status !== "cancelled" && 
                 selectedReservation.status !== "completed" && (
                  <Button 
                    data-testid="button-details-cancel"
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      openStatusDialog(selectedReservation, "cancelled");
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {admin.reservationsManager?.cancel || "Cancel"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                {selectedReservation && 
                 selectedReservation.status === "pending" && (
                  <Button 
                    data-testid="button-details-confirm"
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      openStatusDialog(selectedReservation, "confirmed");
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {admin.reservationsManager?.confirm || "Confirm"}
                  </Button>
                )}
                
                <Button 
                  data-testid="button-close-details"
                  variant="outline" 
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  {admin.reservationsManager?.close || "Close"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de changement de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent data-testid="dialog-status-change" className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle data-testid="text-status-dialog-title">{admin.reservationsManager?.statusDialogTitle || "Change Reservation Status"}</DialogTitle>
            <DialogDescription data-testid="text-status-dialog-description">
              {selectedStatus === "confirmed" && (admin.reservationsManager?.statusDialogConfirmDescription || "This will confirm the reservation and notify the customer.")}
              {selectedStatus === "cancelled" && (admin.reservationsManager?.statusDialogCancelDescription || "This will cancel the reservation. Make sure to notify the customer.")}
              {selectedStatus === "completed" && (admin.reservationsManager?.statusDialogCompletedDescription || "Mark this reservation as completed after the tour has taken place.")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                <div data-testid="text-reservation-id" className="font-medium">{admin.reservationsManager?.reservation || "Reservation"} #{selectedReservation.id}</div>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">{admin.reservationsManager?.fields?.tour || "Tour"} :</span> {getTourTitle(selectedReservation.tourId)}</p>
                <p><span className="font-medium">{admin.reservationsManager?.fields?.customerInfo || "Customer Information"} :</span> {selectedReservation.customerName}</p>
                <p><span className="font-medium">{admin.reservationsManager?.currentStatus || "Current Status"} :</span> {getStatusBadge(selectedReservation.status)}</p>
                <p><span className="font-medium">{admin.reservationsManager?.newStatus || "New Status"} :</span> {getStatusBadge(selectedStatus)}</p>
              </div>
              
              {selectedStatus === "cancelled" && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-destructive" />
                  <span data-testid="text-cancel-warning">
                    {admin.reservationsManager?.cancelWarning || "This action will cancel the reservation. The customer will need to be notified separately."}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              data-testid="button-status-close"
              type="button" 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
            >
              {admin.reservationsManager?.close || "Close"}
            </Button>
            
            <Button 
              data-testid="button-status-confirm"
              variant={selectedStatus === "cancelled" ? "destructive" : "default"} 
              onClick={confirmStatusChange} 
              disabled={updateReservationStatus.isPending}
            >
              {updateReservationStatus.isPending ? (admin.reservationsManager?.updating || "Updating...") : (
                selectedStatus === "confirmed" ? (admin.reservationsManager?.confirm || "Confirm") : 
                selectedStatus === "cancelled" ? (admin.reservationsManager?.cancel || "Cancel") : 
                (admin.reservationsManager?.markAsCompleted || "Mark as Completed")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}