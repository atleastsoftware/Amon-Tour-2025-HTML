import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Tour, CustomTourRequest, ContactMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTHB } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { Edit, Trash2, LogOut, Plus, ChevronLeft, Eye } from "lucide-react";
export default function Dashboard() {
  const {
    t
  } = useTranslation();
  const [, setLocation] = useLocation();
  const {
    isAuthenticated,
    isLoading: authLoading
  } = useIsAuthenticated();
  const logout = useLogout();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  const {
    data: tours,
    isLoading: toursLoading
  } = useQuery<Tour[]>({
    queryKey: ['/api/tours']
  });
  const {
    data: customTourRequests,
    isLoading: requestsLoading
  } = useQuery<CustomTourRequest[]>({
    queryKey: ['/api/custom-tour-requests']
  });
  const {
    data: contactMessages,
    isLoading: messagesLoading
  } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages']
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
        title: t("Tourdeleted", {
          defaultValue: "Tourdeleted"
        }),
        description: `"${tourToDelete.title}" has been successfully deleted.`,
        variant: "default"
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/tours']
      });
      setDeleteDialogOpen(false);
      setTourToDelete(null);
    } catch (error) {
      toast({
        title: t("Error", {
          defaultValue: "Error"
        }),
        description: t("Aproblemoccurredwhil", {
          defaultValue: "Aproblemoccurredwhil"
        }),
        variant: "destructive"
      });
    }
  };
  if (authLoading) {
    return <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  return <div className="min-h-screen bg-neutral-light">
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
            <div className="hidden md:block text-sm px-3 py-1 bg-primary-dark rounded">{t("Admindashboard", {
              defaultValue: "Admindashboard"
            })}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-primary-dark" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />{t("Logout", {
              defaultValue: "Logout"
            })}</Button>
            <Link href="/">
              <span className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4 inline" />{t("Backtowebsite", {
                defaultValue: "Backtowebsite"
              })}</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">{t("Dashboard", {
            defaultValue: "Dashboard"
          })}</h1>
          <p className="text-gray-600">{t("Manageyourwebsiteand", {
            defaultValue: "Manageyourwebsiteand"
          })}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t("Tours", {
                defaultValue: "Tours"
              })}</CardTitle>
              <CardDescription>{t("Totalnumberoftours", {
                defaultValue: "Totalnumberoftours"
              })}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tours?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t("Customrequests", {
                defaultValue: "Customrequests"
              })}</CardTitle>
              <CardDescription>{t("Totalnumberofrequest", {
                defaultValue: "Totalnumberofrequest"
              })}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customTourRequests?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t("Messages", {
                defaultValue: "Messages"
              })}</CardTitle>
              <CardDescription>{t("Totalnumberofmessage", {
                defaultValue: "Totalnumberofmessage"
              })}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{contactMessages?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tours">
          <TabsList className="mb-6">
            <TabsTrigger value="tours">{t("Tours", {
              defaultValue: "Tours"
            })}</TabsTrigger>
            <TabsTrigger value="requests">{t("Customrequests", {
              defaultValue: "Customrequests"
            })}</TabsTrigger>
            <TabsTrigger value="messages">{t("Messages", {
              defaultValue: "Messages"
            })}</TabsTrigger>
            <TabsTrigger value="reservations">{t("Reservations", {
              defaultValue: "Reservations"
            })}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tours">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{t("Tourmanagement", {
                    defaultValue: "Tourmanagement"
                  })}</CardTitle>
                  <Link href="/admin/tour-form">
                    <span>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />{t("Addtour", {
                        defaultValue: "Addtour"
                      })}</Button>
                    </span>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {toursLoading ? <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div> : tours && tours.length > 0 ? <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Title", {
                          defaultValue: "Title"
                        })}</TableHead>
                          <TableHead>{t("Duration", {
                          defaultValue: "Duration"
                        })}</TableHead>
                          <TableHead>{t("Price", {
                          defaultValue: "Price"
                        })}</TableHead>
                          <TableHead>{t("Featured", {
                          defaultValue: "Featured"
                        })}</TableHead>
                          <TableHead className="text-right">{t("Actions", {
                          defaultValue: "Actions"
                        })}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tours.map(tour => <TableRow key={tour.id}>
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
                                <Button variant="destructive" size="sm" onClick={() => confirmDelete(tour)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500">{t("Notoursavailable", {
                    defaultValue: "Notoursavailable"
                  })}</p>
                    <Link href="/admin/tour-form">
                      <span className="text-primary hover:underline mt-2 inline-block cursor-pointer">{t("Addyourfirsttour", {
                      defaultValue: "Addyourfirsttour"
                    })}</span>
                    </Link>
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>{t("Customtourrequests", {
                  defaultValue: "Customtourrequests"
                })}</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div> : customTourRequests && customTourRequests.length > 0 ? <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Name", {
                          defaultValue: "Name"
                        })}</TableHead>
                          <TableHead>{t("Email", {
                          defaultValue: "Email"
                        })}</TableHead>
                          <TableHead>{t("Travelers", {
                          defaultValue: "Travelers"
                        })}</TableHead>
                          <TableHead>{t("Duration", {
                          defaultValue: "Duration"
                        })}</TableHead>
                          <TableHead>{t("Date", {
                          defaultValue: "Date"
                        })}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customTourRequests.map(request => <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.fullName}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.numberOfAdults + (request.numberOfKids || 0)}</TableCell>
                            <TableCell>{request.duration}</TableCell>
                            <TableCell>
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500">{t("Nocustomtourrequests", {
                    defaultValue: "Nocustomtourrequests"
                  })}</p>
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>{t("Contactmessages", {
                  defaultValue: "Contactmessages"
                })}</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div> : contactMessages && contactMessages.length > 0 ? <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Name", {
                          defaultValue: "Name"
                        })}</TableHead>
                          <TableHead>{t("Email", {
                          defaultValue: "Email"
                        })}</TableHead>
                          <TableHead>{t("Subject", {
                          defaultValue: "Subject"
                        })}</TableHead>
                          <TableHead>{t("Date", {
                          defaultValue: "Date"
                        })}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactMessages.map(message => <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.name}</TableCell>
                            <TableCell>{message.email}</TableCell>
                            <TableCell>{message.subject}</TableCell>
                            <TableCell>
                              {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500">{t("Nocontactmessagesava", {
                    defaultValue: "Nocontactmessagesava"
                  })}</p>
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>{t("Reservationmanagemen", {
                  defaultValue: "Reservationmanagemen"
                })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-md shadow-sm">
                    <h3 className="font-heading font-semibold text-xl mb-4">{t("Touravailability", {
                      defaultValue: "Touravailability"
                    })}</h3>
                    <p className="text-gray-600 mb-4">{t("Managetheavailabilit", {
                      defaultValue: "Managetheavailabilit"
                    })}</p>
                    <Link href="/admin/availability-manager">
                      <Button>{t("Manageavailabilities", {
                        defaultValue: "Manageavailabilities"
                      })}</Button>
                    </Link>
                  </div>
                  
                  <div className="bg-white p-6 rounded-md shadow-sm">
                    <h3 className="font-heading font-semibold text-xl mb-4">{t("Reservations", {
                      defaultValue: "Reservations"
                    })}</h3>
                    <p className="text-gray-600 mb-4">{t("Viewandmanagecustome", {
                      defaultValue: "Viewandmanagecustome"
                    })}</p>
                    <Link href="/admin/reservations-manager">
                      <Button>{t("Managereservations", {
                        defaultValue: "Managereservations"
                      })}</Button>
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
            <DialogTitle>{t("Confirmdeletion", {
              defaultValue: "Confirmdeletion"
            })}</DialogTitle>
            <DialogDescription>{t('Are you sure you want to delete the tour "', {
              defaultValue: 'Are you sure you want to delete the tour "'
            })}{tourToDelete?.title}{t('"? This action cannot be undone.', {
              defaultValue: '"? This action cannot be undone.'
            })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t("Cancel", {
              defaultValue: "Cancel"
            })}</Button>
            <Button variant="destructive" onClick={deleteTour}>{t("Delete", {
              defaultValue: "Delete"
            })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}