import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Tour, CustomTourRequest, ContactMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTHB } from "@/lib/utils";
import { useTranslationSection } from "@/contexts/TranslationContext";

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
  
  const admin = useTranslationSection('admin');
  
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
        title: admin.dashboard?.tourManagement?.deleteSuccess?.title || "Tour Deleted",
        description: (admin.dashboard?.tourManagement?.deleteSuccess?.description || "Tour '{title}' has been successfully deleted.").replace('{title}', tourToDelete.title),
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      setDeleteDialogOpen(false);
      setTourToDelete(null);
    } catch (error) {
      toast({
        title: admin.dashboard?.tourManagement?.deleteError?.title || "Delete Failed",
        description: admin.dashboard?.tourManagement?.deleteError?.description || "Failed to delete the tour. Please try again.",
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
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded" data-testid="text-admin-dashboard-badge">
              Admin Dashboard
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
              {admin.dashboard?.logout || "Logout"}
            </Button>
            <Link href="/">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer" data-testid="link-back-to-website">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />
                Back to Website
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2" data-testid="text-dashboard-title">
            {admin.dashboard?.title || "Administration"}
          </h1>
          <p className="text-gray-600" data-testid="text-dashboard-subtitle">
            {admin.dashboard?.subtitle || "Centralized management dashboard"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-stats-tours">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{admin.dashboard?.stats?.tours || "Total Tours"}</CardTitle>
              <CardDescription>{admin.dashboard?.stats?.toursDescription || "Published tour experiences"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" data-testid="text-tours-count">{tours?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stats-custom-requests">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{admin.dashboard?.stats?.customRequests || "Custom Requests"}</CardTitle>
              <CardDescription>{admin.dashboard?.stats?.customRequestsDescription || "Pending tour requests"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" data-testid="text-requests-count">{customTourRequests?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stats-messages">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{admin.dashboard?.stats?.messages || "Contact Messages"}</CardTitle>
              <CardDescription>{admin.dashboard?.stats?.messagesDescription || "Unread messages"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" data-testid="text-messages-count">{contactMessages?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tours">
          <TabsList className="mb-6">
            <TabsTrigger value="tours" data-testid="tab-tours">{admin.dashboard?.tabs?.tours || "Tours"}</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">{admin.dashboard?.tabs?.requests || "Custom Requests"}</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">{admin.dashboard?.tabs?.messages || "Messages"}</TabsTrigger>
            <TabsTrigger value="reservations" data-testid="tab-reservations">{admin.dashboard?.tabs?.reservations || "Reservations"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tours">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle data-testid="text-tour-management-title">
                    {admin.dashboard?.tourManagement?.title || "Tour Management"}
                  </CardTitle>
                  <Link href="/admin/tour-form">
                    <span>
                      <Button data-testid="button-add-tour">
                        <Plus className="mr-2 h-4 w-4" />
                        {admin.dashboard?.tourManagement?.addTour || "Add New Tour"}
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
                          <TableHead>{admin.dashboard?.tourManagement?.tableHeaders?.title || "Title"}</TableHead>
                          <TableHead>{admin.dashboard?.tourManagement?.tableHeaders?.duration || "Duration"}</TableHead>
                          <TableHead>{admin.dashboard?.tourManagement?.tableHeaders?.price || "Price"}</TableHead>
                          <TableHead>{admin.dashboard?.tourManagement?.tableHeaders?.featured || "Featured"}</TableHead>
                          <TableHead className="text-right">{admin.dashboard?.tourManagement?.tableHeaders?.actions || "Actions"}</TableHead>
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
                                  <Button variant="outline" size="sm" data-testid={`button-edit-tour-${tour.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/tours/${tour.id}`}>
                                  <Button variant="outline" size="sm" data-testid={`button-view-tour-${tour.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => confirmDelete(tour)}
                                  data-testid={`button-delete-tour-${tour.id}`}
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
                  <div className="text-center py-8" data-testid="text-no-tours">
                    <p className="text-gray-500">{admin.dashboard?.tourManagement?.empty || "No tours found. Create your first tour to get started."}</p>
                    <Link href="/admin/tour-form">
                      <span className="text-primary hover:underline mt-2 inline-block cursor-pointer" data-testid="link-create-first-tour">
                        {admin.dashboard?.tourManagement?.addTour || "Add New Tour"}
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
                <CardTitle data-testid="text-custom-tour-requests-title">
                  {admin.dashboard?.customTourRequests?.title || "Custom Tour Requests"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center py-8" data-testid="loading-requests">
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
                          <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
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
                  <div className="text-center py-8" data-testid="text-no-requests">
                    <p className="text-gray-500">{admin.dashboard?.customTourRequests?.empty || "No custom tour requests yet."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-contact-messages-title">
                  {admin.dashboard?.contactMessages?.title || "Contact Messages"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex justify-center py-8" data-testid="loading-messages">
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
                          <TableRow key={message.id} data-testid={`row-message-${message.id}`}>
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
                  <div className="text-center py-8" data-testid="text-no-messages">
                    <p className="text-gray-500">{admin.dashboard?.contactMessages?.empty || "No contact messages yet."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-reservations-title">
                  {admin.dashboard?.reservations?.title || "Reservations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-md shadow-sm">
                    <h3 className="font-heading font-semibold text-xl mb-4">
                      {admin.dashboard?.reservations?.title || "Reservations"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {admin.dashboard?.reservations?.description || "Manage tour availabilities and booking schedules."}
                    </p>
                    <Link href="/admin/availability-manager">
                      <Button data-testid="button-manage-availabilities">
                        {admin.dashboard?.reservations?.manageAvailabilities || "Manage Availabilities"}
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="bg-white p-6 rounded-md shadow-sm">
                    <h3 className="font-heading font-semibold text-xl mb-4">
                      {admin.dashboard?.reservations?.title || "Reservations"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {admin.dashboard?.reservations?.viewDescription || "View and manage all tour reservations and bookings."}
                    </p>
                    <Link href="/admin/reservations-manager">
                      <Button data-testid="button-manage-reservations">
                        {admin.dashboard?.reservations?.manageReservations || "Manage Reservations"}
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
        <DialogContent data-testid="dialog-delete-confirm">
          <DialogHeader>
            <DialogTitle>Delete Tour</DialogTitle>
            <DialogDescription>
              {(admin.dashboard?.tourManagement?.deleteConfirm || "Are you sure you want to delete '{title}'? This action cannot be undone.").replace('{title}', tourToDelete?.title || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTour} data-testid="button-confirm-delete">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
