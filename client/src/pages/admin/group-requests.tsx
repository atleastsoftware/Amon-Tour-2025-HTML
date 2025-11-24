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
  const admin = useTranslationSection('admin');
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
        title: admin.common?.success || "Success",
        description: admin.groupRequests?.markAsReadSuccess || "Request marked as read",
      });
    },
    onError: () => {
      toast({
        title: admin.common?.error || "Error",
        description: admin.groupRequests?.markAsReadError || "Failed to mark as read",
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
        title: admin.common?.success || "Success",
        description: admin.groupRequests?.deleteSuccess || "Request deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: admin.common?.error || "Error",
        description: admin.groupRequests?.deleteError || "Failed to delete request",
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/admin")}
                  className="flex items-center gap-2"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {admin.common?.back || "Back"}
                </Button>
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-8 w-8 text-amber-600" data-testid="icon-groups" />
                  <div>
                    <h1 className="text-3xl font-heading text-gray-900" data-testid="heading-title">{admin.groupRequests?.title || "Groups & Corporate"}</h1>
                    <p className="text-gray-600" data-testid="text-subtitle">{admin.groupRequests?.subtitle || "Group and corporate travel requests"}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-unread">
                    {admin.groupRequests?.unreadBadge?.replace('{count}', String(unreadCount)) || `${unreadCount} new`}
                  </Badge>
                )}
                <Button
                  variant={showUnreadOnly ? "default" : "outline"}
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className="flex items-center gap-2"
                  data-testid="button-filter"
                >
                  {showUnreadOnly ? (admin.groupRequests?.viewAll || "View all") : (admin.groupRequests?.unreadOnly || "Unread only")}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle data-testid="text-requests-count">{admin.groupRequests?.requestsReceived?.replace('{count}', String(requests.length)) || `Requests received (${requests.length})`}</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" data-testid="icon-empty" />
                    <p className="text-gray-500" data-testid="text-no-requests">
                      {showUnreadOnly ? (admin.groupRequests?.noUnreadRequests || "No unread requests.") : (admin.groupRequests?.noRequests || "No requests yet.")}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="header-status">{admin.groupRequests?.tableHeaders?.status || "Status"}</TableHead>
                        <TableHead data-testid="header-contact">{admin.groupRequests?.tableHeaders?.contact || "Contact"}</TableHead>
                        <TableHead data-testid="header-company">{admin.groupRequests?.tableHeaders?.company || "Company"}</TableHead>
                        <TableHead data-testid="header-participants">{admin.groupRequests?.tableHeaders?.participants || "Participants"}</TableHead>
                        <TableHead data-testid="header-travel-dates">{admin.groupRequests?.tableHeaders?.travelDates || "Travel Dates"}</TableHead>
                        <TableHead data-testid="header-received-on">{admin.groupRequests?.tableHeaders?.receivedOn || "Received on"}</TableHead>
                        <TableHead data-testid="header-actions">{admin.groupRequests?.tableHeaders?.actions || "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                          <TableCell>
                            {!request.read ? (
                              <Badge variant="destructive" data-testid={`badge-status-new-${request.id}`}>{admin.groupRequests?.statusNew || "New"}</Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-status-read-${request.id}`}>{admin.groupRequests?.statusRead || "Read"}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`text-contact-${request.id}`}>{request.contactName}</TableCell>
                          <TableCell data-testid={`text-company-${request.id}`}>{request.companyName}</TableCell>
                          <TableCell data-testid={`text-participants-${request.id}`}>{admin.groupRequests?.peopleCount?.replace('{count}', String(request.groupSize)) || `${request.groupSize} people`}</TableCell>
                          <TableCell data-testid={`text-travel-dates-${request.id}`}>{request.travelDates || (admin.groupRequests?.notSpecified || "Not specified")}</TableCell>
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
                                onClick={() => window.open(`mailto:${request.email}?subject=Your group travel request`)}
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
              <UsersIcon className="h-5 w-5 text-amber-600" />
              {admin.groupRequests?.dialogTitle || "Group Travel Request Details"}
            </DialogTitle>
            <DialogDescription data-testid="dialog-description">
              {admin.groupRequests?.dialogDescription || "View all information about this group travel request"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.contactName || "Contact Name"}</label>
                  <p className="text-gray-900" data-testid="text-detail-contact-name">{selectedRequest.contactName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.email || "Email"}</label>
                  <p className="text-gray-900" data-testid="text-detail-email">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.company || "Company/Organization"}</label>
                  <p className="text-gray-900" data-testid="text-detail-company">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.phone || "Phone"}</label>
                  <p className="text-gray-900" data-testid="text-detail-phone">{selectedRequest.phone || (admin.groupRequests?.notProvided || "Not provided")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.participants || "Number of Participants"}</label>
                  <p className="text-gray-900 flex items-center gap-1" data-testid="text-detail-participants">
                    <Users className="h-4 w-4" />
                    {admin.groupRequests?.peopleCount?.replace('{count}', String(selectedRequest.groupSize)) || `${selectedRequest.groupSize} people`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.budget || "Budget"}</label>
                  <p className="text-gray-900" data-testid="text-detail-budget">{selectedRequest.budget || (admin.groupRequests?.notSpecified || "Not specified")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.travelDates || "Travel Dates"}</label>
                  <p className="text-gray-900 flex items-center gap-1" data-testid="text-detail-travel-dates">
                    <Calendar className="h-4 w-4" />
                    {selectedRequest.travelDates || (admin.groupRequests?.notSpecified || "Not specified")}
                  </p>
                </div>
              </div>
              
              {selectedRequest.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">{admin.groupRequests?.fields?.specialRequirements || "Special Requirements"}</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1" data-testid="text-detail-description">
                    {selectedRequest.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500" data-testid="text-received-on">
                  {admin.groupRequests?.receivedOn || "Received on"} {new Date(selectedRequest.createdAt).toLocaleString('en-US')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Your group travel request&body=Hello ${selectedRequest.contactName},%0D%0A%0D%0AWe have received your request for a group trip (${selectedRequest.companyName}).%0D%0A%0D%0ABest regards,%0D%0AAmon Tour Team`)}
                    data-testid="button-reply-email"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {admin.groupRequests?.replyByEmail || "Reply by email"}
                  </Button>
                  {!selectedRequest.read && (
                    <Button onClick={() => markAsReadMutation.mutate(selectedRequest.id)} data-testid="button-mark-read">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {admin.groupRequests?.markAsRead || "Mark as read"}
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