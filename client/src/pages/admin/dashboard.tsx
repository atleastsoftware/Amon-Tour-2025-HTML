import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Tour, CustomTourRequest, ContactMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { Edit, Trash2, LogOut, Plus, ChevronLeft, Eye } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const logout = useLogout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  
  const { data: tours, isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });
  
  const { data: customTourRequests, isLoading: requestsLoading } = useQuery<CustomTourRequest[]>({
    queryKey: ['/api/custom-tour-requests'],
  });
  
  const { data: contactMessages, isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
  });
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);
  
  const handleLogout = () => {
    logout.mutate();
    setLocation("/");
  };
  
  const confirmDelete = (tour: Tour) => {
    setTourToDelete(tour);
    setDeleteDialogOpen(true);
  };
  
  const deleteTour = async () => {
    if (!tourToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/tours/${tourToDelete.id}`);
      
      toast({
        title: "Tour supprimé",
        description: `Le tour "${tourToDelete.title}" a été supprimé avec succès.`,
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      setDeleteDialogOpen(false);
      setTourToDelete(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la suppression du tour.",
        variant: "destructive",
      });
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen bg-neutral-light">
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <a className="flex items-center">
                <span className="text-white font-heading font-bold text-xl">Senthang</span>
                <span className="text-secondary font-accent text-xl ml-1">Siam</span>
                <span className="text-white font-heading font-bold text-xl ml-1">Tour</span>
              </a>
            </Link>
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded">
              Espace Admin
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
            <Link href="/">
              <a className="text-white hover:text-gray-200 transition-colors">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />
                Retour au site
              </a>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Gérez votre site et consultez les demandes des clients.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Tours</CardTitle>
              <CardDescription>Nombre total de tours</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tours?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Demandes personnalisées</CardTitle>
              <CardDescription>Nombre total de demandes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customTourRequests?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Messages</CardTitle>
              <CardDescription>Nombre total de messages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{contactMessages?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tours">
          <TabsList className="mb-6">
            <TabsTrigger value="tours">Tours</TabsTrigger>
            <TabsTrigger value="requests">Demandes personnalisées</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tours">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestion des Tours</CardTitle>
                  <Link href="/admin/tour-form">
                    <a>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un tour
                      </Button>
                    </a>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {toursLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : tours && tours.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Durée</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tours.map((tour) => (
                          <TableRow key={tour.id}>
                            <TableCell className="font-medium">{tour.title}</TableCell>
                            <TableCell>{tour.duration}</TableCell>
                            <TableCell>{tour.price}€</TableCell>
                            <TableCell>{tour.featured ? "Oui" : "Non"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/admin/tour-form?id=${tour.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/tours/${tour.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => confirmDelete(tour)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun tour disponible.</p>
                    <Link href="/admin/tour-form">
                      <a className="text-primary hover:underline mt-2 inline-block">
                        Ajouter un premier tour
                      </a>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Demandes de Voyages Personnalisés</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : customTourRequests && customTourRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Voyageurs</TableHead>
                          <TableHead>Durée</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customTourRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.travelers}</TableCell>
                            <TableCell>{request.duration}</TableCell>
                            <TableCell>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucune demande de voyage personnalisé.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages de Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : contactMessages && contactMessages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Sujet</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactMessages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.name}</TableCell>
                            <TableCell>{message.email}</TableCell>
                            <TableCell>{message.subject}</TableCell>
                            <TableCell>
                              {new Date(message.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun message de contact.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le tour "{tourToDelete?.title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteTour}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
