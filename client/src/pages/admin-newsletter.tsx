import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Users, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface NewsletterSubscription {
  id: number;
  email: string;
  subscribedAt: string;
  confirmed: boolean;
  unsubscribed: boolean;
  language: string;
}

export default function AdminNewsletterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: subscriptions = [], isLoading } = useQuery<NewsletterSubscription[]>({
    queryKey: ["/api/admin/newsletter/subscriptions", { 
      confirmed: statusFilter === "confirmed" ? true : statusFilter === "unconfirmed" ? false : undefined,
      unsubscribed: statusFilter === "unsubscribed" ? true : false
    }],
  });

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/export", {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to export subscriptions");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Newsletter subscribers exported successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export newsletter subscribers",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (subscription: NewsletterSubscription) => {
    if (subscription.unsubscribed) {
      return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Unsubscribed</Badge>;
    }
    if (subscription.confirmed) {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" /> Confirmed</Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
  };

  const confirmedCount = subscriptions.filter(s => s.confirmed && !s.unsubscribed).length;
  const pendingCount = subscriptions.filter(s => !s.confirmed && !s.unsubscribed).length;
  const unsubscribedCount = subscriptions.filter(s => s.unsubscribed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Newsletter Management</h1>
              <p className="text-gray-600 mt-2">Manage newsletter subscriptions and export subscriber lists</p>
            </div>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter newsletter subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by email address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    <SelectItem value="confirmed">Confirmed Only</SelectItem>
                    <SelectItem value="unconfirmed">Pending Confirmation</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Subscriptions ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>
                Complete list of newsletter subscribers with their status and subscription details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No subscriptions found matching your search." : "No newsletter subscriptions yet."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Subscribed Date</TableHead>
                        <TableHead>Language</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">{subscription.email}</TableCell>
                          <TableCell>{getStatusBadge(subscription)}</TableCell>
                          <TableCell>
                            {new Date(subscription.subscribedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{subscription.language?.toUpperCase() || 'EN'}</Badge>
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
      
      <Footer />
    </div>
  );
}