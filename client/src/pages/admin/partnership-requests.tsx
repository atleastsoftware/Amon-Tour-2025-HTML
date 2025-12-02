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
  const admin = useTranslationSection('admin');
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
        title: admin.common?.success || "Success",
        description: admin.partnershipRequests?.markAsReadSuccess || "Request marked as read",
      });
    },
    onError: () => {
      toast({
        title: admin.common?.error || "Error",
        description: admin.partnershipRequests?.markAsReadError || "Failed to mark as read",
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
        title: admin.common?.success || "Success",
        description: admin.partnershipRequests?.deleteSuccess || "Request deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: admin.common?.error || "Error",
        description: admin.partnershipRequests?.deleteError || "Failed to delete request",
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600" data-testid="text-loading">{admin.common?.loading || "Loading..."}</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/admin")}
                  className="flex items-center gap-2 w-fit"
                  data-testid="button-back-to-admin"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {admin.common?.back || "Back"}
                </Button>
                <div className="flex items-center gap-3">
                  <Handshake className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <div>
                    <h1 className="text-xl sm:text-3xl font-heading text-gray-900" data-testid="text-page-title">
                      {admin.partnershipRequests?.title || "Partnership Requests"}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600" data-testid="text-page-subtitle">
                      {admin.partnershipRequests?.subtitle || "Collaboration proposals"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-unread-count">
                    {(admin.partnershipRequests?.unreadBadge || "{count} new").replace('{count}', String(unreadCount))}
                  </Badge>
                )}
                <Button
                  variant={showUnreadOnly ? "default" : "outline"}
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  data-testid="button-toggle-unread"
                >
                  {showUnreadOnly 
                    ? admin.partnershipRequests?.viewAll || "View all" 
                    : admin.partnershipRequests?.unreadOnly || "Unread only"}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle data-testid="text-requests-count">
                  {(admin.partnershipRequests?.requestsReceived || "Requests received ({count})").replace('{count}', String(requests.length))}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500" data-testid="text-no-requests">
                      {showUnreadOnly 
                        ? admin.partnershipRequests?.noUnreadRequests || "No unread requests." 
                        : admin.partnershipRequests?.noRequests || "No requests yet."}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{admin.partnershipRequests?.tableHeaders?.status || "Status"}</TableHead>
                        <TableHead>{admin.partnershipRequests?.tableHeaders?.contact || "Contact"}</TableHead>
                        <TableHead>{admin.partnershipRequests?.tableHeaders?.company || "Company"}</TableHead>
                        <TableHead>{admin.partnershipRequests?.tableHeaders?.activityType || "Activity Type"}</TableHead>
                        <TableHead>{admin.partnershipRequests?.tableHeaders?.website || "Website"}</TableHead>
                        <TableHead>{admin.partnershipRequests?.tableHeaders?.receivedOn || "Received on"}</TableHead>
                        <TableHead>{admin.partnershipRequests?.tableHeaders?.actions || "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                          <TableCell>
                            {!request.read ? (
                              <Badge variant="destructive" data-testid={`badge-status-new-${request.id}`}>
                                {admin.partnershipRequests?.statusNew || "New"}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-status-read-${request.id}`}>
                                {admin.partnershipRequests?.statusRead || "Read"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`text-contact-${request.id}`}>
                            {request.contactName}
                          </TableCell>
                          <TableCell data-testid={`text-company-${request.id}`}>
                            {request.companyName}
                          </TableCell>
                          <TableCell data-testid={`text-type-${request.id}`}>
                            {request.partnershipType}
                          </TableCell>
                          <TableCell>
                            {request.website ? (
                              <a 
                                href={request.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                data-testid={`link-website-${request.id}`}
                              >
                                {request.website}
                              </a>
                            ) : (
                              <span className="text-gray-400" data-testid={`text-no-website-${request.id}`}>
                                {admin.partnershipRequests?.notProvided || "Not provided"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell data-testid={`text-date-${request.id}`}>
                            {new Date(request.createdAt).toLocaleDateString('en-US')}
                          </TableCell>
                          <TableCell>
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
                                onClick={() => window.open(`mailto:${request.email}?subject=Your partnership request`)}
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
            <DialogTitle className="flex items-center gap-2" data-testid="text-dialog-title">
              <Handshake className="h-5 w-5 text-primary" />
              {admin.partnershipRequests?.dialogTitle || "Partnership Request Details"}
            </DialogTitle>
            <DialogDescription data-testid="text-dialog-description">
              {admin.partnershipRequests?.dialogDescription || "View all information about this partnership proposal"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {admin.partnershipRequests?.fields?.contactName || "Contact Name"}
                  </label>
                  <p className="text-gray-900" data-testid="text-detail-contact-name">
                    {selectedRequest.contactName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {admin.partnershipRequests?.fields?.email || "Email"}
                  </label>
                  <p className="text-gray-900" data-testid="text-detail-email">
                    {selectedRequest.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {admin.partnershipRequests?.fields?.companyName || "Company Name"}
                  </label>
                  <p className="text-gray-900 flex items-center gap-1" data-testid="text-detail-company">
                    <Building className="h-4 w-4" />
                    {selectedRequest.companyName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {admin.partnershipRequests?.fields?.partnershipType || "Partnership Type"}
                  </label>
                  <p className="text-gray-900 flex items-center gap-1" data-testid="text-detail-type">
                    <Briefcase className="h-4 w-4" />
                    {selectedRequest.partnershipType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {admin.partnershipRequests?.fields?.phone || "Phone"}
                  </label>
                  <p className="text-gray-900" data-testid="text-detail-phone">
                    {selectedRequest.phone || admin.partnershipRequests?.notProvided || "Not provided"}
                  </p>
                </div>
                {selectedRequest.website && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      {admin.partnershipRequests?.fields?.website || "Website"}
                    </label>
                    <p className="text-gray-900">
                      <a 
                        href={selectedRequest.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                        data-testid="link-detail-website"
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
                  <label className="text-sm font-medium text-gray-700">
                    {admin.partnershipRequests?.fields?.projectDescription || "Project Description"}
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1" data-testid="text-detail-description">
                    {selectedRequest.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500" data-testid="text-detail-received-date">
                  {admin.partnershipRequests?.receivedOn || "Received on"} {new Date(selectedRequest.createdAt).toLocaleString('en-US')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Your partnership request&body=Hello ${selectedRequest.contactName},%0D%0A%0D%0AWe have received your partnership proposal for ${selectedRequest.companyName}.%0D%0A%0D%0ABest regards,%0D%0AAmon Tour Team`)}
                    data-testid="button-reply-email"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {admin.partnershipRequests?.replyByEmail || "Reply by email"}
                  </Button>
                  {!selectedRequest.read && (
                    <Button 
                      onClick={() => markAsReadMutation.mutate(selectedRequest.id)}
                      data-testid="button-mark-as-read"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {admin.partnershipRequests?.markAsRead || "Mark as read"}
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
