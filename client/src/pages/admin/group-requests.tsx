import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsAuthenticated } from "@/lib/auth";
import { useUITranslation } from "@/hooks/useUITranslation";
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
  UsersIcon, 
  Eye, 
  Trash2, 
  Mail, 
  CheckCircle2,
  Calendar,
  Clock,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface GroupRequest {
  id: number;
  contactName: string;
  companyName: string;
  email: string;
  phone?: string;
  groupSize: number;
  travelDates?: string;
  budget?: string;
  description?: string;
  read: boolean;
  createdAt: string;
}

export default function AdminGroupRequests() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useUITranslation();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: requests = [], isLoading: requestsLoading } = useQuery<GroupRequest[]>({
    queryKey: ["/api/group-requests", showUnreadOnly ? { read: false } : {}],
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/group-requests/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-requests"] });
      toast({
        title: t('common.success'),
        description: t('groupRequests.markAsReadSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('groupRequests.markAsReadError'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/group-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-requests"] });
      setSelectedRequest(null);
      toast({
        title: t('common.success'),
        description: t('groupRequests.deleteSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('groupRequests.deleteError'),
        variant: "destructive",
      });
    },
  });

  const handleViewRequest = (request: GroupRequest) => {
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
                  {t('common.back')}
                </Button>
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-8 w-8 text-amber-600" />
                  <div>
                    <h1 className="text-3xl font-heading text-gray-900">{t('groupRequests.title')}</h1>
                    <p className="text-gray-600">{t('groupRequests.subtitle')}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    {t('groupRequests.unreadBadge', { count: unreadCount })}
                  </Badge>
                )}
                <Button
                  variant={showUnreadOnly ? "default" : "outline"}
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className="flex items-center gap-2"
                >
                  {showUnreadOnly ? t('groupRequests.viewAll') : t('groupRequests.unreadOnly')}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('groupRequests.requestsReceived', { count: requests.length })}</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {showUnreadOnly ? t('groupRequests.noUnreadRequests') : t('groupRequests.noRequests')}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('groupRequests.tableHeaders.status')}</TableHead>
                        <TableHead>{t('groupRequests.tableHeaders.contact')}</TableHead>
                        <TableHead>{t('groupRequests.tableHeaders.company')}</TableHead>
                        <TableHead>{t('groupRequests.tableHeaders.participants')}</TableHead>
                        <TableHead>{t('groupRequests.tableHeaders.travelDates')}</TableHead>
                        <TableHead>{t('groupRequests.tableHeaders.receivedOn')}</TableHead>
                        <TableHead>{t('groupRequests.tableHeaders.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {!request.read ? (
                              <Badge variant="destructive">{t('groupRequests.statusNew')}</Badge>
                            ) : (
                              <Badge variant="secondary">{t('groupRequests.statusRead')}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{request.contactName}</TableCell>
                          <TableCell>{request.companyName}</TableCell>
                          <TableCell>{t('groupRequests.peopleCount', { count: request.groupSize })}</TableCell>
                          <TableCell>{request.travelDates || t('groupRequests.notSpecified')}</TableCell>
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
                                onClick={() => window.open(`mailto:${request.email}?subject=Votre demande de groupe`)}
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
              <UsersIcon className="h-5 w-5 text-amber-600" />
              {t('groupRequests.dialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('groupRequests.dialogDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.contactName')}</label>
                  <p className="text-gray-900">{selectedRequest.contactName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.email')}</label>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.company')}</label>
                  <p className="text-gray-900">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.phone')}</label>
                  <p className="text-gray-900">{selectedRequest.phone || t('groupRequests.notProvided')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.participants')}</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {t('groupRequests.peopleCount', { count: selectedRequest.groupSize })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.budget')}</label>
                  <p className="text-gray-900">{selectedRequest.budget || t('groupRequests.notSpecified')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.travelDates')}</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedRequest.travelDates || t('groupRequests.notSpecified')}
                  </p>
                </div>
              </div>
              
              {selectedRequest.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('groupRequests.fields.specialRequirements')}</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedRequest.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">
                  {t('groupRequests.receivedOn')} {new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Votre demande de voyage de groupe&body=Bonjour ${selectedRequest.contactName},%0D%0A%0D%0ANous avons bien reçu votre demande pour un voyage de groupe (${selectedRequest.companyName}).%0D%0A%0D%0ACordialement,%0D%0AÉquipe Amon Tour`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {t('groupRequests.replyByEmail')}
                  </Button>
                  {!selectedRequest.read && (
                    <Button onClick={() => markAsReadMutation.mutate(selectedRequest.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t('groupRequests.markAsRead')}
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