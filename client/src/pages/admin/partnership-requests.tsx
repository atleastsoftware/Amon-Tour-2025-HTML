import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsAuthenticated } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Handshake, 
  Eye, 
  Trash2, 
  Mail, 
  CheckCircle2,
  Building,
  Globe,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface PartnershipRequest {
  id: number;
  contactName: string;
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  partnershipType: string;
  description?: string;
  read: boolean;
  createdAt: string;
}

export default function AdminPartnershipRequests() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: requests = [], isLoading: requestsLoading } = useQuery<PartnershipRequest[]>({
    queryKey: ["/api/partnership-requests", showUnreadOnly ? { read: false } : {}],
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/partnership-requests/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partnership-requests"] });
      toast({
        title: "Succès",
        description: "Demande marquée comme lue",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la demande comme lue",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/partnership-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partnership-requests"] });
      setSelectedRequest(null);
      toast({
        title: "Succès",
        description: "Demande supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la demande",
        variant: "destructive",
      });
    },
  });

  const handleViewRequest = (request: PartnershipRequest) => {
    setSelectedRequest(request);
    if (!request.read) {
      markAsReadMutation.mutate(request.id);
    }
  };

  if (isLoading || requestsLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    setLocation("/admin-login");
    return null;
  }

  const unreadCount = requests.filter(req => !req.read).length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/admin")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <Handshake className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h1 className="text-3xl font-heading text-gray-900">Demandes de partenariat</h1>
                    <p className="text-gray-600">Propositions de collaboration</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  variant={showUnreadOnly ? "default" : "outline"}
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className="flex items-center gap-2"
                >
                  {showUnreadOnly ? "View all" : "Unread only"}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Demandes reçues ({requests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {showUnreadOnly ? "Aucune demande non lue" : "Aucune demande reçue"}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Statut</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Type d'activité</TableHead>
                        <TableHead>Site web</TableHead>
                        <TableHead>Reçu le</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {!request.read ? (
                              <Badge variant="destructive">Nouveau</Badge>
                            ) : (
                              <Badge variant="secondary">Lu</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{request.contactName}</TableCell>
                          <TableCell>{request.companyName}</TableCell>
                          <TableCell>{request.partnershipType}</TableCell>
                          <TableCell>
                            {request.website ? (
                              <a 
                                href={request.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {request.website}
                              </a>
                            ) : (
                              <span className="text-gray-400">Non renseigné</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRequest(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`mailto:${request.email}?subject=Votre demande de partenariat`)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteMutation.mutate(request.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
              <Handshake className="h-5 w-5 text-indigo-600" />
              Demande de partenariat
            </DialogTitle>
            <DialogDescription>
              Détails de la proposition de collaboration
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom du contact</label>
                  <p className="text-gray-900">{selectedRequest.contactName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {selectedRequest.companyName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type de partenariat</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {selectedRequest.partnershipType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-gray-900">{selectedRequest.phone || 'Non renseigné'}</p>
                </div>
                {selectedRequest.website && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Site web</label>
                    <p className="text-gray-900">
                      <a 
                        href={selectedRequest.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-4 w-4" />
                        {selectedRequest.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
              
              {selectedRequest.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description du projet</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedRequest.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Reçu le {new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Votre demande de partenariat&body=Bonjour ${selectedRequest.fullName},%0D%0A%0D%0ANous avons bien reçu votre proposition de partenariat pour ${selectedRequest.companyName}.%0D%0A%0D%0ACordialement,%0D%0AÉquipe Amon Tour`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Répondre par email
                  </Button>
                  {!selectedRequest.read && (
                    <Button onClick={() => markAsReadMutation.mutate(selectedRequest.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marquer comme lu
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}