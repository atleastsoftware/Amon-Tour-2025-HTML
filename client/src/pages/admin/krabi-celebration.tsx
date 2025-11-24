import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsAuthenticated } from "@/lib/auth";
import { useTranslationSection } from "@/contexts/TranslationContext";
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
  PartyPopper, 
  Eye, 
  Trash2, 
  Mail, 
  CheckCircle2,
  Calendar,
  Users,
  DollarSign
} from "lucide-react";
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
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const admin = useTranslationSection('admin');
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<KrabiCelebrationRequest | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: requests = [], isLoading: requestsLoading } = useQuery<KrabiCelebrationRequest[]>({
    queryKey: ["/api/krabi-celebration", showUnreadOnly ? { read: false } : {}],
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/krabi-celebration/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krabi-celebration"] });
      toast({
        title: "Success",
        description: admin.krabiCelebration?.markAsReadSuccess || "Request marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: admin.krabiCelebration?.markAsReadError || "Failed to mark as read",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/krabi-celebration/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krabi-celebration"] });
      setSelectedRequest(null);
      toast({
        title: "Success",
        description: admin.krabiCelebration?.deleteSuccess || "Request deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: admin.krabiCelebration?.deleteError || "Failed to delete request",
        variant: "destructive",
      });
    },
  });

  const handleViewRequest = (request: KrabiCelebrationRequest) => {
    setSelectedRequest(request);
    if (!request.read) {
      markAsReadMutation.mutate(request.id);
    }
  };

  if (isLoading || requestsLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white pt-24 pb-16" data-testid="loading-screen">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" data-testid="spinner"></div>
                <p className="mt-4 text-gray-600" data-testid="text-loading">Loading...</p>
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
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <PartyPopper className="h-8 w-8 text-pink-600" data-testid="icon-party" />
                  <div>
                    <h1 className="text-3xl font-heading text-gray-900" data-testid="text-title">
                      {admin.krabiCelebration?.title || "Krabi Celebration"}
                    </h1>
                    <p className="text-gray-600" data-testid="text-subtitle">
                      {admin.krabiCelebration?.subtitle || "Special event requests"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-unread-count">
                    {unreadCount} new
                  </Badge>
                )}
                <Button
                  variant={showUnreadOnly ? "default" : "outline"}
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className="flex items-center gap-2"
                  data-testid="button-toggle-filter"
                >
                  {showUnreadOnly 
                    ? (admin.krabiCelebration?.viewAll || "View all")
                    : (admin.krabiCelebration?.unreadOnly || "Unread only")
                  }
                </Button>
              </div>
            </div>

            <Card data-testid="card-requests">
              <CardHeader>
                <CardTitle data-testid="text-requests-count">
                  Requests received ({requests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8" data-testid="empty-state">
                    <PartyPopper className="h-12 w-12 text-gray-400 mx-auto mb-4" data-testid="icon-empty" />
                    <p className="text-gray-500" data-testid="text-empty">
                      {showUnreadOnly 
                        ? (admin.krabiCelebration?.noUnreadRequests || "No unread requests.")
                        : (admin.krabiCelebration?.noRequests || "No requests yet.")
                      }
                    </p>
                  </div>
                ) : (
                  <Table data-testid="table-requests">
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="header-status">
                          {admin.krabiCelebration?.tableHeaders?.status || "Status"}
                        </TableHead>
                        <TableHead data-testid="header-name">
                          {admin.krabiCelebration?.tableHeaders?.name || "Name"}
                        </TableHead>
                        <TableHead data-testid="header-celebration-type">
                          {admin.krabiCelebration?.tableHeaders?.celebrationType || "Celebration Type"}
                        </TableHead>
                        <TableHead data-testid="header-guests">
                          {admin.krabiCelebration?.tableHeaders?.guests || "Guests"}
                        </TableHead>
                        <TableHead data-testid="header-date">
                          {admin.krabiCelebration?.tableHeaders?.date || "Date"}
                        </TableHead>
                        <TableHead data-testid="header-received-on">
                          {admin.krabiCelebration?.tableHeaders?.receivedOn || "Received on"}
                        </TableHead>
                        <TableHead data-testid="header-actions">
                          {admin.krabiCelebration?.tableHeaders?.actions || "Actions"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                          <TableCell data-testid={`cell-status-${request.id}`}>
                            {!request.read ? (
                              <Badge variant="destructive" data-testid={`badge-new-${request.id}`}>
                                {admin.krabiCelebration?.statusNew || "New"}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-read-${request.id}`}>
                                {admin.krabiCelebration?.statusRead || "Read"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`cell-name-${request.id}`}>
                            {request.name}
                          </TableCell>
                          <TableCell data-testid={`cell-type-${request.id}`}>
                            {request.celebrationType}
                          </TableCell>
                          <TableCell data-testid={`cell-guests-${request.id}`}>
                            {request.guests} people
                          </TableCell>
                          <TableCell data-testid={`cell-date-${request.id}`}>
                            {request.date}
                          </TableCell>
                          <TableCell data-testid={`cell-received-${request.id}`}>
                            {new Date(request.createdAt).toLocaleDateString('en-US')}
                          </TableCell>
                          <TableCell data-testid={`cell-actions-${request.id}`}>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRequest(request)}
                                data-testid={`button-view-${request.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`mailto:${request.email}?subject=Your Krabi Celebration Request`)}
                                data-testid={`button-email-${request.id}`}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteMutation.mutate(request.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-${request.id}`}
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
        <DialogContent className="max-w-2xl" data-testid="dialog-request-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" data-testid="dialog-title">
              <PartyPopper className="h-5 w-5 text-pink-600" />
              {admin.krabiCelebration?.dialogTitle || "Celebration Request Details"}
            </DialogTitle>
            <DialogDescription data-testid="dialog-description">
              {admin.krabiCelebration?.dialogDescription || "View all information about this special event request"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div data-testid="field-contact-name">
                  <label className="text-sm font-medium text-gray-700">
                    {admin.krabiCelebration?.fields?.contactName || "Contact Name"}
                  </label>
                  <p className="text-gray-900" data-testid="value-contact-name">{selectedRequest.name}</p>
                </div>
                <div data-testid="field-email">
                  <label className="text-sm font-medium text-gray-700">
                    {admin.krabiCelebration?.fields?.email || "Email"}
                  </label>
                  <p className="text-gray-900" data-testid="value-email">{selectedRequest.email}</p>
                </div>
                <div data-testid="field-whatsapp">
                  <label className="text-sm font-medium text-gray-700">
                    {admin.krabiCelebration?.fields?.whatsapp || "WhatsApp"}
                  </label>
                  <p className="text-gray-900" data-testid="value-whatsapp">
                    {selectedRequest.whatsapp || (admin.krabiCelebration?.notProvided || "Not provided")}
                  </p>
                </div>
                <div data-testid="field-celebration-type">
                  <label className="text-sm font-medium text-gray-700">
                    {admin.krabiCelebration?.fields?.celebrationType || "Celebration Type"}
                  </label>
                  <p className="text-gray-900" data-testid="value-celebration-type">{selectedRequest.celebrationType}</p>
                </div>
                <div data-testid="field-guests">
                  <label className="text-sm font-medium text-gray-700">
                    {admin.krabiCelebration?.fields?.guests || "Number of Guests"}
                  </label>
                  <p className="text-gray-900 flex items-center gap-1" data-testid="value-guests">
                    <Users className="h-4 w-4" />
                    {selectedRequest.guests} people
                  </p>
                </div>
                <div data-testid="field-date">
                  <label className="text-sm font-medium text-gray-700">
                    {admin.krabiCelebration?.fields?.date || "Event Date"}
                  </label>
                  <p className="text-gray-900 flex items-center gap-1" data-testid="value-date">
                    <Calendar className="h-4 w-4" />
                    {selectedRequest.date}
                  </p>
                </div>
                {selectedRequest.budget && (
                  <div data-testid="field-budget">
                    <label className="text-sm font-medium text-gray-700">
                      {admin.krabiCelebration?.fields?.budget || "Budget"}
                    </label>
                    <p className="text-gray-900 flex items-center gap-1" data-testid="value-budget">
                      <DollarSign className="h-4 w-4" />
                      {selectedRequest.budget}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedRequest.description && (
                <div data-testid="field-description">
                  <label className="text-sm font-medium text-gray-700">
                    {admin.krabiCelebration?.fields?.description || "Description"}
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1" data-testid="value-description">
                    {selectedRequest.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500" data-testid="text-received-timestamp">
                  {admin.krabiCelebration?.receivedOn || "Received on"} {new Date(selectedRequest.createdAt).toLocaleString('en-US')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Your Krabi Celebration Request&body=Hello ${selectedRequest.name},%0D%0A%0D%0AWe have received your request for ${selectedRequest.celebrationType}.%0D%0A%0D%0ABest regards,%0D%0AAmon Tour Team`)}
                    data-testid="button-reply-email"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {admin.krabiCelebration?.replyByEmail || "Reply by email"}
                  </Button>
                  {!selectedRequest.read && (
                    <Button 
                      onClick={() => markAsReadMutation.mutate(selectedRequest.id)}
                      data-testid="button-mark-read"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {admin.krabiCelebration?.markAsRead || "Mark as read"}
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
