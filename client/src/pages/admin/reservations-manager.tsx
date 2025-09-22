import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LogOut, ChevronLeft, Check, X, Info, AlertTriangle, Eye, Download } from "lucide-react";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reservation, Tour, TourAvailability } from "@shared/schema";
import { formatTHB } from "@/lib/utils";
export default function ReservationsManager() {
  const { t } = useTranslation();

  const {
    isAuthenticated
  } = useIsAuthenticated();
  const logout = useLogout();
  const [, navigate] = useLocation();
  const {
    toast
  } = useToast();
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
  const {
    data: reservations,
    isLoading: isReservationsLoading
  } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"]
  });

  // Récupérer la liste des tours
  const {
    data: tours,
    isLoading: isToursLoading
  } = useQuery<Tour[]>({
    queryKey: ["/api/tours"]
  });

  // Mutation pour mettre à jour le statut d'une réservation
  const updateReservationStatus = useMutation({
    mutationFn: (data: {
      id: number;
      status: "pending" | "confirmed" | "cancelled" | "completed";
    }) => {
      return apiRequest("PUT", `/api/reservations/${data.id}/status`, {
        status: data.status
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/reservations"]
      });
      toast({
        title: t('common.statutmisxe0jour'),
        description: t('common.lestatutdelarxe9serv')
      });
      setIsStatusDialogOpen(false);
      setSelectedReservation(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.erreur'),
        description: error.message || "Une erreur est survenue lors de la modification du statut."
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
        return <Badge variant="outline" className="bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.2)]">{t('common.enattente')}</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.2)]">{t('common.confirmxe9e')}</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]">{t('common.annulxe9e')}</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t('common.terminxe9e')}</Badge>;
      default:
        return <Badge variant="outline">{t('common.inconnu')}</Badge>;
    }
  };

  // Vérification de l'authentification
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }

  // Obtenir les réservations filtrées
  const filteredReservations = getFilteredReservations();
  return <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-white font-heading font-bold text-xl">{t('common.senthang')}</span>
                <span className="text-secondary font-accent text-xl ml-1">{t('common.siam')}</span>
                <span className="text-white font-heading font-bold text-xl ml-1">{t('common.tour')}</span>
              </div>
            </Link>
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded">{t('common.gestiondesrxe9servat')}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-primary-dark" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />{t('common.logout')}</Button>
            <Link href="/admin/dashboard">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />{t('common.backtodashboard')}</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">{t('common.gestiondesrxe9servat')}</h1>
          <p className="text-gray-600">{t('common.consultezetgxe9rezto')}</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <CardTitle>{t('common.rxe9servations')}</CardTitle>
                <CardDescription>{t('common.listedesrxe9servatio')}</CardDescription>
              </div>
              <div className="mt-4 md:mt-0">
                <Button variant="outline" className="mr-2" disabled>
                  <Download className="h-4 w-4 mr-2" />{t('common.exporter')}</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">{t('common.toutes')}</TabsTrigger>
                <TabsTrigger value="pending">{t('common.enattente')}</TabsTrigger>
                <TabsTrigger value="confirmed">{t('common.confirmxe9es')}</TabsTrigger>
                <TabsTrigger value="completed">{t('common.terminxe9es')}</TabsTrigger>
                <TabsTrigger value="cancelled">{t('common.annulxe9es')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab}>
                {isReservationsLoading || isToursLoading ? <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div> : filteredReservations.length > 0 ? <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>{t('common.tour')}</TableHead>
                          <TableHead>{t('common.client')}</TableHead>
                          <TableHead>{t('common.date')}</TableHead>
                          <TableHead>{t('common.personnes')}</TableHead>
                          <TableHead>{t('common.montant')}</TableHead>
                          <TableHead>{t('common.statut')}</TableHead>
                          <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReservations.map(reservation => <TableRow key={reservation.id}>
                            <TableCell className="font-mono">#{reservation.id}</TableCell>
                            <TableCell className="font-medium">{getTourTitle(reservation.tourId)}</TableCell>
                            <TableCell>{reservation.customerName}</TableCell>
                            <TableCell>
                              {reservation.createdAt && format(new Date(reservation.createdAt), 'dd/MM/yyyy', {
                          locale: fr
                        })}
                            </TableCell>
                            <TableCell>{reservation.numberOfPeople}</TableCell>
                            <TableCell>{formatTHB(reservation.totalAmount)}</TableCell>
                            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">{t('common.actions')}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => openDetailsDialog(reservation)}>
                                    <Eye className="h-4 w-4 mr-2" />{t('common.viewdetails')}</DropdownMenuItem>
                                  
                                  {reservation.status === "pending" && <DropdownMenuItem onClick={() => openStatusDialog(reservation, "confirmed")}>
                                      <Check className="h-4 w-4 mr-2 text-green-600" />{t('common.confirm')}</DropdownMenuItem>}
                                  
                                  {reservation.status === "confirmed" && <DropdownMenuItem onClick={() => openStatusDialog(reservation, "completed")}>
                                      <Check className="h-4 w-4 mr-2 text-blue-600" />{t('common.markascompleted')}</DropdownMenuItem>}
                                  
                                  {(reservation.status === "pending" || reservation.status === "confirmed") && <DropdownMenuItem onClick={() => openStatusDialog(reservation, "cancelled")}>
                                      <X className="h-4 w-4 mr-2 text-destructive" />{t('common.cancel')}</DropdownMenuItem>}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500">
                      {selectedTab === "all" ? "Aucune réservation disponible." : `Aucune réservation avec le statut "${selectedTab}".`}
                    </p>
                  </div>}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      {/* Modal de détails de réservation */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t('common.dxe9tailsdelarxe9ser')}</DialogTitle>
            <DialogDescription>{t('common.informationscomplxe8')}</DialogDescription>
          </DialogHeader>
          
          {selectedReservation && <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.numxe9roderxe9servat')}</h4>
                  <p className="font-mono">#{selectedReservation.id}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.statut')}</h4>
                  <p>{getStatusBadge(selectedReservation.status)}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.tour')}</h4>
                <p className="font-medium">{getTourTitle(selectedReservation.tourId)}</p>
              </div>
              
              <div className="pt-2">
                <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.informationsclient')}</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">{t('common.nom')}</span> {selectedReservation.customerName}</p>
                  <p><span className="font-medium">{t('common.email')}</span> {selectedReservation.customerEmail}</p>
                  <p><span className="font-medium">{t('common.txe9lxe9phone')}</span> {selectedReservation.customerPhone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.nombredepersonnes')}</h4>
                  <p>{selectedReservation.numberOfPeople}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.montanttotal')}</h4>
                  <p className="font-semibold">{formatTHB(selectedReservation.totalAmount)}</p>
                </div>
              </div>
              
              {selectedReservation.specialRequests && <div className="pt-2">
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.demandesspxe9ciales')}</h4>
                  <p className="p-3 bg-gray-50 rounded-md">{selectedReservation.specialRequests}</p>
                </div>}
              
              {selectedReservation.stripePaymentIntentId && <div className="pt-2">
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.informationsdepaieme')}</h4>
                  <div className="space-y-1">
                    <p><span className="font-medium">{t('common.idstripe')}</span> {selectedReservation.stripePaymentIntentId}</p>
                    <p><span className="font-medium">{t('common.clientstripe')}</span> {selectedReservation.stripeCustomerId}</p>
                  </div>
                </div>}
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.datedecrxe9ation')}</h4>
                  <p>
                    {selectedReservation.createdAt && format(new Date(selectedReservation.createdAt), 'dd/MM/yyyy à HH:mm', {
                  locale: fr
                })}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">{t('common.dernixe8remisexe0jou')}</h4>
                  <p>
                    {selectedReservation.updatedAt && format(new Date(selectedReservation.updatedAt), 'dd/MM/yyyy à HH:mm', {
                  locale: fr
                })}
                  </p>
                </div>
              </div>
            </div>}
          
          <DialogFooter>
            <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
              <div>
                {selectedReservation && selectedReservation.status !== "cancelled" && selectedReservation.status !== "completed" && <Button variant="destructive" size="sm" onClick={() => {
                setIsDetailsDialogOpen(false);
                openStatusDialog(selectedReservation, "cancelled");
              }}>
                    <X className="h-4 w-4 mr-1" />{t('common.cancel')}</Button>}
              </div>
              <div className="flex gap-2 justify-end">
                {selectedReservation && selectedReservation.status === "pending" && <Button variant="default" size="sm" onClick={() => {
                setIsDetailsDialogOpen(false);
                openStatusDialog(selectedReservation, "confirmed");
              }}>
                    <Check className="h-4 w-4 mr-1" />{t('common.confirm')}</Button>}
                
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>{t('common.fermer')}</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de changement de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{t('common.modifierlestatutdela')}</DialogTitle>
            <DialogDescription>
              {selectedStatus === "confirmed" && "Confirm this reservation?"}
              {selectedStatus === "cancelled" && "Cancel this reservation?"}
              {selectedStatus === "completed" && "Marquer cette réservation comme terminée ?"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && <div className="py-4">
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                <div className="font-medium">{t('common.rxe9servation')}{selectedReservation.id}</div>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">{t('common.tour')}</span> {getTourTitle(selectedReservation.tourId)}</p>
                <p><span className="font-medium">{t('common.client')}</span> {selectedReservation.customerName}</p>
                <p><span className="font-medium">{t('common.statutactuel')}</span> {getStatusBadge(selectedReservation.status)}</p>
                <p><span className="font-medium">{t('common.nouveaustatut')}</span> {getStatusBadge(selectedStatus)}</p>
              </div>
              
              {selectedStatus === "cancelled" && <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-destructive" />
                  <span>{t('Attention : L\'annulation d\'une r\xE9servation est d\xE9finitive. \n                    Le client sera notifi\xE9 et pourra recevoir un remboursement si applicable.', {
                defaultValue: 'Attention : L\'annulation d\'une r\xE9servation est d\xE9finitive. \n                    Le client sera notifi\xE9 et pourra recevoir un remboursement si applicable.'
              })}</span>
                </div>}
            </div>}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>{t('common.cancel')}</Button>
            
            <Button variant={selectedStatus === "cancelled" ? "destructive" : "default"} onClick={confirmStatusChange} disabled={updateReservationStatus.isPending}>
              {updateReservationStatus.isPending ? "Updating..." : selectedStatus === "confirmed" ? "Confirm" : selectedStatus === "cancelled" ? "Cancel reservation" : "Mark as completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}