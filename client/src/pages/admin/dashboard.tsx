import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Tour, CustomTourRequest, ContactMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTHB } from "@/lib/utils";
import { useUITranslation } from "@/hooks/useUITranslation";

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
  
  // UI translations hook - force cache refresh
  const { t } = useUITranslation();
  console.log('🚀 Dashboard component loaded - UI translation system active');
  
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
        title: t('dashboard.tourManagement.deleteSuccess.title'),
        description: t('dashboard.tourManagement.deleteSuccess.description', { title: tourToDelete.title }),
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      setDeleteDialogOpen(false);
      setTourToDelete(null);
    } catch (error) {
      toast({
        title: t('dashboard.tourManagement.deleteError.title'),
        description: t('dashboard.tourManagement.deleteError.description'),
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
              <div className="flex items-center cursor-pointer">
                <span className="text-white font-heading font-bold text-xl">Senthang</span>
                <span className="text-secondary font-accent text-xl ml-1">Siam</span>
                <span className="text-white font-heading font-bold text-xl ml-1">Tour</span>
              </div>
            </Link>
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded">
              {t('common.adminDashboard')}
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
              {t('common.logout')}
            </Button>
            <Link href="/">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />
                {t('common.backToWebsite')}
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t('dashboard.stats.tours')}</CardTitle>
              <CardDescription>{t('dashboard.stats.toursDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tours?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t('dashboard.stats.customRequests')}</CardTitle>
              <CardDescription>{t('dashboard.stats.customRequestsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customTourRequests?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t('dashboard.stats.messages')}</CardTitle>
              <CardDescription>{t('dashboard.stats.messagesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{contactMessages?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tours">
          <TabsList className="mb-6">
            <TabsTrigger value="tours">{t('dashboard.tabs.tours')}</TabsTrigger>
            <TabsTrigger value="requests">{t('dashboard.tabs.requests')}</TabsTrigger>
            <TabsTrigger value="messages">{t('dashboard.tabs.messages')}</TabsTrigger>
            <TabsTrigger value="reservations">{t('dashboard.tabs.reservations')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tours">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{t('dashboard.tourManagement.title')}</CardTitle>
                  <Link href="/admin/tour-form">
                    <span>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('dashboard.tourManagement.addTour')}
                      </Button>
                    </span>
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
                          <TableHead>{t('dashboard.tourManagement.tableHeaders.title')}</TableHead>
                          <TableHead>{t('dashboard.tourManagement.tableHeaders.duration')}</TableHead>
                          <TableHead>{t('dashboard.tourManagement.tableHeaders.price')}</TableHead>
                          <TableHead>{t('dashboard.tourManagement.tableHeaders.featured')}</TableHead>
                          <TableHead className="text-right">{t('common.edit')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tours.map((tour) => (
                          <TableRow key={tour.id}>
                            <TableCell className="font-medium">{tour.title}</TableCell>
                            <TableCell>{tour.duration}</TableCell>
                            <TableCell>{formatTHB(tour.price)}</TableCell>
                            <TableCell>{tour.featured ? "Yes" : "No"}</TableCell>
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
                    <p className="text-gray-500">{t('dashboard.tourManagement.empty')}</p>
                    <Link href="/admin/tour-form">
                      <span className="text-primary hover:underline mt-2 inline-block cursor-pointer">
                        {t('dashboard.tourManagement.empty')}
                      </span>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.customTourRequests.title')}</CardTitle>
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
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Travelers</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customTourRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.fullName}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.numberOfAdults + request.numberOfKids}</TableCell>
                            <TableCell>{request.duration}</TableCell>
                            <TableCell>
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('dashboard.customTourRequests.empty')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.contactMessages.title')}</CardTitle>
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
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
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
                              {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('dashboard.contactMessages.empty')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.reservations.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-md shadow-sm">
                    <h3 className="font-heading font-semibold text-xl mb-4">{t('dashboard.reservations.title')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('dashboard.reservations.description')}
                    </p>
                    <Link href="/admin/availability-manager">
                      <Button>
                        {t('dashboard.reservations.manageAvailabilities')}
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="bg-white p-6 rounded-md shadow-sm">
                    <h3 className="font-heading font-semibold text-xl mb-4">{t('dashboard.reservations.title')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('dashboard.reservations.viewDescription')}
                    </p>
                    <Link href="/admin/reservations-manager">
                      <Button>
                        {t('dashboard.reservations.manageReservations')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.tourManagement.deleteConfirm', { title: tourToDelete?.title || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={deleteTour}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
