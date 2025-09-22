import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsAuthenticated } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, PartyPopper, Eye, Trash2, Mail, CheckCircle2, Calendar, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
interface KrabiCelebrationRequest {
  id: number;
  name: string;
  email: string;
  whatsapp?: string;
  celebrationType: string;
  guests: number;
  date: string;
  budget?: string;
  description?: string;
  read: boolean;
  createdAt: string;
}
export default function AdminKrabiCelebration() {
  const {
    t
  } = useTranslation();
  const {
    isAuthenticated,
    isLoading
  } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<KrabiCelebrationRequest | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const {
    data: requests = [],
    isLoading: requestsLoading
  } = useQuery<KrabiCelebrationRequest[]>({
    queryKey: ["/api/krabi-celebration", showUnreadOnly ? {
      read: false
    } : {}],
    enabled: isAuthenticated
  });
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/krabi-celebration/${id}`, {
        read: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/krabi-celebration"]
      });
      toast({
        title: t("Succxe8s", {
          defaultValue: "Succxe8s"
        }),
        description: t("Demandemarquxe9ecomm", {
          defaultValue: "Demandemarquxe9ecomm"
        })
      });
    },
    onError: () => {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Impossible de marquer la demande comme lue", {
          defaultValue: "Impossible de marquer la demande comme lue"
        }),
        variant: "destructive"
      });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/krabi-celebration/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/krabi-celebration"]
      });
      setSelectedRequest(null);
      toast({
        title: t("Succxe8s", {
          defaultValue: "Succxe8s"
        }),
        description: t("Demandesupprimxe9eav", {
          defaultValue: "Demandesupprimxe9eav"
        })
      });
    },
    onError: () => {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Impossible de supprimer la demande", {
          defaultValue: "Impossible de supprimer la demande"
        }),
        variant: "destructive"
      });
    }
  });
  const handleViewRequest = (request: KrabiCelebrationRequest) => {
    setSelectedRequest(request);
    if (!request.read) {
      markAsReadMutation.mutate(request.id);
    }
  };
  if (isLoading || requestsLoading) {
    return <>
        <Header />
        <div className="min-h-screen bg-white pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("Chargement", {
                  defaultValue: "Chargement"
                })}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>;
  }
  if (!isAuthenticated) {
    setLocation("/admin-login");
    return null;
  }
  const unreadCount = requests.filter(req => !req.read).length;
  return <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setLocation("/admin")} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />{t("Back", {
                  defaultValue: "Back"
                })}</Button>
                <div className="flex items-center gap-3">
                  <PartyPopper className="h-8 w-8 text-pink-600" />
                  <div>
                    <h1 className="text-3xl font-heading text-gray-900">{t('pages.krabiCelebration.title')}</h1>
                    <p className="text-gray-600">{t('Demandes d\'\xE9v\xE9nements sp\xE9ciaux', {
                      defaultValue: 'Demandes d\'\xE9v\xE9nements sp\xE9ciaux'
                    })}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {unreadCount > 0 && <Badge variant="destructive" className="flex items-center gap-1">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </Badge>}
                <Button variant={showUnreadOnly ? "default" : "outline"} onClick={() => setShowUnreadOnly(!showUnreadOnly)} className="flex items-center gap-2">
                  {showUnreadOnly ? "View all" : "Unread only"}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("Demandesrexe7ues", {
                  defaultValue: "Demandesrexe7ues"
                })}{requests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? <div className="text-center py-8">
                    <PartyPopper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {showUnreadOnly ? "Aucune demande non lue" : "Aucune demande reçue"}
                    </p>
                  </div> : <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("Statut", {
                        defaultValue: "Statut"
                      })}</TableHead>
                        <TableHead>{t('common.nom')}</TableHead>
                        <TableHead>{t("Typedecxe9lxe9bratio", {
                        defaultValue: "Typedecxe9lxe9bratio"
                      })}</TableHead>
                        <TableHead>{t("Invitxe9s", {
                        defaultValue: "Invitxe9s"
                      })}</TableHead>
                        <TableHead>{t("Date", {
                        defaultValue: "Date"
                      })}</TableHead>
                        <TableHead>{t("Rexe7ule", {
                        defaultValue: "Rexe7ule"
                      })}</TableHead>
                        <TableHead>{t("Actions", {
                        defaultValue: "Actions"
                      })}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map(request => <TableRow key={request.id}>
                          <TableCell>
                            {!request.read ? <Badge variant="destructive">{t("Nouveau", {
                          defaultValue: "Nouveau"
                        })}</Badge> : <Badge variant="secondary">Lu</Badge>}
                          </TableCell>
                          <TableCell className="font-medium">{request.name}</TableCell>
                          <TableCell>{request.celebrationType}</TableCell>
                          <TableCell>{request.guests} personnes</TableCell>
                          <TableCell>{request.date}</TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${request.email}?subject=Votre demande Krabi Celebration`)}>
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(request.id)} disabled={deleteMutation.isPending}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* View Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-pink-600" />{t("Demande Krabi Celebration", {
              defaultValue: "Demande Krabi Celebration"
            })}</DialogTitle>
            <DialogDescription>{t('D\xE9tails de la demande d\'\xE9v\xE9nement sp\xE9cial', {
              defaultValue: 'D\xE9tails de la demande d\'\xE9v\xE9nement sp\xE9cial'
            })}</DialogDescription>
          </DialogHeader>
          
          {selectedRequest && <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("Nom du contact", {
                  defaultValue: "Nom du contact"
                })}</label>
                  <p className="text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("Email", {
                  defaultValue: "Email"
                })}</label>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("Whatsapp", {
                  defaultValue: "Whatsapp"
                })}</label>
                  <p className="text-gray-900">{selectedRequest.whatsapp || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("Typedecxe9lxe9bratio", {
                  defaultValue: "Typedecxe9lxe9bratio"
                })}</label>
                  <p className="text-gray-900">{selectedRequest.celebrationType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('Nombre d\'invit\xE9s', {
                  defaultValue: 'Nombre d\'invit\xE9s'
                })}</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedRequest.guests} personnes
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("Datesouhaitxe9e", {
                  defaultValue: "Datesouhaitxe9e"
                })}</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedRequest.date}
                  </p>
                </div>
                {selectedRequest.budget && <div>
                    <label className="text-sm font-medium text-gray-700">{t("Budget", {
                  defaultValue: "Budget"
                })}</label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {selectedRequest.budget}
                    </p>
                  </div>}
              </div>
              
              {selectedRequest.description && <div>
                  <label className="text-sm font-medium text-gray-700">{t("Description:", {
                defaultValue: "Description:"
              })}</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedRequest.description}
                  </p>
                </div>}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">{t("Rexe7ule", {
                defaultValue: "Rexe7ule"
              })}{new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Votre demande Krabi Celebration&body=Bonjour ${selectedRequest.name},%0D%0A%0D%0ANous avons bien reçu votre demande pour ${selectedRequest.celebrationType}.%0D%0A%0D%0ACordialement,%0D%0AÉquipe Amon Tour`)}>
                    <Mail className="h-4 w-4 mr-2" />{t("Rxe9pondreparemail", {
                  defaultValue: "Rxe9pondreparemail"
                })}</Button>
                  {!selectedRequest.read && <Button onClick={() => markAsReadMutation.mutate(selectedRequest.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />{t("Marquer comme lu", {
                  defaultValue: "Marquer comme lu"
                })}</Button>}
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      <Footer />
    </>;
}