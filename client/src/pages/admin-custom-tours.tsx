import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Users,
  MessageSquare,
  Archive,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";

interface CustomTourRequest {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  numberOfAdults: number;
  numberOfKids: number;
  tripDates?: string;
  duration?: string;
  interests: string[];
  tripTypes: string[];
  destinations: string[];
  message: string;
  status: 'new' | 'in_progress' | 'archived';
  createdAt: string;
}

export default function AdminCustomTours() {
  const [selectedRequest, setSelectedRequest] = useState<CustomTourRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch custom tour requests
  const { data: requests = [], isLoading } = useQuery<CustomTourRequest[]>({
    queryKey: ["/api/custom-tour", { status: statusFilter, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/custom-tour?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch custom tour requests");
      }
      
      return response.json();
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/custom-tour/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tour"] });
      toast({ title: "Success", description: "Status updated successfully" });
      setSelectedRequest(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Delete request mutation
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/custom-tour/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete request");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tour"] });
      toast({ title: "Success", description: "Request deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Export to CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await fetch(`/api/custom-tour/export?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "custom-tour-requests.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Data exported successfully" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteRequestMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-green-100 text-green-800">New</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <SEO 
        title="Custom Tour Requests - Admin" 
        description="Manage custom tour requests and inquiries"
      />
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Custom Tour Requests</h1>
            </div>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tour Requests ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Travelers</TableHead>
                        <TableHead>Dates/Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.fullName}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1" />
                                {request.email}
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1" />
                                {request.phoneNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Users className="h-3 w-3 mr-1" />
                              {request.numberOfAdults}A
                              {request.numberOfKids > 0 && `, ${request.numberOfKids}K`}
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.tripDates ? (
                              <div className="text-sm">
                                <span className="text-gray-600">Dates:</span> {request.tripDates}
                              </div>
                            ) : request.duration ? (
                              <div className="text-sm">
                                <span className="text-gray-600">Duration:</span> {request.duration} days
                              </div>
                            ) : (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{formatDate(request.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(request.id)}
                                disabled={deleteRequestMutation.isPending}
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-lg">{selectedRequest.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p>{selectedRequest.email}</p>
                    <a href={`mailto:${selectedRequest.email}`}>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p>{selectedRequest.phoneNumber}</p>
                    <a href={`tel:${selectedRequest.phoneNumber}`}>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Adults</label>
                  <p className="text-lg">{selectedRequest.numberOfAdults}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Kids</label>
                  <p className="text-lg">{selectedRequest.numberOfKids}</p>
                </div>
              </div>

              {/* Trip Timing */}
              <div className="space-y-3">
                {selectedRequest.tripDates && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trip Dates</label>
                    <p className="text-lg">{selectedRequest.tripDates}</p>
                  </div>
                )}
                {selectedRequest.duration && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-lg">{selectedRequest.duration} days</p>
                  </div>
                )}
                {!selectedRequest.tripDates && !selectedRequest.duration && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trip Timing</label>
                    <p className="text-gray-500">Not specified</p>
                  </div>
                )}
              </div>

              {/* Trip Types */}
              <div>
                <label className="text-sm font-medium text-gray-700">Trip Types</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRequest.tripTypes && selectedRequest.tripTypes.length > 0 ? (
                    selectedRequest.tripTypes.map((tripType, index) => (
                      <Badge key={index} variant="secondary">{tripType}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No trip types selected</span>
                  )}
                </div>
              </div>

              {/* Destinations */}
              <div>
                <label className="text-sm font-medium text-gray-700">Destinations</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRequest.destinations && selectedRequest.destinations.length > 0 ? (
                    selectedRequest.destinations.map((destination, index) => (
                      <Badge key={index} variant="outline">{destination}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No destinations selected</span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>

              {/* Created Date */}
              <div>
                <label className="text-sm font-medium text-gray-700">Submitted</label>
                <p>{formatDate(selectedRequest.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Select
                  value={selectedRequest.status}
                  onValueChange={(status) => 
                    updateStatusMutation.mutate({ id: selectedRequest.id, status })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        New
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center">
                        <Archive className="h-4 w-4 mr-2 text-gray-600" />
                        Archived
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}